import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BankAccountActivityView } from '@/views/accounts/BankAccountActivityView'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')

const mockActivity = {
  entries: [
    {
      id: 1,
      entry_type: 'credit' as const,
      amount: '100.00',
      currency: 'RSD',
      balance_before: '0.00',
      balance_after: '100.00',
      description: 'Transfer fee collection',
      reference_id: 'ref-001',
      reference_type: 'transfer',
      occurred_at: 1747000000,
    },
    {
      id: 2,
      entry_type: 'debit' as const,
      amount: '50.00',
      currency: 'RSD',
      balance_before: '100.00',
      balance_after: '50.00',
      description: 'Outgoing fee',
      reference_id: 'ref-002',
      reference_type: 'fee',
      occurred_at: 1747001000,
    },
  ],
  total_count: 2,
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccountsHook.useBankAccountActivity).mockReturnValue({
    data: mockActivity,
    isLoading: false,
  } as any)
})

describe('BankAccountActivityView', () => {
  it('renders page heading', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByText(/bank account activity/i)).toBeInTheDocument()
  })

  it('shows activity entries', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByText('Transfer fee collection')).toBeInTheDocument()
    expect(screen.getByText('Outgoing fee')).toBeInTheDocument()
  })

  it('shows credit entry in green and debit in red', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    const creditCell = screen.getByText('credit')
    const debitCell = screen.getByText('debit')
    expect(creditCell).toHaveClass('text-green-600')
    expect(debitCell).toHaveClass('text-red-600')
  })

  it('shows total count', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByText(/2 entries/i)).toBeInTheDocument()
  })

  it('shows loading spinner while loading', () => {
    jest.mocked(useAccountsHook.useBankAccountActivity).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    jest.mocked(useAccountsHook.useBankAccountActivity).mockReturnValue({
      data: { entries: [], total_count: 0 },
      isLoading: false,
    } as any)
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })

  it('calls useBankAccountActivity with account id from url', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/42/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(useAccountsHook.useBankAccountActivity).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ page: 1 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('advances to page 2 when next page is clicked', async () => {
    jest.mocked(useAccountsHook.useBankAccountActivity).mockReturnValue({
      data: { entries: mockActivity.entries, total_count: 25 },
      isLoading: false,
    } as any)
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    await userEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(useAccountsHook.useBankAccountActivity).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ page: 2 })
    )
  })

  it('shows back button', () => {
    renderWithProviders(<BankAccountActivityView />, {
      route: '/admin/bank-accounts/1/activity',
      routePath: '/admin/bank-accounts/:id/activity',
    })
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })
})
