// Egyszerű i18n a kétnyelvű oldalhoz (HU alap + EN).
// A magyar a default: a lang prop hiányában minden komponens 'hu'-t használ,
// így a meglévő magyar oldalak változatlanul működnek.

export type Lang = 'hu' | 'en';
export const defaultLang: Lang = 'hu';
export const languages: Record<Lang, string> = { hu: 'Magyar', en: 'English' };

// HU ↔ EN útvonalpárok (angol slug-ok /en/ alatt). A nyelvváltó és a hreflang
// ebből számolja a megfelelő párt. Ami nincs itt (jogi oldalak, /lp/), annak a
// nyelvváltója a másik nyelv főoldalára mutat.
export const ROUTES: { hu: string; en: string }[] = [
  { hu: '/', en: '/en/' },
  { hu: '/rolunk/', en: '/en/about/' },
  { hu: '/munkavedelem/', en: '/en/occupational-safety/' },
  { hu: '/tuzvedelem/', en: '/en/fire-safety/' },
  { hu: '/kornyezetvedelem/', en: '/en/environmental-protection/' },
  { hu: '/kockazatertekeles/', en: '/en/risk-assessment/' },
  { hu: '/munkavedelmi-oktatas/', en: '/en/occupational-safety-training/' },
  { hu: '/tuzvedelmi-oktatas/', en: '/en/fire-safety-training/' },
  { hu: '/munkavedelmi-kepviselo-kepzes/', en: '/en/safety-representative-training/' },
  { hu: '/elsosegelynyujto-tanfolyam/', en: '/en/first-aid-course/' },
  { hu: '/referenciak/', en: '/en/references/' },
  { hu: '/munkatarsaink/', en: '/en/team/' },
  { hu: '/gyik/', en: '/en/faq/' },
  { hu: '/karrier/', en: '/en/careers/' },
  { hu: '/kapcsolat/', en: '/en/contact/' },
  { hu: '/koszonjuk/', en: '/en/thank-you/' },
];

function normalize(p: string): string {
  if (!p) return '/';
  // trailing slash egységesítés (a / kivételével)
  if (p.length > 1 && !p.endsWith('/')) p = p + '/';
  return p;
}

/** Az adott útvonal párja a másik nyelven (ha nincs pár, a másik nyelv főoldala). */
export function getAlternatePath(pathname: string, target: Lang): string {
  const p = normalize(pathname);
  const hit = ROUTES.find((r) => r.hu === p || r.en === p);
  if (hit) return target === 'en' ? hit.en : hit.hu;
  return target === 'en' ? '/en/' : '/';
}

/** Van-e a magyar útvonalnak angol párja (a HU EN-zászló ne mutasson vakon a főoldalra). */
export function hasAlternate(pathname: string): boolean {
  const p = normalize(pathname);
  return ROUTES.some((r) => r.hu === p || r.en === p);
}

// Fejléc/lábléc navigáció nyelvenként (label + href).
export function navItems(lang: Lang) {
  const t = ui[lang];
  const r = (hu: string) => (lang === 'en' ? getAlternatePath(hu, 'en') : hu);
  return [
    { label: t.nav.about, href: r('/rolunk/') },
    {
      label: t.nav.services,
      children: [
        { label: t.nav.occupationalSafety, href: r('/munkavedelem/') },
        { label: t.nav.fireSafety, href: r('/tuzvedelem/') },
        { label: t.nav.environmental, href: r('/kornyezetvedelem/') },
        { label: t.nav.riskAssessment, href: r('/kockazatertekeles/') },
        { label: t.nav.osTraining, href: r('/munkavedelmi-oktatas/') },
        { label: t.nav.fsTraining, href: r('/tuzvedelmi-oktatas/') },
        { label: t.nav.repTraining, href: r('/munkavedelmi-kepviselo-kepzes/') },
        { label: t.nav.firstAid, href: r('/elsosegelynyujto-tanfolyam/') },
      ],
    },
    { label: t.nav.references, href: r('/referenciak/') },
    { label: t.nav.team, href: r('/munkatarsaink/') },
    { label: t.nav.faq, href: r('/gyik/') },
    { label: t.nav.careers, href: r('/karrier/') },
    { label: t.nav.contact, href: r('/kapcsolat/') },
  ];
}

export const ui = {
  hu: {
    nav: {
      about: 'Rólunk',
      services: 'Szolgáltatások',
      occupationalSafety: 'Munkavédelem',
      fireSafety: 'Tűzvédelem',
      environmental: 'Környezetvédelem',
      riskAssessment: 'Kockázatértékelés',
      osTraining: 'Munkavédelmi oktatás',
      fsTraining: 'Tűzvédelmi oktatás',
      repTraining: 'Munkavédelmi képviselő képzés',
      firstAid: 'Elsősegélynyújtó tanfolyam',
      references: 'Referenciák',
      team: 'Munkatársaink',
      faq: 'GYIK',
      careers: 'Karrier',
      contact: 'Kapcsolat',
    },
    header: { quote: 'Ajánlatkérés', langAria: 'Magyar nyelv (aktuális)', switchToEn: 'English' },
    footer: {
      tagline: 'Munkavédelem, tűzvédelem és környezetvédelem – egy kézből, 40 millió Ft bírsággaranciával.',
      services: 'Szolgáltatások',
      company: 'Cég',
      contact: 'Kapcsolat',
      about: 'Rólunk',
      references: 'Referenciák',
      team: 'Munkatársaink',
      faq: 'GYIK',
      privacy: 'Adatvédelem',
      imprint: 'Impresszum',
      rights: 'Minden jog fenntartva.',
    },
    cookie: {
      text: 'Az oldal sütiket használ a jobb felhasználói élmény érdekében.',
      details: 'Részletek',
      reject: 'Elutasítom',
      accept: 'Elfogadom',
    },
    sticky: { call: 'Hívás', quote: 'Ajánlatkérés' },
    exit: {
      title: 'Mielőtt elmenne…',
      subtitle: 'Iratkozzon fel, hogy értesüljön a legújabb jogszabály-változásokról!',
      name: 'Név',
      email: 'E-mail',
      gdprPre: 'Elolvastam és elfogadom az',
      gdprLink: 'Adatkezelési tájékoztatót',
      submit: 'Feliratkozom',
      sending: 'Küldés…',
      success: 'Köszönjük! Feliratkozott a jogszabály-változás értesítőre.',
    },
    band: {
      title: 'Kérjen ingyenes felmérést és ajánlatot',
      subtitle: 'Fél perc alatt kitölthető – 24 órán belül visszahívjuk!',
      badgeFree: 'Ingyenes',
      badge24h: '24 órán belüli válasz',
      badgeGuarantee: '40M Ft bírsággarancia',
    },
    card: { details: 'Részletek' },
    stats: {
      years: 'év tapasztalat',
      experts: 'szakértő országszerte',
      refs: 'nagyvállalati referencia',
      fines: 'bírság közel 20 év alatt',
    },
    hero: { defaultCta: 'Ingyenes ajánlat 24 órán belül' },
    wizard: {
      heading: 'Kérjen ingyenes ajánlatot',
      subheadingA: 'Fél perc alatt kitölthető',
      subheadingB: 'Válasz 24 órán belül',
      legend: 'Melyik szolgáltatás érdekli?',
      multi: 'Több is választható.',
      svcOccupational: 'Munkavédelem',
      svcFire: 'Tűzvédelem',
      svcEnvironmental: 'Környezetvédelem',
      svcFirstAid: 'Elsősegélynyújtó képzés',
      svcRep: 'Munkavédelmi képviselő képzés',
      svcMeasurement: 'Elektromos mérés vagy gépvizsgálat',
      company: 'Cég neve',
      contactName: 'Kapcsolattartó neve',
      phone: 'Telefonszám',
      email: 'Email',
      message: 'Üzenet (opcionális)',
      messagePlaceholder: 'Pl. iparág, telephelyek, határidő…',
      gdprPre: 'Elolvastam és elfogadom az',
      gdprLink: 'Adatkezelési tájékoztatót',
      submit: 'Ingyenes ajánlat kérése',
      trust: '✓ Válasz 24 órán belül  ✓ Kötelezettségmentes  ✓ 40M Ft bírsággarancia',
      back: '← Vissza',
      next: 'Tovább →',
      errNoService: 'Kérjük, válasszon legalább egy szolgáltatást.',
      sending: 'Küldés…',
      stepWord: 'lépés',
      lastStep: 'Utolsó lépés',
    },
  },

  en: {
    nav: {
      about: 'About us',
      services: 'Services',
      occupationalSafety: 'Occupational safety',
      fireSafety: 'Fire safety',
      environmental: 'Environmental protection',
      riskAssessment: 'Risk assessment',
      osTraining: 'Occupational safety training',
      fsTraining: 'Fire safety training',
      repTraining: 'Safety representative training',
      firstAid: 'First aid course',
      references: 'References',
      team: 'Our team',
      faq: 'FAQ',
      careers: 'Careers',
      contact: 'Contact',
    },
    header: { quote: 'Get a quote', langAria: 'English (current)', switchToEn: 'English' },
    footer: {
      tagline: 'Occupational safety, fire safety and environmental protection – from a single provider, backed by a HUF 40 million penalty guarantee.',
      services: 'Services',
      company: 'Company',
      contact: 'Contact',
      about: 'About us',
      references: 'References',
      team: 'Our team',
      faq: 'FAQ',
      privacy: 'Privacy policy',
      imprint: 'Imprint',
      rights: 'All rights reserved.',
    },
    cookie: {
      text: 'This website uses cookies to improve your experience.',
      details: 'Details',
      reject: 'Decline',
      accept: 'Accept',
    },
    sticky: { call: 'Call', quote: 'Get a quote' },
    exit: {
      title: 'Before you go…',
      subtitle: 'Subscribe to stay up to date with the latest legislative changes!',
      name: 'Name',
      email: 'E-mail',
      gdprPre: 'I have read and accept the',
      gdprLink: 'Privacy Policy',
      submit: 'Subscribe',
      sending: 'Sending…',
      success: 'Thank you! You have subscribed to our legislation update newsletter.',
    },
    band: {
      title: 'Request a free assessment and quote',
      subtitle: 'Takes half a minute to fill in – we call you back within 24 hours!',
      badgeFree: 'Free',
      badge24h: 'Reply within 24 hours',
      badgeGuarantee: 'HUF 40M penalty guarantee',
    },
    card: { details: 'Details' },
    stats: {
      years: 'years of experience',
      experts: 'experts nationwide',
      refs: 'enterprise references',
      fines: 'fines in nearly 20 years',
    },
    hero: { defaultCta: 'Free quote within 24 hours' },
    wizard: {
      heading: 'Request a free quote',
      subheadingA: 'Fill in within half a minute',
      subheadingB: 'Reply within 24 hours',
      legend: 'Which service are you interested in?',
      multi: 'You can select more than one.',
      svcOccupational: 'Occupational safety',
      svcFire: 'Fire safety',
      svcEnvironmental: 'Environmental protection',
      svcFirstAid: 'First aid training',
      svcRep: 'Safety representative training',
      svcMeasurement: 'Electrical or machine inspection',
      company: 'Company name',
      contactName: 'Contact name',
      phone: 'Phone number',
      email: 'Email',
      message: 'Message (optional)',
      messagePlaceholder: 'E.g. industry, sites, deadline…',
      gdprPre: 'I have read and accept the',
      gdprLink: 'Privacy Policy',
      submit: 'Request a free quote',
      trust: '✓ Reply within 24 hours  ✓ No obligation  ✓ HUF 40M penalty guarantee',
      back: '← Back',
      next: 'Next →',
      errNoService: 'Please select at least one service.',
      sending: 'Sending…',
      stepWord: 'step',
      lastStep: 'Last step',
    },
  },
} as const;

export function useTranslations(lang: Lang) {
  return ui[lang] ?? ui[defaultLang];
}
