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
import type { ForexPair } from '@/types/security'
import { hoverLift, rowEnter } from '@/views/shared'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

interface ForexTableProps {
  pairs: ForexPair[]
  onRowClick: (id: number) => void
  onBuy: (pair: ForexPair) => void
  onCreateAlert?: (pair: ForexPair) => void
  watchlistIds?: Set<number>
  onToggleWatchlist?: (listingId: number, inWatchlist: boolean) => void
}

export function ForexTable({
  pairs,
  onRowClick,
  onBuy,
  onCreateAlert,
  watchlistIds,
  onToggleWatchlist,
}: ForexTableProps) {
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
        {pairs.map((pair) => {
          const listingId = pair.listing_id ?? pair.id
          return (
            <TableRow
              key={pair.id}
              className={`${hoverLift} ${rowEnter}`}
              onClick={() => onRowClick(pair.id)}
            >
              <TableCell className="font-mono font-semibold">{pair.ticker}</TableCell>
              <TableCell>{pair.name}</TableCell>
              <TableCell>{pair.exchange_rate}</TableCell>
              <TableCell className={Number(pair.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Number(pair.change) >= 0 ? '+' : ''}
                {pair.change}
              </TableCell>
              <TableCell>{(pair.volume ?? 0).toLocaleString()}</TableCell>
              <TableCell>{pair.liquidity}</TableCell>
              <TableCell>{pair.initial_margin_cost}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBuy(pair)
                    }}
                  >
                    Buy
                  </Button>
                  {onCreateAlert && (
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Create price alert for ${pair.ticker}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateAlert(pair)
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                  {onToggleWatchlist && (
                    <WatchlistButton
                      listingId={listingId}
                      ticker={pair.ticker}
                      inWatchlist={watchlistIds?.has(listingId) ?? false}
                      onToggle={onToggleWatchlist}
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
