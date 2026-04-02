import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPaymentSchema } from '@/lib/utils/validation'
import { PAYMENT_CODES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'
import { useRecipientAutofill } from '@/hooks/useRecipientAutofill'
import { SavedRecipientSelect } from '@/components/payments/SavedRecipientSelect'
import type { Account } from '@/types/account'
import type { PaymentRecipient } from '@/types/payment'
import type { z } from 'zod'

type FormValues = z.infer<typeof createPaymentSchema>
interface NewPaymentFormProps {
  accounts: Account[]
  recipients: PaymentRecipient[] | undefined
  onSubmit: (data: FormValues) => void
}

export function NewPaymentForm({ accounts, recipients, onSubmit }: NewPaymentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      payment_code: '289',
    },
  })

  const { handleRecipientSelect } = useRecipientAutofill(recipients, setValue)
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>From Account</Label>
            <Controller
              name="from_account_number"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.account_name} —{' '}
                        {formatCurrency(acc.available_balance, acc.currency_code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.from_account_number && (
              <p className="text-sm text-destructive">{errors.from_account_number.message}</p>
            )}
          </div>

          {recipients && recipients.length > 0 && (
            <SavedRecipientSelect recipients={recipients} onSelect={handleRecipientSelect} />
          )}

          <div>
            <Label htmlFor="to_account_number">Recipient Account Number</Label>
            <Input id="to_account_number" {...register('to_account_number')} />
            {errors.to_account_number && (
              <p className="text-sm text-destructive">{errors.to_account_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="recipient_name">Recipient Name</Label>
            <Input id="recipient_name" {...register('recipient_name')} />
            {errors.recipient_name && (
              <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div>
            <Label>Payment Code</Label>
            <Controller
              name="payment_code"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select code" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.payment_code && (
              <p className="text-sm text-destructive">{errors.payment_code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reference_number">Reference Number (optional)</Label>
            <Input id="reference_number" {...register('reference_number')} />
          </div>

          <div>
            <Label htmlFor="payment_purpose">Payment Purpose (optional)</Label>
            <Input id="payment_purpose" {...register('payment_purpose')} />
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
