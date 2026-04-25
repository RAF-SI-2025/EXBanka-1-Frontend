export interface Stock {
  id: number
  listing_id?: number
  ticker: string
  name: string
  outstanding_shares: number
  dividend_yield: number
  exchange_acronym: string
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  market_cap: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface FuturesContract {
  id: number
  listing_id?: number
  ticker: string
  name: string
  contract_size: number
  contract_unit: string
  settlement_date: string
  exchange_acronym: string
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface ForexPair {
  id: number
  listing_id?: number
  ticker: string
  name: string
  base_currency: string
  quote_currency: string
  exchange_rate: string
  liquidity: 'high' | 'medium' | 'low'
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface Option {
  id: number
  ticker: string
  name: string
  stock_listing_id: number
  option_type: 'call' | 'put'
  strike_price: string
  implied_volatility: string
  premium: string
  open_interest: number
  settlement_date: string
  price: string
  ask: string
  bid: string
  volume: number
}

export interface PriceHistoryEntry {
  date: string
  price: string
  high: string
  low: string
  change: string
  volume: number
}

export interface PriceHistoryResponse {
  history: PriceHistoryEntry[]
  total_count: number
}

export type SecurityType = 'stock' | 'futures' | 'forex'
export type PriceHistoryPeriod = 'day' | 'week' | 'month' | 'year' | '5y' | 'all'
export type SortOrder = 'asc' | 'desc'

export interface StockListResponse {
  stocks: Stock[]
  total_count: number
}

export interface FuturesListResponse {
  futures: FuturesContract[]
  total_count: number
}

export interface ForexListResponse {
  forex_pairs: ForexPair[]
  total_count: number
}

export interface OptionsListResponse {
  options: Option[]
  total_count: number
}

export interface StockFilters {
  page?: number
  page_size?: number
  search?: string
  exchange_acronym?: string
  min_price?: string
  max_price?: string
  min_volume?: number
  max_volume?: number
  sort_by?: 'price' | 'volume' | 'change' | 'margin'
  sort_order?: SortOrder
}

export interface FuturesFilters {
  page?: number
  page_size?: number
  search?: string
  exchange_acronym?: string
  min_price?: string
  max_price?: string
  settlement_date_from?: string
  settlement_date_to?: string
  sort_by?: string
  sort_order?: SortOrder
}

export interface ForexFilters {
  page?: number
  page_size?: number
  search?: string
  base_currency?: string
  quote_currency?: string
  liquidity?: 'high' | 'medium' | 'low'
  sort_by?: string
  sort_order?: SortOrder
}

export interface OptionsFilters {
  stock_id: number
  page?: number
  page_size?: number
  option_type?: 'call' | 'put'
  settlement_date?: string
  min_strike?: string
  max_strike?: string
}

export interface PriceHistoryFilters {
  period?: PriceHistoryPeriod
  page?: number
  page_size?: number
}

export interface CreateOptionOrderPayload {
  direction: 'buy' | 'sell'
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit'
  quantity: number
  account_id?: number
  limit_value?: string
  stop_value?: string
  all_or_none?: boolean
  margin?: boolean
}

export interface ExerciseOptionResponse {
  id: number
  option_ticker: string
  exercised_quantity: number
  shares_affected: number
  profit: string
}
