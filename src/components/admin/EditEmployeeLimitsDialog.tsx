import { useState } from 'react'
import {
  useEmployeeLimits,
  useUpdateEmployeeLimits,
  useLimitTemplates,
  useApplyLimitTemplate,
} from '@/hooks/useLimits'
import type { EmployeeLimits } from '@/types/limits'
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface EditEmployeeLimitsDialogProps {
  open: boolean
  employeeId: number
  employeeName: string
  onClose: () => void
  onSave: () => void
}

const LIMIT_FIELDS = [
  { key: 'max_loan_approval_amount', label: 'Max Loan Approval Amount' },
  { key: 'max_single_transaction', label: 'Max Single Transaction' },
  { key: 'max_daily_transaction', label: 'Max Daily Transaction' },
  { key: 'max_client_daily_limit', label: 'Max Client Daily Limit' },
  { key: 'max_client_monthly_limit', label: 'Max Client Monthly Limit' },
] as const

type LimitKey = (typeof LIMIT_FIELDS)[number]['key']
type LimitFormValues = Record<LimitKey, string>

function limitsToForm(limits: EmployeeLimits): LimitFormValues {
  return {
    max_loan_approval_amount: limits.max_loan_approval_amount,
    max_single_transaction: limits.max_single_transaction,
    max_daily_transaction: limits.max_daily_transaction,
    max_client_daily_limit: limits.max_client_daily_limit,
    max_client_monthly_limit: limits.max_client_monthly_limit,
  }
}

function EditEmployeeLimitsForm({
  employeeId,
  employeeName,
  initialValues,
  onClose,
  onSave,
}: {
  employeeId: number
  employeeName: string
  initialValues: LimitFormValues
  onClose: () => void
  onSave: () => void
}) {
  const updateMutation = useUpdateEmployeeLimits()
  const applyTemplateMutation = useApplyLimitTemplate()
  const { data: templatesData } = useLimitTemplates()

  const [form, setForm] = useState<LimitFormValues>(initialValues)
  const templates = templatesData?.templates ?? []

  function handleFieldChange(key: LimitKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    updateMutation.mutate(
      { id: employeeId, payload: form },
      {
        onSuccess: () => {
          onSave()
          onClose()
        },
      }
    )
  }

  function handleApplyTemplate(templateName: string | null) {
    if (!templateName) return
    applyTemplateMutation.mutate(
      { employeeId, templateName },
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
        <DialogTitle>Edit Limits - {employeeName}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        {LIMIT_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={`limit-${key}`}>{label}</Label>
            <Input
              id={`limit-${key}`}
              type="number"
              value={form[key]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        {templates.length > 0 && (
          <Select onValueChange={handleApplyTemplate}>
            <SelectTrigger className="mr-auto">
              <SelectValue placeholder="Apply Template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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

function EditEmployeeLimitsInner({
  employeeId,
  employeeName,
  onClose,
  onSave,
}: Omit<EditEmployeeLimitsDialogProps, 'open'>) {
  const { data: limits, isLoading } = useEmployeeLimits(employeeId)

  if (isLoading || !limits) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Limits - {employeeName}</DialogTitle>
        </DialogHeader>
        <LoadingSpinner />
      </>
    )
  }

  return (
    <EditEmployeeLimitsForm
      employeeId={employeeId}
      employeeName={employeeName}
      initialValues={limitsToForm(limits)}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

export function EditEmployeeLimitsDialog({
  open,
  employeeId,
  employeeName,
  onClose,
  onSave,
}: EditEmployeeLimitsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        {open && (
          <EditEmployeeLimitsInner
            employeeId={employeeId}
            employeeName={employeeName}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
