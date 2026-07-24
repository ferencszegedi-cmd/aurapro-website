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
- **Nyelvváltó fent: Magyar · English · 中文** (teljes fordítás)
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

---

## DOMAIN — döntés és lépések (hétfőre)

> ✅ **ELÉRHETŐSÉG ELLENŐRIZVE (2026-07): mind a 3 domain SZABAD, foglalható** — `budaorsbox.hu`, `stresszbox.hu`, `boxbudaors.hu`. Hétfőn ezeket kell megvenni magyar registrarnál (rackhost.hu / domain.hu). Érdemes gyorsan lefoglalni, mielőtt más elviszi.

**Választott terv (Béla ajánlása):**
- **Fő domain: `budaorsbox.hu`** — márka + hely (Budaörs Box), jó a helyi Google-kereséshez, könnyen bediktálható. **(SZABAD ✔)**
- **Marketing-átirányítás: `stresszbox.hu`** — a menedzser/cégvezető célcsoporthoz fülbemászó („stresszlevezetés bokszban”), átirányítva a főre; ezt jó kampányban/Instán kommunikálni. **(SZABAD ✔)**
- **Elgépelés-védelem: `boxbudaors.hu`** — átirányítva a főre. **(SZABAD ✔)**
- Kerülendő: hosszú `budaorsboxacademy.hu` (nehéz bediktálni); a „boksz” írásmód (a márka „**box**”, maradj annál).

**.hu regisztráció** (NEM megy automatikusan Vercelen át — magyar registrar kell):
1. Elérhetőség + vásárlás: **rackhost.hu** / **domain.hu** / **3-in-1.hu** — írd be a nevet; ha szabad, vedd meg (kb. 2000–4000 Ft/év). A `.hu`-hoz általában magyar személy/cég adatok kellenek.
2. **Vercelhez kötés** (miután megvan a domain ÉS az oldal fent van Vercelen):
   - Vercel projekt → **Settings → Domains → Add** → `budaorsbox.hu`
   - A Vercel ad egy DNS-beállítást: **A-rekord `76.76.21.21`** VAGY **CNAME `cname.vercel-dns.com`**
   - A registrar DNS-kezelőjében állítsd be ezt; a `www`-t is: **CNAME → `cname.vercel-dns.com`**
   - Pár perc–óra múlva él, a Vercel automatikusan HTTPS/SSL-t is ad.
3. `stresszbox.hu` és `boxbudaors.hu`: vedd meg, majd a registrarnál állítsd **átirányítás/redirect → `https://budaorsbox.hu`** (vagy Vercelben add hozzá redirect-domainként).

**Megjegyzés:** az elérhetőség-ellenőrzést és a domain-vásárlást a mostani munkamenetből nem tudtam elvégezni (a Vercel-műveletek jóváhagyást kérnek, ami itt nem megy át; a `.hu` amúgy is magyar registraron keresztül megy). Ezért a fenti manuális lépésekkel.

---

## CARLOS ÚJ PROFI FOTÓI — a Gmailben várnak (hétfőn letölteni)

Carlos elküldte a ~10 profi fotót (köztük a fekete Nike pólós portré a ring előtt), te pedig továbbküldted a **saját Gmailedre** (ferenc.szegedi@gmail.com).

**Hol vannak pontosan:**
- Gmail, **3 e-mail**, feladó = címzett = `ferenc.szegedi@gmail.com`
- Dátum: **2026-07-24**, kb. **18:51 / 18:52 / 18:53**, tárgy nélkül, csatolt képekkel
- Gmail-kereső: **`from:me to:me has:attachment`** → nyisd meg a mai (18:51–18:53) leveleket

**Hétfői teendő (irodai gép):**
1. Töltsd le a képeket a Gmailből a gépre.
2. Tedd a fájlokat a `public/box/` mappába (pl. `carlos-pro.jpg`, `edzes-1.jpg`, …).
3. Jelezd → becserélem Carlos fotóját a **profi portréra** (Carlos-szekció + galéria), és a többi jó képet is beteszem a galériába, majd újraépítés.

**Megjegyzés:** a képfájlokat a mostani munkamenetből nem tudtam közvetlenül a projektbe menteni (a nagy csatolmány-bájtokat a környezet nem mozgatja fájlként), de a Gmailben biztonságban vannak, onnan hétfőn letölthetők.
