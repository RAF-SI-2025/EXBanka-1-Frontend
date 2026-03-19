import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanListPage } from '@/pages/LoanListPage'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('LoanListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders loan list', () => {
    renderWithProviders(<LoanListPage />)
    expect(screen.getByText(/moji krediti/i)).toBeInTheDocument()
    expect(screen.getByText(/gotovinski/i)).toBeInTheDocument()
  })

  it('shows apply button', () => {
    renderWithProviders(<LoanListPage />)
    expect(screen.getByText(/podnesi zahtev/i)).toBeInTheDocument()
  })
})
