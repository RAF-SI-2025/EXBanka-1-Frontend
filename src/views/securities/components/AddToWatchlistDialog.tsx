import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { displayWatchlistName } from '@/lib/utils/watchlist'
import type { Watchlist } from '@/types/watchlist'

interface Listing {
  listing_id: number
  ticker: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing
  watchlists: Watchlist[]
  onSubmit: (watchlistId: number) => void
  loading: boolean
}

export function AddToWatchlistDialog({
  open,
  onOpenChange,
  listing,
  watchlists,
  onSubmit,
  loading,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | undefined>(watchlists[0]?.id)
  const selected = watchlists.find((w) => w.id === selectedId) ?? watchlists[0]
  const canSubmit = selected != null && !loading

  const handleSubmit = () => {
    if (selected == null) return
    onSubmit(selected.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add <span className="font-mono">{listing.ticker}</span> to a watchlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {watchlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no watchlists yet. Create one from the Portfolio → Favorites tab first.
            </p>
          ) : (
            <>
              <Label htmlFor="watchlist-select">Watchlist</Label>
              <Select
                value={selected ? String(selected.id) : undefined}
                onValueChange={(v) => v && setSelectedId(Number(v))}
              >
                <SelectTrigger id="watchlist-select" className="w-full" aria-label="Watchlist">
                  <SelectValue>{selected ? displayWatchlistName(selected.name) : ''}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {watchlists.map((wl) => (
                    <SelectItem key={wl.id} value={String(wl.id)}>
                      {displayWatchlistName(wl.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? 'Adding...' : 'Add to list'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
