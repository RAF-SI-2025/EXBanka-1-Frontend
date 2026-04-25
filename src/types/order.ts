export type OrderDirection = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type OrderStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'filled' | 'partial'
export type OrderState = 'pending' | 'approved' | 'filling' | 'filled' | 'cancelled' | 'declined'

export interface Order {
  id: number
  listing_id: number
  holding_id: number | null
  direction: OrderDirection
  order_type: OrderType
  status: OrderStatus
  state?: OrderState
  filled_quantity?: number
  is_done?: boolean
  quantity: number
  limit_value: string | null
  stop_value: string | null
  all_or_none: boolean
  margin: boolean
  account_id: number
  ticker: string
  security_name: string
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  listing_id?: number
  direction: OrderDirection
  order_type: OrderType
  quantity: number
  limit_value?: string
  stop_value?: string
  all_or_none?: boolean
  margin?: boolean
  account_id?: number
  base_account_id?: number
  security_type?: string
}

export interface OrderListResponse {
  orders: Order[]
  total_count: number
}

export interface MyOrderFilters {
  page?: number
  page_size?: number
  status?: OrderStatus
  direction?: OrderDirection
  order_type?: OrderType
}

export interface AdminOrderFilters extends MyOrderFilters {
  agent_email?: string
}
