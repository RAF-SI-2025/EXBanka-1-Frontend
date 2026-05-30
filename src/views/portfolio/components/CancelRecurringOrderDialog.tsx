import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function CancelRecurringOrderDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel recurring order?</DialogTitle>
          <DialogDescription>
            This permanently cancels the recurring order. No further orders will be placed. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
