import { useNavigate } from 'react-router-dom'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivan',
  PAID_OFF: 'Isplaćen',
  DELINQUENT: 'U kašnjenju',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PAID_OFF: 'secondary',
  DELINQUENT: 'destructive',
}

export function LoanListPage() {
  const navigate = useNavigate()
  const { data: loans, isLoading } = useLoans()
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

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
            <Card
              key={loan.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/loans/${loan.id}`)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-semibold">{loanTypeLabel(loan.loan_type)}</p>
                  <p className="text-sm text-muted-foreground">
                    Rata: {formatCurrency(loan.installment_amount, 'RSD')}/mesec
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Odobren: {formatDate(loan.created_at)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold">{formatCurrency(loan.amount, 'RSD')}</p>
                  <Badge variant={STATUS_VARIANT[loan.status] ?? 'secondary'}>
                    {STATUS_LABELS[loan.status] ?? loan.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nemate aktivnih kredita.</p>
      )}
    </div>
  )
}
