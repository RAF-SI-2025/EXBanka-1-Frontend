import { useNavigate } from 'react-router-dom'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { LoanCard } from '@/components/loans/LoanCard'

export function LoanListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useLoans()
  const loans = data?.loans ?? []

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Loans</h1>
        <Button onClick={() => navigate('/loans/apply')}>Apply for Loan</Button>
      </div>

      {loans.length > 0 ? (
        <div className="space-y-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onClick={() => navigate(`/loans/${loan.id}`)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You have no active loans.</p>
      )}
    </div>
  )
}
