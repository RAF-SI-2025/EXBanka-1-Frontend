export interface Holding {
  id: number
  security_type: 'stock' | 'futures' | 'option'
  ticker: string
  name: string
  quantity: number
  public_quantity: number
  account_id: number
  last_modified: string
}

export interface PortfolioSummary {
  total_profit: string
  total_profit_rsd: string
  unrealized_profit: string
  realized_profit_this_month_rsd: string
  realized_profit_this_year_rsd: string
  realized_profit_lifetime_rsd: string
  tax_paid_this_year: string
  tax_unpaid_this_month: string
  tax_unpaid_total_rsd: string
  open_positions_count: number
  closed_trades_this_year: number
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

export interface HoldingTransaction {
  id: number
  order_id: number
  executed_at: string
  direction: 'buy' | 'sell'
  quantity: number
  price_per_unit: string
  native_amount: string
  native_currency: string
  converted_amount: string
  account_currency: string
  fx_rate: string
  commission: string
  account_id: number
  ticker: string
}

export interface HoldingTransactionsResponse {
  transactions: HoldingTransaction[]
  total_count: number
}

export interface HoldingTransactionsFilters {
  direction?: 'buy' | 'sell'
  page?: number
  page_size?: number
}
