import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WatchlistButtonProps {
  listingId: number
  ticker: string
  inWatchlist: boolean
  disabled?: boolean
  onToggle: (listingId: number, inWatchlist: boolean) => void
}

export function WatchlistButton({
  listingId,
  ticker,
  inWatchlist,
  disabled,
  onToggle,
}: WatchlistButtonProps) {
  return (
    <Button
      size="icon"
      variant="outline"
      disabled={disabled}
      aria-label={inWatchlist ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      aria-pressed={inWatchlist}
      onClick={(e) => {
        e.stopPropagation()
        onToggle(listingId, inWatchlist)
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
