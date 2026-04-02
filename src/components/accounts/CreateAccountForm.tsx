import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const PERSONAL_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'savings', label: 'Savings' },
  { value: 'pension', label: 'Pension' },
  { value: 'youth', label: 'Youth' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
]

const COMPANY_TYPE_OPTIONS = [
  { value: 'doo', label: 'DOO' },
  { value: 'ad', label: 'AD' },
  { value: 'foundation', label: 'Foundation' },
]

const ACCOUNT_CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Company' },
] as const

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const navigate = useNavigate()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isForeign, setIsForeign] = useState(false)
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
      account_kind: 'current' as const,
      account_type: 'standard',
      account_category: 'personal' as const,
      currency_code: 'RSD',
      initial_balance: 0,
      create_card: false,
      card_brand: undefined as 'visa' | 'mastercard' | 'dinacard' | undefined,
    },
  })

  const accountType = watch('account_type')
  const accountCategory = watch('account_category')
  const createCard = watch('create_card')

  const typeOptions = accountCategory === 'business' ? COMPANY_TYPE_OPTIONS : PERSONAL_TYPE_OPTIONS

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client)
    setValue('owner_id', client?.id ?? 0)
  }

  const handleAccountTypeChange = (v: string | null) => {
    if (v === 'foreign') {
      setIsForeign(true)
      setValue('account_kind', 'foreign')
      setValue('currency_code', 'EUR')
    } else {
      setIsForeign(false)
      setValue('account_kind', 'current')
      setValue('currency_code', 'RSD')
    }
  }

  const handleCategoryChange = (v: 'personal' | 'business' | null) => {
    const cat = v ?? 'personal'
    setValue('account_category', cat)
    setValue('account_type', cat === 'business' ? 'doo' : 'standard')
  }

  const onSubmit = (data: CreateAccountRequest) => {
    createAccount.mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account_type_ui">Account Type</Label>
          <Select value={isForeign ? 'foreign' : 'current'} onValueChange={handleAccountTypeChange}>
            <SelectTrigger id="account_type_ui" aria-label="Account Type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="foreign">Foreign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="account_category">Account Category</Label>
          <Select value={accountCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger id="account_category" aria-label="Account Category">
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
      </div>

      <div className={isForeign ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <Label htmlFor="account_type">Account Kind</Label>
          <Select
            value={accountType}
            onValueChange={(v) => setValue('account_type', v ?? 'standard')}
          >
            <SelectTrigger id="account_type" aria-label="Account Kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isForeign && (
          <div>
            <Label htmlFor="currency_code">Currency</Label>
            <Select
              value={watch('currency_code')}
              onValueChange={(v) => setValue('currency_code', v ?? '')}
            >
              <SelectTrigger id="currency_code" aria-label="Currency">
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
      </div>

      <div>
        <Label>Owner (Client)</Label>
        <ClientSelector
          onClientSelected={handleClientSelected}
          selectedClient={selectedClient}
          onCreateNew={() => navigate('/admin/clients/new')}
        />
        {errors.owner_id && (
          <p className="text-sm text-destructive mt-1">{errors.owner_id.message}</p>
        )}
      </div>

      {accountCategory === 'business' && <CompanyForm register={register} errors={errors} />}

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
          <Label>Card Brand</Label>
          <Select
            value={watch('card_brand') ?? ''}
            onValueChange={(v) =>
              setValue('card_brand', v as 'visa' | 'mastercard' | 'dinacard' | undefined)
            }
          >
            <SelectTrigger aria-label="Card Brand">
              <SelectValue placeholder="Select card brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">MasterCard</SelectItem>
              <SelectItem value="dinacard">DinaCard</SelectItem>
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
