import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StockExchange } from '@/types/stockExchange'

interface StockExchangeTableProps {
  exchanges: StockExchange[]
}

export function StockExchangeTable({ exchanges }: StockExchangeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Acronym</TableHead>
          <TableHead>MIC Code</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Time Zone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchanges.map((exchange) => (
          <TableRow key={exchange.id}>
            <TableCell>{exchange.exchange_name}</TableCell>
            <TableCell>{exchange.exchange_acronym}</TableCell>
            <TableCell>{exchange.exchange_mic_code}</TableCell>
            <TableCell>{exchange.polity}</TableCell>
            <TableCell>{exchange.currency}</TableCell>
            <TableCell>
              UTC{Number(exchange.time_zone) >= 0 ? '+' : ''}
              {exchange.time_zone}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
