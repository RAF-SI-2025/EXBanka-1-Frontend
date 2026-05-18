import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HoldingTransactionsView } from '@/views/portfolio/HoldingTransactionsView'
import * as portfolioApi from '@/lib/api/portfolio'
import { createMockHoldingTransaction } from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '7' }),
  useNavigate: () => jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(portfolioApi.getHoldingTransactions).mockResolvedValue({
    transactions: [createMockHoldingTransaction({ id: 1, ticker: 'AAPL', direction: 'buy' })],
    total_count: 1,
  })
})

describe('HoldingTransactionsView', () => {
  it('renders the page heading', () => {
    renderWithProviders(<HoldingTransactionsView />)
    expect(screen.getByText('Holding Transactions')).toBeInTheDocument()
  })

  it('renders transaction data on load', async () => {
    renderWithProviders(<HoldingTransactionsView />)
    await screen.findByText('AAPL')
    expect(screen.getByText('buy')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', async () => {
    jest
      .mocked(portfolioApi.getHoldingTransactions)
      .mockResolvedValue({ transactions: [], total_count: 0 })
    renderWithProviders(<HoldingTransactionsView />)
    await screen.findByText(/no transactions found/i)
  })

  it('shows loading spinner while fetching', () => {
    jest.mocked(portfolioApi.getHoldingTransactions).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<HoldingTransactionsView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })
})
