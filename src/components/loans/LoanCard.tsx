import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { Loan } from '@/types/loan'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAID_OFF: 'Paid Off',
  DELINQUENT: 'Delinquent',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PAID_OFF: 'secondary',
  DELINQUENT: 'destructive',
}

export interface LoanCardProps {
  loan: Loan
  onClick: () => void
}

const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

export function LoanCard({ loan, onClick }: LoanCardProps) {
  const currency = loan.currency_code ?? 'RSD'
  const installmentAmount = loan.installment_amount ?? loan.next_installment_amount

  return (
    <Card
      role="article"
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-semibold">{loanTypeLabel(loan.loan_type)}</p>
          <p className="text-sm text-muted-foreground">{loan.loan_number}</p>
          {installmentAmount !== undefined && (
            <p className="text-sm text-muted-foreground">
              Installment: {formatCurrency(installmentAmount, currency)}/month
            </p>
          )}
          <p className="text-sm text-muted-foreground">Approved: {formatDate(loan.created_at)}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-lg font-bold">{formatCurrency(loan.amount, 'RSD')}</p>
          <Badge variant={STATUS_VARIANT[loan.status] ?? 'secondary'}>
            {STATUS_LABELS[loan.status] ?? loan.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
