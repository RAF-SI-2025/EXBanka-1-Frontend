import type { LoanRequest } from '@/types/loan'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Na čekanju',
  APPROVED: 'Odobren',
  REJECTED: 'Odbijen',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fiksna',
  VARIABLE: 'Varijabilna',
}

interface LoanRequestCardProps {
  request: LoanRequest
  onApprove: (id: number) => void
  onReject: (id: number) => void
  approving: boolean
  rejecting: boolean
}

export function LoanRequestCard({
  request,
  onApprove,
  onReject,
  approving,
  rejecting,
}: LoanRequestCardProps) {
  const loanTypeLabel =
    LOAN_TYPES.find((t) => t.value === request.loan_type)?.label ?? request.loan_type
  const isPending = request.status === 'PENDING'
  const isDisabled = approving || rejecting
  const currency = request.currency_code ?? 'RSD'

  return (
    <TableRow>
      <TableCell>{loanTypeLabel}</TableCell>
      <TableCell>{formatCurrency(request.amount, currency)}</TableCell>
      <TableCell>{request.repayment_period} mes.</TableCell>
      <TableCell>{request.account_number}</TableCell>
      <TableCell>
        {request.interest_type ? INTEREST_TYPE_LABELS[request.interest_type] : '—'}
      </TableCell>
      <TableCell>{request.currency_code ?? '—'}</TableCell>
      <TableCell>{request.purpose ?? '—'}</TableCell>
      <TableCell>
        {request.monthly_salary ? formatCurrency(request.monthly_salary, 'RSD') : '—'}
      </TableCell>
      <TableCell>{request.employment_status ?? '—'}</TableCell>
      <TableCell>{request.phone ?? '—'}</TableCell>
      <TableCell>{formatDate(request.created_at)}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>
          {STATUS_LABELS[request.status] ?? request.status}
        </Badge>
      </TableCell>
      <TableCell>
        {isPending && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApprove(request.id)} disabled={isDisabled}>
              Odobri
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(request.id)}
              disabled={isDisabled}
            >
              Odbij
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
