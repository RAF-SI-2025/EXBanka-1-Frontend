import type { Card } from '@/types/card'
import type { CardRequest } from '@/types/cardRequest'

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

export function createMockCardRequest(overrides: Partial<CardRequest> = {}): CardRequest {
  return {
    id: 1,
    client_id: 1,
    account_number: '111000100000000011',
    card_brand: 'visa',
    card_type: 'debit',
    card_name: 'My Main Card',
    status: 'pending',
    reason: '',
    approved_by: 0,
    created_at: '2026-03-25T10:00:00Z',
    updated_at: '2026-03-25T10:00:00Z',
    ...overrides,
  }
}
