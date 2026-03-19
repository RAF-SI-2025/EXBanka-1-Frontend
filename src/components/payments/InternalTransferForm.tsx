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

  const fromAccount = watch('from_account')
  const toAccounts = accounts.filter((a) => {
    const fromAcc = accounts.find((acc) => acc.account_number === fromAccount)
    return a.account_number !== fromAccount && (!fromAcc || a.currency === fromAcc.currency)
  })

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
