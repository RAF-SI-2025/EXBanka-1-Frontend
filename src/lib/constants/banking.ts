export const SUPPORTED_CURRENCIES = [
  'RSD',
  'EUR',
  'CHF',
  'USD',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const FOREIGN_CURRENCIES = ['EUR', 'CHF', 'USD', 'GBP', 'JPY', 'CAD', 'AUD'] as const

export const CURRENT_PERSONAL_SUBTYPES = [
  { value: 'STANDARD', label: 'Standardni' },
  { value: 'SAVINGS', label: 'Štedni' },
  { value: 'PENSION', label: 'Penzionerski' },
  { value: 'YOUTH', label: 'Za mlade' },
  { value: 'STUDENT', label: 'Za studente' },
  { value: 'UNEMPLOYED', label: 'Za nezaposlene' },
] as const

export const CURRENT_BUSINESS_SUBTYPES = [
  { value: 'DOO', label: 'DOO' },
  { value: 'AD', label: 'AD' },
  { value: 'PREDUZETNIK', label: 'Preduzetnik' },
  { value: 'FONDACIJA', label: 'Fondacija' },
] as const

export const LOAN_TYPES = [
  { value: 'CASH', label: 'Gotovinski' },
  { value: 'MORTGAGE', label: 'Stambeni' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'REFINANCING', label: 'Refinansiranje' },
  { value: 'STUDENT', label: 'Studentski' },
] as const

export const LOAN_PERIODS_MONTHS = [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360] as const

export const LOAN_PERIODS_BY_TYPE: Record<string, number[]> = {
  CASH: [12, 24, 36, 48, 60, 72, 84],
  AUTO: [12, 24, 36, 48, 60, 72, 84],
  STUDENT: [12, 24, 36, 48, 60, 72, 84],
  REFINANCING: [12, 24, 36, 48, 60, 72, 84],
  MORTGAGE: [60, 120, 180, 240, 300, 360],
}

export const INTEREST_TYPES = [
  { value: 'FIXED', label: 'Fiksna' },
  { value: 'VARIABLE', label: 'Varijabilna' },
] as const

export const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED', label: 'Stalno zaposlenje' },
  { value: 'SELF_EMPLOYED', label: 'Privremeno zaposlenje' },
  { value: 'UNEMPLOYED', label: 'Nezaposlen' },
  { value: 'RETIRED', label: 'Penzioner' },
] as const

export const PAYMENT_CODES = [
  { value: '221', label: '221 - Platni promet' },
  { value: '253', label: '253 - Komunalije' },
  { value: '289', label: '289 - Ostalo' },
] as const
