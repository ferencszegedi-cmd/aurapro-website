// Costa VIP ajánlatkérő endpoint – a costavip.eu űrlapja POST-ol ide (cross-origin).
// Cél: a címzett e-mail cím SOHA ne kerüljön a costavip.eu kliens-bundle-jébe.
// Minta: ./lead.ts (honeypot + rate-limit + fail-open), Turnstile nélkül,
// mert a Costa VIP oldalon nincs Turnstile widget.
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { rateLimited } from '../../lib/api-guards';

export const prerender = false;

const ALLOWED_ORIGINS = new Set([
  'https://costavip.eu',
  'https://www.costavip.eu',
  'https://costa-vip.lovable.app',
  'https://id-preview--a32185cc-0721-4b75-86e3-5abebc6d5223.lovable.app',
]);

const corsHeaders = (origin: string | null) => ({
  'access-control-allow-origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://costavip.eu',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  vary: 'origin',
});

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  // telefon, WhatsApp, Telegram vagy e-mail – szabad szöveg
  contact: z.string().trim().min(3).max(200),
  date: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  lang: z.enum(['hu', 'uk', 'en']).optional(),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const requestId = crypto.randomUUID();
  const origin = request.headers.get('origin');
  const headers = { 'content-type': 'application/json', ...corsHeaders(origin) };
  const log = (level: 'info' | 'warn' | 'error', msg: string, extra?: object) =>
    console.log(JSON.stringify({ level, requestId, endpoint: 'costavip-lead', msg, ...extra }));

  if (clientAddress && rateLimited(`costavip:${clientAddress}`)) {
    log('warn', 'rate_limited', { ip: clientAddress });
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429,
      headers: { ...headers, 'retry-after': '60' },
    });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), { status: 400, headers });
  }

  // Honeypot – a `website` mezőt bot tölti ki; silent OK jár rá.
  const honeypotValue =
    raw && typeof raw === 'object' && 'website' in raw
      ? String((raw as Record<string, unknown>).website ?? '')
      : '';
  if (honeypotValue.length > 0) {
    log('info', 'honeypot_triggered', { ip: clientAddress });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    log('warn', 'validation_failed', { issues: parsed.error.issues });
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'validation_failed',
        fields: parsed.error.issues.map((i) => i.path[0]).filter(Boolean),
      }),
      { status: 400, headers },
    );
  }

  const data = parsed.data;

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const LEAD_TO =
    import.meta.env.COSTAVIP_LEAD_TO || process.env.COSTAVIP_LEAD_TO || 'adriana1993@freemail.hu';
  const LEAD_FROM =
    import.meta.env.COSTAVIP_LEAD_FROM || process.env.COSTAVIP_LEAD_FROM || 'COSTA VIP <noreply@aurapro.hu>';

  const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '';
  const adminBody = `
    <h2>Új ajánlatkérés a costavip.eu-ról</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Név</strong></td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td><strong>Elérhetőség</strong></td><td>${escapeHtml(data.contact)}</td></tr>
      ${data.date ? `<tr><td><strong>Érkezés dátuma</strong></td><td>${escapeHtml(data.date)}</td></tr>` : ''}
      ${safeMessage ? `<tr><td valign="top"><strong>Üzenet</strong></td><td>${safeMessage}</td></tr>` : ''}
      <tr><td><strong>Nyelv</strong></td><td>${escapeHtml(data.lang ?? 'hu')}</td></tr>
      <tr><td><strong>IP</strong></td><td>${escapeHtml(clientAddress ?? 'n/a')}</td></tr>
      <tr><td><strong>Request ID</strong></td><td><code>${requestId}</code></td></tr>
    </table>
    <p style="color:#888;font-size:12px">Időbélyeg: ${new Date().toISOString()}</p>
  `;

  if (!RESEND_API_KEY) {
    // Degraded mode: a lead a logba kerül, hogy visszanyerhető legyen.
    log('warn', 'resend_disabled_no_key', { lead: data });
    return new Response(JSON.stringify({ ok: true, mode: 'degraded' }), { status: 200, headers });
  }

  // Ha az elérhetőség e-mail cím, reply-to-ként hasznos.
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact) ? data.contact : undefined;

  const resend = new Resend(RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: LEAD_FROM,
      to: LEAD_TO.split(',').map((s: string) => s.trim()).filter(Boolean),
      subject: `Ajánlatkérés a costavip.eu-ról – ${data.name}`,
      html: adminBody,
      reply_to: replyTo,
    });
    if (result.error) {
      // FAIL-OPEN: a látogató nem kap hibát, a lead a logból visszanyerhető.
      log('error', 'send_failed_lead_preserved', { error: result.error, lead: data });
    } else {
      log('info', 'email_sent', { id: result.data?.id });
    }
    return new Response(JSON.stringify({ ok: true, requestId }), { status: 200, headers });
  } catch (err) {
    log('error', 'unexpected_send_error_lead_preserved', { err: String(err), lead: data });
    return new Response(JSON.stringify({ ok: true, requestId }), { status: 200, headers });
  }
};

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
