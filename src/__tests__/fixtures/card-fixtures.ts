import type { Card } from '@/types/card'

export function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    card_number: '4111111111111111',
    card_type: 'DEBIT',
    card_name: 'Visa Debit',
    brand: 'VISA',
    created_at: '2026-01-01T00:00:00Z',
    expires_at: '2030-01-01T00:00:00Z',
    account_number: '111000100000000011',
    cvv: '123',
    limit: 1000000,
    status: 'ACTIVE',
    owner_name: 'Petar Petrović',
    ...overrides,
  }
}
