export type WatchlistSecurityType = 'stock' | 'option' | 'futures' | 'forex'

export interface WatchlistItem {
  id: number
  listing_id: number
  security_type: WatchlistSecurityType
  ticker: string
  current_price: string
  daily_change: string
  daily_change_percent: string
  added_at_unix: number
}

export interface WatchlistResponse {
  items: WatchlistItem[]
}

export interface WatchlistFilters {
  listing_type?: WatchlistSecurityType
}
