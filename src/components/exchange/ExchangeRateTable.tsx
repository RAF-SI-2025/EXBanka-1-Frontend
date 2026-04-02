import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ExchangeRate } from '@/types/exchange'

interface ExchangeRateTableProps {
  rates: ExchangeRate[]
}

export function ExchangeRateTable({ rates }: ExchangeRateTableProps) {
  if (rates.length === 0) {
    return <p className="text-muted-foreground">No exchange rate data available.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Currency</TableHead>
          <TableHead className="text-right">Buy Rate</TableHead>
          <TableHead className="text-right">Sell Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.map((rate) => (
          <TableRow key={rate.from_currency}>
            <TableCell className="font-medium">{rate.from_currency}</TableCell>
            <TableCell className="text-right">{Number(rate.buy_rate).toFixed(2)}</TableCell>
            <TableCell className="text-right">{Number(rate.sell_rate).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
