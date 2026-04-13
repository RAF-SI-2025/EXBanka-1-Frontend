import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { InstallmentTable } from '@/components/loans/InstallmentTable'
import { createMockInstallment } from '@/__tests__/fixtures/loan-fixtures'

const mockInstallments = [
  createMockInstallment({
    id: 1,
    loan_id: 1,
    expected_date: '2026-02-01',
    amount: 10234,
    status: 'PAID',
  }),
  createMockInstallment({
    id: 2,
    loan_id: 1,
    expected_date: '2026-03-01',
    amount: 10234,
    status: 'PENDING',
  }),
]

describe('InstallmentTable', () => {
  it('renders installment rows with amounts', () => {
    renderWithProviders(<InstallmentTable installments={mockInstallments} />)
    expect(screen.getAllByText(/10\.234/)).toHaveLength(2)
  })

  it('renders paid and pending status badges', () => {
    renderWithProviders(<InstallmentTable installments={mockInstallments} />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders row numbers based on index', () => {
    renderWithProviders(<InstallmentTable installments={mockInstallments} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows empty state when no installments', () => {
    renderWithProviders(<InstallmentTable installments={[]} />)
    expect(screen.getByText(/no installments/i)).toBeInTheDocument()
  })
})
