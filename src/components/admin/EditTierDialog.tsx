import { useState } from 'react'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'
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

interface EditTierDialogProps {
  open: boolean
  tier: InterestRateTier | null
  onClose: () => void
  onSave: (id: number, payload: CreateTierPayload) => void
  loading: boolean
}

function EditTierDialogInner({
  tier,
  onSave,
  loading,
}: {
  tier: InterestRateTier
  onSave: (id: number, payload: CreateTierPayload) => void
  loading: boolean
}) {
  const [amountFrom, setAmountFrom] = useState(String(tier.amount_from))
  const [amountTo, setAmountTo] = useState(String(tier.amount_to))
  const [fixedRate, setFixedRate] = useState(String(tier.fixed_rate))
  const [variableBase, setVariableBase] = useState(String(tier.variable_base))

  function handleSave() {
    if (!fixedRate || !variableBase) return
    onSave(tier.id, {
      amount_from: Number(amountFrom) || 0,
      amount_to: Number(amountTo) || 0,
      fixed_rate: Number(fixedRate),
      variable_base: Number(variableBase),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Interest Rate Tier</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-tier-amount-from">Amount From</Label>
          <Input
            id="edit-tier-amount-from"
            type="number"
            value={amountFrom}
            onChange={(e) => setAmountFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-tier-amount-to">Amount To</Label>
          <Input
            id="edit-tier-amount-to"
            type="number"
            value={amountTo}
            onChange={(e) => setAmountTo(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-tier-fixed-rate">Fixed Rate % *</Label>
          <Input
            id="edit-tier-fixed-rate"
            type="number"
            step="0.01"
            value={fixedRate}
            onChange={(e) => setFixedRate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-tier-variable-base">Variable Base % *</Label>
          <Input
            id="edit-tier-variable-base"
            type="number"
            step="0.01"
            value={variableBase}
            onChange={(e) => setVariableBase(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={!fixedRate || !variableBase || loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditTierDialog({ open, tier, onClose, onSave, loading }: EditTierDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && tier && <EditTierDialogInner tier={tier} onSave={onSave} loading={loading} />}
      </DialogContent>
    </Dialog>
  )
}
