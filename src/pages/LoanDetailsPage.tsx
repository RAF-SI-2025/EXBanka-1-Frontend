import { useParams, useNavigate } from 'react-router-dom'
import { useLoan } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { LOAN_TYPES } from '@/lib/constants/banking'
import { LoanDetails } from '@/components/loans/LoanDetails'
import { InstallmentTable } from '@/components/loans/InstallmentTable'

export function LoanDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: loan, isLoading } = useLoan(Number(id))

  if (isLoading) return <p>Loading...</p>
  if (!loan) return <p>Loan not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/loans')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">
          {LOAN_TYPES.find((t) => t.value === loan.loan_type)?.label ?? loan.loan_type}
        </h1>
      </div>

      <LoanDetails loan={loan} />

      <InstallmentTable installments={loan.installments ?? []} />
    </div>
  )
}
