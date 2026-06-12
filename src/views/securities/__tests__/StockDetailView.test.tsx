import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockDetailView } from '@/views/securities/StockDetailView'
import * as securitiesApi from '@/lib/api/securities'
import {
  createMockStock,
  createMockOption,
  createMockPriceHistory,
} from '@/__tests__/fixtures/security-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/securities')

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
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

function renderStockDetail(auth: ReturnType<typeof createMockAuthState>) {
  return renderWithProviders(<StockDetailView />, {
    route: '/securities/stocks/1',
    routePath: '/securities/stocks/:id',
    preloadedState: { auth },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getStock).mockResolvedValue(createMockStock())
  jest.mocked(securitiesApi.getStockHistory).mockResolvedValue({
    history: createMockPriceHistory(),
    total_count: 5,
  })
  jest.mocked(securitiesApi.getOptions).mockResolvedValue({
    options: [createMockOption()],
    total_count: 1,
  })
})

describe('StockDetailView — options chain access by role', () => {
  it('does not call the employee-only options API for clients', async () => {
    renderStockDetail(clientAuth)

    await screen.findByText(/AAPL — Apple Inc\./)
    expect(securitiesApi.getOptions).not.toHaveBeenCalled()
    expect(screen.queryByText('Options Chain')).not.toBeInTheDocument()
  })

  it('calls the options API and renders the options chain for employees', async () => {
    renderStockDetail(employeeAuth)

    await screen.findByText(/AAPL — Apple Inc\./)
    await waitFor(() =>
      expect(securitiesApi.getOptions).toHaveBeenCalledWith({
        stock_id: 1,
        settlement_date: undefined,
      })
    )
    expect(await screen.findByText('Options Chain')).toBeInTheDocument()
  })
})
