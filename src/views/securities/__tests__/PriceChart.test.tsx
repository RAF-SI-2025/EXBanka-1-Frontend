import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PriceChart } from '@/views/securities/components/PriceChart'
import { createMockPriceHistory } from '@/__tests__/fixtures/security-fixtures'

// Mock Recharts to avoid SVG rendering issues in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

describe('PriceChart', () => {
  const defaultProps = {
    data: createMockPriceHistory(),
    selectedPeriod: 'month' as const,
    onPeriodChange: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders period selector buttons', () => {
    renderWithProviders(<PriceChart {...defaultProps} />)
    expect(screen.getByText('1D')).toBeInTheDocument()
    expect(screen.getByText('1W')).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
    expect(screen.getByText('1Y')).toBeInTheDocument()
    expect(screen.getByText('5Y')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('calls onPeriodChange when a period button is clicked', () => {
    renderWithProviders(<PriceChart {...defaultProps} />)
    fireEvent.click(screen.getByText('1W'))
    expect(defaultProps.onPeriodChange).toHaveBeenCalledWith('week')
  })

  it('renders chart when data is present', () => {
    renderWithProviders(<PriceChart {...defaultProps} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(<PriceChart {...defaultProps} isLoading />)
    expect(screen.getByText('Loading chart...')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })

  it('shows "No historical data available" when data has fewer than 2 entries', () => {
    const onPeriodChange = jest.fn()
    renderWithProviders(
      <PriceChart
        data={createMockPriceHistory(1)}
        selectedPeriod="month"
        onPeriodChange={onPeriodChange}
      />
    )
    expect(screen.getByText(/no historical data/i)).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
  })

  it('shows "No historical data available" when data is empty', () => {
    renderWithProviders(<PriceChart data={[]} selectedPeriod="month" onPeriodChange={jest.fn()} />)
    expect(screen.getByText(/no historical data/i)).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
  })
})
