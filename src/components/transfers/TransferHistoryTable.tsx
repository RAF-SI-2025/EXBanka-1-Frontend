import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatAccountNumber } from '@/lib/utils/format'
import type { Transfer } from '@/types/transfer'

const STATUS_LABELS: Record<string, string> = {
  REALIZED: 'Realizovano',
  REJECTED: 'Odbijeno',
  PROCESSING: 'U obradi',
}

interface TransferHistoryTableProps {
  transfers: Transfer[]
}

export function TransferHistoryTable({ transfers }: TransferHistoryTableProps) {
  if (transfers.length === 0) {
    return <p className="text-muted-foreground">Nema transfera.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Sa računa</TableHead>
          <TableHead>Na račun</TableHead>
          <TableHead>Iznos</TableHead>
          <TableHead>Krajnji iznos</TableHead>
          <TableHead>Kurs</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{new Date(t.timestamp).toLocaleDateString('sr-Latn-RS')}</TableCell>
            <TableCell>{formatAccountNumber(t.from_account)}</TableCell>
            <TableCell>{formatAccountNumber(t.to_account)}</TableCell>
            <TableCell>{formatCurrency(t.initial_amount, t.initial_currency)}</TableCell>
            <TableCell>{formatCurrency(t.final_amount, t.final_currency)}</TableCell>
            <TableCell>{t.exchange_rate}</TableCell>
            <TableCell>
              <Badge variant={t.status === 'REALIZED' ? 'default' : 'secondary'}>
                {STATUS_LABELS[t.status] ?? t.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
