import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  REALIZED: 'Realizovano',
  REJECTED: 'Odbijeno',
  PROCESSING: 'U obradi',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  REALIZED: 'default',
  REJECTED: 'destructive',
  PROCESSING: 'secondary',
}

interface RecentTransactionsProps {
  transactions: Payment[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nema transakcija.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Primalac</TableHead>
          <TableHead className="text-right">Iznos</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{formatDate(tx.timestamp)}</TableCell>
            <TableCell className="text-sm">{tx.receiver_name}</TableCell>
            <TableCell className="text-sm text-right">
              {formatCurrency(tx.amount, tx.currency)}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[tx.status] ?? 'secondary'}>
                {STATUS_LABELS[tx.status] ?? tx.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
