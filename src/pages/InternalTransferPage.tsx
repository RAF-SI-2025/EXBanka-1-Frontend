import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useExecuteTransfer } from '@/hooks/useTransfers'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  setVerificationError,
  resetPaymentFlow,
} from '@/store/slices/paymentSlice'
import { Button } from '@/components/ui/button'
import { InternalTransferForm } from '@/components/payments/InternalTransferForm'
import { TransferConfirmation } from '@/components/payments/TransferConfirmation'
import { VerificationStep } from '@/components/verification/VerificationStep'
import { createInternalTransferSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof createInternalTransferSchema>

export function InternalTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    step,
    submitting,
    error,
    result,
    formData,
    transactionId,
    codeRequested,
    verificationError,
  } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const executeTransfer = useExecuteTransfer()

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Transfer successful!</h2>
        <p>Transaction ID: {result.id}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>History</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            New Transfer
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'verification' && transactionId !== null) {
    return (
      <VerificationStep
        codeRequested={codeRequested}
        loading={executeTransfer.isPending}
        error={verificationError}
        onRequestCode={() => {}}
        onVerified={(code) => {
          executeTransfer.mutate(
            { id: transactionId, verificationCode: code },
            {
              onSuccess: () => dispatch(setPaymentStep('success')),
              onError: () =>
                dispatch(setVerificationError('Transfer execution failed. Please try again.')),
            }
          )
        }}
        onBack={() => dispatch(setPaymentStep('confirmation'))}
      />
    )
  }

  if (step === 'confirmation' && formData) {
    const data = formData as FormValues
    const fromAccount = accounts.find((a) => a.account_number === data.from_account_number)
    const currency = fromAccount?.currency_code ?? 'RSD'
    return (
      <TransferConfirmation
        formData={data}
        currency={currency}
        submitting={submitting}
        error={error}
        onConfirm={() => dispatch(submitPayment({ type: 'internal', data: formData! }))}
        onBack={() => dispatch(setPaymentStep('form'))}
      />
    )
  }

  const onSubmit = (data: FormValues) => {
    dispatch(setPaymentFormData(data))
    dispatch(setPaymentStep('confirmation'))
  }

  return <InternalTransferForm accounts={accounts} onSubmit={onSubmit} />
}
