import type { Holding } from '@/types/portfolio'

export function createMockHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1,
    listing_id: 42,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    security_type: 'stock',
    quantity: 10,
    purchase_price: '150.00',
    current_price: '175.45',
    bid: '175.40',
    contract_size: 1,
    maintenance_margin: '10.00',
    ...overrides,
  }
}
