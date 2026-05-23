import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PriceChart } from '@/views/securities/components/PriceChart'
import { createMockPriceHistory } from '@/__tests__/fixtures/security-fixtures'

// Recharts is mocked because JSDOM has no SVG layout engine. The mock renders
// children inline so we can assert on the shape callbacks recharts would
// otherwise invoke with computed geometry.
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composed-chart" data-rows={data.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`bar-${dataKey}`} />
  ),
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

  it('renders a ComposedChart with both wick and body bars when data is present', () => {
    renderWithProviders(<PriceChart {...defaultProps} />)
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-wick')).toBeInTheDocument()
    expect(screen.getByTestId('bar-body')).toBeInTheDocument()
  })

  it('passes the full data row count to the chart', () => {
    renderWithProviders(<PriceChart {...defaultProps} data={createMockPriceHistory(7)} />)
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-rows', '7')
  })

  it('renders a single candle when data has exactly 1 entry (no longer blocked by <2 gate)', () => {
    renderWithProviders(
      <PriceChart
        data={createMockPriceHistory(1)}
        selectedPeriod="month"
        onPeriodChange={jest.fn()}
      />
    )
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-rows', '1')
  })

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(<PriceChart {...defaultProps} isLoading />)
    expect(screen.getByText('Loading chart...')).toBeInTheDocument()
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument()
  })

  it('shows "No historical data available" when data is empty', () => {
    renderWithProviders(<PriceChart data={[]} selectedPeriod="month" onPeriodChange={jest.fn()} />)
    expect(screen.getByText(/no historical data/i)).toBeInTheDocument()
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument()
  })
})
