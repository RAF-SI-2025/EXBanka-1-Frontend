import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
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
import { createInternalTransferSchema } from '@/lib/utils/validation'
import { formatCurrency } from '@/lib/utils/format'
import type { z } from 'zod'

type FormValues = z.infer<typeof createInternalTransferSchema>

export function InternalTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result, formData } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createInternalTransferSchema),
  })

  const fromAccount = watch('from_account')
  const toAccounts = accounts.filter((a) => {
    const fromAcc = accounts.find((acc) => acc.account_number === fromAccount)
    return a.account_number !== fromAccount && (!fromAcc || a.currency === fromAcc.currency)
  })

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Prenos uspešan!</h2>
        <p>Broj naloga: {result.order_number}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Novi prenos
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'confirmation' && formData) {
    const data = formData as FormValues
    return (
      <Card>
        <CardHeader>
          <CardTitle>Potvrdi prenos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ConfirmRow label="Sa računa" value={data.from_account} />
          <ConfirmRow label="Na račun" value={data.to_account} />
          <ConfirmRow label="Iznos" value={formatCurrency(data.amount, 'RSD')} />
          {data.description && <ConfirmRow label="Opis" value={data.description} />}
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
              onClick={() => dispatch(submitPayment({ type: 'internal', data: formData! }))}
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
        <CardTitle>Prenos sredstava</CardTitle>
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

          <div>
            <Label>Na račun</Label>
            <Controller
              name="to_account"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite račun" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.name} — {formatCurrency(acc.available_balance, acc.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.to_account && (
              <p className="text-sm text-destructive">{errors.to_account.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Iznos</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
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
