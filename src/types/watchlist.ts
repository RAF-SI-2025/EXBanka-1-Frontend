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

/** A named watchlist (e.g. the default "My Watchlist", or "tech", "forex pairs"). */
export interface Watchlist {
  id: number
  name: string
  item_count: number
  created_at: number
}

export interface WatchlistsResponse {
  watchlists: Watchlist[]
}

export interface CreateWatchlistPayload {
  name: string
}

/** Identifies an item within a specific named list. */
export interface WatchlistItemRef {
  watchlistId: number
  listingId: number
}
