import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Actuary } from '@/types/actuary'

interface EditLimitDialogProps {
  open: boolean
  actuary: Actuary | null
  onClose: () => void
  onConfirm: (limit: string) => void
}

function EditLimitDialogInner({
  actuary,
  onClose,
  onConfirm,
}: Pick<EditLimitDialogProps, 'actuary' | 'onClose' | 'onConfirm'>) {
  const [limit, setLimit] = useState(actuary?.limit ?? '')

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Edit Limit — {actuary?.first_name} {actuary?.last_name}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="limit-input">New Limit</Label>
        <Input
          id="limit-input"
          type="text"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="mt-1"
        />
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(limit)}>Save</Button>
      </DialogFooter>
    </>
  )
}

export function EditLimitDialog({ open, actuary, onClose, onConfirm }: EditLimitDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && actuary && (
          <EditLimitDialogInner actuary={actuary} onClose={onClose} onConfirm={onConfirm} />
        )}
      </DialogContent>
    </Dialog>
  )
}
