import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanCard } from '@/components/loans/LoanCard'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

describe('LoanCard', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loan type label', () => {
    const loan = createMockLoan({ loan_type: 'CASH' })
    renderWithProviders(<LoanCard loan={loan} onClick={mockOnClick} />)
    expect(screen.getByText(/cash/i)).toBeInTheDocument()
  })

  it('renders loan number', () => {
    const loan = createMockLoan({ loan_number: 'LN-2026-00001' })
    renderWithProviders(<LoanCard loan={loan} onClick={mockOnClick} />)
    expect(screen.getByText('LN-2026-00001')).toBeInTheDocument()
  })

  it('renders total amount', () => {
    const loan = createMockLoan({ amount: 500000 })
    renderWithProviders(<LoanCard loan={loan} onClick={mockOnClick} />)
    expect(screen.getByText(/500\.000/)).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const loan = createMockLoan()
    renderWithProviders(<LoanCard loan={loan} onClick={mockOnClick} />)
    await userEvent.click(screen.getByRole('article'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
