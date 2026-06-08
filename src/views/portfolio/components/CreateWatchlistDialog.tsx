import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  loading: boolean
}

const MAX_NAME_LENGTH = 64

export function CreateWatchlistDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New watchlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="watchlist-name">List name</Label>
          <Input
            id="watchlist-name"
            value={name}
            maxLength={MAX_NAME_LENGTH + 1}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. tech, forex pairs"
            aria-invalid={trimmed.length > MAX_NAME_LENGTH}
          />
          {trimmed.length > MAX_NAME_LENGTH && (
            <p className="text-xs text-destructive">
              Name must be {MAX_NAME_LENGTH} characters or fewer.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Creating...' : 'Create list'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
