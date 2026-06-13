import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WatchlistButtonProps {
  listingId: number
  ticker: string
  /** True when the listing is in at least one of the caller's lists. */
  inWatchlist: boolean
  disabled?: boolean
  /** Opens the "add to list" picker for this listing. */
  onOpen: (listingId: number, ticker: string) => void
}

export function WatchlistButton({
  listingId,
  ticker,
  inWatchlist,
  disabled,
  onOpen,
}: WatchlistButtonProps) {
  return (
    <Button
      size="icon"
      variant="outline"
      disabled={disabled}
      aria-label={inWatchlist ? `Manage ${ticker} in watchlists` : `Add ${ticker} to watchlist`}
      aria-pressed={inWatchlist}
      onClick={(e) => {
        e.stopPropagation()
        onOpen(listingId, ticker)
      }}
    >
      <Heart
        className={cn(
          'h-4 w-4',
          inWatchlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        )}
      />
    </Button>
  )
}
