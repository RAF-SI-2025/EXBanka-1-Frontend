export type RecurringOrderInterval = 'weekly' | 'monthly'

export type RecurringOrderStatus = 'active' | 'paused' | 'cancelled'

export interface CreateRecurringOrderPayload {
  listing_id: number
  side: 'buy' | 'sell'
  quantity: number
  account_id: number
  interval: RecurringOrderInterval
  day_of_week?: number
  day_of_month?: number
  start_date_unix: number
  end_date_unix: number
}

export interface RecurringOrder {
  id: number
  listing_id: number
  side: 'buy' | 'sell'
  quantity: number
  account_id: number
  interval: RecurringOrderInterval
  day_of_week?: number
  day_of_month?: number
  start_date_unix: number
  end_date_unix: number
  status: RecurringOrderStatus
  created_at: string
  updated_at: string
}

export interface CreateRecurringOrderResponse {
  recurring_order: RecurringOrder
}

export interface RecurringOrderListResponse {
  recurring_orders: RecurringOrder[]
}
