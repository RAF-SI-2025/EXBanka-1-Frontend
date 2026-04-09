import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import {
  usePaymentRecipients,
  useCreatePaymentRecipient,
  useExecutePayment,
} from '@/hooks/usePayments'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  setChallengeId,
  setVerificationError,
  resetPaymentFlow,
} from '@/store/slices/paymentSlice'
import { createChallenge, submitVerificationCode } from '@/lib/api/verification'
import { Button } from '@/components/ui/button'
import { NewPaymentForm } from '@/components/payments/NewPaymentForm'
import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation'
import { VerificationStep } from '@/components/verification/VerificationStep'
import type { CreatePaymentRequest } from '@/types/payment'

function AddRecipientPrompt({
  recipientName,
  accountNumber,
}: {
  recipientName: string
  accountNumber: string
}) {
  const createRecipient = useCreatePaymentRecipient()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  if (saved) return <p className="text-sm text-muted-foreground">Recipient saved.</p>

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <p className="text-sm">Would you like to save &quot;{recipientName}&quot; as a recipient?</p>
      {saveError && <p className="text-sm text-destructive">Failed to save. Please try again.</p>}
      <Button
        size="sm"
        disabled={createRecipient.isPending}
        onClick={() =>
          createRecipient.mutate(
            { recipient_name: recipientName, account_number: accountNumber },
            {
              onSuccess: () => setSaved(true),
              onError: () => setSaveError(true),
            }
          )
        }
      >
        {createRecipient.isPending ? 'Saving...' : 'Save Recipient'}
      </Button>
    </div>
  )
}

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
    challengeId,
    codeRequested,
    verificationError,
  } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const { data: recipients } = usePaymentRecipients()
  const executePayment = useExecutePayment()
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  useEffect(() => {
    if (step === 'verification' && transactionId !== null && challengeId === null) {
      createChallenge({
        source_service: 'payment',
        source_id: transactionId,
        method: 'code_pull',
      })
        .then((res) => {
          dispatch(setChallengeId(res.challenge_id))
        })
        .catch(() => {
          dispatch(setVerificationError('Failed to create verification challenge.'))
        })
    }
  }, [step, transactionId, challengeId, dispatch])

  const handleExecute = useCallback(() => {
    if (transactionId === null || challengeId === null) return
    setVerifying(true)
    dispatch(setVerificationError(null))
    executePayment.mutate(
      { id: transactionId, challengeId },
      {
        onSuccess: () => {
          setVerifying(false)
          dispatch(setPaymentStep('success'))
        },
        onError: () => {
          setVerifying(false)
          dispatch(setVerificationError('Payment execution failed. Please try again.'))
        },
      }
    )
  }, [transactionId, challengeId, executePayment, dispatch])

  if (step === 'success' && result) {
    const paymentFormData = formData as CreatePaymentRequest | null
    const recipientExists = recipients?.some(
      (r) => r.account_number === paymentFormData?.to_account_number
    )

    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Payment successful!</h2>
        <p>Transaction ID: {result.id}</p>

        {!recipientExists && paymentFormData && (
          <AddRecipientPrompt
            recipientName={paymentFormData.recipient_name}
            accountNumber={paymentFormData.to_account_number}
          />
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>History</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            New Payment
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'verification' && transactionId !== null) {
    return (
      <VerificationStep
        challengeId={challengeId}
        codeRequested={codeRequested && challengeId !== null}
        loading={verifying || executePayment.isPending}
        error={verificationError}
        onStatusVerified={handleExecute}
        onVerified={async (code) => {
          if (challengeId === null) return
          setVerifying(true)
          dispatch(setVerificationError(null))
          try {
            const submitResult = await submitVerificationCode(challengeId, code)
            if (!submitResult.success) {
              dispatch(
                setVerificationError(
                  `Invalid code. ${submitResult.remaining_attempts} attempts remaining.`
                )
              )
              setVerifying(false)
              return
            }
            handleExecute()
          } catch {
            setVerifying(false)
            dispatch(setVerificationError('Verification failed. Please try again.'))
          }
        }}
        onBack={() => dispatch(setPaymentStep('confirmation'))}
      />
    )
  }

  if (step === 'confirmation' && formData) {
    const selectedAccount = accounts.find(
      (a) => a.account_number === (formData as CreatePaymentRequest).from_account_number
    )
    return (
      <PaymentConfirmation
        formData={formData as CreatePaymentRequest}
        currency={selectedAccount?.currency_code ?? 'RSD'}
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
