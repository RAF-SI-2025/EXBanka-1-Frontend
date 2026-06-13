import { useNavigate } from 'react-router-dom'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { LoanCard } from '@/views/loans/components/LoanCard'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function LoanListView() {
  const navigate = useNavigate()
  const { data, isLoading } = useLoans()
  const loans = data?.loans ?? []

  return (
    <ViewShell
      title="My Loans"
      subtitle="Active and historical loans on your accounts."
      actions={<Button onClick={() => navigate('/loans/apply')}>Apply for Loan</Button>}
    >
      {isLoading && <LoadingState />}
      {!isLoading && loans.length === 0 && (
        <EmptyState title="You have no active loans." hint="Apply for one to get started." />
      )}
      {!isLoading && loans.length > 0 && (
        <div className="space-y-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onClick={() => navigate(`/loans/${loan.id}`)} />
          ))}
        </div>
      )}
    </ViewShell>
  )
}
