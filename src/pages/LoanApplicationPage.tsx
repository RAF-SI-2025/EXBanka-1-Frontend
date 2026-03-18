import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { submitLoanRequest, resetLoanFlow } from '@/store/slices/loanSlice'
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
import { createLoanRequestSchema } from '@/lib/utils/validation'
import { LOAN_TYPES, LOAN_PERIODS_MONTHS } from '@/lib/constants/banking'
import type { z } from 'zod'

type FormValues = z.infer<typeof createLoanRequestSchema>

export function LoanApplicationPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result } = useAppSelector((s) => s.loan)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createLoanRequestSchema),
  })

  useEffect(() => {
    return () => {
      dispatch(resetLoanFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Zahtev za kredit uspešno podnet!</h2>
        <p className="text-muted-foreground">Vaš zahtev je u obradi.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/loans')}>Nazad na kredite</Button>
          <Button variant="outline" onClick={() => dispatch(resetLoanFlow())}>
            Novi zahtev
          </Button>
        </div>
      </div>
    )
  }

  const onSubmit = (data: FormValues) => {
    dispatch(submitLoanRequest(data))
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Podnesi zahtev za kredit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Tip kredita</Label>
              <Controller
                name="loan_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite tip" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.loan_type && (
                <p className="text-sm text-destructive">{errors.loan_type.message}</p>
              )}
            </div>

            <div>
              <Label>Račun za isplatu</Label>
              <Controller
                name="account_number"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite račun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.account_number} value={acc.account_number}>
                          {acc.name} ({acc.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.account_number && (
                <p className="text-sm text-destructive">{errors.account_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Iznos</Label>
              <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div>
              <Label>Period (meseci)</Label>
              <Controller
                name="period"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite period" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_PERIODS_MONTHS.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} meseci
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.period && <p className="text-sm text-destructive">{errors.period.message}</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Podnošenje...' : 'Podnesi zahtev'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
