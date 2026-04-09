import { useState } from 'react'
import type { CreateTierPayload } from '@/types/interestRateTiers'
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

interface CreateTierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTierPayload) => void
  loading: boolean
}

function CreateTierDialogInner({
  onSubmit,
  loading,
}: Pick<CreateTierDialogProps, 'onSubmit' | 'loading'>) {
  const [amountFrom, setAmountFrom] = useState('')
  const [amountTo, setAmountTo] = useState('')
  const [fixedRate, setFixedRate] = useState('')
  const [variableBase, setVariableBase] = useState('')

  function handleSubmit() {
    if (!fixedRate || !variableBase) return
    onSubmit({
      amount_from: Number(amountFrom) || 0,
      amount_to: Number(amountTo) || 0,
      fixed_rate: Number(fixedRate),
      variable_base: Number(variableBase),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Interest Rate Tier</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tier-amount-from">Amount From</Label>
          <Input
            id="tier-amount-from"
            type="number"
            value={amountFrom}
            onChange={(e) => setAmountFrom(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tier-amount-to">Amount To</Label>
          <Input
            id="tier-amount-to"
            type="number"
            value={amountTo}
            onChange={(e) => setAmountTo(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tier-fixed-rate">Fixed Rate % *</Label>
          <Input
            id="tier-fixed-rate"
            type="number"
            step="0.01"
            value={fixedRate}
            onChange={(e) => setFixedRate(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tier-variable-base">Variable Base % *</Label>
          <Input
            id="tier-variable-base"
            type="number"
            step="0.01"
            value={variableBase}
            onChange={(e) => setVariableBase(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!fixedRate || !variableBase || loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CreateTierDialog({ open, onOpenChange, onSubmit, loading }: CreateTierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <CreateTierDialogInner onSubmit={onSubmit} loading={loading} />}
      </DialogContent>
    </Dialog>
  )
}
