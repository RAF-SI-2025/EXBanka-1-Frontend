// Response shape for GET /api/v3/me/portfolio (spec §48.1, Plan B 2026-05-28).
// Securities and fund positions are grouped, with full P/L totals computed server-side.

export type SecurityAssetType = 'stock' | 'option' | 'future'

export interface SecurityPosition {
  asset_type: SecurityAssetType
  symbol: string
  holding_id: number
  quantity: number
  // Reserved / available quantity. Optional — absent on some payloads, in which
  // case the holdings table renders "-".
  reserved?: string | number
  available?: string | number
  avg_cost_rsd: string
  current_price_rsd: string
  current_value_rsd: string
  p_l_rsd: string
  p_l_pct: string
  last_updated: string
  dividends_received_rsd: string
}

export type FundLifecycleStatus = 'open' | 'fundraising' | 'active' | 'matured' | 'liquidated' | ''

export interface FundPosition {
  asset_type: 'investment_fund'
  fund_id: number
  fund_name: string
  amount_invested_rsd: string
  current_value_rsd: string
  pct_of_fund: string
  p_l_rsd: string
  p_l_pct: string
  last_updated: string
  dividends_received_rsd: string
  fund_status: FundLifecycleStatus
}

export interface PortfolioGroup<TPosition> {
  total_value_rsd: string
  total_profit_rsd: string
  total_profit_pct: string
  positions: TPosition[]
}

export interface PortfolioResponse {
  portfolio_id: string
  owner_type: 'client' | 'bank' | 'investment_fund'
  owner_id: number
  owner_name: string
  total_value_rsd: string
  total_profit_rsd: string
  total_profit_pct: string
  securities: PortfolioGroup<SecurityPosition>
  funds: PortfolioGroup<FundPosition>
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
