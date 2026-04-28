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
import type { ExerciseContractPayload, OptionContract } from '@/types/otcOption'
import type { Account } from '@/types/account'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: OptionContract
  accounts: Account[]
  onSubmit: (payload: ExerciseContractPayload) => void
  loading: boolean
}

export function ExerciseContractDialog({
  open,
  onOpenChange,
  contract,
  accounts,
  onSubmit,
  loading,
}: Props) {
  const [buyerId, setBuyerId] = useState<number | undefined>(undefined)
  const [sellerId, setSellerId] = useState<number | undefined>(undefined)

  const totalCost = (Number(contract.quantity) * Number(contract.strike_price)).toFixed(2)
  const isValid = buyerId !== undefined && sellerId !== undefined

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
          <div>
            <Label htmlFor="exercise-buyer">Buyer account</Label>
            <Select
              value={buyerId?.toString() ?? ''}
              onValueChange={(v) => v && setBuyerId(Number(v))}
            >
              <SelectTrigger id="exercise-buyer" aria-label="Buyer account">
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
            <Label htmlFor="exercise-seller">Seller account</Label>
            <Select
              value={sellerId?.toString() ?? ''}
              onValueChange={(v) => v && setSellerId(Number(v))}
            >
              <SelectTrigger id="exercise-seller" aria-label="Seller account">
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
              if (isValid) {
                onSubmit({ buyer_account_id: buyerId!, seller_account_id: sellerId! })
              }
            }}
            disabled={!isValid || loading}
          >
            {loading ? 'Exercising...' : 'Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
