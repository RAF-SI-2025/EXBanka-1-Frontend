import { usePayments } from '@/hooks/usePayments'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'

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

export function PaymentHistoryPage() {
  const { data, isLoading } = usePayments()
  const payments = data?.payments ?? []

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija plaćanja</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Sa računa</TableHead>
            <TableHead>Primalac</TableHead>
            <TableHead>Iznos</TableHead>
            <TableHead>Status</TableHead>
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
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nema plaćanja.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
