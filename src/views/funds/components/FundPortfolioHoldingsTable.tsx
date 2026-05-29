import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { FundHolding } from '@/types/fund'

interface FundPortfolioHoldingsTableProps {
  holdings: FundHolding[] | null
}

export function FundPortfolioHoldingsTable({ holdings }: FundPortfolioHoldingsTableProps) {
  if (!holdings || holdings.length === 0) {
    return <p className="text-sm text-muted-foreground">This fund holds no securities yet.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Avg price</TableHead>
          <TableHead className="text-right">Current price</TableHead>
          <TableHead className="text-right">Market value</TableHead>
          <TableHead>Acquired</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <TableRow key={`${h.security_id}-${h.acquired_at}`}>
            <TableCell className="font-mono font-semibold">{h.ticker}</TableCell>
            <TableCell className="capitalize">{h.security_type}</TableCell>
            <TableCell className="text-right">{String(h.quantity)}</TableCell>
            <TableCell className="text-right">{formatRsd(h.average_price_rsd)}</TableCell>
            <TableCell className="text-right">{formatRsd(h.current_price_rsd)}</TableCell>
            <TableCell className="text-right">{formatRsd(h.current_value_rsd)}</TableCell>
            <TableCell>{new Date(h.acquired_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatRsd(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (!Number.isFinite(num)) return value
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(num)
}
