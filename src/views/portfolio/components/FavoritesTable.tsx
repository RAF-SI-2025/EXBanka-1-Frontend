import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { WatchlistItem } from '@/types/watchlist'
import { hoverLift, rowEnter } from '@/views/shared'

interface FavoritesTableProps {
  items: WatchlistItem[]
  onRemove: (listingId: number) => void
  busyListingId?: number
}

export function FavoritesTable({ items, onRemove, busyListingId }: FavoritesTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your watchlist is empty. Tap the heart on any security to add it.
      </p>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Change %</TableHead>
          <TableHead>Added</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const change = Number(item.daily_change)
          const changeClass = !Number.isFinite(change)
            ? ''
            : change >= 0
              ? 'text-green-600'
              : 'text-red-600'
          return (
            <TableRow key={item.id} className={`${hoverLift} ${rowEnter}`}>
              <TableCell className="font-mono font-semibold">{item.ticker}</TableCell>
              <TableCell className="capitalize">{item.security_type}</TableCell>
              <TableCell className="text-right">{item.current_price}</TableCell>
              <TableCell className={`text-right ${changeClass}`}>
                {Number.isFinite(change) && change >= 0 ? '+' : ''}
                {item.daily_change}
              </TableCell>
              <TableCell className={`text-right ${changeClass}`}>
                {Number.isFinite(change) && change >= 0 ? '+' : ''}
                {item.daily_change_percent}%
              </TableCell>
              <TableCell>{new Date(item.added_at_unix * 1000).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyListingId === item.listing_id}
                  onClick={() => onRemove(item.listing_id)}
                  aria-label={`Remove ${item.ticker} from watchlist`}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
