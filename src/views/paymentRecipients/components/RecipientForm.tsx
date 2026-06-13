import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { paymentRecipientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof paymentRecipientSchema>

interface RecipientFormProps {
  onSubmit: (data: FormValues) => void
  onCancel?: () => void
  submitting: boolean
  isEditing?: boolean
  defaultValues?: {
    recipient_name: string
    account_number: string
  }
}

export function RecipientForm({
  onSubmit,
  onCancel,
  submitting,
  isEditing,
  defaultValues,
}: RecipientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(paymentRecipientSchema),
    defaultValues: {
      recipient_name: defaultValues?.recipient_name ?? '',
      account_number: defaultValues?.account_number ?? '',
    },
  })

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="recipient_name">Recipient Name</Label>
          <Input id="recipient_name" {...register('recipient_name')} />
          {errors.recipient_name && (
            <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="account_number">Account Number</Label>
          <Input id="account_number" {...register('account_number')} />
          {errors.account_number && (
            <p className="text-sm text-destructive">{errors.account_number.message}</p>
          )}
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  )
}
