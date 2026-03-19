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
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova uplata</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Sa računa</Label>
            <Controller
              name="from_account"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite račun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.name} — {formatCurrency(acc.available_balance, acc.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.from_account && (
              <p className="text-sm text-destructive">{errors.from_account.message}</p>
            )}
          </div>

          {recipients && recipients.length > 0 && (
            <div>
              <Label>Sačuvani primaoci</Label>
              <Select
                onValueChange={(id) => {
                  const r = recipients.find((rec) => String(rec.id) === id)
                  if (r) {
                    setValue('to_account', r.account_number)
                    setValue('receiver_name', r.name)
                    if (r.reference) setValue('reference', r.reference)
                    if (r.payment_code) setValue('payment_code', r.payment_code)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite primaoca" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="to_account">Broj računa primaoca</Label>
            <Input id="to_account" {...register('to_account')} />
            {errors.to_account && (
              <p className="text-sm text-destructive">{errors.to_account.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="receiver_name">Ime primaoca</Label>
            <Input id="receiver_name" {...register('receiver_name')} />
            {errors.receiver_name && (
              <p className="text-sm text-destructive">{errors.receiver_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Iznos</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div>
            <Label>Šifra plaćanja</Label>
            <Controller
              name="payment_code"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite šifru" />
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
            <Label htmlFor="reference">Poziv na broj (opciono)</Label>
            <Input id="reference" {...register('reference')} />
          </div>

          <div>
            <Label htmlFor="description">Opis (opciono)</Label>
            <Input id="description" {...register('description')} />
          </div>

          <Button type="submit" className="w-full">
            Nastavi
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
