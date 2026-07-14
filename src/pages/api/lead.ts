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
  // service mező opcionális – legacy egyértékű mező, ha valami régi kliens küldené
  service: z.enum(['munkavedelem', 'tuzvedelem', 'kornyezetvedelem', 'kepzes', 'komplex', 'egyeb']).optional(),
  // services: a wizard többes választása, vesszővel fűzött slug-lista
  services: z.string().trim().max(300).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  gdpr_consent: z.literal('1', { message: 'GDPR hozzájárulás kötelező' }),
  // Honnan jött (analytics) – nem kötelező
  source: z.string().max(100).optional(),
  // QuoteWizard kvalifikáló mezők – mind opcionális (a régi egylépcsős form nem küldi)
  headcount: z.enum(['1-49', '50-99', '100-249', '250-999', '1000+']).optional().or(z.literal('')),
  sites: z.enum(['1', '2-5', '6+']).optional().or(z.literal('')),
  priority: z.enum(['gyorsasag', 'szakertelem', 'komplex']).optional().or(z.literal('')),
});

const serviceLabels: Record<string, string> = {
  munkavedelem: 'Munkavédelem',
  tuzvedelem: 'Tűzvédelem',
  kornyezetvedelem: 'Környezetvédelem',
  elsosegely: 'Elsősegélynyújtó képzés',
  'mv-kepviselo': 'Munkavédelmi képviselő képzés',
  gepvizsgalat: 'Elektromos mérés / gépvizsgálat',
  // legacy értékek (régi kliensek)
  kepzes: 'Képzés / oktatás',
  komplex: 'Komplex (MV + TV + KV)',
  egyeb: 'Egyéb / nem tudom',
};

const headcountLabels: Record<string, string> = {
  '1-49': '50 fő alatt',
  '50-99': '50–99 fő',
  '100-249': '100–249 fő',
  '250-999': '250–999 fő',
  '1000+': '1000+ fő',
};

const sitesLabels: Record<string, string> = {
  '1': '1 telephely',
  '2-5': '2–5 telephely',
  '6+': '6+ telephely',
};

const priorityLabels: Record<string, string> = {
  gyorsasag: 'Gyors kezdés',
  szakertelem: 'Maximális szakértelem',
  komplex: 'Komplex szolgáltatás egy kézből',
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
  // No-JS fallback: natív form POST-nál (form-encoded) sikerkor 303 redirect jár JSON helyett.
  let raw: unknown;
  let isNativeFormPost = false;
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
      // Többértékű checkbox-mező: az Object.fromEntries csak az utolsót tartaná meg
      const allServices = form.getAll('services').filter((v) => typeof v === 'string');
      if (allServices.length > 0) {
        (raw as Record<string, unknown>).services = allServices.join(',');
      }
      isNativeFormPost = true;
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

  // Sikeres kimenet: JS-fetch kliensnek JSON, natív form POST-nak 303 → /koszonjuk/
  const successResponse = (body: Record<string, unknown>) =>
    isNativeFormPost
      ? new Response(null, { status: 303, headers: { location: '/koszonjuk/' } })
      : new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });

  // 2. Honeypot – ELŐSZÖR ellenőrizzük (még a Zod-validáció előtt),
  // hogy botoknak silent OK-t tudjunk adni anélkül, hogy bármi mezőnévre rávilágítanánk.
  const honeypotValue =
    raw && typeof raw === 'object' && 'website' in raw
      ? String((raw as Record<string, unknown>).website ?? '')
      : '';
  if (honeypotValue.length > 0) {
    log('info', 'honeypot_triggered', { ip: clientAddress });
    return successResponse({ ok: true });
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
  // LEAD_TO_EMAIL támogat több címet, vesszővel elválasztva (pl. "a@x.hu,b@y.hu")
  const LEAD_TO_RAW = import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL || 'iroda@aurapro.hu';
  const LEAD_TO = LEAD_TO_RAW.split(',').map((s) => s.trim()).filter(Boolean);
  const LEAD_FROM =
    import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || 'Aurapro Lead <noreply@aurapro.hu>';

  // services (többes, vesszős lista) elsőbbséget élvez a legacy service mezővel szemben
  const servicesLabelList = (data.services ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => serviceLabels[s] ?? s)
    .join(', ');
  const serviceLabel = servicesLabelList || (data.service ? (serviceLabels[data.service] ?? data.service) : '');
  const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '';
  const adminBody = `
    <h2>Új lead – ${escapeHtml(data.company)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Név</strong></td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td><strong>Cég</strong></td><td>${escapeHtml(data.company)}</td></tr>
      <tr><td><strong>Telefon</strong></td><td><a href="tel:${encodeURIComponent(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></td></tr>
      ${serviceLabel ? `<tr><td><strong>Érdeklődés</strong></td><td>${escapeHtml(serviceLabel)}</td></tr>` : ''}
      ${data.headcount ? `<tr><td><strong>Cégméret</strong></td><td>${escapeHtml(headcountLabels[data.headcount] ?? data.headcount)}</td></tr>` : ''}
      ${data.sites ? `<tr><td><strong>Telephelyek</strong></td><td>${escapeHtml(sitesLabels[data.sites] ?? data.sites)}</td></tr>` : ''}
      ${data.priority ? `<tr><td><strong>Prioritás</strong></td><td><strong>${escapeHtml(priorityLabels[data.priority] ?? data.priority)}</strong></td></tr>` : ''}
      ${safeMessage ? `<tr><td valign="top"><strong>Üzenet</strong></td><td>${safeMessage}</td></tr>` : ''}
      <tr><td><strong>Forrás</strong></td><td>${escapeHtml(data.source ?? 'unknown')}</td></tr>
      <tr><td><strong>IP</strong></td><td>${escapeHtml(clientAddress ?? 'n/a')}</td></tr>
      <tr><td><strong>Request ID</strong></td><td><code>${requestId}</code></td></tr>
    </table>
    <p style="color:#888;font-size:12px">GDPR consent rögzítve, időbélyeg: ${new Date().toISOString()}</p>
  `;

  if (!RESEND_API_KEY) {
    // Degraded mode: kulcs nincs, csak loggolunk és success-t adunk.
    // A TELJES lead-payload megy a logba, hogy egyetlen lead se vesszen el
    // (Vercel runtime logból visszanyerhető, amíg a Resend nincs élesítve).
    log('warn', 'resend_disabled_no_key', { lead: data });
    return successResponse({ ok: true, mode: 'degraded' });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const adminEmail = resend.emails.send({
      from: LEAD_FROM,
      to: LEAD_TO,
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
      return successResponse({ ok: true, requestId });
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
