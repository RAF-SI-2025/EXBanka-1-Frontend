import { useState } from 'react'
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

export function WatchlistPanel() {
  const { data } = useWatchlists()
  const lists = data ?? []
  const defaultId = (lists.find(isDefaultWatchlist) ?? lists[0])?.id
  const [picked, setPicked] = useState<number | undefined>()
  const currentId = picked ?? defaultId
  const current = lists.find((l) => l.id === currentId)

  const { data: itemsData } = useWatchlistItems(currentId)
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
