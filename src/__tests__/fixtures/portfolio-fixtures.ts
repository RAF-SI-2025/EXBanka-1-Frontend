import type { Holding, PortfolioSummary, HoldingTransaction } from '@/types/portfolio'

export function createMockHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1,
    security_type: 'stock',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    public_quantity: 0,
    account_id: 42,
    last_modified: '2026-04-01T12:00:00Z',
    ...overrides,
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
