import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { CreateOtcOptionPayload, OtcOptionDirection } from '@/views/otcOptions/types'
import { useMyStockHoldings, useStockCatalog } from '@/views/otcOptions/hooks/useTickerPickers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  submitting: boolean
  onSubmit: (payload: CreateOtcOptionPayload) => void
}

export function CreateOtcOptionDialog({
  open,
  onOpenChange,
  accounts,
  submitting,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New OTC option listing</DialogTitle>
        </DialogHeader>
        {open && (
          <CreateOtcOptionForm
            accounts={accounts}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface TickerOption {
  value: string
  label: string
}

function CreateOtcOptionForm({
  accounts,
  submitting,
  onCancel,
  onSubmit,
}: {
  accounts: Account[]
  submitting: boolean
  onCancel: () => void
  onSubmit: (payload: CreateOtcOptionPayload) => void
}) {
  const [direction, setDirection] = useState<OtcOptionDirection>('sell_initiated')
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [strike, setStrike] = useState('')
  const [premium, setPremium] = useState('')
  const [settlement, setSettlement] = useState('')
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)

  const isSell = direction === 'sell_initiated'
  const holdingsQ = useMyStockHoldings(isSell)
  const catalogQ = useStockCatalog(!isSell)

  const tickerOptions: TickerOption[] = useMemo(() => {
    if (isSell) {
      // Picker sources stock positions from the unified portfolio (spec §48.1).
      const seen = new Set<string>()
      const out: TickerOption[] = []
      for (const p of holdingsQ.data?.securities.positions ?? []) {
        if (p.asset_type !== 'stock') continue
        if (p.quantity <= 0) continue
        if (seen.has(p.symbol)) continue
        seen.add(p.symbol)
        out.push({
          value: p.symbol,
          label: `${p.symbol} (you hold ${p.quantity})`,
        })
      }
      return out
    }
    return (catalogQ.data?.stocks ?? []).map((s) => ({
      value: s.ticker,
      label: `${s.ticker} — ${s.name}`,
    }))
  }, [isSell, holdingsQ.data, catalogQ.data])

  const tickerLoading = isSell ? holdingsQ.isLoading : catalogQ.isLoading
  const tickerEmpty = !tickerLoading && tickerOptions.length === 0

  const handleDirectionChange = (next: OtcOptionDirection) => {
    setDirection(next)
    setTicker('') // the previous picker source no longer applies
  }

  const isValid =
    ticker !== '' &&
    quantity !== '' &&
    strike !== '' &&
    premium !== '' &&
    settlement !== '' &&
    accountId != null

  return (
    <>
      <div className="space-y-3 py-2">
        <div>
          <Label htmlFor="new-direction">Direction</Label>
          <Select
            value={direction}
            onValueChange={(v) => handleDirectionChange(v as OtcOptionDirection)}
          >
            <SelectTrigger id="new-direction" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sell_initiated">Sell (I&apos;m offering shares)</SelectItem>
              <SelectItem value="buy_initiated">Buy (I want shares)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="new-ticker">Ticker</Label>
          <Select
            value={ticker}
            onValueChange={(v) => setTicker(v ?? '')}
            disabled={tickerLoading || tickerEmpty}
          >
            <SelectTrigger id="new-ticker" className="w-full">
              <SelectValue
                placeholder={
                  tickerLoading
                    ? 'Loading…'
                    : tickerEmpty
                      ? isSell
                        ? 'You hold no stocks to sell options on'
                        : 'No tradable stocks available'
                      : 'Select ticker'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {tickerOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSell && !tickerLoading && !tickerEmpty && (
            <p className="text-xs text-muted-foreground mt-1">
              Only stocks you currently hold are eligible.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="new-qty">Quantity</Label>
            <Input
              id="new-qty"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-strike">Strike price</Label>
            <Input
              id="new-strike"
              inputMode="decimal"
              value={strike}
              onChange={(e) => setStrike(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-premium">Premium</Label>
            <Input
              id="new-premium"
              inputMode="decimal"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-settle">Settlement date</Label>
            <Input
              id="new-settle"
              type="date"
              value={settlement}
              onChange={(e) => setSettlement(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="new-account">Settlement account</Label>
          <Select
            value={accountId?.toString() ?? ''}
            onValueChange={(v) => setAccountId(Number(v))}
          >
            <SelectTrigger id="new-account" className="w-full">
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
              direction,
              ticker,
              quantity,
              strike_price: strike,
              premium,
              settlement_date: settlement,
              account_id: accountId!,
            })
          }}
        >
          {submitting ? 'Posting…' : 'Post listing'}
        </Button>
      </DialogFooter>
    </>
  )
}
