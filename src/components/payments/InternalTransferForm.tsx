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
import { createInternalTransferSchema } from '@/lib/utils/validation'
import { formatCurrency } from '@/lib/utils/format'
import type { Account } from '@/types/account'
import type { z } from 'zod'

type FormValues = z.infer<typeof createInternalTransferSchema>

interface InternalTransferFormProps {
  accounts: Account[]
  onSubmit: (data: FormValues) => void
}

export function InternalTransferForm({ accounts, onSubmit }: InternalTransferFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createInternalTransferSchema),
  })

  const fromAccount = watch('from_account_number')
  const toAccounts = accounts.filter((a) => {
    const fromAcc = accounts.find((acc) => acc.account_number === fromAccount)
    return (
      a.account_number !== fromAccount && (!fromAcc || a.currency_code === fromAcc.currency_code)
    )
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Funds</CardTitle>
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

          <div>
            <Label>To Account</Label>
            <Controller
              name="to_account_number"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.account_name} —{' '}
                        {formatCurrency(acc.available_balance, acc.currency_code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.to_account_number && (
              <p className="text-sm text-destructive">{errors.to_account_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="payment_purpose">Description (optional)</Label>
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
