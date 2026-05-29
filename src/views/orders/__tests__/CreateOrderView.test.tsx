import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderView } from '@/views/orders/CreateOrderView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useOrdersHook from '@/hooks/useOrders'
import * as useSecuritiesHook from '@/hooks/useSecurities'
import * as useFundsHook from '@/hooks/useFunds'
import * as usePiggyHook from '@/hooks/usePiggy'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}))

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useOrders')
jest.mock('@/hooks/useSecurities')
jest.mock('@/hooks/useFunds')
jest.mock('@/hooks/usePiggy')

const noopMutation = { mutate: jest.fn(), isPending: false }
const emptyAccounts = { data: { accounts: [] }, isLoading: false }
const emptyFunds = { data: { funds: [], total: 0 }, isLoading: false }

beforeEach(() => {
  jest.clearAllMocks()
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
