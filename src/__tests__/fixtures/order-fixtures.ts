import type { Order } from '@/types/order'

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    listing_id: 42,
    holding_id: null,
    direction: 'buy',
    order_type: 'market',
    status: 'pending',
    quantity: 10,
    limit_value: null,
    stop_value: null,
    all_or_none: false,
    margin: false,
    account_id: 1,
    ticker: 'AAPL',
    security_name: 'Apple Inc.',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
    ...overrides,
  }
}
