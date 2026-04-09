import { useState } from 'react'
import type { CreateFeePayload } from '@/types/fee'
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
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'

interface CreateFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateFeePayload) => void
  loading: boolean
}

function CreateFeeDialogInner({
  onSubmit,
  loading,
}: Pick<CreateFeeDialogProps, 'onSubmit' | 'loading'>) {
  const [name, setName] = useState('')
  const [feeType, setFeeType] = useState<'percentage' | 'fixed'>('percentage')
  const [feeValue, setFeeValue] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxFee, setMaxFee] = useState('')
  const [transactionType, setTransactionType] = useState<'payment' | 'transfer' | 'all'>('all')
  const [currencyCode, setCurrencyCode] = useState('')

  function handleSubmit() {
    if (!name.trim() || !feeValue) return
    const payload: CreateFeePayload = {
      name: name.trim(),
      fee_type: feeType,
      fee_value: feeValue,
      transaction_type: transactionType,
    }
    if (minAmount) payload.min_amount = minAmount
    if (maxFee) payload.max_fee = maxFee
    if (currencyCode) payload.currency_code = currencyCode
    onSubmit(payload)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Fee Rule</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fee-name">Name *</Label>
          <Input
            id="fee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fee name"
          />
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
          <Label htmlFor="fee-value">Fee Value *</Label>
          <Input
            id="fee-value"
            type="number"
            step="0.01"
            value={feeValue}
            onChange={(e) => setFeeValue(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fee-min-amount">Min Amount</Label>
          <Input
            id="fee-min-amount"
            type="number"
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fee-max-fee">Max Fee Cap</Label>
          <Input
            id="fee-max-fee"
            type="number"
            step="0.01"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            placeholder="0.00"
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
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!name.trim() || !feeValue || loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CreateFeeDialog({ open, onOpenChange, onSubmit, loading }: CreateFeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <CreateFeeDialogInner onSubmit={onSubmit} loading={loading} />}
      </DialogContent>
    </Dialog>
  )
}
