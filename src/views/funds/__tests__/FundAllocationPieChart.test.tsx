import { render, screen } from '@testing-library/react'
import { FundAllocationPieChart } from '@/views/funds/components/FundAllocationPieChart'
import { createMockFundHolding } from '@/__tests__/fixtures/fund-fixtures'

describe('FundAllocationPieChart', () => {
  it('shows an empty state when the fund holds nothing', () => {
    render(<FundAllocationPieChart holdings={[]} />)
    expect(screen.getByTestId('fund-allocation-empty')).toBeInTheDocument()
  })

  it('renders the pie container when there are holdings', () => {
    render(
      <FundAllocationPieChart
        holdings={[
          createMockFundHolding({ ticker: 'AAPL', current_value_rsd: '2200000.00' }),
          createMockFundHolding({ ticker: 'MSFT', current_value_rsd: '1300000.00' }),
        ]}
      />
    )
    expect(screen.getByTestId('fund-allocation-pie')).toBeInTheDocument()
    expect(screen.queryByTestId('fund-allocation-empty')).not.toBeInTheDocument()
  })
})
