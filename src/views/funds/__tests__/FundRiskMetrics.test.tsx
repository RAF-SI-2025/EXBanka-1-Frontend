import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundRiskMetrics } from '@/views/funds/components/FundRiskMetrics'
import { createMockFund } from '@/__tests__/fixtures/fund-fixtures'

describe('FundRiskMetrics', () => {
  it('renders the four risk/return metrics when available', () => {
    renderWithProviders(
      <FundRiskMetrics
        fund={createMockFund({
          annualized_return_pct: '12.40',
          volatility_pct: '9.00',
          reward_to_variability: '1.31',
          max_drawdown_pct: '-7.20',
          metrics_available: true,
        })}
      />
    )
    expect(screen.getByText(/Annualized return/i)).toBeInTheDocument()
    expect(screen.getByText('12.40%')).toBeInTheDocument()
    expect(screen.getByText(/Volatility/i)).toBeInTheDocument()
    expect(screen.getByText('9.00%')).toBeInTheDocument()
    expect(screen.getByText(/Sharpe/i)).toBeInTheDocument()
    expect(screen.getByText('1.31')).toBeInTheDocument()
    expect(screen.getByText(/Max drawdown/i)).toBeInTheDocument()
    expect(screen.getByText('-7.20%')).toBeInTheDocument()
  })

  it('shows an unavailable notice when metrics are not yet computed', () => {
    renderWithProviders(<FundRiskMetrics fund={createMockFund({ metrics_available: false })} />)
    expect(screen.getByTestId('fund-risk-unavailable')).toBeInTheDocument()
    expect(screen.queryByText(/Annualized return/i)).not.toBeInTheDocument()
  })
})
