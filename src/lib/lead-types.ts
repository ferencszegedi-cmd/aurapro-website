// A QuoteWizard 1. lépésének választható szolgáltatás-slugjai.
// Szinkronban tartandó a src/pages/api/lead.ts serviceLabels mapjével.
export type ServiceValue =
  | 'munkavedelem'
  | 'tuzvedelem'
  | 'kornyezetvedelem'
  | 'elsosegely'
  | 'mv-kepviselo'
  | 'online-oktatas'
  | 'gepvizsgalat'; // legacy — a wizardból 2026-07-23-án kikerült, régi beküldések miatt marad
