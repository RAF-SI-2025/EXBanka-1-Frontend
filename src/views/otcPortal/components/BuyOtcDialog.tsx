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
import type { OtcLocalOffer, OtcBuyRequest } from '@/types/otc'
import type { Account } from '@/types/account'
import { formatAccountOption } from '@/lib/utils/format'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcLocalOffer
  accounts: Account[]
  onSubmit: (payload: OtcBuyRequest) => void
  loading: boolean
}

export function BuyOtcDialog({ open, onOpenChange, offer, accounts, onSubmit, loading }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)
  const selectedAccount = accounts.find((a) => a.id === accountId)

  const isValid = quantity > 0 && quantity <= offer.quantity && accountId !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy {offer.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Available: <strong>{offer.quantity}</strong> @ <strong>{offer.price_per_unit}</strong>
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
