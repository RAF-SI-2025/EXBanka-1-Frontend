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
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'PENSION', label: 'Pension' },
  { value: 'YOUTH', label: 'Youth' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
] as const

export const CURRENT_BUSINESS_SUBTYPES = [
  { value: 'DOO', label: 'DOO' },
  { value: 'AD', label: 'AD' },
  { value: 'PREDUZETNIK', label: 'Sole Trader' },
  { value: 'FONDACIJA', label: 'Foundation' },
] as const

export const LOAN_TYPES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'REFINANCING', label: 'Refinancing' },
  { value: 'STUDENT', label: 'Student' },
] as const

export const LOAN_PERIODS_MONTHS = [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360] as const

export const LOAN_PERIODS_BY_TYPE: Record<string, number[]> = {
  CASH: [12, 24, 36, 48, 60, 72, 84],
  AUTO: [12, 24, 36, 48, 60, 72, 84],
  STUDENT: [12, 24, 36, 48, 60, 72, 84],
  REFINANCING: [12, 24, 36, 48, 60, 72, 84],
  HOUSING: [60, 120, 180, 240, 300, 360],
}

export const INTEREST_TYPES = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'VARIABLE', label: 'Variable' },
] as const

export const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED', label: 'Permanent Employment' },
  { value: 'SELF_EMPLOYED', label: 'Temporary Employment' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'RETIRED', label: 'Retired' },
] as const

export const PAYMENT_CODES = [
  { value: '221', label: '221 - Payment Transactions' },
  { value: '253', label: '253 - Utilities' },
  { value: '289', label: '289 - Other' },
] as const

export const CARD_BRANDS = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'DINACARD', label: 'DinaCard' },
  { value: 'AMEX', label: 'American Express' },
] as const

export const CARD_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
] as const

export const CARD_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  DEACTIVATED: 'Deactivated',
}

export const CARD_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  BLOCKED: 'secondary',
  DEACTIVATED: 'destructive',
}

export const CARD_LIMITS = {
  PERSONAL: 2,
  BUSINESS_PER_PERSON: 1,
} as const
