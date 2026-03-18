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
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PENSION', label: 'Penzionerski' },
] as const

export const CURRENT_BUSINESS_SUBTYPES = [
  { value: 'DOO', label: 'D.O.O.' },
  { value: 'AD', label: 'A.D.' },
  { value: 'PREDUZETNIK', label: 'Preduzetnik' },
] as const

export const LOAN_TYPES = [
  { value: 'CASH', label: 'Gotovinski' },
  { value: 'MORTGAGE', label: 'Stambeni' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'REFINANCING', label: 'Refinansiranje' },
  { value: 'STUDENT', label: 'Studentski' },
] as const

export const LOAN_PERIODS_MONTHS = [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360] as const

export const PAYMENT_CODES = [
  { value: '221', label: '221 - Platni promet' },
  { value: '253', label: '253 - Komunalije' },
  { value: '289', label: '289 - Ostalo' },
] as const
