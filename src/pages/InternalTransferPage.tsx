import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useGenerateVerification, useValidateVerification } from '@/hooks/useVerification'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  setCodeRequested,
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
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const generateVerification = useGenerateVerification()
  const validateVerification = useValidateVerification()

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Prenos uspešan!</h2>
        <p>ID transakcije: {result.id}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Novi prenos
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'verification' && transactionId !== null) {
    const clientId = currentUser?.id ?? 0
    return (
      <VerificationStep
        codeRequested={codeRequested}
        loading={generateVerification.isPending || validateVerification.isPending}
        error={verificationError}
        onRequestCode={() => {
          generateVerification.mutate(
            { client_id: clientId, transaction_id: transactionId, transaction_type: 'TRANSFER' },
            { onSuccess: () => dispatch(setCodeRequested(true)) }
          )
        }}
        onVerified={(code) => {
          validateVerification.mutate(
            { client_id: clientId, transaction_id: transactionId, code },
            {
              onSuccess: (res) => {
                if (res.valid) {
                  dispatch(setPaymentStep('success'))
                } else {
                  dispatch(setVerificationError('Neispravan kod'))
                }
              },
              onError: () => dispatch(setVerificationError('Greška pri verifikaciji')),
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
