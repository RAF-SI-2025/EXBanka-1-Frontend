export type PriceAlertCondition = 'gte' | 'lte' | 'daily_change_pct_gte' | 'daily_change_pct_lte'

export interface PriceAlert {
  id: number
  listing_id: number
  condition: PriceAlertCondition
  threshold: string
  is_recurring: boolean
  cooldown_seconds: number
  email_too: boolean
  active: boolean
  last_triggered_unix: number
  created_at_unix: number
}

export interface CreatePriceAlertPayload {
  listing_id: number
  condition: PriceAlertCondition
  threshold: string
  is_recurring: boolean
  cooldown_seconds?: number
  email_too?: boolean
}

export interface UpdatePriceAlertPayload {
  condition?: PriceAlertCondition
  threshold?: string
  is_recurring?: boolean
  cooldown_seconds?: number
  email_too?: boolean
  active?: boolean
}

export interface PriceAlertListResponse {
  alerts: PriceAlert[]
}

export interface PriceAlertResponse {
  alert: PriceAlert
}
