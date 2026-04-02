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
import type { OtcOffer, OtcBuyRequest } from '@/types/otc'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcOffer
  accounts: Account[]
  onSubmit: (payload: OtcBuyRequest) => void
  loading: boolean
}

export function BuyOtcDialog({ open, onOpenChange, offer, accounts, onSubmit, loading }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)

  const isValid = quantity > 0 && quantity <= offer.quantity && accountId !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy {offer.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Available: <strong>{offer.quantity}</strong> @ <strong>{offer.price}</strong>
          </p>
          <div>
            <Label htmlFor="otc-quantity">Quantity</Label>
            <Input
              id="otc-quantity"
              type="number"
              min={1}
              max={offer.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="otc-account">Account</Label>
            <Select value={accountId?.toString()} onValueChange={(v) => setAccountId(Number(v))}>
              <SelectTrigger id="otc-account">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isValid) onSubmit({ quantity, account_id: accountId! })
            }}
            disabled={!isValid || loading}
          >
            {loading ? 'Buying...' : 'Buy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
