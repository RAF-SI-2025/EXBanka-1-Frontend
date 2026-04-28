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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClientFundPosition, RedeemPayload } from '@/types/fund'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: ClientFundPosition
  accounts: Account[]
  onSubmit: (payload: RedeemPayload) => void
  loading: boolean
  asBank?: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,2})?$/

export function RedeemFromFundDialog({
  open,
  onOpenChange,
  position,
  accounts,
  onSubmit,
  loading,
  asBank = false,
}: Props) {
  const [accountId, setAccountId] = useState<number | undefined>(undefined)
  const [amount, setAmount] = useState('')
  const [withdrawAll, setWithdrawAll] = useState(false)

  const handleWithdrawAllChange = (next: boolean) => {
    setWithdrawAll(next)
    if (next) setAmount(position.current_value_rsd)
  }

  const decimalOk = DECIMAL_RE.test(amount)
  const withinPosition = decimalOk && Number(amount) <= Number(position.current_value_rsd)
  const isValid = accountId !== undefined && decimalOk && withinPosition

  const handleSubmit = () => {
    if (!isValid || accountId === undefined) return
    const payload: RedeemPayload = {
      amount_rsd: amount,
      target_account_id: accountId,
    }
    if (asBank) payload.on_behalf_of_type = 'bank'
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem from {position.fund_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Current value: <strong>{position.current_value_rsd} RSD</strong>
          </p>
          {asBank && (
            <p className="text-sm text-muted-foreground">Bank redemptions are fee-free.</p>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="redeem-all"
              checked={withdrawAll}
              onCheckedChange={(v) => handleWithdrawAllChange(Boolean(v))}
            />
            <Label htmlFor="redeem-all">Withdraw full position</Label>
          </div>
          <div>
            <Label htmlFor="redeem-amount">Amount (RSD)</Label>
            <Input
              id="redeem-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={withdrawAll}
              aria-invalid={amount.length > 0 && (!decimalOk || !withinPosition)}
            />
            {amount.length > 0 && !decimalOk && (
              <p className="text-xs text-destructive mt-1">Use a decimal value (e.g. 1000.00).</p>
            )}
            {decimalOk && !withinPosition && (
              <p className="text-xs text-destructive mt-1">
                Cannot redeem more than the current position value.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="redeem-account">Target account</Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => v && setAccountId(Number(v))}
            >
              <SelectTrigger id="redeem-account" aria-label="Target account">
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
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Redeeming...' : 'Redeem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
