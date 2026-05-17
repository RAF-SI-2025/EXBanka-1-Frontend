import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanDetailsView } from '@/views/loans/LoanDetailsView'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoan, createMockInstallment } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('LoanDetailsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoan).mockReturnValue({
      data: createMockLoan(),
      isLoading: false,
    } as any)
    jest.mocked(useLoansHook.useLoanInstallments).mockReturnValue({
      data: [createMockInstallment({ id: 1, amount: 9755.5, status: 'PENDING' })],
      isLoading: false,
    } as any)
  })

  it('renders loan details', () => {
    renderWithProviders(<LoanDetailsView />, { route: '/loans/1' })
    expect(screen.getAllByText(/cash/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/interest rate/i).length).toBeGreaterThan(0)
  })

  it('renders installments from the dedicated endpoint', () => {
    renderWithProviders(<LoanDetailsView />, { route: '/loans/1' })
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })
})
