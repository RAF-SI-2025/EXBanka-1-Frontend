import { buildRecurringOrderPayload } from './buildRecurringOrderPayload'
import type { CreateOrderPayload } from '@/types/order'

const buyPayload: CreateOrderPayload = {
  direction: 'buy',
  order_type: 'market',
  quantity: 10,
  listing_id: 7,
  account_id: 42,
}

describe('buildRecurringOrderPayload', () => {
  // 2026-03-19 is a Thursday (getDay() === 4), day-of-month 19.
  const now = new Date('2026-03-19T10:00:00Z')

  it('derives day_of_week from today for weekly', () => {
    const result = buildRecurringOrderPayload(buyPayload, 'weekly', now)
    expect(result).toEqual({
      listing_id: 7,
      side: 'buy',
      quantity: 10,
      account_id: 42,
      interval: 'weekly',
      day_of_week: now.getDay(),
      start_date_unix: Math.floor(now.getTime() / 1000),
      end_date_unix: 0,
    })
  })

  it('derives day_of_month from today for monthly', () => {
    const result = buildRecurringOrderPayload(buyPayload, 'monthly', now)
    expect(result).toMatchObject({ interval: 'monthly', day_of_month: now.getDate() })
  })

  it('caps day_of_month at 28 so every month can fire', () => {
    const late = new Date('2026-01-31T10:00:00Z')
    const result = buildRecurringOrderPayload(buyPayload, 'monthly', late)
    expect(result?.day_of_month).toBe(28)
  })

  it('returns null when listing_id is missing', () => {
    expect(
      buildRecurringOrderPayload({ ...buyPayload, listing_id: undefined }, 'monthly', now)
    ).toBeNull()
  })

  it('returns null when account_id is missing', () => {
    expect(
      buildRecurringOrderPayload({ ...buyPayload, account_id: undefined }, 'monthly', now)
    ).toBeNull()
  })
})
