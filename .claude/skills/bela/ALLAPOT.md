# INNEN FOLYTATOM — Béla állapotfájl

> Ezt olvasd el elsőként, ha új gépen (pl. irodai) vagy új munkamenetben folytatod.
> Béla minden futás végén frissíti ezt a fájlt, és commitolja + pusholja.

**Utolsó frissítés:** 2026-07-24
**Ág:** `claude/auction-property-agent-t06zxn`
**Tulajdonos / értesítendő:** ferenc.szegedi@gmail.com

## Mi épült meg
- **Béla = fő ügynök / orchestrator** (skill: `.claude/skills/bela/SKILL.md`). Ő tud
  mindent, ő koordinál és delegál.
- **Béla nyomozója** (al-ügynök: `.claude/agents/bela-nyomozo.md`) — egyszerre egy
  tétel pontos adatait nyomozza ki, verdiktet ad vissza.
- **Ütemezés:** Routine `trig_01RcxKdtEjsCePhi7uz1j4oh` — hétfő + csütörtök reggel,
  e-mail értesítéssel.
- **Perzisztencia:** jelentések a `jelentesek/` mappában, leadek a
  `nyilvantartas.md`-ben. Minden commitolva + pusholva → bármely gépen `git pull`.

## Beállítások (döntéseid)
- Régió: **Budapest + Pest megye**
- Vagyontárgy: **ingatlan · ingóság · résztulajdon/illetőség**
- Értesítés: **e-mail**

## Nyitott szálak (hétfőre)
1. **KIEMELT LEHETŐSÉG — Bp. XIV. Egressy út 167/A-B** (ügyszám `038.V.0879/2025/33`,
   határidő **2026-08-06**, kikiáltási 60 M, előleg 6 M). Nagy zuglói telek (1070 m²),
   piaci ~120–170 M → **feltételes ~50–65% diszkont**. Részletes verdikt:
   `jelentesek/2026-07-24-egressy-lead.md`.
   **SÜRGŐS DD (13 nap):** TAKARNET tulajdoni lap — egész 1/1 vagy 1/2 illetőség? +
   terhek (haszonélvezet?). Ez dönti el, valódi-e az üzlet.
2. `500.V.1636/2024/100` (Kramberger) **ELVETVE** — Tállya (Borsod), haszonélvezet, lakott.
3. **Böngésző-automatizálás bekötése** a nyomozó mögé (Alfred skill), hogy a
   per-tételes terhek/becsérték automatikusan is meglegyen — jóváhagyásra vár.

## Legutóbbi jelentés
`jelentesek/2026-07-24-egressy-lead.md` (kiemelt lehetőség) · `jelentesek/2026-07-24-beavato.md`
