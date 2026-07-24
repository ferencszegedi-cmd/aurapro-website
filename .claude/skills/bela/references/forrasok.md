# Források — magyar árverési csatornák

Béla három hivatalos csatornát figyel, plusz aggregátorokat a gyorsabb szűréshez.
Budapest + Pest megye a fókusz.

## 1. Bírósági végrehajtói árverés — EÁR

- **Portál:** https://arveres.mbvk.hu (Magyar Bírósági Végrehajtói Kar,
  Elektronikus Árverési Rendszer).
- **Mit árvereznek:** végrehajtás alá vont ingatlan és ingóság.
- **Ár-mechanika (kulcs a diszkonthoz):** az érvényes vételi ajánlat alsó határa
  az árverés szakaszaiban a kikiáltási ár (= becsérték) **90% → 70% → 50%**-a.
  - Lakóingatlan, ahol az adós lakik: a padló jellemzően **70%**.
  - Egyéb ingatlan / ismételt sikertelen árverés után: akár **50%**.
  - → Az **ismételt árverés, ahol a minimum már 70% vagy 50%**, önmagában diszkont-jel.
- **Előleg:** árverési előleg (jellemzően a becsérték ~10%-a) szükséges a licithez.
- **Résztulajdon:** gyakori a „tulajdoni hányad / illetőség" tétel — ezekre külön szűrj.

## 2. NAV Elektronikus Árverési Felület — EÁF

- **Portál:** https://arveres.nav.gov.hu
- **Kapcsolódó (állami vagyon):** MNV Elektronikus Aukciós Rendszer —
  https://e-arveres.mnv.hu (ingatlan és ingóság külön listákkal).
- **Mit árvereznek:** adóvégrehajtásban lefoglalt ingóság (autó, gép, műszaki cikk,
  műtárgy) és ingatlan.
- **Ár-mechanika:** a kikiáltási ár jellemzően a valós érték **50–70%-a**, de
  legalább annyi. Anonim licit a végéig. Ingatlannál 10% letét.
- **Licitlépcső (tájékoztató):** 1 000 Ft-tól; 100 000 Ft felett ≥ 5 000 Ft;
  500 000 Ft felett ≥ 20 000 Ft; 5 M Ft felett ≥ 50 000 Ft; 10 M Ft felett ≥ 100 000 Ft.

## 3. EÉR — Elektronikus Értékesítési Rendszer

- **Portál:** https://eer.gov.hu (és https://eer.sztfh.hu)
- **Kereső-URL minta (aktív/meghirdetett árverések):**
  `https://eer.gov.hu/kereses/?searchText=&searchType=OFFER&offer%5Bkind%5D%5B%5D=AUCTION&offer%5Bstatus%5D%5B%5D=PUBLISHED&offer%5Bstatus%5D%5B%5D=ACTIVE&searchMethod=detailed`
- **Mit árvereznek:** felszámolás / végelszámolás alatt álló cégek vagyontárgyai —
  ingatlan, ingóság, készlet, követelés, és sok **résztulajdon / illetőség**.
- **Résztulajdon specialitás:** a tulajdonostársakat a felszámolási értékesítésnél
  **elővásárlási jog** illeti meg — ezt a kivásárlási stratégiánál számításba kell venni.

## Aggregátorok (belépési pont, nem elsődleges forrás)

- https://licit.info — ingatlan/ingóság árverések megye/település szerint, NAV + bírósági.
- https://arveresertesito.hu — árverési hirdetmények gyűjtője, e-mail értesítővel.

> A kulcsadatokat (minimum ár, becsérték, határidő, terhek, cím) **mindig a hivatalos
> hirdetményen erősítsd meg**, az aggregátor csak felderítésre jó.

## Piaci érték kereszt-ellenőrzés

- Ingatlan: https://ingatlan.com — azonos kerület/település, hasonló méret és
  állapot m²-ára → ebből becsüld a valós piaci értéket.
- Ingóság (autó): hasonló évjárat/futás piaci hirdetései (pl. hasznaltauto.hu).

## Adathozzáférés a gyakorlatban (FONTOS)

Ebben a futtatókörnyezetben tapasztalt korlátok:

- A **`WebSearch` MŰKÖDIK** — a Google-alapú keresés valós listákat, aggregált
  számokat (átlag kikiáltási ár, tételszám) és konkrét hirdetményeket (ügyszám,
  kerület, hányad) hoz vissza a találati snippetekben. **Ez Béla elsődleges
  adatforrása.**
- A **`WebFetch` az árverési portálokra jellemzően 403-at ad** (licit.info, NAV
  `arveres.nav.gov.hu`, MNV `e-arveres.mnv.hu`, EÉR `eer.sztfh.hu`) — ezek
  bot-védelme utasítja el az automata lekérést, nem a proxy.
- A **`kormanyhivatalok.hu`** (ahol a végrehajtói PDF-hirdetmények vannak) a
  **szervezeti egress-szabály** miatt blokkolt — ezt NE kerüld meg.

Ebből fakadó munkamódszer:
1. Dolgozz **WebSearch-alapon**: célzott keresésekkel gyűjts tételeket és a
   snippetből kinyerhető számokat.
2. Amit a snippetből nem tudsz megerősíteni (pontos becsérték, minimum ár, terhek),
   azt **jelöld „nem megerősített"-ként** — SOHA ne találj ki számot.
3. A jelentésben mindig add meg a hirdetmény linkjét, hogy a tulajdonos egy
   kattintással megnyithassa a hivatalos oldalt (böngészőben az elérhető).

Ha a tulajdonos teljes, per-tétel adatot akar automatikusan, két járható út:
- Beállítani egy **e-mail értesítőt** (pl. arveresertesito.hu) inputként.
- Élő (interaktív) munkamenetben **böngésző-automatizálással** (pl. az `alfred`
  skill) megnyitni a bot-védett oldalakat mélymerüléshez.

## Hasznos keresőkifejezések

- `végrehajtói árverés ingatlan Budapest ismételt 70%`
- `NAV árverés ingatlan Pest megye`
- `EÉR felszámolás illetőség tulajdoni hányad`
- `illetőség árverés Budapest 1/2 hányad`
