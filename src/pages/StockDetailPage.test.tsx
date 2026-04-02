import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockDetailPage } from '@/pages/StockDetailPage'
import * as securitiesApi from '@/lib/api/securities'
import {
  createMockStock,
  createMockPriceHistory,
  createMockOption,
} from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/securities')

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}))

const renderPage = () =>
  renderWithProviders(<StockDetailPage />, {
    route: '/securities/stocks/1',
    routePath: '/securities/stocks/:id',
  })

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getStock).mockResolvedValue(createMockStock())
  jest.mocked(securitiesApi.getStockHistory).mockResolvedValue({
    history: createMockPriceHistory(),
    total_count: 5,
  })
  jest.mocked(securitiesApi.getOptions).mockResolvedValue({
    options: [
      createMockOption({
        option_type: 'call',
        strike_price: '180.00',
        settlement_date: '2026-04-17',
      }),
      createMockOption({
        id: 2,
        option_type: 'put',
        strike_price: '180.00',
        settlement_date: '2026-04-17',
      }),
    ],
    total_count: 2,
  })
})

describe('StockDetailPage', () => {
  it('renders stock title', async () => {
    renderPage()
    await screen.findByText('AAPL — Apple Inc.')
  })

  it('displays stock info entries', async () => {
    renderPage()
    await screen.findByText('AAPL — Apple Inc.')
    expect(screen.getByText('178.50')).toBeInTheDocument()
    expect(screen.getByText('NYSE')).toBeInTheDocument()
  })

  it('renders Buy button', async () => {
    renderPage()
    await screen.findByText('AAPL — Apple Inc.')
    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument()
  })

  it('renders period selector buttons', async () => {
    renderPage()
    await screen.findByText('AAPL — Apple Inc.')
    expect(screen.getByText('1D')).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
  })

  it('renders Options Chain section', async () => {
    renderPage()
    await screen.findByText('AAPL — Apple Inc.')
    await waitFor(() => {
      expect(screen.getByText('Options Chain')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    jest.mocked(securitiesApi.getStock).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
