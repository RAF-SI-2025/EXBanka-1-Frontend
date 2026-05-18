import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TransferFee } from '@/views/adminFees/types'

interface Props {
  fee: TransferFee | null
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeactivateFeeDialog({ fee, loading, onCancel, onConfirm }: Props) {
  return (
    <Dialog
      open={fee !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deactivate</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to deactivate the fee rule &quot;{fee?.name}&quot;? This will stop
          it from being applied to new transactions.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
