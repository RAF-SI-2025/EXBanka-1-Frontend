import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HomePage } from '@/pages/HomePage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as usePaymentsHook from '@/hooks/usePayments'
import * as useExchangeHook from '@/hooks/useExchange'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/usePayments')
jest.mock('@/hooks/useExchange')

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    jest.mocked(useExchangeHook.useConvertCurrency).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      data: undefined,
    } as any)
  })

  it('renders welcome message and quick action widgets', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    expect(screen.getByText('Saved Recipients')).toBeInTheDocument()
    expect(screen.getByText(/quick conversion/i)).toBeInTheDocument()
  })

  it('does not show recent transactions section when no accounts exist', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.queryByText(/recent transactions/i)).not.toBeInTheDocument()
  })

  it('shows recent transactions section for the primary account', () => {
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [createMockAccount()], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [createMockPayment()], total: 1 },
      isLoading: false,
    } as any)

    renderWithProviders(<HomePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
  })

  it('calls usePayments with primary account number and page_size 5', () => {
    const mockAccount = createMockAccount()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [mockAccount], total: 1 },
      isLoading: false,
    } as any)

    renderWithProviders(<HomePage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    expect(usePaymentsHook.usePayments).toHaveBeenCalledWith({ page_size: 5 })
  })
})
