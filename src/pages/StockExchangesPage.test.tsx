import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockExchangesPage } from '@/pages/StockExchangesPage'
import * as stockExchangesApi from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/stockExchanges')

const mockExchanges = [
  createMockStockExchange({
    id: 1,
    exchange_name: 'New York Stock Exchange',
    exchange_acronym: 'NYSE',
  }),
  createMockStockExchange({
    id: 2,
    exchange_name: 'London Stock Exchange',
    exchange_acronym: 'LSE',
  }),
]

const authWithExchangePermission = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read', 'exchanges.manage'],
  }),
})

const authWithoutExchangePermission = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read'],
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue({
    exchanges: mockExchanges,
    total_count: 2,
  })
  jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: false })
  jest.mocked(stockExchangesApi.setTestingMode).mockResolvedValue({ testing_mode: true })
})

describe('StockExchangesPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    expect(screen.getByText('Stock Exchanges')).toBeInTheDocument()
  })

  it('displays exchanges on load', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')
    expect(screen.getByText('London Stock Exchange')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No exchanges found." when empty', async () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue({
      exchanges: [],
      total_count: 0,
    })
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('No exchanges found.')
  })

  it('shows testing mode toggle when user has exchanges.manage permission', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')
    expect(screen.getByRole('button', { name: /enable testing mode/i })).toBeInTheDocument()
  })

  it('hides testing mode toggle when user lacks exchanges.manage permission', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithoutExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')
    expect(screen.queryByRole('button', { name: /testing mode/i })).not.toBeInTheDocument()
  })

  it('calls setTestingMode(true) when Enable button is clicked', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')

    fireEvent.click(screen.getByRole('button', { name: /enable testing mode/i }))

    await waitFor(() => expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(true))
  })

  it('shows Disable button and calls setTestingMode(false) when testing mode is active', async () => {
    jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: true })

    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')

    const disableBtn = screen.getByRole('button', { name: /disable testing mode/i })
    expect(disableBtn).toBeInTheDocument()

    fireEvent.click(disableBtn)

    await waitFor(() => expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(false))
  })

  it('calls API with search filter when typing', async () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockImplementation(async (filters = {}) => {
      if (filters.search === 'London') {
        return { exchanges: [mockExchanges[1]], total_count: 1 }
      }
      return { exchanges: mockExchanges, total_count: 2 }
    })

    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('New York Stock Exchange')

    const searchInput = screen.getByPlaceholderText(/^search$/i)
    fireEvent.change(searchInput, { target: { value: 'London' } })

    await waitFor(() =>
      expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'London', page: 1, page_size: 10 })
      )
    )
  })
})
