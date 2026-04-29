import type { LoanRequest } from '@/types/loan'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixed',
  VARIABLE: 'Variable',
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
        <StatusBadge status={request.status}>
          {STATUS_LABELS[request.status] ?? request.status}
        </StatusBadge>
      </TableCell>
      <TableCell>
        {isPending && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApprove(request.id)} disabled={isDisabled}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(request.id)}
              disabled={isDisabled}
            >
              Reject
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
