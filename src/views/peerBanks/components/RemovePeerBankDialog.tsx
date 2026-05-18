import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PeerBank } from '@/views/peerBanks/types'

interface Props {
  peer: PeerBank | null
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RemovePeerBankDialog({ peer, loading, onCancel, onConfirm }: Props) {
  return (
    <Dialog
      open={peer !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Peer Bank</DialogTitle>
        </DialogHeader>
        <p>
          Remove peer bank &quot;{peer?.bank_code}&quot; ({peer?.base_url})? This permanently
          deletes its credentials. Disable it instead if you may need to re-enable later.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
