# Aurapro Kft. – weboldal

Az [Aurapro Kft.](https://www.aurapro.hu) hivatalos weboldala. Tevékenység:
munkavédelem, tűzvédelem, környezetvédelem.

## Tech-stack

| Komponens | Választás |
| :-------- | :-------- |
| Framework | Astro 6 (statikus generálás) |
| Styling   | Tailwind CSS 4 |
| Hosting   | Vercel (CDN, automatikus SSL) |
| Form      | Vercel Function (`/api/lead`) + Resend |
| Tartalom  | `.astro` oldalak + Markdown blog |

## Deploy

A Vercel **Git-integráción** keresztül automatikus:

- push a `master` branch-re → **production** deploy
- push bármely más branch-re → **preview** URL (nem érinti az éles oldalt)

Production (jelenleg teszt domain): https://aurapro-website.vercel.app
Végleges domain: https://www.aurapro.hu

## Parancsok

A projekt gyökeréből, terminálból:

| Parancs            | Mit csinál                                  |
| :----------------- | :------------------------------------------ |
| `npm install`      | Függőségek telepítése                        |
| `npm run dev`      | Lokális dev szerver: `localhost:4321`        |
| `npm run build`    | Production build a `./dist/` mappába         |
| `npm run preview`  | A build helyi előnézete deploy előtt         |

## Struktúra

```text
src/
├── layouts/      # BaseLayout, PageLayout, LandingPageLayout
├── components/   # Header, Footer, Hero, ContactForm, FaqAccordion, ...
├── pages/        # .astro oldalak (route = fájlnév)
│   └── api/      # lead.ts – Vercel Function (form backend)
├── content/      # Markdown blog
├── styles/       # global.css (Tailwind + custom)
└── assets/       # logó, képek
```

## Környezeti változók (Vercel projekt-beállításnál)

A teljes form- és tracking-funkcióhoz (l. `fejlesztes/statusz-*` a Béla-rendszerben):
`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `PUBLIC_GA4_ID`,
`PUBLIC_ADS_CONVERSION_ID`, `PUBLIC_ADS_LEAD_LABEL`.
