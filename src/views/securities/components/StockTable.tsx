import { Bell } from 'lucide-react'
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
import { hoverLift, rowEnter } from '@/views/shared'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

interface StockTableProps {
  stocks: Stock[]
  onRowClick: (id: number) => void
  onBuy: (stock: Stock) => void
  onCreateAlert?: (stock: Stock) => void
  watchlistIds?: Set<number>
  onOpenWatchlist?: (listingId: number, ticker: string) => void
}

export function StockTable({
  stocks,
  onRowClick,
  onBuy,
  onCreateAlert,
  watchlistIds,
  onOpenWatchlist,
}: StockTableProps) {
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
        {stocks.map((stock) => {
          const listingId = stock.listing_id ?? stock.id
          return (
            <TableRow
              key={stock.id}
              className={`${hoverLift} ${rowEnter}`}
              onClick={() => onRowClick(stock.id)}
            >
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBuy(stock)
                    }}
                  >
                    Buy
                  </Button>
                  {onCreateAlert && (
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Create price alert for ${stock.ticker}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateAlert(stock)
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                  {onOpenWatchlist && (
                    <WatchlistButton
                      listingId={listingId}
                      ticker={stock.ticker}
                      inWatchlist={watchlistIds?.has(listingId) ?? false}
                      onOpen={onOpenWatchlist}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
