import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FuturesDetailPage } from '@/pages/FuturesDetailPage'
import * as securitiesApi from '@/lib/api/securities'
import { createMockFutures, createMockPriceHistory } from '@/__tests__/fixtures/security-fixtures'

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
  renderWithProviders(<FuturesDetailPage />, {
    route: '/securities/futures/1',
    routePath: '/securities/futures/:id',
  })

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getFuture).mockResolvedValue(createMockFutures())
  jest.mocked(securitiesApi.getFutureHistory).mockResolvedValue({
    history: createMockPriceHistory(),
    total_count: 5,
  })
})

describe('FuturesDetailPage', () => {
  it('renders futures title', async () => {
    renderPage()
    await screen.findByText('CLJ26 — Crude Oil Futures')
  })

  it('displays info entries', async () => {
    renderPage()
    await screen.findByText('CLJ26 — Crude Oil Futures')
    expect(screen.getByText('72.50')).toBeInTheDocument()
    expect(screen.getByText('NYMEX')).toBeInTheDocument()
    expect(screen.getByText('2026-04-15')).toBeInTheDocument()
  })

  it('renders Buy button', async () => {
    renderPage()
    await screen.findByText('CLJ26 — Crude Oil Futures')
    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument()
  })

  it('renders period selector', async () => {
    renderPage()
    await screen.findByText('CLJ26 — Crude Oil Futures')
    expect(screen.getByText('1D')).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(securitiesApi.getFuture).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
