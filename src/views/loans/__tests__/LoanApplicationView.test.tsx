import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanApplicationView } from '@/views/loans/LoanApplicationView'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')

describe('LoanApplicationView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders loan application form', () => {
    renderWithProviders(<LoanApplicationView />)
    expect(screen.getByText(/submit loan request/i)).toBeInTheDocument()
    expect(screen.getByText(/loan type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })
})
