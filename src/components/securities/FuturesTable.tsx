import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { FuturesContract } from '@/types/security'

interface FuturesTableProps {
  futures: FuturesContract[]
  onRowClick: (id: number) => void
  onBuy: (future: FuturesContract) => void
}

export function FuturesTable({ futures, onRowClick, onBuy }: FuturesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Settlement</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Margin Cost</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {futures.map((future) => (
          <TableRow
            key={future.id}
            className="cursor-pointer"
            onClick={() => onRowClick(future.id)}
          >
            <TableCell className="font-mono font-semibold">{future.ticker}</TableCell>
            <TableCell>{future.name}</TableCell>
            <TableCell>{future.price}</TableCell>
            <TableCell className={Number(future.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Number(future.change) >= 0 ? '+' : ''}
              {future.change}
            </TableCell>
            <TableCell>{future.volume.toLocaleString()}</TableCell>
            <TableCell>{future.settlement_date}</TableCell>
            <TableCell>{future.exchange_acronym}</TableCell>
            <TableCell>{future.initial_margin_cost}</TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBuy(future)
                }}
              >
                Buy
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
