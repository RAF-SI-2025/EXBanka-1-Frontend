import type {
  Fund,
  FundHolding,
  ClientFundPosition,
  FundContribution,
  FundDetailResponse,
  FundNavPoint,
} from '@/types/fund'

export function createMockFund(overrides: Partial<Fund> = {}): Fund {
  return {
    id: 101,
    name: 'Alpha Growth Fund',
    description: 'IT-sector focus',
    minimum_contribution_rsd: '1000.00',
    manager_employee_id: 25,
    rsd_account_id: 9001,
    fund_value_rsd: '2600000.00',
    liquid_cash_rsd: '1500000.00',
    profit_rsd: '5000.00',
    active: true,
    created_at: '2020-05-15T00:00:00Z',
    updated_at: '2020-05-15T00:00:00Z',
    annualized_return_pct: '12.40',
    volatility_pct: '9.00',
    reward_to_variability: '1.31',
    max_drawdown_pct: '-7.20',
    metrics_available: true,
    ...overrides,
  }
}

export function createMockFundNavSeries(): FundNavPoint[] {
  return [
    { date: '2026-05-01', total_value_rsd: '2400000.00' },
    { date: '2026-05-02', total_value_rsd: '2450000.00' },
    { date: '2026-05-03', total_value_rsd: '2600000.00' },
  ]
}

export function createMockFundHolding(overrides: Partial<FundHolding> = {}): FundHolding {
  return {
    security_type: 'stock',
    security_id: 42,
    ticker: 'AAPL',
    quantity: 100,
    average_price_rsd: '20000.00',
    current_price_rsd: '22000.00',
    current_value_rsd: '2200000.00',
    acquired_at: '2026-01-12T00:00:00Z',
    ...overrides,
  }
}

export function createMockFundDetailResponse(
  overrides: Partial<FundDetailResponse> = {}
): FundDetailResponse {
  return {
    fund: createMockFund(),
    holdings: [],
    investor_count: 1,
    liquid_rsd_balance: '1500000.00',
    total_contributed_rsd: '2500000.00',
    total_holdings_value_rsd: '1100000.00',
    total_value_rsd: '2600000.00',
    total_dividends_paid_rsd: '0.00',
    profit_rsd: '100000.00',
    profit_pct: '4.0000',
    history: createMockFundNavSeries(),
    average_history: [
      { date: '2026-05-01', total_value_rsd: '100.00' },
      { date: '2026-05-02', total_value_rsd: '101.50' },
      { date: '2026-05-03', total_value_rsd: '104.00' },
    ],
    ...overrides,
  }
}

export function createMockClientFundPosition(
  overrides: Partial<ClientFundPosition> = {}
): ClientFundPosition {
  return {
    fund_id: 101,
    fund_name: 'Alpha Growth Fund',
    total_contributed_rsd: '25000.00',
    current_value_rsd: '27000.00',
    percentage_fund: '0.005',
    profit_rsd: '2000.00',
    last_change_at: '2026-04-15T10:00:00Z',
    ...overrides,
  }
}

export function createMockFundContribution(
  overrides: Partial<FundContribution> = {}
): FundContribution {
  return {
    id: 7001,
    fund_id: 101,
    amount_rsd: '10000.00',
    is_inflow: true,
    status: 'completed',
    created_at: '2026-04-28T15:30:00Z',
    ...overrides,
  }
}

export const mockFunds: Fund[] = [
  createMockFund(),
  createMockFund({ id: 102, name: 'Beta Income Fund', minimum_contribution_rsd: '500.00' }),
]
