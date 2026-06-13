import { useParams, useNavigate } from 'react-router-dom'
import { useLoan, useLoanInstallments } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { LOAN_TYPES } from '@/lib/constants/banking'
import { LoanDetails } from '@/views/loans/components/LoanDetails'
import { InstallmentTable } from '@/views/loans/components/InstallmentTable'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function LoanDetailsView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const loanId = Number(id)
  const { data: loan, isLoading } = useLoan(loanId)
  const { data: installments = [] } = useLoanInstallments(loanId)

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!loan) {
    return (
      <ViewShell title="Loan">
        <EmptyState title="Loan not found." />
      </ViewShell>
    )
  }

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/loans')}>
            ← Back
          </Button>
          {LOAN_TYPES.find((t) => t.value === loan.loan_type)?.label ?? loan.loan_type}
        </span>
      }
    >
      <LoanDetails loan={loan} />
      <InstallmentTable installments={installments} />
    </ViewShell>
  )
}
