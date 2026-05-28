import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStock } from '@/hooks/useSecurities'
import type { FundHolding } from '@/types/fund'

interface FundPortfolioHoldingsTableProps {
  holdings: FundHolding[]
}

export function FundPortfolioHoldingsTable({ holdings }: FundPortfolioHoldingsTableProps) {
  if (holdings.length === 0) {
    return <p className="text-sm text-muted-foreground">This fund holds no securities yet.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">Market Value</TableHead>
          <TableHead>Acquired</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <HoldingRow key={`${h.stock_id}-${h.acquired_at}`} holding={h} />
        ))}
      </TableBody>
    </Table>
  )
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function HoldingRow({ holding }: { holding: FundHolding }) {
  const { data: stock } = useStock(holding.stock_id)
  const qty = Number(holding.quantity)
  const price = stock ? Number(stock.price) : NaN
  const marketValue = Number.isFinite(price) ? formatNumber(qty * price) : '—'
  return (
    <TableRow>
      <TableCell className="font-mono font-semibold">
        {stock?.ticker ?? `#${holding.stock_id}`}
      </TableCell>
      <TableCell>{stock?.name ?? '—'}</TableCell>
      <TableCell className="text-right">{holding.quantity}</TableCell>
      <TableCell className="text-right">{stock?.price ?? '—'}</TableCell>
      <TableCell className="text-right">{marketValue}</TableCell>
      <TableCell>{new Date(holding.acquired_at).toLocaleDateString()}</TableCell>
    </TableRow>
  )
}
