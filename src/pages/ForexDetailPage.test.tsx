import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ForexDetailPage } from '@/pages/ForexDetailPage'
import * as securitiesApi from '@/lib/api/securities'
import { createMockForex, createMockPriceHistory } from '@/__tests__/fixtures/security-fixtures'

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
  renderWithProviders(<ForexDetailPage />, {
    route: '/securities/forex/1',
    routePath: '/securities/forex/:id',
  })

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getForexPair).mockResolvedValue(createMockForex())
  jest.mocked(securitiesApi.getForexHistory).mockResolvedValue({
    history: createMockPriceHistory(),
    total_count: 5,
  })
})

describe('ForexDetailPage', () => {
  it('renders forex title', async () => {
    renderPage()
    await screen.findByText('EUR/USD — Euro to US Dollar')
  })

  it('displays info entries', async () => {
    renderPage()
    await screen.findByText('EUR/USD — Euro to US Dollar')
    expect(screen.getByText('1.0850')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders Buy button', async () => {
    renderPage()
    await screen.findByText('EUR/USD — Euro to US Dollar')
    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(securitiesApi.getForexPair).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
