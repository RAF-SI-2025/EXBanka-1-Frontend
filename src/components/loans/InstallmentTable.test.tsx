import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { InstallmentTable } from '@/components/loans/InstallmentTable'
import type { LoanInstallment } from '@/types/loan'

const mockInstallments: LoanInstallment[] = [
  { id: 1, installment_number: 1, due_date: '2026-02-01T00:00:00Z', amount: 10234, status: 'PAID' },
  {
    id: 2,
    installment_number: 2,
    due_date: '2026-03-01T00:00:00Z',
    amount: 10234,
    status: 'UNPAID',
  },
]

describe('InstallmentTable', () => {
  it('renders installment rows', () => {
    renderWithProviders(<InstallmentTable installments={mockInstallments} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Unpaid')).toBeInTheDocument()
  })

  it('shows empty state when no installments', () => {
    renderWithProviders(<InstallmentTable installments={[]} />)
    expect(screen.getByText(/no installments/i)).toBeInTheDocument()
  })
})
