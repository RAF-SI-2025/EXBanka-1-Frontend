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
import type { AcceptNegotiationPayload } from '@/types/otcOption'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  onSubmit: (payload: AcceptNegotiationPayload) => void
  loading: boolean
}

export function AcceptOfferDialog({ open, onOpenChange, accounts, onSubmit, loading }: Props) {
  const [accountId, setAccountId] = useState<number | undefined>(undefined)

  const isValid = accountId !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            On accept, the premium is moved between the parties and an option contract is created.
            The counterparty's account was bound when the offer was opened.
          </p>
          <div>
            <Label htmlFor="accept-account">Your account</Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => v && setAccountId(Number(v))}
            >
              <SelectTrigger id="accept-account" aria-label="Your account">
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
              if (isValid) onSubmit({ acceptor_account_id: accountId! })
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
