import type { Order } from '@/types/order'

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    user_email: 'agent@exbanka.com',
    listing_id: 42,
    asset_ticker: 'AAPL',
    asset_name: 'Apple Inc.',
    order_type: 'market',
    direction: 'buy',
    quantity: 10,
    contract_size: 1,
    price_per_unit: '175.50',
    all_or_none: false,
    margin: false,
    status: 'pending',
    is_done: false,
    remaining_portions: 10,
    after_hours: false,
    last_modification: '2026-04-02T10:00:00Z',
    account_id: 1,
    ...overrides,
  }
}
