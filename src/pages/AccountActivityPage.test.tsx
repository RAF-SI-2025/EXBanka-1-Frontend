import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountActivityPage } from '@/pages/AccountActivityPage'
import * as accountsApi from '@/lib/api/accounts'

jest.mock('@/lib/api/accounts')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '42' }),
  useNavigate: () => jest.fn(),
}))

const mockEntry = {
  id: 1,
  entry_type: 'credit' as const,
  amount: '500.00',
  currency: 'RSD',
  balance_before: '1000.00',
  balance_after: '1500.00',
  description: 'Order #9 partial fill (txn #15)',
  reference_type: 'reservation_settlement',
  reference_id: 'order-9-txn-15',
  occurred_at: 1745000000,
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(accountsApi.getAccountActivity).mockResolvedValue({
    entries: [mockEntry],
    total_count: 1,
  })
})

describe('AccountActivityPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<AccountActivityPage />)
    expect(screen.getByText('Account Activity')).toBeInTheDocument()
  })

  it('renders activity entry data on load', async () => {
    renderWithProviders(<AccountActivityPage />)
    await screen.findByText('credit')
    expect(screen.getByText('500.00')).toBeInTheDocument()
    expect(screen.getByText('Order #9 partial fill (txn #15)')).toBeInTheDocument()
  })

  it('shows empty state when no activity', async () => {
    jest.mocked(accountsApi.getAccountActivity).mockResolvedValue({ entries: [], total_count: 0 })
    renderWithProviders(<AccountActivityPage />)
    await screen.findByText(/no activity found/i)
  })

  it('shows loading spinner while fetching', () => {
    jest.mocked(accountsApi.getAccountActivity).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<AccountActivityPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
