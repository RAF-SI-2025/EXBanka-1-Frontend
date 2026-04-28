import type { TaxRecord } from '@/types/tax'

export function createMockTaxRecord(overrides: Partial<TaxRecord> = {}): TaxRecord {
  return {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    user_type: 'client',
    unpaid_tax: '750.00',
    last_collection: null,
    ...overrides,
  }
}
