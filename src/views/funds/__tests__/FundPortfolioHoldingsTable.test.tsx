import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundPortfolioHoldingsTable } from '@/views/funds/components/FundPortfolioHoldingsTable'
import { createMockFundHolding } from '@/__tests__/fixtures/fund-fixtures'

describe('FundPortfolioHoldingsTable', () => {
  it('shows the empty-state message when the fund has no holdings', () => {
    renderWithProviders(<FundPortfolioHoldingsTable holdings={[]} />)
    expect(screen.getByText(/no securities/i)).toBeInTheDocument()
  })

  it('shows the empty-state when holdings is null (backend omits the field)', () => {
    renderWithProviders(<FundPortfolioHoldingsTable holdings={null} />)
    expect(screen.getByText(/no securities/i)).toBeInTheDocument()
  })

  it('renders one row per holding with inline ticker, quantity and current value', () => {
    renderWithProviders(
      <FundPortfolioHoldingsTable
        holdings={[
          createMockFundHolding({
            security_id: 1,
            ticker: 'AAPL',
            quantity: '10',
            current_value_rsd: '2200000.00',
          }),
          createMockFundHolding({
            security_id: 2,
            ticker: 'MSFT',
            quantity: '5',
            current_value_rsd: '900000.00',
          }),
        ]}
      />
    )
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('formats the acquired_at date as a local date', () => {
    renderWithProviders(
      <FundPortfolioHoldingsTable
        holdings={[
          createMockFundHolding({
            security_id: 1,
            acquired_at: '2026-01-12T00:00:00Z',
          }),
        ]}
      />
    )
    const expected = new Date('2026-01-12T00:00:00Z').toLocaleDateString()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
