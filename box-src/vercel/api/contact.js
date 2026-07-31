// Budaörs Box Academy – jelentkezési űrlap backend (Vercel Function + Resend)
// Ugyanaz a technika, mint az aurapro.hu lead-endpointja, egyszerűsítve.
// RESEND_API_KEY nélkül degradált mód: a lead a runtime-logba kerül és 503 megy
// vissza, mire a böngésző a FormSubmit → mailto tartalék-láncra vált.
const TO = 'terra.budai@gmail.com';
const FROM = 'Budaörs Box Academy <noreply@aurapro.hu>';

const esc = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const b = req.body || {};
  // Honeypot: botnak csendes sikert adunk
  if (b.website) return res.status(200).json({ ok: true });

  const nev = String(b.nev || '').trim();
  const tel = String(b.tel || '').trim();
  if (nev.length < 2 || tel.length < 6) {
    return res.status(400).json({ ok: false, error: 'validation' });
  }
  const email = String(b.email || '').trim();
  const edzes = String(b.edzes || '').trim();
  const kezdo = b.kezdo ? 'igen' : 'nem';
  const uzenet = String(b.uzenet || '').trim();
  const lead = { nev, tel, email, edzes, kezdo, uzenet };

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) {
    // A lead így sem veszhet el: teljes payload a logba
    console.log(JSON.stringify({ level: 'warn', msg: 'resend_disabled_no_key', lead }));
    return res.status(503).json({ ok: false, error: 'not_configured' });
  }

  const html = `
    <h2>Új jelentkezés – Budaörs Box Academy</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0"><strong>Név</strong></td><td>${esc(nev)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><strong>Telefon</strong></td><td><a href="tel:${encodeURIComponent(tel)}">${esc(tel)}</a></td></tr>
      ${email ? `<tr><td style="padding:4px 12px 4px 0"><strong>E-mail</strong></td><td><a href="mailto:${encodeURIComponent(email)}">${esc(email)}</a></td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0"><strong>Edzés</strong></td><td>${esc(edzes)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0"><strong>Kezdő</strong></td><td>${kezdo}</td></tr>
      ${uzenet ? `<tr><td style="padding:4px 12px 4px 0;vertical-align:top"><strong>Üzenet</strong></td><td>${esc(uzenet).replace(/\n/g, '<br>')}</td></tr>` : ''}
    </table>
    <p style="color:#888;font-size:12px">Beküldve a www.budaorsbox.hu jelentkezési űrlapjáról, ${new Date().toISOString()}</p>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email || undefined,
        subject: 'Jelentkezés edzésre – ' + nev,
        html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.log(JSON.stringify({ level: 'error', msg: 'resend_failed', status: r.status, body: t, lead }));
      return res.status(502).json({ ok: false, error: 'send_failed' });
    }
    console.log(JSON.stringify({ level: 'info', msg: 'lead_sent', nev, tel }));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.log(JSON.stringify({ level: 'error', msg: 'send_error', err: String(e), lead }));
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
};
