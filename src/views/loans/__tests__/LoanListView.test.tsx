import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanListView } from '@/views/loans/LoanListView'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('LoanListView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders loan list', () => {
    renderWithProviders(<LoanListView />)
    expect(screen.getByText(/my loans/i)).toBeInTheDocument()
    expect(screen.getByText(/cash/i)).toBeInTheDocument()
  })

  it('shows apply button', () => {
    renderWithProviders(<LoanListView />)
    expect(screen.getByText(/apply for loan/i)).toBeInTheDocument()
  })
})
