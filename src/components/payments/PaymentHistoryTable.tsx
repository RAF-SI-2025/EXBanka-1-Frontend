import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'
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

interface PaymentHistoryTableProps {
  payments: Payment[]
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Sa računa</TableHead>
          <TableHead>Primalac</TableHead>
          <TableHead>Iznos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{formatDate(p.timestamp)}</TableCell>
            <TableCell className="font-mono text-sm">
              {formatAccountNumber(p.from_account)}
            </TableCell>
            <TableCell>{p.receiver_name}</TableCell>
            <TableCell>{formatCurrency(p.amount, p.currency)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                {STATUS_LABELS[p.status] ?? p.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => generateReceiptPdf(p)}>
                PDF
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {payments.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Nema plaćanja.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
