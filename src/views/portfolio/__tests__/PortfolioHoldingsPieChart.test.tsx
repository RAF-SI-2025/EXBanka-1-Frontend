import { render, screen } from '@testing-library/react'
import { PortfolioHoldingsPieChart } from '@/views/portfolio/components/PortfolioHoldingsPieChart'
import { createMockSecurityPosition } from '@/__tests__/fixtures/portfolio-fixtures'

describe('PortfolioHoldingsPieChart', () => {
  it('shows empty state when there are no positions', () => {
    render(<PortfolioHoldingsPieChart positions={[]} />)
    expect(screen.getByTestId('holdings-pie-empty')).toBeInTheDocument()
  })

  it('renders the chart container when there are positions', () => {
    render(
      <PortfolioHoldingsPieChart
        positions={[
          createMockSecurityPosition({ holding_id: 1, symbol: 'AAPL', quantity: 60 }),
          createMockSecurityPosition({ holding_id: 2, symbol: 'MSFT', quantity: 40 }),
        ]}
      />
    )
    expect(screen.getByTestId('holdings-pie')).toBeInTheDocument()
  })
})
