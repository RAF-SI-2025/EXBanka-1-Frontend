import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountListPage } from '@/pages/AccountListPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

describe('AccountListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [createMockAccount()], total_count: 1 },
      isLoading: false,
    } as any)
  })

  it('renders accounts list', () => {
    renderWithProviders(<AccountListPage />)
    expect(screen.getByText(/moji računi/i)).toBeInTheDocument()
    expect(screen.getByText('Tekući RSD')).toBeInTheDocument()
  })
})
