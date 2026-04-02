import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { ForexPair } from '@/types/security'

interface ForexTableProps {
  pairs: ForexPair[]
  onRowClick: (id: number) => void
  onBuy: (pair: ForexPair) => void
}

export function ForexTable({ pairs, onRowClick, onBuy }: ForexTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Liquidity</TableHead>
          <TableHead>Margin Cost</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pairs.map((pair) => (
          <TableRow key={pair.id} className="cursor-pointer" onClick={() => onRowClick(pair.id)}>
            <TableCell className="font-mono font-semibold">{pair.ticker}</TableCell>
            <TableCell>{pair.name}</TableCell>
            <TableCell>{pair.exchange_rate}</TableCell>
            <TableCell className={Number(pair.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Number(pair.change) >= 0 ? '+' : ''}
              {pair.change}
            </TableCell>
            <TableCell>{pair.volume.toLocaleString()}</TableCell>
            <TableCell>{pair.liquidity}</TableCell>
            <TableCell>{pair.initial_margin_cost}</TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBuy(pair)
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
