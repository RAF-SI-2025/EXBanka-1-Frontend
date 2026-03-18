import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanDetailsPage } from '@/pages/LoanDetailsPage'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('LoanDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoan).mockReturnValue({
      data: createMockLoan(),
      isLoading: false,
    } as any)
  })

  it('renders loan details', () => {
    renderWithProviders(<LoanDetailsPage />, { route: '/loans/1' })
    expect(screen.getByText(/gotovinski/i)).toBeInTheDocument()
    expect(screen.getByText(/kamatna stopa/i)).toBeInTheDocument()
  })
})
