import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePaymentRecipients } from '@/hooks/usePayments'
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
import { NewPaymentForm } from '@/components/payments/NewPaymentForm'
import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation'
import { VerificationStep } from '@/components/verification/VerificationStep'
import type { CreatePaymentRequest } from '@/types/payment'

export function NewPaymentPage() {
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
  const { data: recipients } = usePaymentRecipients()
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
        <h2 className="text-xl font-semibold">Uplata uspešna!</h2>
        <p>ID transakcije: {result.id}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Nova uplata
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
            { client_id: clientId, transaction_id: transactionId, transaction_type: 'PAYMENT' },
            { onSuccess: () => dispatch(setCodeRequested(true)) }
          )
        }}
        onVerified={(code) => {
          validateVerification.mutate(
            {
              client_id: clientId,
              transaction_id: transactionId,
              transaction_type: 'payment',
              code,
            },
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
    return (
      <PaymentConfirmation
        formData={formData as CreatePaymentRequest}
        onConfirm={() => dispatch(submitPayment({ type: 'payment', data: formData! }))}
        onBack={() => dispatch(setPaymentStep('form'))}
        submitting={submitting}
        error={error}
      />
    )
  }

  const onSubmit = (data: CreatePaymentRequest) => {
    dispatch(setPaymentFormData(data))
    dispatch(setPaymentStep('confirmation'))
  }

  return <NewPaymentForm accounts={accounts} recipients={recipients} onSubmit={onSubmit} />
}
