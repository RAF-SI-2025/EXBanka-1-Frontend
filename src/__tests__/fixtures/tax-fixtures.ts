import type { TaxRecord } from '@/types/tax'

export function createMockTaxRecord(overrides: Partial<TaxRecord> = {}): TaxRecord {
  return {
    id: 1,
    user_type: 'client',
    user_name: 'John Doe',
    user_email: 'john@test.com',
    taxable_amount: '5000.00',
    tax_amount: '750.00',
    status: 'pending',
    created_at: '2026-04-01T10:00:00Z',
    ...overrides,
  }
}
