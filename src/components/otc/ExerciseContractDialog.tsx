import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ExerciseContractPayload, OptionContract } from '@/types/otcOption'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: OptionContract
  onSubmit: (payload: ExerciseContractPayload) => void
  loading: boolean
}

export function ExerciseContractDialog({ open, onOpenChange, contract, onSubmit, loading }: Props) {
  const totalCost = (Number(contract.quantity) * Number(contract.strike_price)).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exercise contract</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Total to pay: <strong>{totalCost}</strong> ({contract.quantity} ×{' '}
            {contract.strike_price})
          </p>
          <p className="text-sm text-muted-foreground">
            The settlement accounts were bound at contract creation, so no further account selection
            is needed.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit({})} disabled={loading}>
            {loading ? 'Exercising...' : 'Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
