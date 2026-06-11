import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StockExchange } from '@/views/stockExchanges/types'
import { hoverLift, rowEnter } from '@/views/shared'

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
          <TableHead>Working</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchanges.map((exchange) => (
          <TableRow key={exchange.id} className={`${hoverLift} ${rowEnter}`}>
            <TableCell>{exchange.name}</TableCell>
            <TableCell>{exchange.acronym}</TableCell>
            <TableCell>{exchange.mic_code}</TableCell>
            <TableCell>{exchange.polity}</TableCell>
            <TableCell>{exchange.currency}</TableCell>
            <TableCell>
              UTC{Number(exchange.time_zone) >= 0 ? '+' : ''}
              {exchange.time_zone}
            </TableCell>
            <TableCell>{exchange.is_open ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
