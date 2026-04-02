export interface StockExchange {
  id: number
  exchange_name: string
  exchange_acronym: string
  exchange_mic_code: string
  polity: string
  currency: string
  time_zone: string
}

export interface StockExchangeListResponse {
  exchanges: StockExchange[]
  total_count: number
}

export interface StockExchangeFilters {
  page?: number
  page_size?: number
  search?: string
}

export interface TestingModeResponse {
  testing_mode: boolean
}
