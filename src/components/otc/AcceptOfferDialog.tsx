import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AcceptOtcOfferPayload } from '@/types/otcOption'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  onSubmit: (payload: AcceptOtcOfferPayload) => void
  loading: boolean
}

export function AcceptOfferDialog({ open, onOpenChange, accounts, onSubmit, loading }: Props) {
  const [buyerId, setBuyerId] = useState<number | undefined>(undefined)
  const [sellerId, setSellerId] = useState<number | undefined>(undefined)

  const isValid = buyerId !== undefined && sellerId !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            On accept, the premium is moved from the buyer to the seller and an option contract is
            created.
          </p>
          <div>
            <Label htmlFor="accept-buyer">Buyer account</Label>
            <Select
              value={buyerId?.toString() ?? ''}
              onValueChange={(v) => v && setBuyerId(Number(v))}
            >
              <SelectTrigger id="accept-buyer" aria-label="Buyer account">
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
          <div>
            <Label htmlFor="accept-seller">Seller account</Label>
            <Select
              value={sellerId?.toString() ?? ''}
              onValueChange={(v) => v && setSellerId(Number(v))}
            >
              <SelectTrigger id="accept-seller" aria-label="Seller account">
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
              if (isValid) onSubmit({ buyer_account_id: buyerId!, seller_account_id: sellerId! })
            }}
            disabled={!isValid || loading}
          >
            {loading ? 'Accepting...' : 'Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
