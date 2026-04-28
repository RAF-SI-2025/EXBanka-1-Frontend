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
import type { CounterOtcOfferPayload, OtcOffer } from '@/types/otcOption'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: OtcOffer
  onSubmit: (payload: CounterOtcOfferPayload) => void
  loading: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,4})?$/

export function CounterOfferDialog({ open, onOpenChange, current, onSubmit, loading }: Props) {
  const [quantity, setQuantity] = useState(current.quantity)
  const [strike, setStrike] = useState(current.strike_price)
  const [premium, setPremium] = useState(current.premium ?? '')
  const [settlement, setSettlement] = useState(current.settlement_date)

  const someValid =
    DECIMAL_RE.test(quantity) &&
    DECIMAL_RE.test(strike) &&
    (premium === '' || DECIMAL_RE.test(premium)) &&
    settlement.length === 10

  const someChanged =
    quantity !== current.quantity ||
    strike !== current.strike_price ||
    premium !== (current.premium ?? '') ||
    settlement !== current.settlement_date

  const isValid = someValid && someChanged

  const handleSubmit = () => {
    if (!isValid) return
    const payload: CounterOtcOfferPayload = {}
    if (quantity !== current.quantity) payload.quantity = quantity
    if (strike !== current.strike_price) payload.strike_price = strike
    if (premium !== (current.premium ?? '')) payload.premium = premium
    if (settlement !== current.settlement_date) payload.settlement_date = settlement
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Counter offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="counter-quantity">Quantity</Label>
              <Input
                id="counter-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="counter-strike">Strike</Label>
              <Input
                id="counter-strike"
                inputMode="decimal"
                value={strike}
                onChange={(e) => setStrike(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="counter-premium">Premium</Label>
              <Input
                id="counter-premium"
                inputMode="decimal"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="counter-settlement">Settlement date</Label>
              <Input
                id="counter-settlement"
                type="date"
                value={settlement}
                onChange={(e) => setSettlement(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Sending...' : 'Send counter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
