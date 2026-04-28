import { render, screen } from '@testing-library/react'
import { PortfolioProfitChart } from './PortfolioProfitChart'
import type { PortfolioSummary } from '@/types/portfolio'

function summary(overrides: Partial<PortfolioSummary> = {}): PortfolioSummary {
  return {
    total_profit: '0',
    total_profit_rsd: '0',
    unrealized_profit: '0',
    realized_profit_this_month_rsd: '0',
    realized_profit_this_year_rsd: '0',
    realized_profit_lifetime_rsd: '0',
    tax_paid_this_year: '0',
    tax_unpaid_this_month: '0',
    tax_unpaid_total_rsd: '0',
    open_positions_count: 0,
    closed_trades_this_year: 0,
    ...overrides,
  }
}

describe('PortfolioProfitChart', () => {
  it('shows empty state when all three profit values are zero', () => {
    render(<PortfolioProfitChart summary={summary()} />)
    expect(screen.getByTestId('profit-chart-empty')).toBeInTheDocument()
  })

  it('renders the chart container when there is profit data', () => {
    render(
      <PortfolioProfitChart
        summary={summary({
          realized_profit_this_month_rsd: '1000',
          realized_profit_this_year_rsd: '5000',
          realized_profit_lifetime_rsd: '12000',
        })}
      />
    )
    expect(screen.getByTestId('profit-chart')).toBeInTheDocument()
  })
})
