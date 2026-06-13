import { screen, fireEvent } from '@testing-library/react'
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

  it('renders a Sell button per row and calls onSell with that holding when provided', () => {
    const onSell = jest.fn()
    const holdings = [
      createMockFundHolding({ security_id: 1, ticker: 'AAPL', quantity: '10' }),
      createMockFundHolding({ security_id: 2, ticker: 'MSFT', quantity: '5' }),
    ]
    renderWithProviders(<FundPortfolioHoldingsTable holdings={holdings} onSell={onSell} />)

    expect(screen.getByText('Actions')).toBeInTheDocument()
    const sellButtons = screen.getAllByRole('button', { name: /^sell$/i })
    expect(sellButtons).toHaveLength(2)

    fireEvent.click(sellButtons[1])
    expect(onSell).toHaveBeenCalledTimes(1)
    expect(onSell).toHaveBeenCalledWith(holdings[1])
  })

  it('renders no Sell buttons and no Actions column when onSell is absent', () => {
    renderWithProviders(
      <FundPortfolioHoldingsTable holdings={[createMockFundHolding({ security_id: 1 })]} />
    )
    expect(screen.queryByRole('button', { name: /^sell$/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Actions')).not.toBeInTheDocument()
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
