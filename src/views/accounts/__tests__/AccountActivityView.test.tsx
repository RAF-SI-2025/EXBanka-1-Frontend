import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountActivityView } from '@/views/accounts/AccountActivityView'
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

describe('AccountActivityView', () => {
  it('renders the page heading', () => {
    renderWithProviders(<AccountActivityView />)
    expect(screen.getByText('Account Activity')).toBeInTheDocument()
  })

  it('renders activity entry data on load', async () => {
    renderWithProviders(<AccountActivityView />)
    await screen.findByText('credit')
    expect(screen.getByText('500.00')).toBeInTheDocument()
    expect(screen.getByText('Order #9 partial fill (txn #15)')).toBeInTheDocument()
  })

  it('shows empty state when no activity', async () => {
    jest.mocked(accountsApi.getAccountActivity).mockResolvedValue({ entries: [], total_count: 0 })
    renderWithProviders(<AccountActivityView />)
    await screen.findByText(/no activity found/i)
  })

  it('shows loading spinner while fetching', () => {
    jest.mocked(accountsApi.getAccountActivity).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<AccountActivityView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('shows a permission-denied message when the API returns 403', async () => {
    const err = Object.assign(new Error('access denied'), {
      isAxiosError: true,
      response: {
        status: 403,
        data: { error: { code: 'forbidden', message: 'access denied' } },
      },
    })
    jest.mocked(accountsApi.getAccountActivity).mockRejectedValue(err)

    renderWithProviders(<AccountActivityView />)
    expect(await screen.findByText(/don't have permission/i)).toBeInTheDocument()
  })

  it('shows a generic error message when the API fails with a non-403 error', async () => {
    const err = Object.assign(new Error('server boom'), {
      isAxiosError: true,
      response: { status: 500, data: { error: 'something broke' } },
    })
    jest.mocked(accountsApi.getAccountActivity).mockRejectedValue(err)

    renderWithProviders(<AccountActivityView />)
    expect(await screen.findByText(/could not load activity/i)).toBeInTheDocument()
  })
})
