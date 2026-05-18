import { useState } from 'react'
import { useClientLimits, useUpdateClientLimits } from '@/hooks/useLimits'
import type { ClientLimits } from '@/types/limits'
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface EditClientLimitsDialogProps {
  open: boolean
  clientId: number
  clientName: string
  onClose: () => void
  onSave: () => void
}

const CLIENT_LIMIT_FIELDS = [
  { key: 'daily_limit', label: 'Daily Limit' },
  { key: 'monthly_limit', label: 'Monthly Limit' },
  { key: 'transfer_limit', label: 'Transfer Limit' },
] as const

type ClientLimitKey = (typeof CLIENT_LIMIT_FIELDS)[number]['key']
type ClientLimitFormValues = Record<ClientLimitKey, string>

function limitsToForm(limits: ClientLimits): ClientLimitFormValues {
  return {
    daily_limit: limits.daily_limit,
    monthly_limit: limits.monthly_limit,
    transfer_limit: limits.transfer_limit,
  }
}

function EditClientLimitsForm({
  clientId,
  clientName,
  initialValues,
  onClose,
  onSave,
}: {
  clientId: number
  clientName: string
  initialValues: ClientLimitFormValues
  onClose: () => void
  onSave: () => void
}) {
  const updateMutation = useUpdateClientLimits()
  const [form, setForm] = useState<ClientLimitFormValues>(initialValues)

  function handleFieldChange(key: ClientLimitKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    updateMutation.mutate(
      { id: clientId, payload: form },
      {
        onSuccess: () => {
          onSave()
          onClose()
        },
      }
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Limits - {clientName}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        {CLIENT_LIMIT_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={`client-limit-${key}`}>{label}</Label>
            <Input
              id={`client-limit-${key}`}
              type="number"
              value={form[key]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

function EditClientLimitsInner({
  clientId,
  clientName,
  onClose,
  onSave,
}: Omit<EditClientLimitsDialogProps, 'open'>) {
  const { data: limits, isLoading } = useClientLimits(clientId)

  if (isLoading || !limits) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Limits - {clientName}</DialogTitle>
        </DialogHeader>
        <LoadingSpinner />
      </>
    )
  }

  return (
    <EditClientLimitsForm
      clientId={clientId}
      clientName={clientName}
      initialValues={limitsToForm(limits)}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

export function EditClientLimitsDialog({
  open,
  clientId,
  clientName,
  onClose,
  onSave,
}: EditClientLimitsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        {open && (
          <EditClientLimitsInner
            clientId={clientId}
            clientName={clientName}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
