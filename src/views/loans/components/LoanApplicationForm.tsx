import { Controller } from 'react-hook-form'
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
import { useLoanApplicationForm } from '@/hooks/useLoanApplicationForm'
import { LOAN_TYPES, INTEREST_TYPES, EMPLOYMENT_STATUSES } from '@/lib/constants/banking'
import type { Account } from '@/types/account'
import type { CreateLoanRequest } from '@/types/loan'

interface LoanApplicationFormProps {
  accounts: Account[]
  onSubmit: (data: Omit<CreateLoanRequest, 'client_id'>) => void
  submitting: boolean
  error: string | null
}

export function LoanApplicationForm({
  accounts,
  onSubmit,
  submitting,
  error,
}: LoanApplicationFormProps) {
  const { register, control, errors, periodOptions, handleAccountChange, submitForm } =
    useLoanApplicationForm(accounts, onSubmit)

  return (
    <form onSubmit={submitForm} className="space-y-4">
      <div>
        <Label>Loan Type</Label>
        <Controller
          name="loan_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger aria-label="Loan Type">
                <SelectValue placeholder="Select type" />
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
        {errors.loan_type && <p className="text-sm text-destructive">{errors.loan_type.message}</p>}
      </div>

      <div>
        <Label>Interest Rate Type</Label>
        <Controller
          name="interest_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select interest type" />
              </SelectTrigger>
              <SelectContent>
                {INTEREST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.interest_type && (
          <p className="text-sm text-destructive">{errors.interest_type.message}</p>
        )}
      </div>

      <div>
        <Label>Disbursement Account</Label>
        <Controller
          name="account_number"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => {
                handleAccountChange(v)
                field.onChange(v)
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.account_number} value={acc.account_number}>
                    {acc.account_name} ({acc.currency_code})
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

      <input type="hidden" {...register('currency_code')} />

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div>
        <Label>Period (months)</Label>
        <Controller
          name="repayment_period"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => field.onChange(Number(v))}
              value={field.value ? String(field.value) : ''}
            >
              <SelectTrigger aria-label="Repayment Period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.repayment_period && (
          <p className="text-sm text-destructive">{errors.repayment_period.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="purpose">Loan Purpose</Label>
        <Input id="purpose" {...register('purpose')} />
      </div>

      <div>
        <Label htmlFor="monthly_salary">Monthly Salary</Label>
        <Input
          id="monthly_salary"
          type="number"
          {...register('monthly_salary', { valueAsNumber: true })}
        />
        {errors.monthly_salary && (
          <p className="text-sm text-destructive">{errors.monthly_salary.message}</p>
        )}
      </div>

      <div>
        <Label>Employment Status</Label>
        <Controller
          name="employment_status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="employment_period">Employment Period (years)</Label>
        <Input
          id="employment_period"
          type="number"
          {...register('employment_period', { valueAsNumber: true })}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  )
}
