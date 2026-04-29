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
import { useCreateVirtualCard } from '@/hooks/useCards'
import { notifySuccess, notifyError } from '@/lib/errors'
import type { Account } from '@/types/account'
import type { CreateVirtualCardPayload, VirtualCardUsageType } from '@/types/card'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  ownerId: number
}

const DECIMAL_RE = /^\d+(\.\d{1,4})?$/

export function CreateVirtualCardDialog({ open, onOpenChange, accounts, ownerId }: Props) {
  const [accountNumber, setAccountNumber] = useState(accounts[0]?.account_number ?? '')
  const [brand, setBrand] = useState<CreateVirtualCardPayload['card_brand']>('visa')
  const [usageType, setUsageType] = useState<VirtualCardUsageType>('single_use')
  const [maxUses, setMaxUses] = useState('5')
  const [expiryMonths, setExpiryMonths] = useState<1 | 2 | 3>(1)
  const [cardLimit, setCardLimit] = useState('5000.0000')
  const createMutation = useCreateVirtualCard()

  const limitOk = DECIMAL_RE.test(cardLimit)
  const usesOk = usageType === 'single_use' || (Number(maxUses) >= 2 && /^\d+$/.test(maxUses))
  const isValid = accountNumber.length > 0 && limitOk && usesOk

  const handleSubmit = () => {
    if (!isValid) return
    const payload: CreateVirtualCardPayload = {
      account_number: accountNumber,
      owner_id: ownerId,
      card_brand: brand,
      usage_type: usageType,
      expiry_months: expiryMonths,
      card_limit: cardLimit,
    }
    if (usageType === 'multi_use') payload.max_uses = Number(maxUses)
    createMutation.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Virtual card created.')
        onOpenChange(false)
      },
      onError: (err) => notifyError(err),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create virtual card</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="vc-account">Account</Label>
            <select
              id="vc-account"
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.account_number}>
                  {a.account_name} ({a.currency_code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="vc-brand">Brand</Label>
              <select
                id="vc-brand"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
                value={brand}
                onChange={(e) => setBrand(e.target.value as CreateVirtualCardPayload['card_brand'])}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="dinacard">DinaCard</option>
                <option value="amex">Amex</option>
              </select>
            </div>
            <div>
              <Label htmlFor="vc-expiry">Expires in</Label>
              <select
                id="vc-expiry"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
                value={String(expiryMonths)}
                onChange={(e) => setExpiryMonths(Number(e.target.value) as 1 | 2 | 3)}
              >
                <option value="1">1 month</option>
                <option value="2">2 months</option>
                <option value="3">3 months</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="vc-usage">Usage</Label>
              <select
                id="vc-usage"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
                value={usageType}
                onChange={(e) => setUsageType(e.target.value as VirtualCardUsageType)}
              >
                <option value="single_use">Single use</option>
                <option value="multi_use">Multi use</option>
              </select>
            </div>
            {usageType === 'multi_use' && (
              <div>
                <Label htmlFor="vc-max-uses">Max uses</Label>
                <Input
                  id="vc-max-uses"
                  inputMode="numeric"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ''))}
                  aria-invalid={!usesOk}
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="vc-limit">Spending limit</Label>
            <Input
              id="vc-limit"
              inputMode="decimal"
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              aria-invalid={!limitOk}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
