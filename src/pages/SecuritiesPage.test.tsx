import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { SecuritiesPage } from '@/pages/SecuritiesPage'
import * as securitiesApi from '@/lib/api/securities'
import {
  createMockStock,
  createMockFutures,
  createMockForex,
} from '@/__tests__/fixtures/security-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/securities')

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}))

const employeeAuth = createMockAuthState({
  user: createMockAuthUser({ permissions: ['employees.read'] }),
})

const clientAuth = createMockAuthState({
  user: createMockAuthUser(),
  userType: 'client',
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getStocks).mockResolvedValue({
    stocks: [createMockStock()],
    total_count: 1,
  })
  jest.mocked(securitiesApi.getFutures).mockResolvedValue({
    futures: [createMockFutures()],
    total_count: 1,
  })
  jest.mocked(securitiesApi.getForexPairs).mockResolvedValue({
    forex_pairs: [createMockForex()],
    total_count: 1,
  })
})

describe('SecuritiesPage', () => {
  it('renders page title', () => {
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    expect(screen.getByText('Securities')).toBeInTheDocument()
  })

  it('renders Stocks, Futures, and Forex tabs for employees', () => {
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    expect(screen.getByText('Stocks')).toBeInTheDocument()
    expect(screen.getByText('Futures')).toBeInTheDocument()
    expect(screen.getByText('Forex')).toBeInTheDocument()
  })

  it('renders only Stocks and Futures tabs for clients', () => {
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: clientAuth },
    })
    expect(screen.getByText('Stocks')).toBeInTheDocument()
    expect(screen.getByText('Futures')).toBeInTheDocument()
    expect(screen.queryByText('Forex')).not.toBeInTheDocument()
  })

  it('displays stocks on load', async () => {
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    await screen.findByText('AAPL')
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(securitiesApi.getStocks).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No stocks found." when empty', async () => {
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({
      stocks: [],
      total_count: 0,
    })
    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    await screen.findByText('No stocks found.')
  })

  it('calls API with search filter when typing', async () => {
    jest.mocked(securitiesApi.getStocks).mockImplementation(async (filters = {}) => {
      if (filters.search === 'AAPL') {
        return { stocks: [createMockStock()], total_count: 1 }
      }
      return { stocks: [createMockStock()], total_count: 1 }
    })

    renderWithProviders(<SecuritiesPage />, {
      preloadedState: { auth: employeeAuth },
    })
    await screen.findByText('AAPL')

    const searchInput = screen.getByPlaceholderText(/^search$/i)
    fireEvent.change(searchInput, { target: { value: 'AAPL' } })

    await waitFor(() =>
      expect(securitiesApi.getStocks).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'AAPL', page: 1, page_size: 10 })
      )
    )
  })
})
