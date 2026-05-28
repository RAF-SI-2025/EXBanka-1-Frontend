import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundPortfolioView } from '@/views/funds/FundPortfolioView'
import { createMockFund, createMockFundHolding } from '@/__tests__/fixtures/fund-fixtures'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'
import * as fundsApi from '@/lib/api/funds'
import * as securitiesApi from '@/lib/api/securities'

jest.mock('@/lib/api/funds')
jest.mock('@/lib/api/securities')

const mockedGetFund = fundsApi.getFund as jest.MockedFunction<typeof fundsApi.getFund>
const mockedGetStock = securitiesApi.getStock as jest.MockedFunction<typeof securitiesApi.getStock>

describe('FundPortfolioView', () => {
  beforeEach(() => {
    mockedGetFund.mockReset()
    mockedGetStock.mockReset()
  })

  it('renders the fund name as the page title and summary cards', async () => {
    mockedGetFund.mockResolvedValue({
      fund: createMockFund({
        id: 7,
        name: 'Bravo Yield Fund',
        fund_value_rsd: '5000000.00',
        liquid_cash_rsd: '1000000.00',
        profit_rsd: '20000.00',
      }),
      holdings: [],
      performance: [],
    })

    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })

    await waitFor(() => {
      expect(screen.getByText('Bravo Yield Fund')).toBeInTheDocument()
    })
    expect(screen.getByText(/Fund value/i)).toBeInTheDocument()
    expect(screen.getByText(/Liquid cash/i)).toBeInTheDocument()
    expect(screen.getByText(/Profit/i)).toBeInTheDocument()
    // "Holdings" appears both as a summary stat label and as a section title
    expect(screen.getAllByText(/Holdings/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the holdings table with enriched ticker after fetching stock details', async () => {
    mockedGetFund.mockResolvedValue({
      fund: createMockFund({ id: 7 }),
      holdings: [createMockFundHolding({ stock_id: 42, quantity: '10' })],
      performance: [],
    })
    mockedGetStock.mockResolvedValueOnce(
      createMockStock({ id: 42, ticker: 'AAPL', name: 'Apple Inc.', price: '180.00' })
    )

    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('shows a loading skeleton while the fund is being fetched', () => {
    mockedGetFund.mockReturnValue(new Promise(() => {}))
    const { container } = renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })
    // No fund title rendered yet
    expect(screen.queryByText('Bravo Yield Fund')).not.toBeInTheDocument()
    // Skeleton placeholders use the .animate-pulse class
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows an error fallback when the fund fetch fails', async () => {
    mockedGetFund.mockRejectedValue(new Error('boom'))
    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })
    await waitFor(() => {
      expect(screen.getByText(/could not load fund/i)).toBeInTheDocument()
    })
  })
})
