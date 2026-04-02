import type { Transfer } from '@/types/transfer'

export function createMockTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    id: 1,
    from_account_number: '111000100000000011',
    to_account_number: '111000100000000022',
    initial_amount: 1300,
    final_amount: 11,
    exchange_rate: 117.69,
    commission: 0.7,
    timestamp: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}
