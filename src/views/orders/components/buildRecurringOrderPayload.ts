import type { CreateOrderPayload } from '@/types/order'
import type { CreateRecurringOrderPayload, RecurringOrderInterval } from '@/types/recurringOrder'

/**
 * Derives a recurring-order payload from an in-progress buy order plus a chosen
 * frequency. The recurrence day is derived from "today" (frequency-only UX):
 * weekly uses the current weekday, monthly uses the current day-of-month capped
 * at 28 so every month can fire. `account_id` and `listing_id` are reused from
 * the buy form. Returns null when the buy is missing data the recurring API
 * requires (listing_id / account_id).
 */
export function buildRecurringOrderPayload(
  payload: CreateOrderPayload,
  interval: RecurringOrderInterval,
  now: Date = new Date()
): CreateRecurringOrderPayload | null {
  if (!payload.listing_id || !payload.account_id) return null

  const base = {
    listing_id: payload.listing_id,
    side: 'buy' as const,
    quantity: payload.quantity,
    account_id: payload.account_id,
    interval,
    start_date_unix: Math.floor(now.getTime() / 1000),
    end_date_unix: 0,
  }

  return interval === 'weekly'
    ? { ...base, day_of_week: now.getDay() }
    : { ...base, day_of_month: Math.min(now.getDate(), 28) }
}
