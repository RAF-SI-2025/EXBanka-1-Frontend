import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
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
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { CompanyForm } from '@/components/accounts/CompanyForm'
import { useCreateAccount } from '@/hooks/useAccounts'
import { createAccountSchema } from '@/lib/utils/validation'
import { FOREIGN_CURRENCIES } from '@/lib/constants/banking'
import type { Client } from '@/types/client'
import type { CreateAccountRequest } from '@/types/account'

interface CreateAccountFormProps {
  onSuccess: () => void
}

const ACCOUNT_KIND_OPTIONS = [
  { value: 'checking', label: 'Tekući (Checking)' },
  { value: 'savings', label: 'Štedni (Savings)' },
  { value: 'foreign', label: 'Devizni (Foreign Currency)' },
  { value: 'business', label: 'Poslovni (Business)' },
] as const

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CURRENT', label: 'Transakcioni (Current)' },
  { value: 'TERM', label: 'Oročeni (Term)' },
] as const

const ACCOUNT_CATEGORY_OPTIONS = [
  { value: 'PERSONAL', label: 'Lični (Personal)' },
  { value: 'COMPANY', label: 'Poslovni (Company)' },
] as const

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const createAccount = useCreateAccount()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      owner_id: 0,
      account_kind: 'checking' as const,
      account_type: 'CURRENT' as const,
      account_category: 'PERSONAL' as const,
      currency_code: 'RSD',
      initial_balance: 0,
      create_card: false,
      card_brand: undefined as 'VISA' | 'MASTERCARD' | 'DINA' | undefined,
    },
  })

  const accountKind = watch('account_kind')
  const accountCategory = watch('account_category')
  const createCard = watch('create_card')

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client)
    setValue('owner_id', client?.id ?? 0)
  }

  const onSubmit = (data: CreateAccountRequest) => {
    createAccount.mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account_kind">Account Type</Label>
          <Select
            value={accountKind}
            onValueChange={(v) => {
              setValue(
                'account_kind',
                (v ?? 'checking') as 'checking' | 'savings' | 'foreign' | 'business'
              )
              if (v !== 'foreign') setValue('currency_code', 'RSD')
            }}
          >
            <SelectTrigger id="account_kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_KIND_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="account_type">Term Type</Label>
          <Select
            value={watch('account_type')}
            onValueChange={(v) => setValue('account_type', (v ?? 'CURRENT') as 'CURRENT' | 'TERM')}
          >
            <SelectTrigger id="account_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="account_category">Owner Type</Label>
        <Select
          value={accountCategory}
          onValueChange={(v) =>
            setValue('account_category', (v ?? 'PERSONAL') as 'PERSONAL' | 'COMPANY')
          }
        >
          <SelectTrigger id="account_category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {accountKind === 'foreign' && (
        <div>
          <Label htmlFor="currency_code">Currency</Label>
          <Select
            value={watch('currency_code')}
            onValueChange={(v) => setValue('currency_code', v ?? '')}
          >
            <SelectTrigger id="currency_code">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOREIGN_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Owner (Client)</Label>
        <ClientSelector
          onClientSelected={handleClientSelected}
          selectedClient={selectedClient}
          onCreateNew={() => window.open('/admin/clients/new', '_blank')}
        />
        {errors.owner_id && (
          <p className="text-sm text-destructive mt-1">{errors.owner_id.message}</p>
        )}
      </div>

      {accountCategory === 'COMPANY' && <CompanyForm register={register} errors={errors} />}

      <div>
        <Label htmlFor="initial_balance">Initial Balance</Label>
        <Input
          id="initial_balance"
          type="number"
          {...register('initial_balance', { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="create_card" {...register('create_card')} />
        <Label htmlFor="create_card">Create Card</Label>
      </div>

      {createCard && (
        <div>
          <Label>Tip kartice</Label>
          <Select
            value={watch('card_brand') ?? ''}
            onValueChange={(v) =>
              setValue('card_brand', v as 'VISA' | 'MASTERCARD' | 'DINA' | undefined)
            }
          >
            <SelectTrigger aria-label="Tip kartice">
              <SelectValue placeholder="Izaberite tip kartice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VISA">Visa</SelectItem>
              <SelectItem value="MASTERCARD">MasterCard</SelectItem>
              <SelectItem value="DINA">DinaCard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={createAccount.isPending}>
        {createAccount.isPending ? 'Creating...' : 'Create Account'}
      </Button>

      {createAccount.isError && (
        <p className="text-sm text-destructive">Failed to create account. Please try again.</p>
      )}
    </form>
  )
}
