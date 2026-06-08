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
import type { FuturesContract } from '@/types/security'
import { hoverLift, rowEnter } from '@/views/shared'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

interface FuturesTableProps {
  futures: FuturesContract[]
  onRowClick: (id: number) => void
  onBuy: (future: FuturesContract) => void
  onCreateAlert?: (future: FuturesContract) => void
  watchlistIds?: Set<number>
  onOpenWatchlist?: (listingId: number, ticker: string) => void
}

export function FuturesTable({
  futures,
  onRowClick,
  onBuy,
  onCreateAlert,
  watchlistIds,
  onOpenWatchlist,
}: FuturesTableProps) {
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
        {futures.map((future) => {
          const listingId = future.listing_id ?? future.id
          return (
            <TableRow
              key={future.id}
              className={`${hoverLift} ${rowEnter}`}
              onClick={() => onRowClick(future.id)}
            >
              <TableCell className="font-mono font-semibold">{future.ticker}</TableCell>
              <TableCell>{future.name}</TableCell>
              <TableCell>{future.price}</TableCell>
              <TableCell className={Number(future.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Number(future.change) >= 0 ? '+' : ''}
                {future.change}
              </TableCell>
              <TableCell>{(future.volume ?? 0).toLocaleString()}</TableCell>
              <TableCell>{future.settlement_date}</TableCell>
              <TableCell>{future.exchange_acronym}</TableCell>
              <TableCell>{future.initial_margin_cost}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBuy(future)
                    }}
                  >
                    Buy
                  </Button>
                  {onCreateAlert && (
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Create price alert for ${future.ticker}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateAlert(future)
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                  {onOpenWatchlist && (
                    <WatchlistButton
                      listingId={listingId}
                      ticker={future.ticker}
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
