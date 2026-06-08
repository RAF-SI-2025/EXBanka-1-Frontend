import { render, screen } from '@testing-library/react'
import { FundNavChart } from '@/views/funds/components/FundNavChart'
import { createMockFundNavSeries } from '@/__tests__/fixtures/fund-fixtures'

describe('FundNavChart', () => {
  it('shows an empty state when there is not enough history', () => {
    render(<FundNavChart history={[]} />)
    expect(screen.getByTestId('fund-nav-chart-empty')).toBeInTheDocument()
  })

  it('shows the empty state with a single data point (cannot draw a line)', () => {
    render(<FundNavChart history={[{ date: '2026-05-01', total_value_rsd: '100' }]} />)
    expect(screen.getByTestId('fund-nav-chart-empty')).toBeInTheDocument()
  })

  it('renders the chart container when there are at least two points', () => {
    render(
      <FundNavChart
        history={createMockFundNavSeries()}
        averageHistory={[
          { date: '2026-05-01', total_value_rsd: '100' },
          { date: '2026-05-02', total_value_rsd: '101' },
          { date: '2026-05-03', total_value_rsd: '104' },
        ]}
      />
    )
    expect(screen.getByTestId('fund-nav-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('fund-nav-chart-empty')).not.toBeInTheDocument()
  })
})
