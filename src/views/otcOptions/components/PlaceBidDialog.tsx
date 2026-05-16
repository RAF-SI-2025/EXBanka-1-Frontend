import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Account } from '@/types/account'
import type { OtcOptionRow } from '@/views/otcOptions/types'

interface BidInput {
  account_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcOptionRow | null
  accounts: Account[]
  submitting: boolean
  onSubmit: (input: BidInput) => void
}

export function PlaceBidDialog({
  open,
  onOpenChange,
  offer,
  accounts,
  submitting,
  onSubmit,
}: Props) {
  if (!offer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid on {offer.ticker}</DialogTitle>
          <DialogDescription>
            The bank routes your first bid to <code>/bid</code>; if you already have an open chain
            on this listing, your terms become a counter on that chain automatically.
          </DialogDescription>
        </DialogHeader>
        <PlaceBidForm
          key={`${offer.bank_code}-${offer.offer_id}`}
          offer={offer}
          accounts={accounts}
          submitting={submitting}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function PlaceBidForm({
  offer,
  accounts,
  submitting,
  onCancel,
  onSubmit,
}: {
  offer: OtcOptionRow
  accounts: Account[]
  submitting: boolean
  onCancel: () => void
  onSubmit: (input: BidInput) => void
}) {
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)
  const [quantity, setQuantity] = useState(String(offer.amount ?? ''))
  const [strike, setStrike] = useState(offer.strike_price ?? '')
  const [premium, setPremium] = useState(offer.premium ?? '')
  const [settlement, setSettlement] = useState(
    offer.settlement_date ? offer.settlement_date.slice(0, 10) : ''
  )

  const isValid =
    accountId != null && quantity !== '' && strike !== '' && premium !== '' && settlement !== ''

  return (
    <>
      <div className="space-y-3 py-2">
        <div>
          <Label htmlFor="bid-account">Account</Label>
          <Select
            value={accountId?.toString() ?? ''}
            onValueChange={(v) => setAccountId(Number(v))}
          >
            <SelectTrigger id="bid-account">
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
            <Label htmlFor="bid-qty">Quantity</Label>
            <Input
              id="bid-qty"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bid-strike">Strike price</Label>
            <Input
              id="bid-strike"
              inputMode="decimal"
              value={strike}
              onChange={(e) => setStrike(e.target.value)}
            />
          </div>
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!isValid || submitting}
          onClick={() => {
            if (!isValid) return
            onSubmit({
              account_id: accountId!,
              quantity,
              strike_price: strike,
              premium,
              settlement_date: settlement,
            })
          }}
        >
          {submitting ? 'Submitting…' : 'Submit bid'}
        </Button>
      </DialogFooter>
    </>
  )
}
