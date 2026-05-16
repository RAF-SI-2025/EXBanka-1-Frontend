import type { OtcOffer, OtcNegotiation, OptionContract } from '@/types/otcOption'

export function createMockOtcOptionOffer(overrides: Partial<OtcOffer> = {}): OtcOffer {
  return {
    id: 1001,
    direction: 'sell_initiated',
    status: 'open',
    stock_id: 42,
    quantity: '100',
    strike_price: '5000.00',
    premium: '50000.00',
    settlement_date: '2026-06-05',
    initiator: { owner_type: 'client', owner_id: 7 },
    counterparty: { owner_type: 'client', owner_id: 8 },
    last_modified_at: '2026-04-28T14:20:00Z',
    unread: false,
    ...overrides,
  }
}

export function createMockOtcNegotiation(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 1,
    offer_id: 1001,
    status: 'open',
    bidder: { owner_type: 'client', owner_id: 7 },
    last_action_by: { owner_type: 'client', owner_id: 7 },
    quantity: '100',
    strike_price: '5000.00',
    premium: '45000.00',
    settlement_date: '2026-06-05',
    created_at: '2026-04-28T14:20:00Z',
    updated_at: '2026-04-28T14:20:00Z',
    ...overrides,
  }
}

export function createMockOptionContract(overrides: Partial<OptionContract> = {}): OptionContract {
  return {
    id: 5001,
    status: 'ACTIVE',
    stock_id: 42,
    quantity: '100',
    strike_price: '5000.00',
    premium: '50000.00',
    settlement_date: '2026-06-05',
    buyer: { owner_type: 'client', owner_id: 7 },
    seller: { owner_type: 'client', owner_id: 8 },
    ...overrides,
  }
}
