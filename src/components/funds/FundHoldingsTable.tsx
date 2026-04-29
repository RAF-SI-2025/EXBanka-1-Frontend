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

interface FundHoldingsTableProps {
  holdings: FundHolding[]
}

export function FundHoldingsTable({ holdings }: FundHoldingsTableProps) {
  if (holdings.length === 0) {
    return <p className="text-sm text-muted-foreground">This fund holds no securities yet.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Acquired</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <HoldingRow key={h.stock_id} holding={h} />
        ))}
      </TableBody>
    </Table>
  )
}

function HoldingRow({ holding }: { holding: FundHolding }) {
  const { data: stock } = useStock(holding.stock_id)
  return (
    <TableRow>
      <TableCell className="font-medium">{stock?.ticker ?? `#${holding.stock_id}`}</TableCell>
      <TableCell>{holding.quantity}</TableCell>
      <TableCell>{new Date(holding.acquired_at).toLocaleDateString()}</TableCell>
    </TableRow>
  )
}
