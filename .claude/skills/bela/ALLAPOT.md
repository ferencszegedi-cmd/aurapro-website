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
1. **Résztulajdon-leadek mélymerülése** — Zugló `500.V.1636/2024/100` és
   `038.V.0879/2025/33` (lásd `nyilvantartas.md`). Add át a nyomozónak pontos
   számokért (böngésző-automatizálással a bot-védett oldalakon).
2. **Böngésző-automatizálás bekötése** a nyomozó mögé (Alfred skill), hogy a
   per-tételes becsérték/minimumár/terhek automatikusan is meglegyen — jóváhagyásra vár.

## Legutóbbi jelentés
`jelentesek/2026-07-24-beavato.md`
