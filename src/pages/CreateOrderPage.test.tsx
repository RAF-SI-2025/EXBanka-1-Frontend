import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderPage } from '@/pages/CreateOrderPage'
import * as ordersApi from '@/lib/api/orders'
import * as accountsApi from '@/lib/api/accounts'
import * as clientsApi from '@/lib/api/clients'
import * as securitiesApi from '@/lib/api/securities'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/orders')
jest.mock('@/lib/api/accounts')
jest.mock('@/lib/api/clients')
jest.mock('@/lib/api/securities')
jest.mock('@/lib/api/portfolio')

const mockNavigate = jest.fn()
let mockSearchParams = 'listingId=42&direction=buy'
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearchParams)],
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
  is_bank_account: true,
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.createOrder).mockResolvedValue(createMockOrder())
  jest.mocked(ordersApi.createOrderOnBehalf).mockResolvedValue(createMockOrder())
  jest
    .mocked(accountsApi.getClientAccounts)
    .mockResolvedValue({ accounts: [clientAccount], total: 1 })
  jest.mocked(accountsApi.getBankAccounts).mockResolvedValue({ accounts: [bankAccount], total: 1 })
  jest.mocked(accountsApi.getAllAccounts).mockResolvedValue({ accounts: [], total: 0 })
  jest.mocked(clientsApi.getClients).mockResolvedValue({ clients: [], total: 0 })
  jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [], total_count: 0 })
  jest.mocked(securitiesApi.getFutures).mockResolvedValue({ futures: [], total_count: 0 })
  jest.mocked(securitiesApi.getForexPairs).mockResolvedValue({ forex_pairs: [], total_count: 0 })
})

describe('CreateOrderPage', () => {
  it('renders page title for buy', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.getByText('Create Order')).toBeInTheDocument()
  })

  it('renders the order form', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.queryByLabelText('Direction')).not.toBeInTheDocument()
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

      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'client' } })

      await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Ana')

      await waitFor(() => {
        expect(screen.getByText(/Ana Anić/)).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText(/Ana Anić/))

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

  describe('employee on-behalf order routing', () => {
    it('calls createOrderOnBehalf with client_id when employee submits in client charge mode', async () => {
      const mockClient = createMockClient({ id: 7, first_name: 'Ana', last_name: 'Anić' })
      const anaAccount = createMockAccount({ id: 55, account_number: 'CLIENT-ANA-001' })
      jest.mocked(clientsApi.getClients).mockResolvedValue({ clients: [mockClient], total: 1 })
      jest
        .mocked(accountsApi.getAllAccounts)
        .mockResolvedValue({ accounts: [anaAccount], total: 1 })

      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      fireEvent.change(screen.getByLabelText('Charge As'), { target: { value: 'client' } })
      await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Ana')
      await waitFor(() => expect(screen.getByText(/Ana Anić/)).toBeInTheDocument())
      fireEvent.click(screen.getByText(/Ana Anić/))

      await waitFor(() => expect(screen.getByText(/CLIENT-ANA-001/)).toBeInTheDocument())

      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(ordersApi.createOrderOnBehalf).toHaveBeenCalledWith(
          expect.objectContaining({ client_id: 7, listing_id: 42, direction: 'buy', quantity: 5 })
        )
        expect(ordersApi.createOrder).not.toHaveBeenCalled()
      })
    })

    it('calls createOrder (not on-behalf) when employee submits in bank charge mode', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalled()
        expect(ordersApi.createOrderOnBehalf).not.toHaveBeenCalled()
      })
    })
  })

  describe('forex security type', () => {
    beforeEach(() => {
      mockSearchParams = 'listingId=42&direction=buy&securityType=forex'
    })

    afterEach(() => {
      mockSearchParams = 'listingId=42&direction=buy'
    })

    it('employee Charge As dropdown is disabled and locked to bank', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      const chargeSelect = screen.getByLabelText('Charge As')
      expect(chargeSelect).toBeDisabled()
      expect((chargeSelect as HTMLSelectElement).value).toBe('bank')
    })

    it('employee cannot switch to client mode for forex', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      expect(screen.queryByPlaceholderText(/search client/i)).not.toBeInTheDocument()
    })

    it('employee sees a Deposit Account dropdown for forex', () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      expect(screen.getByLabelText('Deposit Account')).toBeInTheDocument()
    })

    it('Deposit Account dropdown lists bank accounts', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })
      await waitFor(() => {
        const depositSelect = screen.getByLabelText('Deposit Account') as HTMLSelectElement
        expect(depositSelect.options.length).toBeGreaterThan(1)
      })
    })

    it('order submission includes base_account_id and security_type when forex', async () => {
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      await waitFor(() => {
        const depositSelect = screen.getByLabelText('Deposit Account') as HTMLSelectElement
        expect(depositSelect.options.length).toBeGreaterThan(1)
      })

      fireEvent.change(screen.getByLabelText('Deposit Account'), { target: { value: '99' } })
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({ base_account_id: 99, security_type: 'forex' })
        )
      })
    })

    it('non-forex order does not include base_account_id', async () => {
      mockSearchParams = 'listingId=42&direction=buy'
      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'employee' }) },
      })

      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalled()
      })
      const payload = jest.mocked(ordersApi.createOrder).mock.calls[0][0]
      expect(payload).not.toHaveProperty('base_account_id')
    })
  })

  describe('sell order', () => {
    beforeEach(() => {
      mockSearchParams = 'direction=sell&securityType=stock&ticker=AAPL'
    })

    afterEach(() => {
      mockSearchParams = 'listingId=42&direction=buy'
    })

    it('renders "Sell Order" title', () => {
      renderWithProviders(<CreateOrderPage />)
      expect(screen.getByText('Sell Order')).toBeInTheDocument()
    })

    it('renders the Listing dropdown', () => {
      renderWithProviders(<CreateOrderPage />)
      expect(screen.getByLabelText('Listing')).toBeInTheDocument()
    })

    it('populates Listing dropdown with matching stocks', async () => {
      jest.mocked(securitiesApi.getStocks).mockResolvedValue({
        stocks: [
          {
            id: 5,
            listing_id: 10,
            ticker: 'AAPL',
            name: 'Apple Inc.',
            exchange_acronym: 'NASDAQ',
          } as any,
        ],
        total_count: 1,
      })

      renderWithProviders(<CreateOrderPage />)

      await waitFor(() => {
        const listingSelect = screen.getByLabelText('Listing') as HTMLSelectElement
        expect(listingSelect.options.length).toBeGreaterThan(1)
      })
      expect(screen.getByText('NASDAQ — AAPL')).toBeInTheDocument()
    })

    it('order submission includes listing_id selected from dropdown', async () => {
      jest.mocked(securitiesApi.getStocks).mockResolvedValue({
        stocks: [
          {
            id: 5,
            listing_id: 10,
            ticker: 'AAPL',
            name: 'Apple Inc.',
            exchange_acronym: 'NASDAQ',
          } as any,
        ],
        total_count: 1,
      })

      renderWithProviders(<CreateOrderPage />, {
        preloadedState: { auth: createMockAuthState({ userType: 'client' }) },
      })

      await waitFor(() => {
        expect(screen.getByText('NASDAQ — AAPL')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByLabelText('Listing'), { target: { value: '10' } })
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({ listing_id: 10, direction: 'sell', quantity: 3 })
        )
      })
    })
  })
})
