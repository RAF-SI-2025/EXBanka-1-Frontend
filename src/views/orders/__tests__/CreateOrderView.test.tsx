import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderView } from '@/views/orders/CreateOrderView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useOrdersHook from '@/hooks/useOrders'
import * as useSecuritiesHook from '@/hooks/useSecurities'
import * as usePiggyHook from '@/hooks/usePiggy'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}))

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useOrders')
jest.mock('@/hooks/useSecurities')
jest.mock('@/hooks/usePiggy')

const noopMutation = { mutate: jest.fn(), isPending: false }
const emptyAccounts = { data: { accounts: [] }, isLoading: false }

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue(emptyAccounts as any)
  jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue(emptyAccounts as any)
  jest.mocked(useAccountsHook.useAccountsByClient).mockReturnValue(emptyAccounts as any)
  jest.mocked(useOrdersHook.useCreateOrder).mockReturnValue(noopMutation as any)
  jest.mocked(useOrdersHook.useCreateOrderOnBehalf).mockReturnValue(noopMutation as any)
  jest.mocked(useSecuritiesHook.useCreateOptionOrder).mockReturnValue(noopMutation as any)
  jest.mocked(useSecuritiesHook.useListingsForSell).mockReturnValue([] as any)
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
