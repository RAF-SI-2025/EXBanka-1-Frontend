export interface Holding {
  id: number
  security_type: 'stock' | 'futures' | 'option'
  ticker: string
  security_name: string
  quantity: number
  average_price: string
  current_price: string
  total_value: string
  profit_loss: string
  profit_loss_percent: string
  is_public: boolean
  public_quantity: number
}

export interface PortfolioSummary {
  total_value: string
  total_cost: string
  total_profit_loss: string
  total_profit_loss_percent: string
  holdings_count: number
}

export interface HoldingListResponse {
  holdings: Holding[]
  total_count: number
}

export interface PortfolioFilters {
  page?: number
  page_size?: number
  security_type?: 'stock' | 'futures' | 'option'
}

export interface MakePublicPayload {
  quantity: number
}
