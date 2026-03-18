import type { Transfer } from '@/types/transfer'

export function createMockTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    id: 1,
    order_number: '1234568902873',
    from_account: '111000100000000011',
    to_account: '111000100000000022',
    initial_amount: 1300,
    initial_currency: 'RSD',
    final_amount: 11,
    final_currency: 'EUR',
    exchange_rate: 117.69,
    commission: 0.7,
    timestamp: '2026-03-13T10:00:00Z',
    status: 'REALIZED',
    ...overrides,
  }
}
