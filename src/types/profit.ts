export interface ActuaryPerformance {
  employee_id: number
  first_name: string
  last_name: string
  position: string
  realised_profit_rsd: string
  trade_count: number
}

export interface BankFundPosition {
  fund_id: number
  fund_name: string
  manager_employee_id: number
  total_contributed_rsd: string
  current_value_rsd: string
  percentage_fund: string
  profit_rsd: string
}

export interface ActuaryPerformanceResponse {
  actuaries: ActuaryPerformance[]
}

export interface BankFundPositionsResponse {
  positions: BankFundPosition[]
}
