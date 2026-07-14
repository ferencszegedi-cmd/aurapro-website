// Közös lead-beküldő logika – a QuoteWizard (és bármely jövőbeli form) ezt használja,
// hogy a beküldés viselkedése soha ne térjen el form-onként.
// Konverziós esemény (generate_lead) NEM itt sül el, hanem a /koszonjuk/ oldalon –
// a form_id/service attribúciót sessionStorage-on adjuk át neki.

type SubmitResult = { ok: true } | { ok: false; message: string };

const FIELD_LABELS: Record<string, string> = {
  name: 'Név',
  company: 'Cég neve',
  phone: 'Telefonszám',
  email: 'Email',
  gdpr_consent: 'Adatkezelési hozzájárulás',
  message: 'Üzenet',
};

const fieldLabel = (f: string) => FIELD_LABELS[f] ?? f;

export function gtagEvent(name: string, params: Record<string, unknown>): void {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
}

export async function submitLead(form: HTMLFormElement): Promise<SubmitResult> {
  const formData = new FormData(form);
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    payload[key] = typeof value === 'string' ? value : '';
  });
  payload.source = form.dataset.form ?? 'unknown';

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Attribúció a köszönjük-oldali konverziós eseményhez (per-LP CPL méréshez)
      try {
        sessionStorage.setItem(
          'aurapro_lead',
          JSON.stringify({ form_id: payload.source, service: payload.service ?? '' }),
        );
      } catch {
        /* sessionStorage tiltva – a konverzió attribúció nélkül is elsül */
      }
      return { ok: true };
    }

    let message = 'Hiba történt a küldéskor. Próbálja újra, vagy hívjon: +36 70 409 8764';
    try {
      const data = await res.json();
      if (data?.error === 'validation_failed' && Array.isArray(data.fields)) {
        message = `Kérjük, ellenőrizze: ${data.fields.map(fieldLabel).join(', ')}`;
      }
    } catch {
      /* nem-JSON hibaválasz – marad az általános üzenet */
    }
    return { ok: false, message };
  } catch {
    return { ok: false, message: 'Hálózati hiba. Kérjük, hívjon közvetlenül: +36 70 409 8764' };
  }
}
