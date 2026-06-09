import type { OtcLocalOffer, OtcRemoteOffer, OtcOffer, OtcOfferListResponse } from '@/types/otc'

export function createMockOtcOffer(overrides: Partial<OtcLocalOffer> = {}): OtcLocalOffer {
  return {
    kind: 'local',
    bank_code: '111',
    id: 1,
    seller_id: 42,
    seller_name: 'Test Seller',
    security_type: 'stock',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 5,
    price_per_unit: '175.00',
    created_at: '2026-04-20T10:00:00Z',
    ...overrides,
  }
}

export function createMockRemoteOtcOffer(overrides: Partial<OtcRemoteOffer> = {}): OtcRemoteOffer {
  return {
    kind: 'remote',
    id: 10,
    bank_code: '333',
    owner_id: '0',
    security_type: 'stock',
    ticker: 'MSFT',
    quantity: 1,
    price_per_unit: '0',
    currency: 'USD',
    ...overrides,
  }
}

export function createMockOtcOfferListResponse(
  overrides: Partial<OtcOfferListResponse> = {}
): OtcOfferListResponse {
  const offers: OtcOffer[] = overrides.offers ?? [createMockOtcOffer()]
  return {
    offers,
    total_count: offers.length,
    peers_total: 1,
    peers_reached: 1,
    partial: false,
    last_refresh: '2026-05-07T21:18:00Z',
    ...overrides,
  }
}
