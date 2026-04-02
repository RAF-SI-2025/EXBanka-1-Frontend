import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface RenameAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  existingNames?: string[]
  onRename: (name: string) => void
  loading: boolean
}

export function RenameAccountDialog({
  open,
  onOpenChange,
  currentName,
  existingNames = [],
  onRename,
  loading,
}: RenameAccountDialogProps) {
  const [name, setName] = useState(currentName)

  const isSameName = name === currentName
  const isDuplicate = existingNames.includes(name)
  const isInvalid = !name || isSameName || isDuplicate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="account-name">Account Name</Label>
          <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} />
          {isSameName && name && (
            <p className="text-sm text-destructive">Name is the same as current.</p>
          )}
          {isDuplicate && !isSameName && (
            <p className="text-sm text-destructive">Name is already in use by another account.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onRename(name)} disabled={loading || isInvalid}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
