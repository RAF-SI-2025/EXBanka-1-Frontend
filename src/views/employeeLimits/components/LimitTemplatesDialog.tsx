import { useState } from 'react'
import { useLimitTemplates, useCreateLimitTemplate } from '@/hooks/useLimits'
import type { CreateLimitTemplatePayload } from '@/types/limits'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface LimitTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TEMPLATE_LIMIT_FIELDS = [
  { key: 'max_loan_approval_amount', label: 'Max Loan Approval' },
  { key: 'max_single_transaction', label: 'Max Single Txn' },
  { key: 'max_daily_transaction', label: 'Max Daily Txn' },
  { key: 'max_client_daily_limit', label: 'Max Client Daily' },
  { key: 'max_client_monthly_limit', label: 'Max Client Monthly' },
] as const

type TemplateLimitKey = (typeof TEMPLATE_LIMIT_FIELDS)[number]['key']

const EMPTY_TEMPLATE: CreateLimitTemplatePayload = {
  name: '',
  description: '',
  max_loan_approval_amount: '',
  max_single_transaction: '',
  max_daily_transaction: '',
  max_client_daily_limit: '',
  max_client_monthly_limit: '',
}

function LimitTemplatesInner({ onOpenChange }: LimitTemplatesDialogProps) {
  const { data, isLoading } = useLimitTemplates()
  const createMutation = useCreateLimitTemplate()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateLimitTemplatePayload>(EMPTY_TEMPLATE)

  const templates = data?.templates ?? []

  function handleFieldChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCreate() {
    if (!form.name.trim()) return
    createMutation.mutate(form, {
      onSuccess: () => {
        setShowCreate(false)
        setForm(EMPTY_TEMPLATE)
      },
    })
  }

  if (isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Limit Templates</DialogTitle>
        </DialogHeader>
        <LoadingSpinner />
      </>
    )
  }

  if (showCreate) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="template-name">Name *</Label>
            <Input
              id="template-name"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Template name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Template description"
            />
          </div>
          {TEMPLATE_LIMIT_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={`template-${key}`}>{label}</Label>
              <Input
                id={`template-${key}`}
                type="number"
                value={form[key as TemplateLimitKey]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>
            Back
          </Button>
          <Button onClick={handleCreate} disabled={!form.name.trim() || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Limit Templates</DialogTitle>
      </DialogHeader>
      {templates.length > 0 ? (
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Loan Approval</TableHead>
                <TableHead>Single Txn</TableHead>
                <TableHead>Daily Txn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.max_loan_approval_amount}</TableCell>
                  <TableCell>{t.max_single_transaction}</TableCell>
                  <TableCell>{t.max_daily_transaction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">No templates yet.</p>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button onClick={() => setShowCreate(true)}>Create Template</Button>
      </DialogFooter>
    </>
  )
}

export function LimitTemplatesDialog({ open, onOpenChange }: LimitTemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <LimitTemplatesInner open={open} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}
