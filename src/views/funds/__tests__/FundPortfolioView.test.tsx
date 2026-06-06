import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundPortfolioView } from '@/views/funds/FundPortfolioView'
import {
  createMockFund,
  createMockFundDetailResponse,
  createMockFundHolding,
} from '@/__tests__/fixtures/fund-fixtures'
import * as fundsApi from '@/lib/api/funds'

jest.mock('@/lib/api/funds')

const mockedGetFund = fundsApi.getFund as jest.MockedFunction<typeof fundsApi.getFund>

describe('FundPortfolioView', () => {
  beforeEach(() => {
    mockedGetFund.mockReset()
  })

  it('renders the fund name as the page title and summary cards', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7, name: 'Bravo Yield Fund' }),
        total_value_rsd: '5000000.00',
        liquid_rsd_balance: '1000000.00',
        profit_rsd: '20000.00',
        holdings: [],
      })
    )

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
    expect(screen.getAllByText(/Holdings/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the holdings table with inline ticker', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7 }),
        holdings: [createMockFundHolding({ security_id: 42, ticker: 'AAPL', quantity: '10' })],
      })
    )

    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  it('shows a loading skeleton while the fund is being fetched', () => {
    mockedGetFund.mockReturnValue(new Promise(() => {}))
    const { container } = renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })
    expect(screen.queryByText('Bravo Yield Fund')).not.toBeInTheDocument()
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

  it('renders "— RSD" (not "undefined RSD") when a financial field is empty', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7, name: 'Sparse Fund' }),
        total_value_rsd: '',
        liquid_rsd_balance: '',
        profit_rsd: '',
        holdings: [],
      })
    )

    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })

    await waitFor(() => {
      expect(screen.getByText('Sparse Fund')).toBeInTheDocument()
    })
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/—\s*RSD/).length).toBeGreaterThanOrEqual(3)
  })

  it('renders 0 in the Holdings count when the backend returns null holdings', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7 }),
        holdings: null as unknown as never,
      })
    )

    renderWithProviders(<FundPortfolioView />, {
      route: '/funds/7/portfolio',
      routePath: '/funds/:id/portfolio',
    })

    await waitFor(() => {
      expect(screen.getByText(/no securities/i)).toBeInTheDocument()
    })
  })
})
