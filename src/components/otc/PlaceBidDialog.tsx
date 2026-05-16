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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OtcOffer, PlaceBidPayload } from '@/types/otcOption'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: OtcOffer
  accounts: Account[]
  onSubmit: (payload: PlaceBidPayload) => void
  loading: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,4})?$/

export function PlaceBidDialog({
  open,
  onOpenChange,
  listing,
  accounts,
  onSubmit,
  loading,
}: Props) {
  const [bidderAccountId, setBidderAccountId] = useState<number | undefined>(undefined)
  const [quantity, setQuantity] = useState(listing.quantity)
  const [strike, setStrike] = useState(listing.strike_price)
  const [premium, setPremium] = useState(listing.premium ?? '')
  const [settlement, setSettlement] = useState(listing.settlement_date)

  const isValid =
    bidderAccountId !== undefined &&
    DECIMAL_RE.test(quantity) &&
    DECIMAL_RE.test(strike) &&
    DECIMAL_RE.test(premium) &&
    settlement.length === 10

  const handleSubmit = () => {
    if (!isValid || bidderAccountId === undefined) return
    onSubmit({
      bidder_account_id: bidderAccountId,
      quantity,
      strike_price: strike,
      premium,
      settlement_date: settlement,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place bid</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Opens a new negotiation chain on this listing. You can counter, accept, or withdraw the
            chain afterwards.
          </p>
          <div>
            <Label htmlFor="bid-account">Your account</Label>
            <Select
              value={bidderAccountId?.toString() ?? ''}
              onValueChange={(v) => v && setBidderAccountId(Number(v))}
            >
              <SelectTrigger id="bid-account" aria-label="Your account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.account_name} ({a.currency_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bid-quantity">Quantity</Label>
              <Input
                id="bid-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bid-strike">Strike</Label>
              <Input
                id="bid-strike"
                inputMode="decimal"
                value={strike}
                onChange={(e) => setStrike(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bid-premium">Premium</Label>
              <Input
                id="bid-premium"
                inputMode="decimal"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bid-settlement">Settlement date</Label>
              <Input
                id="bid-settlement"
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
            {loading ? 'Placing...' : 'Place bid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
