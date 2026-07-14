// Hírlevél-feliratkozás endpoint (exit-intent popup) – a lead.ts mintájára.
// Jogszabály-változás értesítőre iratkozás: admin-emailt küld, NEM konverzió.
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';

export const prerender = false;

const NewsletterSchema = z.object({
  name: z.string().trim().min(2, 'Név túl rövid').max(100),
  email: z.string().trim().email('Érvénytelen email').max(255),
  gdpr_consent: z.literal('1', { message: 'GDPR hozzájárulás kötelező' }),
  source: z.string().max(100).optional(),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const requestId = crypto.randomUUID();
  const log = (level: 'info' | 'warn' | 'error', msg: string, extra?: object) =>
    console.log(JSON.stringify({ level, requestId, msg, ...extra }));

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
      isNativeFormPost = true;
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'unsupported_content_type' }), {
        status: 415,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const successResponse = () =>
    isNativeFormPost
      ? new Response(null, { status: 303, headers: { location: '/?feliratkozva=1' } })
      : new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });

  // Honeypot – silent OK (mint a lead.ts-ben)
  const honeypotValue =
    raw && typeof raw === 'object' && 'website' in raw
      ? String((raw as Record<string, unknown>).website ?? '')
      : '';
  if (honeypotValue.length > 0) {
    log('info', 'newsletter_honeypot_triggered', { ip: clientAddress });
    return successResponse();
  }

  const parsed = NewsletterSchema.safeParse(raw);
  if (!parsed.success) {
    log('warn', 'newsletter_validation_failed', { issues: parsed.error.issues });
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'validation_failed',
        fields: parsed.error.issues.map((i) => i.path[0]).filter(Boolean),
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const data = parsed.data;

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const LEAD_TO_RAW = import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL || 'iroda@aurapro.hu';
  const LEAD_TO = LEAD_TO_RAW.split(',').map((s: string) => s.trim()).filter(Boolean);
  const LEAD_FROM =
    import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || 'Aurapro Lead <noreply@aurapro.hu>';

  if (!RESEND_API_KEY) {
    // Degraded mode: teljes payload logolása, hogy a feliratkozó ne vesszen el
    log('warn', 'resend_disabled_no_key_newsletter', { subscriber: data });
    return successResponse();
  }

  const resend = new Resend(RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: LEAD_FROM,
      to: LEAD_TO,
      subject: `Új hírlevél-feliratkozó – ${data.name}`,
      html: `
        <h2>Új hírlevél-feliratkozó (jogszabály-változás értesítő)</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td><strong>Név</strong></td><td>${escapeHtml(data.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          <tr><td><strong>Forrás</strong></td><td>${escapeHtml(data.source ?? 'exit-popup')}</td></tr>
          <tr><td><strong>IP</strong></td><td>${escapeHtml(clientAddress ?? 'n/a')}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">GDPR consent rögzítve, időbélyeg: ${new Date().toISOString()}</p>
      `,
    });
    log('info', 'newsletter_admin_email_sent');
    return successResponse();
  } catch (err) {
    log('error', 'newsletter_send_error', { err: String(err) });
    return new Response(JSON.stringify({ ok: false, error: 'internal_error', requestId }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 405 });
