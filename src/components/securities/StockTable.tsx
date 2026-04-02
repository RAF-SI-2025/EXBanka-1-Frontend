import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Stock } from '@/types/security'

interface StockTableProps {
  stocks: Stock[]
  onRowClick: (id: number) => void
  onBuy: (stock: Stock) => void
}

export function StockTable({ stocks, onRowClick, onBuy }: StockTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Margin Cost</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.id} className="cursor-pointer" onClick={() => onRowClick(stock.id)}>
            <TableCell className="font-mono font-semibold">{stock.ticker}</TableCell>
            <TableCell>{stock.name}</TableCell>
            <TableCell>{stock.price}</TableCell>
            <TableCell className={Number(stock.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Number(stock.change) >= 0 ? '+' : ''}
              {stock.change}
            </TableCell>
            <TableCell>{(stock.volume ?? 0).toLocaleString()}</TableCell>
            <TableCell>{stock.exchange_acronym}</TableCell>
            <TableCell>{stock.initial_margin_cost}</TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBuy(stock)
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
