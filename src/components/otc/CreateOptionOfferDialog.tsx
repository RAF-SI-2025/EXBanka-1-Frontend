import { useMemo, useState } from 'react'
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
import type { CreateOtcOfferPayload, OtcOfferDirection } from '@/types/otcOption'
import type { Holding } from '@/types/portfolio'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  holdings: Holding[]
  accounts: Account[]
  onSubmit: (payload: CreateOtcOfferPayload) => void
  loading: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,4})?$/

export function CreateOptionOfferDialog({
  open,
  onOpenChange,
  holdings,
  accounts,
  onSubmit,
  loading,
}: Props) {
  const [direction, setDirection] = useState<OtcOfferDirection>('sell_initiated')
  const [ticker, setTicker] = useState('')
  const [accountId, setAccountId] = useState<number | undefined>(undefined)
  const [quantity, setQuantity] = useState('')
  const [strike, setStrike] = useState('')
  const [premium, setPremium] = useState('')
  const [settlement, setSettlement] = useState('')

  const tickerOptions = useMemo(() => {
    const seen = new Set<string>()
    return holdings
      .filter((h) => h.security_type === 'stock' && h.quantity > 0)
      .filter((h) => (seen.has(h.ticker) ? false : (seen.add(h.ticker), true)))
  }, [holdings])

  const isValid =
    ticker.length > 0 &&
    accountId !== undefined &&
    DECIMAL_RE.test(quantity) &&
    DECIMAL_RE.test(strike) &&
    settlement.length === 10

  const handleSubmit = () => {
    if (!isValid || accountId === undefined) return
    const payload: CreateOtcOfferPayload = {
      direction,
      ticker,
      quantity,
      strike_price: strike,
      settlement_date: settlement,
      account_id: accountId,
    }
    if (premium && DECIMAL_RE.test(premium)) payload.premium = premium
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New OTC option offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="otc-opt-direction">Direction</Label>
            <Select
              value={direction}
              onValueChange={(v) => v && setDirection(v as OtcOfferDirection)}
            >
              <SelectTrigger id="otc-opt-direction" aria-label="Direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell_initiated">Sell option (I sell)</SelectItem>
                <SelectItem value="buy_initiated">Buy option (I buy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="otc-opt-ticker">Stock ticker</Label>
            <Select value={ticker} onValueChange={(v) => v && setTicker(v)}>
              <SelectTrigger id="otc-opt-ticker" aria-label="Stock ticker">
                <SelectValue placeholder="Select a stock you own" />
              </SelectTrigger>
              <SelectContent>
                {tickerOptions.length === 0 ? (
                  <SelectItem value="" disabled>
                    No stock holdings
                  </SelectItem>
                ) : (
                  tickerOptions.map((h) => (
                    <SelectItem key={h.ticker} value={h.ticker}>
                      {h.ticker} — {h.name} ({h.quantity})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="otc-opt-account">Account</Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => v && setAccountId(Number(v))}
            >
              <SelectTrigger id="otc-opt-account" aria-label="Account">
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
              <Label htmlFor="otc-opt-quantity">Quantity</Label>
              <Input
                id="otc-opt-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="otc-opt-strike">Strike</Label>
              <Input
                id="otc-opt-strike"
                inputMode="decimal"
                value={strike}
                onChange={(e) => setStrike(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="otc-opt-premium">Premium (optional)</Label>
              <Input
                id="otc-opt-premium"
                inputMode="decimal"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="otc-opt-settlement">Settlement date</Label>
              <Input
                id="otc-opt-settlement"
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
            {loading ? 'Creating...' : 'Create offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
