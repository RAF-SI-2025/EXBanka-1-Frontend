import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FundDetailsView } from '@/views/funds/FundDetailsView'
import {
  createMockFund,
  createMockFundDetailResponse,
  createMockFundHolding,
} from '@/__tests__/fixtures/fund-fixtures'
import * as fundsApi from '@/lib/api/funds'

jest.mock('@/lib/api/funds')

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  Pie: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

const mockedGetFund = fundsApi.getFund as jest.MockedFunction<typeof fundsApi.getFund>

beforeEach(() => mockedGetFund.mockReset())

function renderView() {
  renderWithProviders(<FundDetailsView />, { route: '/funds/7', routePath: '/funds/:id' })
}

describe('FundDetailsView', () => {
  it('shows hero summary cards, the chart sections, risk metrics, and holdings', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7, name: 'Bravo Yield Fund', metrics_available: true }),
        investor_count: 42,
        holdings: [createMockFundHolding({ ticker: 'AAPL' })],
      })
    )

    renderView()

    await waitFor(() => expect(screen.getByText('Bravo Yield Fund')).toBeInTheDocument())
    // Hero cards
    expect(screen.getByText(/Total value/i)).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument() // investors
    // Chart sections
    expect(screen.getByText(/Performance vs\. system average/i)).toBeInTheDocument()
    expect(screen.getByText(/Allocation/i)).toBeInTheDocument()
    // Risk metrics
    expect(screen.getByText(/Annualized return/i)).toBeInTheDocument()
    // Secondary details + holdings
    expect(screen.getByText(/Fund details/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Holdings/i).length).toBeGreaterThanOrEqual(1)
  })

  it('hides risk metrics behind an unavailable notice when not computed', async () => {
    mockedGetFund.mockResolvedValue(
      createMockFundDetailResponse({
        fund: createMockFund({ id: 7, name: 'Sparse Fund', metrics_available: false }),
      })
    )

    renderView()

    await waitFor(() => expect(screen.getByText('Sparse Fund')).toBeInTheDocument())
    expect(screen.getByTestId('fund-risk-unavailable')).toBeInTheDocument()
    expect(screen.queryByText(/Annualized return/i)).not.toBeInTheDocument()
  })

  it('shows an error fallback when the fund fetch fails', async () => {
    mockedGetFund.mockRejectedValue(new Error('boom'))
    renderView()
    await waitFor(() => expect(screen.getByText(/could not load fund/i)).toBeInTheDocument())
  })
})
