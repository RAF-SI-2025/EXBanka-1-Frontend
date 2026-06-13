import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Processing',
  FAILED: 'Rejected',
}

interface RecentTransactionsProps {
  transactions: Payment[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No transactions.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{formatDate(tx.timestamp)}</TableCell>
            <TableCell className="text-sm">{tx.recipient_name}</TableCell>
            <TableCell className="text-sm text-right">
              {formatCurrency(tx.initial_amount, 'RSD')}
            </TableCell>
            <TableCell>
              <StatusBadge status={tx.status}>{STATUS_LABELS[tx.status] ?? tx.status}</StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
