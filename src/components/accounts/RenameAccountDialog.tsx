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
  onRename: (name: string) => void
  loading: boolean
}

export function RenameAccountDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
  loading,
}: RenameAccountDialogProps) {
  const [name, setName] = useState(currentName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preimenuj račun</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="account-name">Naziv računa</Label>
          <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={() => onRename(name)} disabled={loading || !name}>
            {loading ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
