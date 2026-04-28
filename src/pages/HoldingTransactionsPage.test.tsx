import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HoldingTransactionsPage } from '@/pages/HoldingTransactionsPage'
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

describe('HoldingTransactionsPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<HoldingTransactionsPage />)
    expect(screen.getByText('Holding Transactions')).toBeInTheDocument()
  })

  it('renders transaction data on load', async () => {
    renderWithProviders(<HoldingTransactionsPage />)
    await screen.findByText('AAPL')
    expect(screen.getByText('buy')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', async () => {
    jest
      .mocked(portfolioApi.getHoldingTransactions)
      .mockResolvedValue({ transactions: [], total_count: 0 })
    renderWithProviders(<HoldingTransactionsPage />)
    await screen.findByText(/no transactions found/i)
  })

  it('shows loading spinner while fetching', () => {
    jest.mocked(portfolioApi.getHoldingTransactions).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<HoldingTransactionsPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
