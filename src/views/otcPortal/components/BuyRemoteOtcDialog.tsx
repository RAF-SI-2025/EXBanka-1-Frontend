import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import type { OtcRemoteOffer } from '@/types/otc'
import type { Account } from '@/types/account'
import type { PlaceBidPayload } from '@/views/otcOptions/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcRemoteOffer
  accounts: Account[]
  onSubmit: (payload: PlaceBidPayload) => void
  loading: boolean
}

export function BuyRemoteOtcDialog({
  open,
  onOpenChange,
  offer,
  accounts,
  onSubmit,
  loading,
}: Props) {
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)
  const [quantity, setQuantity] = useState('1')
  const [strikePrice, setStrikePrice] = useState('')
  const [premium, setPremium] = useState('0')
  const [settlementDate, setSettlementDate] = useState('')

  const isValid =
    accountId !== undefined &&
    Number(quantity) > 0 &&
    Number(quantity) <= offer.quantity &&
    Number(strikePrice) > 0 &&
    Number(premium) >= 0 &&
    settlementDate.length > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      bidder_account_id: accountId!,
      quantity,
      strike_price: strikePrice,
      premium,
      settlement_date: settlementDate,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Bid on {offer.ticker} — bank {offer.bank_code}
          </DialogTitle>
          <DialogDescription>
            Cross-bank OTC option bid — dispatched to the seller's bank via SI-TX.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Available: <strong>{offer.quantity}</strong>
          </p>
          <div>
            <Label htmlFor="remote-account">Account</Label>
            <Select value={accountId?.toString()} onValueChange={(v) => setAccountId(Number(v))}>
              <SelectTrigger id="remote-account">
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
          <div>
            <Label htmlFor="remote-quantity">Quantity</Label>
            <Input
              id="remote-quantity"
              type="number"
              min={1}
              max={offer.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="remote-strike">Strike price</Label>
            <Input
              id="remote-strike"
              type="number"
              step="0.01"
              min={0}
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="remote-premium">Premium</Label>
            <Input
              id="remote-premium"
              type="number"
              step="0.01"
              min={0}
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="remote-settlement">Settlement date</Label>
            <Input
              id="remote-settlement"
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Submitting…' : 'Submit bid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
