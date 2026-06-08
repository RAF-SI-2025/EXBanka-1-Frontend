import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundSummaryCards } from '@/views/funds/components/FundSummaryCards'
import { createMockFundDetailResponse } from '@/__tests__/fixtures/fund-fixtures'

describe('FundSummaryCards', () => {
  it('renders the four headline metrics', () => {
    renderWithProviders(
      <FundSummaryCards detail={createMockFundDetailResponse({ investor_count: 42 })} />
    )
    expect(screen.getByText(/Total value/i)).toBeInTheDocument()
    expect(screen.getByText(/Profit/i)).toBeInTheDocument()
    expect(screen.getByText(/Total contributed/i)).toBeInTheDocument()
    expect(screen.getByText(/Investors/i)).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows the profit percent and colours a positive profit green', () => {
    renderWithProviders(
      <FundSummaryCards
        detail={createMockFundDetailResponse({ profit_rsd: '100000.00', profit_pct: '4.0000' })}
      />
    )
    const profit = screen.getByTestId('fund-summary-profit')
    expect(profit).toHaveTextContent('4.00%')
    expect(profit.className).toMatch(/emerald/)
  })

  it('colours a negative profit red', () => {
    renderWithProviders(
      <FundSummaryCards
        detail={createMockFundDetailResponse({ profit_rsd: '-78.27', profit_pct: '-0.0775' })}
      />
    )
    const profit = screen.getByTestId('fund-summary-profit')
    expect(profit).toHaveTextContent('-0.08%')
    expect(profit.className).toMatch(/red/)
  })
})
