import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderPage } from '@/pages/CreateOrderPage'
import * as ordersApi from '@/lib/api/orders'
import * as accountsApi from '@/lib/api/accounts'
import * as clientsApi from '@/lib/api/clients'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/orders')
jest.mock('@/lib/api/accounts')
jest.mock('@/lib/api/clients')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('listingId=42&direction=buy')],
}))

const clientAccount = createMockAccount({
  id: 1,
  account_number: 'CLIENT-001',
  account_name: 'My Account',
})
const bankAccount = createMockAccount({
  id: 99,
  account_number: 'BANK-001',
  account_name: 'Bank Account',
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.createOrder).mockResolvedValue(createMockOrder())
  jest
    .mocked(accountsApi.getClientAccounts)
    .mockResolvedValue({ accounts: [clientAccount], total: 1 })
  jest.mocked(accountsApi.getBankAccounts).mockResolvedValue({ accounts: [bankAccount], total: 1 })
  jest.mocked(accountsApi.getAllAccounts).mockResolvedValue({ accounts: [], total: 0 })
  jest.mocked(clientsApi.getClients).mockResolvedValue({ clients: [], total: 0 })
})

describe('CreateOrderPage', () => {
  it('renders page title', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.getByText('Create Order')).toBeInTheDocument()
  })

  it('renders the order form', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.getByLabelText('Direction')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
  })

  it('submits the order and navigates to orders', async () => {
    renderWithProviders(<CreateOrderPage />, {
      preloadedState: { auth: createMockAuthState({ userType: 'client' }) },
    })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ listing_id: 42, direction: 'buy', quantity: 10 })
      )
    })
  })

  describe('account dropdown by role', () => {
    it('client sees own accounts', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'client' }) },
      })
      await waitFor(() => {
        expect(screen.getByText(/CLIENT-001/)).toBeInTheDocument()
      })
      expect(screen.queryByText(/BANK-001/)).not.toBeInTheDocument()
    })

    it('employee sees bank accounts by default', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      await waitFor(() => {
        expect(screen.getByText(/BANK-001/)).toBeInTheDocument()
      })
      expect(screen.queryByText(/CLIENT-001/)).not.toBeInTheDocument()
    })

    it('admin (employee with permissions) sees bank accounts', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      await waitFor(() => {
        expect(screen.getByText(/BANK-001/)).toBeInTheDocument()
      })
      expect(screen.queryByText(/CLIENT-001/)).not.toBeInTheDocument()
    })
  })

  describe('employee charge mode selector', () => {
    it('employee sees Charge As dropdown', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      expect(screen.getByLabelText('Charge As')).toBeInTheDocument()
    })

    it('client does not see Charge As dropdown', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'client' }) },
      })
      expect(screen.queryByLabelText('Charge As')).not.toBeInTheDocument()
    })

    it('employee switching to client mode sees client search input', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'client' } })
      expect(screen.getByPlaceholderText(/search client/i)).toBeInTheDocument()
    })

    it('employee in client mode with selected client sees their accounts', async () => {
      const mockClient = createMockClient({ id: 7, first_name: 'Ana', last_name: 'Anić' })
      const anaAccount = createMockAccount({
        id: 55,
        account_number: 'CLIENT-ANA-001',
        account_name: "Ana's Account",
      })
      jest.mocked(clientsApi.getClients).mockResolvedValue({ clients: [mockClient], total: 1 })
      jest
        .mocked(accountsApi.getAllAccounts)
        .mockResolvedValue({ accounts: [anaAccount], total: 1 })

      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      // Switch to client mode
      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'client' } })

      // Type in client search
      await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Ana')

      // Wait for client result and click it
      await waitFor(() => {
        expect(screen.getByText(/Ana Anić/)).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText(/Ana Anić/))

      // Client's accounts should load
      await waitFor(() => {
        expect(accountsApi.getAllAccounts).toHaveBeenCalledWith({ client_id: 7 })
      })
      await waitFor(() => {
        expect(screen.getByText(/CLIENT-ANA-001/)).toBeInTheDocument()
      })
    })

    it('switching back to bank mode hides client search and shows bank accounts', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'client' } })
      expect(screen.getByPlaceholderText(/search client/i)).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'bank' } })
      expect(screen.queryByPlaceholderText(/search client/i)).not.toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText(/BANK-001/)).toBeInTheDocument()
      })
    })
  })
})
