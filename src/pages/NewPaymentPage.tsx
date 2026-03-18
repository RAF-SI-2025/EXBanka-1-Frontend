import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePaymentRecipients } from '@/hooks/usePayments'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  resetPaymentFlow,
} from '@/store/slices/paymentSlice'
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
import type { z } from 'zod'

type FormValues = z.infer<typeof createPaymentSchema>

export function NewPaymentPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result, formData } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const { data: recipients } = usePaymentRecipients()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createPaymentSchema),
  })

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Uplata uspešna!</h2>
        <p>Broj naloga: {result.order_number}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Nova uplata
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'confirmation' && formData) {
    const payData = formData as FormValues
    return (
      <Card>
        <CardHeader>
          <CardTitle>Potvrdi uplatu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ConfirmRow label="Sa računa" value={payData.from_account} />
          <ConfirmRow label="Na račun" value={payData.to_account} />
          <ConfirmRow label="Primalac" value={payData.receiver_name} />
          <ConfirmRow label="Iznos" value={formatCurrency(payData.amount, 'RSD')} />
          <ConfirmRow label="Šifra" value={payData.payment_code} />
          {payData.reference && <ConfirmRow label="Poziv na broj" value={payData.reference} />}
          {payData.description && <ConfirmRow label="Opis" value={payData.description} />}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => dispatch(setPaymentStep('form'))}
            >
              Nazad
            </Button>
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={() => dispatch(submitPayment({ type: 'payment', data: formData! }))}
            >
              {submitting ? 'Obrađuje se...' : 'Potvrdi'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  const onSubmit = (data: FormValues) => {
    dispatch(setPaymentFormData(data))
    dispatch(setPaymentStep('confirmation'))
  }

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

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
