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
    owner_name: 'Petar Petrovic',
    ...overrides,
  }
}

export function createMockMastercardCard(overrides: Partial<Card> = {}): Card {
  return createMockCard({
    id: 2,
    card_number: '5211111111111117',
    card_name: 'Mastercard Standard',
    brand: 'MASTERCARD',
    ...overrides,
  })
}

export function createMockDinaCard(overrides: Partial<Card> = {}): Card {
  return createMockCard({
    id: 3,
    card_number: '9891111111111115',
    card_name: 'DinaCard',
    brand: 'DINACARD',
    ...overrides,
  })
}

export function createMockAmexCard(overrides: Partial<Card> = {}): Card {
  return createMockCard({
    id: 6,
    card_number: '341111111111111',
    card_name: 'American Express',
    brand: 'AMEX',
    ...overrides,
  })
}

export function createMockBlockedCard(overrides: Partial<Card> = {}): Card {
  return createMockCard({ id: 4, status: 'BLOCKED', ...overrides })
}

export function createMockDeactivatedCard(overrides: Partial<Card> = {}): Card {
  return createMockCard({ id: 5, status: 'DEACTIVATED', ...overrides })
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
