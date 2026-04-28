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
import type { OtcOffer, OtcBuyOnBehalfRequest } from '@/types/otc'
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OtcOffer
  clients: Client[]
  accountsForClient: Account[]
  onClientSelect: (clientId: number) => void
  onSubmit: (payload: OtcBuyOnBehalfRequest) => void
  loading: boolean
}

export function BuyOnBehalfOtcDialog({
  open,
  onOpenChange,
  offer,
  clients,
  accountsForClient,
  onClientSelect,
  onSubmit,
  loading,
}: Props) {
  const [clientId, setClientId] = useState<number | undefined>(undefined)
  const [accountId, setAccountId] = useState<number | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

  const isValid =
    clientId !== undefined && accountId !== undefined && quantity > 0 && quantity <= offer.quantity

  const handleClientChange = (value: string | null) => {
    if (!value) return
    const id = Number(value)
    setClientId(id)
    setAccountId(undefined)
    onClientSelect(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy {offer.ticker} on behalf of client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Available: <strong>{offer.quantity}</strong> @ <strong>{offer.price}</strong>
          </p>
          <div>
            <Label htmlFor="otc-onbehalf-client">Client</Label>
            <Select value={clientId?.toString() ?? ''} onValueChange={handleClientChange}>
              <SelectTrigger id="otc-onbehalf-client" aria-label="Client">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="otc-onbehalf-account">Account</Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => v && setAccountId(Number(v))}
              disabled={clientId === undefined || accountsForClient.length === 0}
            >
              <SelectTrigger id="otc-onbehalf-account" aria-label="Account">
                <SelectValue
                  placeholder={clientId === undefined ? 'Select a client first' : 'Select account'}
                />
              </SelectTrigger>
              <SelectContent>
                {accountsForClient.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.account_name} ({a.currency_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="otc-onbehalf-quantity">Quantity</Label>
            <Input
              id="otc-onbehalf-quantity"
              type="number"
              min={1}
              max={offer.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isValid) {
                onSubmit({ client_id: clientId!, account_id: accountId!, quantity })
              }
            }}
            disabled={!isValid || loading}
          >
            {loading ? 'Buying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
