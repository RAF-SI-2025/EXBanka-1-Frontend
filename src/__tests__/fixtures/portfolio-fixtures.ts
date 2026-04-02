import type { Holding, PortfolioSummary } from '@/types/portfolio'

export function createMockHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1,
    security_type: 'stock',
    ticker: 'AAPL',
    security_name: 'Apple Inc.',
    quantity: 10,
    average_price: '170.00',
    current_price: '178.50',
    total_value: '1785.00',
    profit_loss: '85.00',
    profit_loss_percent: '5.00',
    is_public: false,
    public_quantity: 0,
    ...overrides,
  }
}

export function createMockPortfolioSummary(
  overrides: Partial<PortfolioSummary> = {}
): PortfolioSummary {
  return {
    total_value: '25000.00',
    total_cost: '22000.00',
    total_profit_loss: '3000.00',
    total_profit_loss_percent: '13.64',
    holdings_count: 5,
    ...overrides,
  }
}
