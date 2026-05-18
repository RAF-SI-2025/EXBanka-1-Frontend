import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CardRequestDenyDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

function CardRequestDenyDialogInner({
  onClose,
  onConfirm,
}: Pick<CardRequestDenyDialogProps, 'onClose' | 'onConfirm'>) {
  const [reason, setReason] = useState('')

  return (
    <>
      <DialogHeader>
        <DialogTitle>Deny Card Request</DialogTitle>
      </DialogHeader>
      <Textarea
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => onConfirm(reason)}>
          Confirm Deny
        </Button>
      </DialogFooter>
    </>
  )
}

export function CardRequestDenyDialog({ open, onClose, onConfirm }: CardRequestDenyDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && <CardRequestDenyDialogInner onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  )
}
