import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { createLoanRequestSchema } from '@/lib/utils/validation'
import { LOAN_PERIODS_BY_TYPE } from '@/lib/constants/banking'
import type { Account } from '@/types/account'
import type { CreateLoanRequest } from '@/types/loan'

export type LoanFormValues = z.infer<typeof createLoanRequestSchema>

export function useLoanApplicationForm(
  accounts: Account[],
  onSubmit: (data: CreateLoanRequest) => void
) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(createLoanRequestSchema),
  })

  const watchedLoanType = watch('loan_type')
  const periodOptions = LOAN_PERIODS_BY_TYPE[watchedLoanType] ?? LOAN_PERIODS_BY_TYPE.CASH

  function handleAccountChange(accountNumber: string | null) {
    if (!accountNumber) return
    const acc = accounts.find((a) => a.account_number === accountNumber)
    if (acc) setValue('currency_code', acc.currency_code)
  }

  const submitForm = handleSubmit((data) => onSubmit(data))

  return { register, control, errors, periodOptions, handleAccountChange, submitForm }
}
