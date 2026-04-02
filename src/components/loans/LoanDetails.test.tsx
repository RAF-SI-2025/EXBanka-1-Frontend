import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanDetails } from '@/components/loans/LoanDetails'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

describe('LoanDetails', () => {
  it('renders loan number', () => {
    const loan = createMockLoan({ loan_number: 'LN-2026-00001' })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText('LN-2026-00001')).toBeInTheDocument()
  })

  it('renders loan type', () => {
    const loan = createMockLoan({ loan_type: 'CASH' })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText(/cash/i)).toBeInTheDocument()
  })

  it('renders interest rate', () => {
    const loan = createMockLoan({ interest_rate: 8.5 })
    renderWithProviders(<LoanDetails loan={loan} />)
    expect(screen.getByText(/8\.5%/)).toBeInTheDocument()
  })

  it('renders effective interest rate', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan()} />)
    expect(screen.getByText(/effective/i)).toBeInTheDocument()
  })

  it('renders maturity date', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan()} />)
    expect(screen.getByText(/maturity date/i)).toBeInTheDocument()
  })

  it('renders remaining debt', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan()} />)
    expect(screen.getByText(/remaining debt/i)).toBeInTheDocument()
  })

  it('renders next installment info', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan()} />)
    expect(screen.getByText(/next installment/i)).toBeInTheDocument()
  })

  it('renders currency from loan data', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan({ currency_code: 'EUR' })} />)
    expect(screen.getAllByText(/EUR/).length).toBeGreaterThan(0)
  })

  it('renders interest type', () => {
    renderWithProviders(<LoanDetails loan={createMockLoan({ interest_type: 'VARIABLE' })} />)
    expect(screen.getByText(/variable/i)).toBeInTheDocument()
  })
})
