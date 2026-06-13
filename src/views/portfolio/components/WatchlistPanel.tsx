import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateWatchlist,
  useDeleteWatchlist,
  useRemoveFromWatchlistItems,
  useWatchlistItems,
  useWatchlists,
} from '@/hooks/useWatchlist'
import { displayWatchlistName, isDefaultWatchlist } from '@/lib/utils/watchlist'
import { notifySuccess } from '@/lib/errors'
import { CreateWatchlistDialog } from '@/views/portfolio/components/CreateWatchlistDialog'
import { FavoritesTable } from '@/views/portfolio/components/FavoritesTable'
import type { WatchlistSecurityType } from '@/types/watchlist'

const TYPE_FILTER_OPTIONS: { value: WatchlistSecurityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'stock', label: 'Stocks' },
  { value: 'futures', label: 'Futures' },
  { value: 'forex', label: 'Forex' },
  { value: 'option', label: 'Options' },
]

export function WatchlistPanel() {
  const navigate = useNavigate()
  const { data } = useWatchlists()
  const lists = data ?? []
  const defaultId = (lists.find(isDefaultWatchlist) ?? lists[0])?.id
  const [picked, setPicked] = useState<number | undefined>()
  const currentId = picked ?? defaultId
  const current = lists.find((l) => l.id === currentId)

  const [typeFilter, setTypeFilter] = useState<WatchlistSecurityType | 'all'>('all')
  const { data: itemsData } = useWatchlistItems(
    currentId,
    typeFilter === 'all' ? {} : { listing_type: typeFilter }
  )
  const items = itemsData?.items ?? []

  const [createOpen, setCreateOpen] = useState(false)
  const createMutation = useCreateWatchlist()
  const deleteMutation = useDeleteWatchlist()
  const removeMutation = useRemoveFromWatchlistItems()

  const handleCreate = (name: string) =>
    createMutation.mutate(name, {
      onSuccess: (list) => {
        notifySuccess(`Created list “${displayWatchlistName(list.name)}”.`)
        setPicked(list.id)
        setCreateOpen(false)
      },
    })

  const handleDelete = () => {
    if (current == null || isDefaultWatchlist(current)) return
    deleteMutation.mutate(current.id, {
      onSuccess: () => {
        notifySuccess(`Deleted list “${current.name}”.`)
        setPicked(undefined)
      },
    })
  }

  const handleRemove = (listingId: number) => {
    if (currentId == null) return
    removeMutation.mutate({ watchlistId: currentId, listingId })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <Label htmlFor="watchlist-picker">List</Label>
          <Select
            value={currentId != null ? String(currentId) : undefined}
            onValueChange={(v) => v && setPicked(Number(v))}
          >
            <SelectTrigger id="watchlist-picker" className="w-56" aria-label="Watchlist">
              <SelectValue>{current ? displayWatchlistName(current.name) : 'No lists'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {lists.map((wl) => (
                <SelectItem key={wl.id} value={String(wl.id)}>
                  {displayWatchlistName(wl.name)} ({wl.item_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setCreateOpen(true)}>
          New list
        </Button>
        <div className="min-w-40">
          <Label htmlFor="watchlist-type-filter">Type</Label>
          <Select
            value={typeFilter}
            onValueChange={(v) => v && setTypeFilter(v as WatchlistSecurityType | 'all')}
          >
            <SelectTrigger id="watchlist-type-filter" className="w-40" aria-label="Filter by type">
              <SelectValue>
                {TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {current && !isDefaultWatchlist(current) && (
          <Button
            variant="ghost"
            aria-label="Delete list"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete list
          </Button>
        )}
      </div>

      <FavoritesTable
        items={items}
        onRemove={handleRemove}
        busyListingId={removeMutation.isPending ? removeMutation.variables?.listingId : undefined}
        onOrder={(item) =>
          navigate(
            `/securities/order/new?listingId=${item.listing_id}&direction=buy&securityType=${item.security_type}&ticker=${encodeURIComponent(item.ticker)}`
          )
        }
      />

      {createOpen && (
        <CreateWatchlistDialog
          open
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
        />
      )}
    </div>
  )
}
