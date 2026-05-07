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
import type { OtcRemoteOffer, PeerOtcNegotiationRequest } from '@/types/otc'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcRemoteOffer
  onSubmit: (payload: PeerOtcNegotiationRequest) => void
  loading: boolean
}

const CURRENCIES = ['USD', 'EUR', 'RSD', 'GBP', 'CHF']

export function BuyRemoteOtcDialog({ open, onOpenChange, offer, onSubmit, loading }: Props) {
  const [amount, setAmount] = useState(1)
  const [settlementDate, setSettlementDate] = useState('')
  const [priceAmount, setPriceAmount] = useState('')
  const [priceCurrency, setPriceCurrency] = useState(offer.currency || 'USD')
  const [premiumAmount, setPremiumAmount] = useState('')
  const [premiumCurrency, setPremiumCurrency] = useState(offer.currency || 'USD')

  const isValid =
    amount > 0 &&
    amount <= offer.quantity &&
    settlementDate.length > 0 &&
    Number(priceAmount) > 0 &&
    Number(premiumAmount) >= 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      seller_bank_code: offer.bank_code,
      seller_id: offer.owner_id,
      stock: { ticker: offer.ticker },
      amount,
      settlement_date: new Date(settlementDate).toISOString(),
      price_per_unit: { amount: priceAmount, currency: priceCurrency },
      premium: { amount: premiumAmount || '0', currency: premiumCurrency },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Negotiate {offer.ticker} with bank {offer.bank_code}
          </DialogTitle>
          <DialogDescription>
            Cross-bank OTC option negotiation — initiates an SI-TX offer against the seller bank.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Available: <strong>{offer.quantity}</strong>
          </p>
          <div>
            <Label htmlFor="remote-amount">Amount</Label>
            <Input
              id="remote-amount"
              type="number"
              min={1}
              max={offer.quantity}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
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
          <div className="grid grid-cols-[1fr_8rem] gap-2">
            <div>
              <Label htmlFor="remote-price-amount">Price per unit</Label>
              <Input
                id="remote-price-amount"
                type="number"
                step="0.01"
                min={0}
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="remote-price-currency">Currency</Label>
              <Select value={priceCurrency} onValueChange={(v) => v && setPriceCurrency(v)}>
                <SelectTrigger id="remote-price-currency" aria-label="Price currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_8rem] gap-2">
            <div>
              <Label htmlFor="remote-premium-amount">Premium</Label>
              <Input
                id="remote-premium-amount"
                type="number"
                step="0.01"
                min={0}
                value={premiumAmount}
                onChange={(e) => setPremiumAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="remote-premium-currency">Currency</Label>
              <Select value={premiumCurrency} onValueChange={(v) => v && setPremiumCurrency(v)}>
                <SelectTrigger id="remote-premium-currency" aria-label="Premium currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Submitting…' : 'Submit negotiation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
