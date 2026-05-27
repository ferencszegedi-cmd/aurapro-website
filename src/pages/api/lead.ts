// P0-3: Lead endpoint – Vercel Function (Fluid Compute, Node.js runtime)
// Statikus build mellett ez az egy route dinamikus, lásd astro.config.mjs.
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';

export const prerender = false;

// Zod schema – szigorú szerver-oldali validáció.
// A honeypot (`website`) mezőt NEM tesszük bele Zod-ba, mert ott nem akarunk
// validation_failed-et adni rá (árulkodna a botnak). Külön kezeljük a body-parsing után.
const LeadSchema = z.object({
  name: z.string().trim().min(2, 'Név túl rövid').max(100, 'Név túl hosszú'),
  company: z.string().trim().min(2, 'Cégnév túl rövid').max(200),
  phone: z
    .string()
    .trim()
    .min(6, 'Telefonszám túl rövid')
    .max(30)
    .regex(/^[0-9+\-()\s]+$/, 'Telefonszám érvénytelen karaktereket tartalmaz'),
  email: z.string().trim().email('Érvénytelen email').max(255),
  // service mező opcionális – a frontend-en már nincs select, de ha valami más kliens küldené, elfogadjuk
  service: z.enum(['munkavedelem', 'tuzvedelem', 'kornyezetvedelem', 'komplex', 'egyeb']).optional(),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  gdpr_consent: z.literal('1', { message: 'GDPR hozzájárulás kötelező' }),
  // Honnan jött (analytics) – nem kötelező
  source: z.string().max(100).optional(),
});

const serviceLabels: Record<string, string> = {
  munkavedelem: 'Munkavédelem',
  tuzvedelem: 'Tűzvédelem',
  kornyezetvedelem: 'Környezetvédelem',
  komplex: 'Komplex (MV + TV + KV)',
  egyeb: 'Egyéb / nem tudom',
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const requestId = crypto.randomUUID();
  const log = (level: 'info' | 'warn' | 'error', msg: string, extra?: object) =>
    console.log(JSON.stringify({ level, requestId, msg, ...extra }));

  // 1. Body parse – fetch + JSON.stringify, vagy classic form-encoded
  let raw: unknown;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      raw = await request.json();
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const form = await request.formData();
      raw = Object.fromEntries(form.entries());
    } else {
      log('warn', 'unsupported_content_type', { contentType });
      return new Response(JSON.stringify({ ok: false, error: 'unsupported_content_type' }), {
        status: 415,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (err) {
    log('warn', 'body_parse_failed', { err: String(err) });
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 2. Honeypot – ELŐSZÖR ellenőrizzük (még a Zod-validáció előtt),
  // hogy botoknak silent OK-t tudjunk adni anélkül, hogy bármi mezőnévre rávilágítanánk.
  const honeypotValue =
    raw && typeof raw === 'object' && 'website' in raw
      ? String((raw as Record<string, unknown>).website ?? '')
      : '';
  if (honeypotValue.length > 0) {
    log('info', 'honeypot_triggered', { ip: clientAddress });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 3. Zod validáció
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    log('warn', 'validation_failed', { issues: parsed.error.issues });
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'validation_failed',
        // Csak a mezőneveket adjuk vissza, részleteket nem (bot-leakage ellen)
        fields: parsed.error.issues.map((i) => i.path[0]).filter(Boolean),
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const data = parsed.data;

  // 4. Email küldés Resend-en keresztül (degraded mode, ha kulcs hiányzik)
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const LEAD_TO = import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL || 'iroda@aurapro.hu';
  const LEAD_FROM =
    import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || 'Aurapro Lead <noreply@aurapro.hu>';

  const serviceLabel = data.service ? (serviceLabels[data.service] ?? data.service) : '';
  const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '';
  const adminBody = `
    <h2>Új lead – ${escapeHtml(data.company)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Név</strong></td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td><strong>Cég</strong></td><td>${escapeHtml(data.company)}</td></tr>
      <tr><td><strong>Telefon</strong></td><td><a href="tel:${encodeURIComponent(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></td></tr>
      ${serviceLabel ? `<tr><td><strong>Érdeklődés</strong></td><td>${escapeHtml(serviceLabel)}</td></tr>` : ''}
      ${safeMessage ? `<tr><td valign="top"><strong>Üzenet</strong></td><td>${safeMessage}</td></tr>` : ''}
      <tr><td><strong>Forrás</strong></td><td>${escapeHtml(data.source ?? 'unknown')}</td></tr>
      <tr><td><strong>IP</strong></td><td>${escapeHtml(clientAddress ?? 'n/a')}</td></tr>
      <tr><td><strong>Request ID</strong></td><td><code>${requestId}</code></td></tr>
    </table>
    <p style="color:#888;font-size:12px">GDPR consent rögzítve, időbélyeg: ${new Date().toISOString()}</p>
  `;

  if (!RESEND_API_KEY) {
    // Degraded mode: kulcs nincs, csak loggolunk és success-t adunk.
    // (Ferenc bekapcsolja a Vercel env-ben + aurapro.hu domain-verifikáció után aktiválódik.)
    log('warn', 'resend_disabled_no_key', {
      lead: { name: data.name, company: data.company, phone: data.phone, service: data.service },
    });
    return new Response(JSON.stringify({ ok: true, mode: 'degraded' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const adminEmail = resend.emails.send({
      from: LEAD_FROM,
      to: [LEAD_TO],
      subject: serviceLabel
        ? `Új ajánlatkérés – ${data.company} (${serviceLabel})`
        : `Új ajánlatkérés – ${data.company}`,
      html: adminBody,
      reply_to: data.email || undefined,
    });

    const confirmEmail = data.email
      ? resend.emails.send({
          from: LEAD_FROM,
          to: [data.email],
          subject: 'Megkaptuk az ajánlatkérését – Aurapro',
          html: `
            <p>Kedves ${escapeHtml(data.name)}!</p>
            <p>Köszönjük, hogy felvette velünk a kapcsolatot.
            Egy Aurapro szakértő <strong>24 órán belül</strong> visszahívja Önt a megadott telefonszámon
            (${escapeHtml(data.phone)}).</p>
            ${serviceLabel ? `<p>Érdeklődés tárgya: <strong>${escapeHtml(serviceLabel)}</strong></p>` : ''}
            <p>Ha sürgős, hívjon: <a href="tel:+36704098764">+36 70 409 8764</a></p>
            <p>Üdvözlettel,<br>Aurapro csapata</p>
            <hr>
            <p style="color:#888;font-size:12px">Ezt az e-mailt automatikusan generáltuk az
            <a href="https://www.aurapro.hu/">aurapro.hu</a>-n leadott ajánlatkérés megerősítéseként.</p>
          `,
        })
      : Promise.resolve(null);

    const [adminResult, confirmResult] = await Promise.allSettled([adminEmail, confirmEmail]);

    if (adminResult.status === 'rejected') {
      log('error', 'admin_email_failed', { reason: String(adminResult.reason) });
    } else {
      log('info', 'admin_email_sent', { id: adminResult.value?.data?.id });
    }
    if (confirmResult.status === 'rejected') {
      log('warn', 'confirm_email_failed', { reason: String(confirmResult.reason) });
    }

    // Akkor is success, ha csak az admin notification ment ki (a confirm bónusz).
    if (adminResult.status === 'fulfilled') {
      return new Response(JSON.stringify({ ok: true, requestId }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'email_send_failed', requestId }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (err) {
    log('error', 'unexpected_send_error', { err: String(err) });
    return new Response(JSON.stringify({ ok: false, error: 'internal_error', requestId }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

// CORS preflight – ha más domain-ról próbálkozna valaki, 405.
export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 405 });
