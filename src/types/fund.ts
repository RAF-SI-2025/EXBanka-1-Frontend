export interface Fund {
  id: number
  name: string
  description: string
  minimum_contribution_rsd: string | null
  manager_employee_id: number
  rsd_account_id: number
  active: boolean
  created_at: string
  updated_at?: string
  // Computed financials returned by the LIST endpoint only.
  // The detail endpoint exposes equivalents at the response top level
  // (see FundDetailResponse). Optional so both shapes typecheck.
  fund_value_rsd?: string | null
  liquid_cash_rsd?: string | null
  profit_rsd?: string | null
  // SP3 risk/return statistics carried on fund objects. Numeric metrics are
  // decimal strings ("0" with metrics_available=false when a fund lacks
  // enough NAV-snapshot history). reward_to_variability ≈ Sharpe ratio.
  annualized_return_pct?: string | null
  volatility_pct?: string | null
  reward_to_variability?: string | null
  max_drawdown_pct?: string | null
  metrics_available?: boolean
}

/** One point on a fund's daily NAV series. */
export interface FundNavPoint {
  date: string
  total_value_rsd: string
}

export interface FundHolding {
  security_type: string
  security_id: number
  ticker: string
  quantity: string | number
  average_price_rsd: string
  current_price_rsd: string
  current_value_rsd: string
  acquired_at: string
}

export interface ClientFundPosition {
  fund_id: number
  fund_name: string
  total_contributed_rsd: string
  current_value_rsd: string
  percentage_fund: string
  profit_rsd: string
  last_change_at: string
}

export interface FundContribution {
  id: number
  fund_id: number
  amount_rsd: string
  is_inflow: boolean
  status: 'completed' | 'pending' | 'failed'
  fee_rsd?: string
  created_at: string
}

export interface FundFilters {
  page?: number
  page_size?: number
  search?: string
  active_only?: boolean
}

export interface CreateFundPayload {
  name: string
  description?: string
  minimum_contribution_rsd?: string
}

export interface UpdateFundPayload {
  name?: string
  description?: string
  minimum_contribution_rsd?: string
  active?: boolean
}

export interface InvestPayload {
  source_account_id: number
  amount: string
  currency: string
  on_behalf_of_type?: 'self' | 'bank'
}

export interface RedeemPayload {
  amount_rsd: string
  target_account_id: number
  on_behalf_of_type?: 'self' | 'bank'
}

export interface FundListResponse {
  funds: Fund[]
  total: number
}

export interface FundDetailResponse {
  fund: Fund
  holdings: FundHolding[]
  investor_count: number
  liquid_rsd_balance: string
  total_contributed_rsd: string
  total_holdings_value_rsd: string
  total_value_rsd: string
  total_dividends_paid_rsd: string
  profit_rsd: string
  profit_pct: string
  // Daily NAV series for the detail charts. `history` is this fund's series;
  // `average_history` is the system-average benchmark (each fund indexed to
  // 100 at its first snapshot). Absent when the backend has no snapshots yet.
  history?: FundNavPoint[]
  average_history?: FundNavPoint[]
}

export interface MyFundPositionsResponse {
  positions: ClientFundPosition[]
}
