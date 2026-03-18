import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminAccountsPage } from '@/pages/AdminAccountsPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

describe('AdminAccountsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [createMockAccount()], total_count: 1 },
      isLoading: false,
    } as any)
  })

  it('renders admin accounts page', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/upravljanje računima/i)).toBeInTheDocument()
    expect(screen.getByText(/tekući rsd/i)).toBeInTheDocument()
  })

  it('shows create account button', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/novi račun/i)).toBeInTheDocument()
  })
})
