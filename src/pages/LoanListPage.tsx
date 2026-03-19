import { useNavigate } from 'react-router-dom'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { LoanCard } from '@/components/loans/LoanCard'

export function LoanListPage() {
  const navigate = useNavigate()
  const { data: loans, isLoading } = useLoans()

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Moji krediti</h1>
        <Button onClick={() => navigate('/loans/apply')}>Podnesi zahtev</Button>
      </div>

      {loans && loans.length > 0 ? (
        <div className="space-y-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onClick={() => navigate(`/loans/${loan.id}`)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nemate aktivnih kredita.</p>
      )}
    </div>
  )
}
