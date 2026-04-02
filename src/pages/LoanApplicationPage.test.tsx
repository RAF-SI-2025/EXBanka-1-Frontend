import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanApplicationPage } from '@/pages/LoanApplicationPage'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')

describe('LoanApplicationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders loan application form', () => {
    renderWithProviders(<LoanApplicationPage />)
    expect(screen.getByText(/submit loan request/i)).toBeInTheDocument()
    expect(screen.getByText(/loan type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })
})
