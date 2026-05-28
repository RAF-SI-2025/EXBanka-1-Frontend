import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundPortfolioHoldingsTable } from '@/views/funds/components/FundPortfolioHoldingsTable'
import { createMockFundHolding } from '@/__tests__/fixtures/fund-fixtures'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'
import * as securitiesApi from '@/lib/api/securities'

jest.mock('@/lib/api/securities')

const mockedGetStock = securitiesApi.getStock as jest.MockedFunction<typeof securitiesApi.getStock>

describe('FundPortfolioHoldingsTable', () => {
  beforeEach(() => {
    mockedGetStock.mockReset()
  })

  it('shows the empty-state message when the fund has no holdings', () => {
    renderWithProviders(<FundPortfolioHoldingsTable holdings={[]} />)
    expect(screen.getByText(/no securities/i)).toBeInTheDocument()
  })

  it('renders one row per holding with fallback ticker before enrichment resolves', () => {
    mockedGetStock.mockReturnValue(new Promise(() => {})) // never resolves
    renderWithProviders(
      <FundPortfolioHoldingsTable
        holdings={[
          createMockFundHolding({ stock_id: 1, quantity: '10' }),
          createMockFundHolding({ stock_id: 2, quantity: '5' }),
        ]}
      />
    )
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('replaces fallback ID with ticker + name + price + market value after fetch resolves', async () => {
    mockedGetStock.mockResolvedValueOnce(
      createMockStock({ id: 42, ticker: 'AAPL', name: 'Apple Inc.', price: '200.00' })
    )
    renderWithProviders(
      <FundPortfolioHoldingsTable
        holdings={[createMockFundHolding({ stock_id: 42, quantity: '10' })]}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('200.00')).toBeInTheDocument()
    // Market value = 10 * 200.00 = 2,000.00
    expect(screen.getByText(/2,000\.00/)).toBeInTheDocument()
  })

  it('formats the acquired_at date as a local date', () => {
    mockedGetStock.mockReturnValue(new Promise(() => {}))
    renderWithProviders(
      <FundPortfolioHoldingsTable
        holdings={[createMockFundHolding({ stock_id: 1, acquired_at: '2026-01-12T00:00:00Z' })]}
      />
    )
    const expected = new Date('2026-01-12T00:00:00Z').toLocaleDateString()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
