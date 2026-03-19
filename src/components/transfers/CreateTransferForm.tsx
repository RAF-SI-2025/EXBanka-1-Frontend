import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransferSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Account } from '@/types/account'
import { useState } from 'react'
import type { z } from 'zod'

type FormValues = z.infer<typeof createTransferSchema>

interface CreateTransferFormProps {
  accounts: Account[]
  onSubmit: (data: FormValues) => void
}

export function CreateTransferForm({ accounts, onSubmit }: CreateTransferFormProps) {
  const [fromCurrency, setFromCurrency] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createTransferSchema),
  })

  const toAccounts = accounts.filter((acc) =>
    fromCurrency ? acc.currency_code !== fromCurrency : true
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kreiraj transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="from_account_number">Izvorni račun</Label>
            <Controller
              name="from_account_number"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    const acc = accounts.find((a) => a.account_number === val)
                    setFromCurrency(acc?.currency_code ?? '')
                  }}
                  value={field.value}
                >
                  <SelectTrigger aria-label="Izvorni račun">
                    <SelectValue placeholder="Izaberite račun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.account_name} — {acc.available_balance} {acc.currency_code}
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
            <Label htmlFor="to_account_number">Odredišni račun</Label>
            <Controller
              name="to_account_number"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-label="Odredišni račun">
                    <SelectValue placeholder="Izaberite račun" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.account_name} — {acc.available_balance} {acc.currency_code}
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
            <Label htmlFor="amount">Iznos</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              aria-label="Iznos"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <Button type="submit" className="w-full">
            Uradi transfer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
