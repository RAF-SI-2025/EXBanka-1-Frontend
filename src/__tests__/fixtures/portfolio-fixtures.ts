import type {
  SecurityPosition,
  FundPosition,
  PortfolioResponse,
  PortfolioSummary,
  HoldingTransaction,
} from '@/types/portfolio'

export function createMockSecurityPosition(
  overrides: Partial<SecurityPosition> = {}
): SecurityPosition {
  return {
    asset_type: 'stock',
    symbol: 'AAPL',
    holding_id: 1,
    quantity: 10,
    avg_cost_rsd: '200.0000',
    current_price_rsd: '220.0000',
    current_value_rsd: '2200.0000',
    p_l_rsd: '200.0000',
    p_l_pct: '10.0000',
    last_updated: '2026-04-01T12:00:00Z',
    dividends_received_rsd: '0.00',
    ...overrides,
  }
}

export function createMockFundPosition(overrides: Partial<FundPosition> = {}): FundPosition {
  return {
    asset_type: 'investment_fund',
    fund_id: 7,
    fund_name: 'Alpha Growth',
    amount_invested_rsd: '25000.0000',
    current_value_rsd: '27000.0000',
    pct_of_fund: '100.0000',
    p_l_rsd: '2000.0000',
    p_l_pct: '8.0000',
    last_updated: '2026-04-01T12:00:00Z',
    dividends_received_rsd: '0.00',
    fund_status: 'active',
    ...overrides,
  }
}

export function createMockPortfolioResponse(
  overrides: Partial<PortfolioResponse> = {}
): PortfolioResponse {
  const securitiesPositions = overrides.securities?.positions ?? [createMockSecurityPosition()]
  const fundsPositions = overrides.funds?.positions ?? []
  return {
    portfolio_id: 'client-42',
    owner_type: 'client',
    owner_id: 42,
    owner_name: '',
    total_value_rsd: '2200.0000',
    total_profit_rsd: '200.0000',
    total_profit_pct: '10.0000',
    ...overrides,
    securities: {
      total_value_rsd: '2200.0000',
      total_profit_rsd: '200.0000',
      total_profit_pct: '10.0000',
      ...(overrides.securities ?? {}),
      positions: securitiesPositions,
    },
    funds: {
      total_value_rsd: '0',
      total_profit_rsd: '0',
      total_profit_pct: '0',
      ...(overrides.funds ?? {}),
      positions: fundsPositions,
    },
  }
}

export function createMockPortfolioSummary(
  overrides: Partial<PortfolioSummary> = {}
): PortfolioSummary {
  return {
    total_profit: '3000.00',
    total_profit_rsd: '3000.00',
    unrealized_profit: '1500.00',
    realized_profit_this_month_rsd: '500.00',
    realized_profit_this_year_rsd: '2000.00',
    realized_profit_lifetime_rsd: '3000.00',
    tax_paid_this_year: '300.00',
    tax_unpaid_this_month: '75.00',
    tax_unpaid_total_rsd: '75.00',
    open_positions_count: 5,
    closed_trades_this_year: 12,
    ...overrides,
  }
}

export function createMockHoldingTransaction(
  overrides: Partial<HoldingTransaction> = {}
): HoldingTransaction {
  return {
    id: 1,
    order_id: 100,
    executed_at: '2026-04-01T10:30:00Z',
    direction: 'buy',
    quantity: 5,
    price_per_unit: '170.00',
    native_amount: '850.00',
    native_currency: 'USD',
    converted_amount: '99535.00',
    account_currency: 'RSD',
    fx_rate: '117.10',
    commission: '8.50',
    account_id: 42,
    ticker: 'AAPL',
    ...overrides,
  }
}
