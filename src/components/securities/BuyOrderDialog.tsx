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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inferOrderType, calculateApproxPrice } from '@/lib/utils/trading'
import type { Stock } from '@/types/security'
import type { Account } from '@/types/account'
import type { CreateOrderPayload } from '@/types/order'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  security: Stock
  accounts: Account[]
  onSubmit: (payload: CreateOrderPayload) => void
  loading: boolean
}

export function BuyOrderDialog({
  open,
  onOpenChange,
  security,
  accounts,
  onSubmit,
  loading,
}: Props) {
  const [quantity, setQuantity] = useState(1)
  const [limitValue, setLimitValue] = useState('')
  const [stopValue, setStopValue] = useState('')
  const [allOrNone, setAllOrNone] = useState(false)
  const [margin, setMargin] = useState(false)
  const [afterHours, setAfterHours] = useState(false)
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)

  const orderType = inferOrderType(limitValue, stopValue)
  const approxPrice = calculateApproxPrice(
    orderType,
    'buy',
    security.ask,
    security.bid,
    1,
    quantity,
    limitValue || undefined,
    stopValue || undefined
  )

  const isValid = quantity > 0 && accountId !== undefined

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      listing_id: security.id,
      direction: 'buy',
      order_type: orderType,
      quantity,
      limit_value: limitValue || undefined,
      stop_value: stopValue || undefined,
      all_or_none: allOrNone,
      margin,
      account_id: accountId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy {security.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="limit-value">Limit Price (optional)</Label>
            <Input
              id="limit-value"
              type="number"
              placeholder="Leave empty for market order"
              value={limitValue}
              onChange={(e) => setLimitValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="stop-value">Stop Price (optional)</Label>
            <Input
              id="stop-value"
              type="number"
              placeholder="Leave empty for market order"
              value={stopValue}
              onChange={(e) => setStopValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="account">Account</Label>
            <Select value={accountId?.toString()} onValueChange={(v) => setAccountId(Number(v))}>
              <SelectTrigger id="account">
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="all-or-none"
                checked={allOrNone}
                onCheckedChange={(v) => setAllOrNone(!!v)}
              />
              <Label htmlFor="all-or-none">All or None</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="margin" checked={margin} onCheckedChange={(v) => setMargin(!!v)} />
              <Label htmlFor="margin">Margin</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="after-hours"
                checked={afterHours}
                onCheckedChange={(v) => setAfterHours(!!v)}
              />
              <Label htmlFor="after-hours">After Hours</Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Order type: <strong>{orderType}</strong> &nbsp;|&nbsp; Approx. price:{' '}
            <strong>{approxPrice.toFixed(2)}</strong>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Placing...' : 'Place Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
