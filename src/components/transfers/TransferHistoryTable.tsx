import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatAccountNumber } from '@/lib/utils/format'
import type { Transfer } from '@/types/transfer'

interface TransferHistoryTableProps {
  transfers: Transfer[]
}

export function TransferHistoryTable({ transfers }: TransferHistoryTableProps) {
  if (transfers.length === 0) {
    return <p className="text-muted-foreground">No transfers.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>From Account</TableHead>
          <TableHead>To Account</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Final Amount</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Commission</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{new Date(t.timestamp).toLocaleDateString('sr-Latn-RS')}</TableCell>
            <TableCell>{formatAccountNumber(t.from_account_number)}</TableCell>
            <TableCell>{formatAccountNumber(t.to_account_number)}</TableCell>
            <TableCell>{formatCurrency(t.initial_amount, 'RSD')}</TableCell>
            <TableCell>{t.final_amount}</TableCell>
            <TableCell>{t.exchange_rate}</TableCell>
            <TableCell>{Number(t.commission).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
