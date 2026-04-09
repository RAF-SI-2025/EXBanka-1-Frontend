import { useState } from 'react'
import type { TransferFee, UpdateFeePayload } from '@/types/fee'
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
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'

interface EditFeeDialogProps {
  open: boolean
  fee: TransferFee | null
  onClose: () => void
  onSave: (id: number, payload: UpdateFeePayload) => void
  loading: boolean
}

function EditFeeDialogInner({
  fee,
  onSave,
  loading,
}: {
  fee: TransferFee
  onSave: (id: number, payload: UpdateFeePayload) => void
  loading: boolean
}) {
  const [name, setName] = useState(fee.name)
  const [feeType, setFeeType] = useState<'percentage' | 'fixed'>(fee.fee_type)
  const [feeValue, setFeeValue] = useState(fee.fee_value)
  const [minAmount, setMinAmount] = useState(fee.min_amount || '')
  const [maxFee, setMaxFee] = useState(fee.max_fee || '')
  const [transactionType, setTransactionType] = useState<'payment' | 'transfer' | 'all'>(
    fee.transaction_type
  )
  const [currencyCode, setCurrencyCode] = useState(fee.currency_code || '')
  const [active, setActive] = useState(fee.active)

  function handleSave() {
    if (!name.trim() || !feeValue) return
    const payload: UpdateFeePayload = {
      name: name.trim(),
      fee_type: feeType,
      fee_value: feeValue,
      min_amount: minAmount || undefined,
      max_fee: maxFee || undefined,
      transaction_type: transactionType,
      currency_code: currencyCode || undefined,
      active,
    }
    onSave(fee.id, payload)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Fee Rule</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-fee-name">Name *</Label>
          <Input id="edit-fee-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Fee Type</Label>
          <Select
            value={feeType}
            onValueChange={(v) => v && setFeeType(v as 'percentage' | 'fixed')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-fee-value">Fee Value *</Label>
          <Input
            id="edit-fee-value"
            type="number"
            step="0.01"
            value={feeValue}
            onChange={(e) => setFeeValue(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-fee-min-amount">Min Amount</Label>
          <Input
            id="edit-fee-min-amount"
            type="number"
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-fee-max-fee">Max Fee Cap</Label>
          <Input
            id="edit-fee-max-fee"
            type="number"
            step="0.01"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Transaction Type</Label>
          <Select
            value={transactionType}
            onValueChange={(v) => v && setTransactionType(v as 'payment' | 'transfer' | 'all')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Currency</Label>
          <Select value={currencyCode} onValueChange={(v) => setCurrencyCode(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="All currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All currencies</SelectItem>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="edit-fee-active"
            checked={active}
            onCheckedChange={(checked) => setActive(checked === true)}
          />
          <Label htmlFor="edit-fee-active" className="text-sm font-normal">
            Active
          </Label>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={!name.trim() || !feeValue || loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditFeeDialog({ open, fee, onClose, onSave, loading }: EditFeeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && fee && <EditFeeDialogInner fee={fee} onSave={onSave} loading={loading} />}
      </DialogContent>
    </Dialog>
  )
}
