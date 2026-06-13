import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountListView } from '@/views/accounts/AccountListView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as usePaymentsHook from '@/hooks/usePayments'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/usePayments')

describe('AccountListView', () => {
  const mockAccount = createMockAccount()
  const mockPayment = createMockPayment()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [mockAccount], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [mockPayment], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders accounts list', () => {
    renderWithProviders(<AccountListView />)
    expect(screen.getByText(/my accounts/i)).toBeInTheDocument()
    expect(screen.getByText('Tekući RSD')).toBeInTheDocument()
  })

  it('shows recent transactions for the first account by default', () => {
    renderWithProviders(<AccountListView />)
    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
  })

  it('shows recent transactions after clicking an account', () => {
    renderWithProviders(<AccountListView />)
    fireEvent.click(screen.getByText('Tekući RSD'))
    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
  })

  it('shows account name in recent transactions heading', () => {
    renderWithProviders(<AccountListView />)
    fireEvent.click(screen.getByText('Tekući RSD'))
    const headings = screen.getAllByText(/Tekući RSD/)
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('shows details button after account selection', () => {
    renderWithProviders(<AccountListView />)
    fireEvent.click(screen.getByText('Tekući RSD'))
    expect(screen.getByRole('button', { name: /account details/i })).toBeInTheDocument()
  })
})
