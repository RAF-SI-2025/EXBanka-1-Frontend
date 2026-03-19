import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountDetailsPage } from '@/pages/AccountDetailsPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

describe('AccountDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useAccount).mockReturnValue({
      data: createMockAccount(),
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useUpdateAccount).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total_count: 0 },
      isLoading: false,
    } as any)
  })

  it('renders account name', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.getByRole('heading', { name: 'Tekući RSD' })).toBeInTheDocument()
  })

  it('renders rename button', () => {
    renderWithProviders(<AccountDetailsPage />, { route: '/accounts/1' })
    expect(screen.getByText(/preimenuj račun/i)).toBeInTheDocument()
  })
})
