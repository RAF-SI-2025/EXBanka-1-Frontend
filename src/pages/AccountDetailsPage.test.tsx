import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountDetailsPage } from '@/pages/AccountDetailsPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

describe('AccountDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccount).mockReturnValue({
      data: createMockAccount(),
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useUpdateAccountName).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useUpdateAccountLimits).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useAccountActivity).mockReturnValue({
      data: { entries: [], total_count: 0 },
      isLoading: false,
    } as any)
  })

  it('embeds the activity panel', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.getByText(/^activity$/i)).toBeInTheDocument()
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument()
  })

  it('does not have a separate "View Activity" navigate button', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.queryByRole('button', { name: /view activity/i })).not.toBeInTheDocument()
  })

  it('renders account name', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.getByRole('heading', { name: 'Tekući RSD' })).toBeInTheDocument()
  })

  it('renders rename button', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.getByText(/rename account/i)).toBeInTheDocument()
  })
})
