import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderView } from '@/views/orders/CreateOrderView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useOrdersHook from '@/hooks/useOrders'
import * as useSecuritiesHook from '@/hooks/useSecurities'
import * as useFundsHook from '@/hooks/useFunds'
import * as usePiggyHook from '@/hooks/usePiggy'
import * as useRecurringOrdersHook from '@/hooks/useRecurringOrders'
import * as errors from '@/lib/errors'

const mockNavigate = jest.fn()
let mockSearchParams = new URLSearchParams()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}))

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useOrders')
jest.mock('@/hooks/useSecurities')
jest.mock('@/hooks/useFunds')
jest.mock('@/hooks/usePiggy')
jest.mock('@/hooks/useRecurringOrders')
jest.mock('@/lib/errors', () => ({
  ...jest.requireActual('@/lib/errors'),
  notifyError: jest.fn(),
}))

const noopMutation = { mutate: jest.fn(), isPending: false }
const emptyAccounts = { data: { accounts: [] }, isLoading: false }
const emptyFunds = { data: { funds: [], total: 0 }, isLoading: false }

beforeEach(() => {
  jest.clearAllMocks()
  mockSearchParams = new URLSearchParams()
  jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue(emptyAccounts as any)
  jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue(emptyAccounts as any)
  jest.mocked(useAccountsHook.useAccountsByClient).mockReturnValue(emptyAccounts as any)
  jest.mocked(useOrdersHook.useCreateOrder).mockReturnValue(noopMutation as any)
  jest.mocked(useOrdersHook.useCreateOrderOnBehalf).mockReturnValue(noopMutation as any)
  jest.mocked(useOrdersHook.useCreateOrderOnBehalfFund).mockReturnValue(noopMutation as any)
  jest.mocked(useSecuritiesHook.useCreateOptionOrder).mockReturnValue(noopMutation as any)
  jest.mocked(useSecuritiesHook.useListingsForSell).mockReturnValue([] as any)
  jest.mocked(useFundsHook.useFunds).mockReturnValue(emptyFunds as any)
  jest.mocked(usePiggyHook.usePiggy).mockReturnValue({ triggerPiggy: jest.fn() } as any)
  jest.mocked(useRecurringOrdersHook.useCreateRecurringOrder).mockReturnValue(noopMutation as any)
})

describe('CreateOrderView — scheduling a recurring buy', () => {
  const clientAccount = {
    id: 50,
    account_number: 'ACC-050',
    account_name: 'My Account',
    currency_code: 'RSD',
  }

  function renderClientBuy() {
    mockSearchParams = new URLSearchParams({ listingId: '7', direction: 'buy' })
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [clientAccount] },
      isLoading: false,
    } as any)
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'client' } as any },
    })
  }

  it('shows the Schedule order checkbox for a client market buy', () => {
    renderClientBuy()
    expect(screen.getByLabelText(/schedule order/i)).toBeInTheDocument()
  })

  it('shows the Schedule order checkbox for an employee market buy', () => {
    mockSearchParams = new URLSearchParams({ listingId: '7', direction: 'buy' })
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })
    expect(screen.getByLabelText(/schedule order/i)).toBeInTheDocument()
  })

  it('places the order then creates the recurring order on "Place order and schedule"', () => {
    const placeMutate = jest.fn((_payload, opts) => opts?.onSuccess?.())
    const recurringMutate = jest.fn((_payload, opts) => opts?.onSuccess?.())
    jest
      .mocked(useOrdersHook.useCreateOrder)
      .mockReturnValue({ mutate: placeMutate, isPending: false } as any)
    jest
      .mocked(useRecurringOrdersHook.useCreateRecurringOrder)
      .mockReturnValue({ mutate: recurringMutate, isPending: false } as any)

    renderClientBuy()
    fireEvent.click(screen.getByLabelText(/schedule order/i))
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /place order and schedule/i }))

    expect(placeMutate).toHaveBeenCalledTimes(1)
    expect(recurringMutate).toHaveBeenCalledTimes(1)
    const recurringPayload = recurringMutate.mock.calls[0][0]
    expect(recurringPayload).toEqual(
      expect.objectContaining({
        listing_id: 7,
        side: 'buy',
        quantity: 5,
        account_id: 50,
        interval: 'monthly',
        end_date_unix: 0,
      })
    )
    expect(typeof recurringPayload.day_of_month).toBe('number')
    expect(typeof recurringPayload.start_date_unix).toBe('number')
    expect(mockNavigate).toHaveBeenCalledWith('/orders')
  })

  it('only creates the recurring order on "Schedule" (no immediate buy)', () => {
    const placeMutate = jest.fn()
    const recurringMutate = jest.fn((_payload, opts) => opts?.onSuccess?.())
    jest
      .mocked(useOrdersHook.useCreateOrder)
      .mockReturnValue({ mutate: placeMutate, isPending: false } as any)
    jest
      .mocked(useRecurringOrdersHook.useCreateRecurringOrder)
      .mockReturnValue({ mutate: recurringMutate, isPending: false } as any)

    renderClientBuy()
    fireEvent.click(screen.getByLabelText(/schedule order/i))
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'weekly' } })
    fireEvent.click(screen.getByRole('button', { name: /^schedule$/i }))

    expect(placeMutate).not.toHaveBeenCalled()
    expect(recurringMutate).toHaveBeenCalledTimes(1)
    const recurringPayload = recurringMutate.mock.calls[0][0]
    expect(recurringPayload).toEqual(
      expect.objectContaining({ listing_id: 7, interval: 'weekly', quantity: 5 })
    )
    expect(typeof recurringPayload.day_of_week).toBe('number')
    expect(mockNavigate).toHaveBeenCalledWith('/orders')
  })

  it('surfaces a combined error and does not navigate when scheduling fails after the buy', () => {
    const placeMutate = jest.fn((_payload, opts) => opts?.onSuccess?.())
    const scheduleError = new Error('schedule failed')
    const recurringMutate = jest.fn((_payload, opts) => opts?.onError?.(scheduleError))
    jest
      .mocked(useOrdersHook.useCreateOrder)
      .mockReturnValue({ mutate: placeMutate, isPending: false } as any)
    jest
      .mocked(useRecurringOrdersHook.useCreateRecurringOrder)
      .mockReturnValue({ mutate: recurringMutate, isPending: false } as any)

    renderClientBuy()
    fireEvent.click(screen.getByLabelText(/schedule order/i))
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /place order and schedule/i }))

    expect(placeMutate).toHaveBeenCalledTimes(1)
    expect(errors.notifyError).toHaveBeenCalledWith(scheduleError)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('CreateOrderView — bank-accounts query gating', () => {
  it('calls useBankAccounts with enabled=true when userType is employee', () => {
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    expect(useAccountsHook.useBankAccounts).toHaveBeenCalledWith(true)
  })

  it('calls useBankAccounts with enabled=false when userType is client', () => {
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'client' } as any },
    })

    expect(useAccountsHook.useBankAccounts).toHaveBeenCalledWith(false)
  })

  it('calls useBankAccounts with enabled=false when userType is null', () => {
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: null } as any },
    })

    expect(useAccountsHook.useBankAccounts).toHaveBeenCalledWith(false)
  })
})

describe('CreateOrderView — Fund chargeMode', () => {
  it('renders the "Fund" option in the Charge As dropdown for employees', () => {
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    const chargeAs = screen.getByLabelText(/Charge As/i)
    expect(
      within(chargeAs as HTMLSelectElement).getByRole('option', { name: /Fund/i })
    ).toBeInTheDocument()
  })

  it('does not render the Charge As dropdown for clients', () => {
    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'client' } as any },
    })

    expect(screen.queryByLabelText(/Charge As/i)).not.toBeInTheDocument()
  })

  it('hides fund-linked accounts from the Account dropdown when Bank is selected', () => {
    jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
      data: {
        accounts: [
          {
            id: 100,
            account_number: '111-1',
            account_name: 'Bank Op',
            currency_code: 'RSD',
          },
          {
            id: 200,
            account_number: '111-2',
            account_name: 'Fund RSD',
            currency_code: 'RSD',
          },
        ],
      },
      isLoading: false,
    } as any)
    jest.mocked(useFundsHook.useFunds).mockReturnValue({
      data: {
        funds: [
          {
            id: 7,
            name: 'Alpha Fund',
            description: '',
            minimum_contribution_rsd: '0',
            manager_employee_id: 1,
            rsd_account_id: 200,
            active: true,
            created_at: '',
          },
        ],
        total: 1,
      },
      isLoading: false,
    } as any)

    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    // Default mode is Bank — should show only the non-fund account.
    const accountSelect = screen.getByLabelText(/Account/i) as HTMLSelectElement
    const options = within(accountSelect).getAllByRole('option')
    expect(options).toHaveLength(2) // placeholder + 1 non-fund account
    expect(options[1].textContent).toMatch(/Bank Op/i)
    expect(options[1].textContent).not.toMatch(/Fund RSD/i)
  })

  it('lists only fund-linked bank accounts when Fund is selected', () => {
    jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
      data: {
        accounts: [
          {
            id: 100,
            account_number: '111-1',
            account_name: 'Bank Op',
            currency_code: 'RSD',
          },
          {
            id: 200,
            account_number: '111-2',
            account_name: 'Fund RSD',
            currency_code: 'RSD',
          },
        ],
      },
      isLoading: false,
    } as any)
    jest.mocked(useFundsHook.useFunds).mockReturnValue({
      data: {
        funds: [
          {
            id: 7,
            name: 'Alpha Fund',
            description: '',
            minimum_contribution_rsd: '0',
            manager_employee_id: 1,
            rsd_account_id: 200,
            active: true,
            created_at: '',
          },
        ],
        total: 1,
      },
      isLoading: false,
    } as any)

    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    fireEvent.change(screen.getByLabelText(/Charge As/i), { target: { value: 'fund' } })

    const accountSelect = screen.getByLabelText(/Account/i) as HTMLSelectElement
    const options = within(accountSelect).getAllByRole('option')
    // "Select account" placeholder + 1 fund account; bank op account excluded
    expect(options).toHaveLength(2)
    expect(options[1].textContent).toMatch(/Alpha Fund/)
    expect(options[1].textContent).not.toMatch(/Bank Op/i)
  })

  it('submits with on_behalf_of_fund_id when chargeMode is Fund', () => {
    const fundMutate = jest.fn()
    jest.mocked(useOrdersHook.useCreateOrderOnBehalfFund).mockReturnValue({
      mutate: fundMutate,
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
      data: {
        accounts: [
          { id: 200, account_number: '111-2', account_name: 'Fund RSD', currency_code: 'RSD' },
        ],
      },
      isLoading: false,
    } as any)
    jest.mocked(useFundsHook.useFunds).mockReturnValue({
      data: {
        funds: [
          {
            id: 42,
            name: 'Alpha Fund',
            description: '',
            minimum_contribution_rsd: '0',
            manager_employee_id: 1,
            rsd_account_id: 200,
            active: true,
            created_at: '',
          },
        ],
        total: 1,
      },
      isLoading: false,
    } as any)

    renderWithProviders(<CreateOrderView />, {
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    fireEvent.change(screen.getByLabelText(/Charge As/i), { target: { value: 'fund' } })
    fireEvent.change(screen.getByLabelText(/Account/i), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }))

    expect(fundMutate).toHaveBeenCalledTimes(1)
    const submitted = fundMutate.mock.calls[0][0]
    expect(submitted.on_behalf_of_fund_id).toBe(42)
    expect(submitted.account_id).toBe(200)
    expect(submitted.quantity).toBe(5)
  })
})
