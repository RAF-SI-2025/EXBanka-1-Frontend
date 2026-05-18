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
import type { Fund, InvestPayload } from '@/types/fund'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  fund: Fund
  accounts: Account[]
  onSubmit: (payload: InvestPayload) => void
  loading: boolean
  /** When true, the page is mounted by an employee acting on behalf of the bank. */
  asBank?: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,2})?$/

export function InvestInFundDialog({
  open,
  onOpenChange,
  fund,
  accounts,
  onSubmit,
  loading,
  asBank = false,
}: Props) {
  const [accountId, setAccountId] = useState<number | undefined>(undefined)
  const [amount, setAmount] = useState('')

  const account = accounts.find((a) => a.id === accountId)
  const currency = account?.currency_code ?? 'RSD'

  const decimalOk = DECIMAL_RE.test(amount)
  const aboveMinimum =
    !decimalOk || currency !== 'RSD' || Number(amount) >= Number(fund.minimum_contribution_rsd)

  const isValid = accountId !== undefined && decimalOk && aboveMinimum

  const handleSubmit = () => {
    if (!isValid || !account) return
    const payload: InvestPayload = {
      source_account_id: account.id,
      amount,
      currency,
    }
    if (asBank) payload.on_behalf_of_type = 'bank'
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invest in {fund.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Minimum: <strong>{fund.minimum_contribution_rsd} RSD</strong>
          </p>
          <div>
            <Label htmlFor="invest-account">Source account</Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => v && setAccountId(Number(v))}
            >
              <SelectTrigger id="invest-account" aria-label="Source account">
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
            <Label htmlFor="invest-amount">Amount ({currency})</Label>
            <Input
              id="invest-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              aria-invalid={amount.length > 0 && !decimalOk}
            />
            {amount.length > 0 && !decimalOk && (
              <p className="text-xs text-destructive mt-1">Use a decimal value (e.g. 1000.00).</p>
            )}
            {decimalOk && !aboveMinimum && (
              <p className="text-xs text-destructive mt-1">
                Minimum contribution is {fund.minimum_contribution_rsd} RSD.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Investing...' : 'Invest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
