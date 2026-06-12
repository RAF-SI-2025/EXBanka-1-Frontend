import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Account } from '@/types/account'
import type { ExerciseContractPayload, OptionContract } from '@/types/otcOption'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: OptionContract
  onSubmit: (payload: ExerciseContractPayload) => void
  loading: boolean
  // The caller's own accounts — required only for a cross-bank (remote)
  // contract, whose exercise must name the buyer's strike account.
  accounts?: Account[]
}

export function ExerciseContractDialog({
  open,
  onOpenChange,
  contract,
  onSubmit,
  loading,
  accounts = [],
}: Props) {
  const isRemote = contract.kind === 'remote'
  const [buyerAccount, setBuyerAccount] = useState('')

  const totalCost = (Number(contract.quantity) * Number(contract.strike_price)).toFixed(2)
  const eligibleAccounts = contract.strike_currency
    ? accounts.filter((a) => a.currency_code === contract.strike_currency)
    : accounts

  const canSubmit = !loading && (!isRemote || buyerAccount !== '')

  const handleSubmit = () => {
    onSubmit(isRemote ? { buyer_account_number: buyerAccount } : {})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exercise contract</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Total to pay: <strong>{totalCost}</strong> ({contract.quantity} ×{' '}
            {contract.strike_price})
          </p>
          {isRemote ? (
            <div className="space-y-1">
              <label htmlFor="buyer-account" className="text-sm font-medium">
                Buyer account (pays the strike)
              </label>
              <select
                id="buyer-account"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={buyerAccount}
                onChange={(e) => setBuyerAccount(e.target.value)}
              >
                <option value="">Select account</option>
                {eligibleAccounts.map((a) => (
                  <option key={a.id} value={a.account_number}>
                    {a.account_number} ({a.currency_code}) — {a.account_name}
                  </option>
                ))}
              </select>
              {eligibleAccounts.length === 0 && (
                <p className="text-sm text-destructive">
                  No eligible {contract.strike_currency ?? ''} account to pay the strike.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              The settlement accounts were bound at contract creation, so no further account
              selection is needed.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? 'Exercising...' : 'Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
