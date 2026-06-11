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
import { formatAccountOption } from '@/lib/utils/format'
import type { OtcOptionRow } from '@/views/otcOptions/types'
import { resolveListingId } from '@/views/otcOptions/lib/listingId'
import { hasOwnNegotiationChain } from '@/views/otcOptions/lib/myNegotiation'

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bid on {offer.ticker}</DialogTitle>
          <DialogDescription>
            The bank routes your first bid to <code>/bid</code>; if you already have an open chain
            on this listing, your terms become a counter on that chain automatically.
          </DialogDescription>
        </DialogHeader>
        <PlaceBidForm
          key={`${offer.bank_code}-${resolveListingId(offer)}`}
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

// Premium floor: prefer the current best_bid; fall back to the seller's
// original strike if best_bid is absent or not a finite positive number.
// Returns the floor as a number for comparison and as a string for display,
// keeping the seller's original string so "175.50" doesn't render as "175.5".
function computePremiumFloor(offer: OtcOptionRow): {
  floor: number | null
  floorLabel: string
  floorSource: 'best_bid' | 'strike' | null
} {
  const bestBidNum = Number(offer.best_bid)
  if (Number.isFinite(bestBidNum) && bestBidNum > 0) {
    return { floor: bestBidNum, floorLabel: offer.best_bid as string, floorSource: 'best_bid' }
  }
  const strikeNum = Number(offer.strike_price)
  if (Number.isFinite(strikeNum) && strikeNum > 0) {
    return { floor: strikeNum, floorLabel: offer.strike_price, floorSource: 'strike' }
  }
  return { floor: null, floorLabel: '', floorSource: null }
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
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const [quantity, setQuantity] = useState(String(offer.amount ?? ''))
  const [strike, setStrike] = useState(offer.strike_price ?? '')
  const [premium, setPremium] = useState(offer.premium ?? '')
  const [premiumTouched, setPremiumTouched] = useState(false)
  const [settlement, setSettlement] = useState(
    offer.settlement_date ? offer.settlement_date.slice(0, 10) : ''
  )

  // The premium floor (best-bid / seller-strike) only guards a FIRST bid. Once
  // the caller has an open chain on this listing, this submit is a *counter* —
  // the bidder may propose any premium, so the floor does not apply.
  const isCounter = hasOwnNegotiationChain(offer.my_negotiation_id)
  const { floor, floorLabel, floorSource } = isCounter
    ? { floor: null, floorLabel: '', floorSource: null as 'best_bid' | 'strike' | null }
    : computePremiumFloor(offer)
  const premiumNum = Number(premium)
  const premiumIsNumber = premium !== '' && Number.isFinite(premiumNum)
  const premiumMeetsFloor = floor == null || !premiumIsNumber || premiumNum >= floor
  // Destructive variant fires only once the user has edited — a prefilled
  // below-floor value on initial mount shouldn't shout. Submit is still
  // blocked by `premiumMeetsFloor` regardless.
  const premiumBelowFloor = premiumTouched && floor != null && premiumIsNumber && premiumNum < floor

  const isValid =
    accountId != null &&
    quantity !== '' &&
    strike !== '' &&
    premium !== '' &&
    settlement !== '' &&
    premiumMeetsFloor

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
              <SelectValue placeholder="Select account">
                {selectedAccount ? formatAccountOption(selectedAccount) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {formatAccountOption(a)}
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
              onChange={(e) => {
                setPremium(e.target.value)
                setPremiumTouched(true)
              }}
            />
            {floor != null && floorSource && (
              <PremiumFloorHelp
                floorLabel={floorLabel}
                source={floorSource}
                violated={premiumBelowFloor}
              />
            )}
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

function PremiumFloorHelp({
  floorLabel,
  source,
  violated,
}: {
  floorLabel: string
  source: 'best_bid' | 'strike'
  violated: boolean
}) {
  const label = source === 'best_bid' ? 'current best bid' : 'seller strike'
  if (violated) {
    const reason = source === 'best_bid' ? 'the current best bid' : "the seller's strike"
    return (
      <p className="text-xs text-destructive mt-1">
        Bid must be at least {floorLabel} — {reason}.
      </p>
    )
  }
  return (
    <p className="text-xs text-muted-foreground mt-1">
      Minimum {floorLabel} ({label})
    </p>
  )
}
