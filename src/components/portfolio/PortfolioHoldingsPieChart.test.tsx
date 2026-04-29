import { render, screen } from '@testing-library/react'
import { PortfolioHoldingsPieChart } from './PortfolioHoldingsPieChart'
import type { Holding } from '@/types/portfolio'

function holding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1,
    security_type: 'stock',
    ticker: 'AAPL',
    name: 'Apple',
    quantity: 10,
    public_quantity: 0,
    account_id: 1,
    last_modified: '2026-04-01',
    ...overrides,
  }
}

describe('PortfolioHoldingsPieChart', () => {
  it('shows empty state when there are no holdings', () => {
    render(<PortfolioHoldingsPieChart holdings={[]} />)
    expect(screen.getByTestId('holdings-pie-empty')).toBeInTheDocument()
  })

  it('renders the chart container when there are holdings', () => {
    render(
      <PortfolioHoldingsPieChart
        holdings={[
          holding({ id: 1, ticker: 'AAPL', quantity: 60 }),
          holding({ id: 2, ticker: 'MSFT', quantity: 40 }),
        ]}
      />
    )
    expect(screen.getByTestId('holdings-pie')).toBeInTheDocument()
  })
})
