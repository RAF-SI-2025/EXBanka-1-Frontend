import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Holding } from '@/types/portfolio'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  holding: Holding
  onSubmit: (quantity: number) => void
  loading: boolean
}

export function MakePublicDialog({ open, onOpenChange, holding, onSubmit, loading }: Props) {
  const [quantity, setQuantity] = useState(1)

  const isValid = quantity > 0 && quantity <= holding.quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Shares Public for {holding.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Currently public: <strong>{holding.public_quantity}</strong> / {holding.quantity}
          </p>
          <div>
            <Label htmlFor="public-quantity">Quantity to make public</Label>
            <Input
              id="public-quantity"
              type="number"
              min={1}
              max={holding.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isValid) onSubmit(quantity)
            }}
            disabled={!isValid || loading}
          >
            {loading ? 'Making Public...' : 'Make Public'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
