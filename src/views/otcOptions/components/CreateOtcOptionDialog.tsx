import { useState } from 'react'
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
          <Select value={direction} onValueChange={(v) => setDirection(v as OtcOptionDirection)}>
            <SelectTrigger id="new-direction">
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
          <Input
            id="new-ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
          />
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
            <SelectTrigger id="new-account">
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
