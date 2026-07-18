// MiniCRM R3 REST API integráció – a weboldalas lead automatikus bekerülése.
// Env-vezérelt: ha a MINICRM_API_KEY nincs beállítva, no-op (semmit sem csinál).
// Fail-safe: sosem dob kivételt; hibánál { ok:false, error } tér vissza, hogy
// a hívó (api/lead.ts) az e-mailt akkor is kiküldje és a leadet ne veszítse el.
//
// Auth: HTTP Basic (SystemId : ApiKey). Base: https://r3.minicrm.hu/Api/R3/
// Pipeline: Értékesítés (CategoryId 70), belépő státusz Kapcsolatfelvétel (3608).

const BASE = 'https://r3.minicrm.hu/Api/R3';
const CATEGORY_ERTEKESITES = 70;
const STATUS_KAPCSOLATFELVETEL = 3608;

export interface MiniCrmLead {
  name: string;
  company: string;
  phone: string;
  email: string;
  /** Ember-olvasható szolgáltatás-lista (pl. "Munkavédelem, Tűzvédelem") */
  serviceLabel?: string;
  headcountLabel?: string;
  message?: string;
  source?: string;
}

type Result = { ok: true; projectId: number } | { ok: false; error: string } | { skipped: true };

function authHeader(systemId: string, apiKey: string): string {
  const token = Buffer.from(`${systemId}:${apiKey}`).toString('base64');
  return `Basic ${token}`;
}

async function put(path: string, systemId: string, apiKey: string, body: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: {
      authorization: authHeader(systemId, apiKey),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* nem-JSON válasz */
  }
  if (!res.ok) {
    throw new Error(`MiniCRM ${path} HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

/**
 * Létrehoz egy Business kontaktot (cégnév + elérhetőség) és egy hozzá tartozó
 * Projectet az Értékesítés pipeline "Kapcsolatfelvétel" státuszában.
 * A választott szolgáltatások / cégméret / üzenet a projekt nevében és leírásában.
 */
export async function pushLeadToMiniCrm(lead: MiniCrmLead): Promise<Result> {
  const systemId =
    import.meta.env.MINICRM_SYSTEM_ID || process.env.MINICRM_SYSTEM_ID || '';
  const apiKey = import.meta.env.MINICRM_API_KEY || process.env.MINICRM_API_KEY || '';
  if (!systemId || !apiKey) return { skipped: true };

  // Opcionális alapértelmezett felelős (MINICRM_RESPONSIBLE_USER_ID env)
  const userIdRaw =
    import.meta.env.MINICRM_RESPONSIBLE_USER_ID || process.env.MINICRM_RESPONSIBLE_USER_ID || '';
  const userId = userIdRaw ? Number(userIdRaw) : undefined;

  try {
    // 1. Business kontakt (a cég)
    const contact = await put('/Contact', systemId, apiKey, {
      Type: 'Business',
      Name: lead.company,
      Email: lead.email || undefined,
      Phone: lead.phone || undefined,
    });
    const contactId = contact?.Id ?? contact?.ContactId;
    if (!contactId) {
      return { ok: false, error: 'MiniCRM: nincs ContactId a válaszban' };
    }

    // 2. Project az Értékesítés pipeline-ba, Kapcsolatfelvétel státuszba
    const descLines = [
      `Kapcsolattartó: ${lead.name}`,
      lead.serviceLabel ? `Szolgáltatás: ${lead.serviceLabel}` : '',
      lead.headcountLabel ? `Cégméret: ${lead.headcountLabel}` : '',
      lead.message ? `Üzenet: ${lead.message}` : '',
      `Forrás: weboldal (${lead.source ?? 'ajanlatkero'})`,
    ].filter(Boolean);

    const project = await put('/Project', systemId, apiKey, {
      CategoryId: CATEGORY_ERTEKESITES,
      ContactId: contactId,
      StatusId: STATUS_KAPCSOLATFELVETEL,
      Name: lead.serviceLabel
        ? `${lead.company} – ${lead.serviceLabel} (weboldal)`
        : `${lead.company} – weboldal ajánlatkérés`,
      Description: descLines.join('\n'),
      ...(userId ? { UserId: userId } : {}),
    });
    const projectId = project?.Id;
    if (!projectId) {
      return { ok: false, error: 'MiniCRM: nincs projekt Id a válaszban' };
    }
    return { ok: true, projectId };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
