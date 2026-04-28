import type {
  Fund,
  FundHolding,
  ClientFundPosition,
  FundPerformancePoint,
  FundContribution,
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
    ...overrides,
  }
}

export function createMockFundHolding(overrides: Partial<FundHolding> = {}): FundHolding {
  return {
    stock_id: 42,
    quantity: '100',
    acquired_at: '2026-01-12T00:00:00Z',
    ...overrides,
  }
}

export function createMockPerformancePoint(
  overrides: Partial<FundPerformancePoint> = {}
): FundPerformancePoint {
  return { as_of: '2026-04-01', fund_value_rsd: '2600000.00', ...overrides }
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
