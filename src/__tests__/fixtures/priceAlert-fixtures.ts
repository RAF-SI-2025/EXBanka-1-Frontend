import type { PriceAlert } from '@/types/priceAlert'

export function createMockPriceAlert(overrides: Partial<PriceAlert> = {}): PriceAlert {
  return {
    id: 1,
    listing_id: 42,
    condition: 'gte',
    threshold: '200.00',
    is_recurring: false,
    cooldown_seconds: 3600,
    email_too: false,
    active: true,
    last_triggered_unix: 0,
    created_at_unix: 1731699200,
    ...overrides,
  }
}
