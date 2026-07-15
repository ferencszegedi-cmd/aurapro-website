// Közös API-védelmi segédek: IP rate-limit + Cloudflare Turnstile ellenőrzés.
// A /api/lead és a /api/newsletter használja.

// --- Egyszerű IP-alapú rate-limit (példány-szintű memória; Fluid Compute
// újrahasznosítja a példányokat, így értelmes védelmet ad plusz infra nélkül) ---
const rlHits = new Map<string, number[]>();

export function rateLimited(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rlHits.get(ip) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  if (rlHits.size > 10_000) rlHits.clear(); // memóriavédelem
  rlHits.set(ip, hits);
  return hits.length > limit;
}

// --- Cloudflare Turnstile szerver-oldali ellenőrzés (env-vezérelt) ---
// Ha a TURNSTILE_SECRET_KEY nincs beállítva, az ellenőrzés kimarad (degraded).
export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // nincs kulcs → nincs ellenőrzés
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Cloudflare-hiba esetén NEM dobjuk el a leadet (fail-open) – a honeypot
    // és a rate-limit így is véd, valódi ügyfelet nem veszítünk.
    return true;
  }
}
