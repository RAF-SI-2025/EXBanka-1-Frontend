import { useState } from 'react'
import type { BankMargin } from '@/types/bankMargins'
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

interface EditMarginDialogProps {
  open: boolean
  margin: BankMargin | null
  onClose: () => void
  onSave: (id: number, margin: number) => void
  loading: boolean
}

function EditMarginDialogInner({
  margin,
  onSave,
  loading,
}: {
  margin: BankMargin
  onSave: (id: number, margin: number) => void
  loading: boolean
}) {
  const [value, setValue] = useState(String(margin.margin))

  function handleSave() {
    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0) return
    onSave(margin.id, numValue)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Edit Margin -{' '}
          {margin.loan_type.charAt(0).toUpperCase() + margin.loan_type.slice(1).toLowerCase()}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-margin-value">Margin % *</Label>
          <Input
            id="edit-margin-value"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={handleSave}
          disabled={!value || Number(value) < 0 || isNaN(Number(value)) || loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditMarginDialog({
  open,
  margin,
  onClose,
  onSave,
  loading,
}: EditMarginDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && margin && (
          <EditMarginDialogInner margin={margin} onSave={onSave} loading={loading} />
        )}
      </DialogContent>
    </Dialog>
  )
}
