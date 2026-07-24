# Budaörs Box Academy — weboldal (átadó jegyzet)

Ez a Budaörs Box Academy (BBA) amatőr/hobbi bokszklub weboldala. Carlos vezetőedző.
Cél: minél több bokszoló jöjjön a klubba. Az első edzés ingyenes.

## Élő linkek
- **Előnézet (mindig a legfrissebb, de belépés kell hozzá):**
  https://claude.ai/code/artifact/5f2f01d5-7840-44ea-9915-46c0dc8e2ea0
- **Publikus, megosztható (Vercel, kicsit régebbi verzió):**
  https://budaors-box-academy.vercel.app

## Hol van mi a repóban
Repo: `ferencszegedi-cmd/aurapro-website` · branch: `claude/budaors-box-klub-website-6fegy4`

- `public/box/` — **a KÉSZ oldal** (ezt kell Vercelre kitenni):
  - `index.html` — önálló oldal (betűtípusok beágyazva, képek relatív `./*.jpg`). Közvetlenül szerkeszthető és deployolható.
  - `site.html` — ugyanaz, de a képeket/videókat jsDelivr CDN-ről tölti (a jelenlegi Vercel-shell ezt hívja).
  - `*.jpg`, `vid/*.mp4` — a valódi fotók és videók.
- `box-src/` — **a szerkeszthető FORRÁS**:
  - `template.html` — a fő sablon (ezt szerkeszd tartalomhoz/dizájnhoz). `{{FONTS_CSS}}` token a betűtípusoknak.
  - `fonts.css` — a beágyazott betűtípusok (Anton + Barlow, magyar ékezetekkel).
  - `build.py` — ebből legyártja a `public/box/index.html`-t és a `standalone.html`-t.
  - `fonts/` — a nyers woff2 betűfájlok.

## Újraépítés (ha a template.html-t szerkeszted)
A repo gyökeréből:
```
pip install Pillow imageio-ffmpeg
python3 box-src/build.py
```
Ez frissíti a `public/box/index.html`-t. (A `standalone.html` a teljesen önálló, minden beágyazva — ez ment az előnézetbe.)

## Mi van kész a weboldalon
- Fekete-arany BBA márka + BBA embléma (SVG)
- **Nyelvváltó fent: Magyar · Roma · 中文** (teljes fordítás; a roma/lovári fordítást érdemes anyanyelvivel átnézetni)
- Hero: Higgsfield-generált fekete párduc (a klub kabalája) — CDN-hotlink, ha nem tölt be, a valódi ring-fotóra vált
- Valódi **órarend** és edzők: Carlos, Bertók Róbert, Tibi bá', Totka Pali bácsi
- **Online jelentkezés** (edzésválasztóval) → e-mailt nyit Carlosnak: **terra.budai@gmail.com**
- Carlos-szekció (vezetőedző) + Carlos a galériában
- Galéria **kép-nagyítással (lightbox)**, 2 videó, GYIK, kapcsolat
- Reszponzív: telefon (Android/iPhone), álló és fekvő is rendben

## Valódi adatok
- Név: **Budaörs Box Academy (BBA)**
- Cím: **Budaörs, TerraPark, Edison u. 3**
- Telefon (Carlos): **06 70 365 9393**
- E-mail: **terra.budai@gmail.com**
- Szlogen: „A bajnokok itt kezdődnek." / „Lépj ki a határaidból, légy a legjobb önmagad!"

## TEENDŐK (itt folytasd)
1. **Friss verzió kirakása Vercelre** (a nyelvváltós/Carlos-galériás verzió).
   Legegyszerűbb, git-kötött, magától frissül:
   - vercel.com → **Add New → Project** → repo: **aurapro-website** → *Import*
   - **Root Directory: `public/box`**  (fontos!)
   - Branch: **`claude/budaors-box-klub-website-6fegy4`**
   - **Deploy** → kapsz egy publikus linket, ami ezután minden push-nál automatikusan frissül.
2. **Carlos új, profi fotói (10 db)** — Carlos küldte, cseréljük le a mostani gárda-pózos képet a
   fekete Nike pólós profi portréra (a Carlos-szekcióban és a galériában), és a többi jó képet is a galériába.
   A képfájlokat fel kell tölteni (nem képernyőképként).
3. Opcionális: saját domain (pl. budaorsboxacademy.hu) rákötése a Vercel-projektre.

— Ha bármi kell, folytasd nyugodtan; a forrás és a kész oldal is itt van a repóban.
