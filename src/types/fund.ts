export interface Fund {
  id: number
  name: string
  description: string
  minimum_contribution_rsd: string
  manager_employee_id: number
  rsd_account_id: number
  fund_value_rsd: string
  liquid_cash_rsd: string
  profit_rsd: string
  active: boolean
  created_at: string
}

export interface FundHolding {
  stock_id: number
  quantity: string
  acquired_at: string
}

export interface FundPerformancePoint {
  as_of: string
  fund_value_rsd: string
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
  performance: FundPerformancePoint[]
}

export interface MyFundPositionsResponse {
  positions: ClientFundPosition[]
}
