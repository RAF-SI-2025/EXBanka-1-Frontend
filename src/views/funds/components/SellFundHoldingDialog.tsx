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
import { useCreateOrderOnBehalfFund } from '@/hooks/useOrders'
import { useListingsForSell } from '@/hooks/useSecurities'
import { notifySuccess } from '@/lib/errors'
import type { FundHolding } from '@/types/fund'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  holding: FundHolding
  fundId: number
  fundName: string
}

const INTEGER_RE = /^\d+$/

export function SellFundHoldingDialog({ open, onOpenChange, holding, fundId, fundName }: Props) {
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined)
  const [quantity, setQuantity] = useState(String(holding.quantity))

  const listings = useListingsForSell(holding.security_type, holding.ticker)
  const createOrderMutation = useCreateOrderOnBehalfFund()

  const listingId = selectedListingId ?? listings[0]?.listing_id
  const integerOk = INTEGER_RE.test(quantity) && Number(quantity) > 0
  const withinHolding = integerOk && Number(quantity) <= Number(holding.quantity)
  const isValid = listingId !== undefined && integerOk && withinHolding

  const handleSubmit = () => {
    if (!isValid || listingId === undefined) return
    const qty = Number(quantity)
    createOrderMutation.mutate(
      {
        on_behalf_of_fund_id: fundId,
        listing_id: listingId,
        direction: 'sell',
        order_type: 'market',
        quantity: qty,
        security_type: holding.security_type,
      },
      {
        onSuccess: () => {
          notifySuccess(`Sell order placed for ${qty} ${holding.ticker}`)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Sell {holding.ticker} for {fundName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Holding: <strong>{String(holding.quantity)}</strong> {holding.ticker} — a market sell
            order will be placed on behalf of the fund.
          </p>
          <div>
            <Label htmlFor="sell-listing">Listing (exchange venue)</Label>
            {listings.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-1">
                No sell venue found for {holding.ticker}.
              </p>
            ) : (
              <select
                id="sell-listing"
                aria-label="Listing"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={listingId ?? ''}
                onChange={(e) => setSelectedListingId(Number(e.target.value) || undefined)}
              >
                {listings.map((l) => (
                  <option key={l.listing_id} value={l.listing_id}>
                    {l.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <Label htmlFor="sell-quantity">Quantity</Label>
            <Input
              id="sell-quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              aria-invalid={quantity.length > 0 && (!integerOk || !withinHolding)}
            />
            {quantity.length > 0 && !integerOk && (
              <p className="text-xs text-destructive mt-1">Use a positive whole number.</p>
            )}
            {integerOk && !withinHolding && (
              <p className="text-xs text-destructive mt-1">Cannot sell more than the fund holds.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createOrderMutation.isPending}>
            {createOrderMutation.isPending ? 'Placing...' : 'Place sell order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
