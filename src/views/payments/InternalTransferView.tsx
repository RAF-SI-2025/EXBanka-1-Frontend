import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useExecuteTransfer } from '@/hooks/useTransfers'
import {
  resetPaymentFlow,
  setChallengeId,
  setPaymentFormData,
  setPaymentStep,
  setVerificationError,
  submitPayment,
} from '@/store/slices/paymentSlice'
import { createChallenge, submitVerificationCode } from '@/lib/api/verification'
import { VerificationStep } from '@/views/auth/verification/VerificationStep'
import { createInternalTransferSchema } from '@/lib/utils/validation'
import type { z } from 'zod'
import { InternalTransferForm } from '@/views/payments/components/InternalTransferForm'
import { TransferConfirmation } from '@/views/payments/components/TransferConfirmation'
import { ViewShell } from '@/views/shared'

type FormValues = z.infer<typeof createInternalTransferSchema>

export function InternalTransferView() {
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
  const executeTransfer = useExecuteTransfer()
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  useEffect(() => {
    if (step === 'verification' && transactionId !== null && challengeId === null) {
      createChallenge({
        source_service: 'transfer',
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
    executeTransfer.mutate(
      { id: transactionId, challengeId },
      {
        onSuccess: () => {
          setVerifying(false)
          dispatch(setPaymentStep('success'))
        },
        onError: () => {
          setVerifying(false)
          dispatch(setVerificationError('Transfer execution failed. Please try again.'))
        },
      }
    )
  }, [transactionId, challengeId, executeTransfer, dispatch])

  if (step === 'success' && result) {
    return (
      <ViewShell title="Transfer successful">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <p>Transaction ID: {result.id}</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate('/transfers/history')}>History</Button>
              <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
                New Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </ViewShell>
    )
  }

  if (step === 'verification' && transactionId !== null) {
    return (
      <ViewShell title="Verify transfer">
        <VerificationStep
          challengeId={challengeId}
          codeRequested={codeRequested && challengeId !== null}
          loading={verifying || executeTransfer.isPending}
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
      </ViewShell>
    )
  }

  if (step === 'confirmation' && formData) {
    const data = formData as FormValues
    const fromAccount = accounts.find((a) => a.account_number === data.from_account_number)
    const currency = fromAccount?.currency_code ?? 'RSD'
    return (
      <ViewShell title="Confirm transfer">
        <TransferConfirmation
          formData={data}
          currency={currency}
          submitting={submitting}
          error={error}
          onConfirm={() => dispatch(submitPayment({ type: 'internal', data: formData! }))}
          onBack={() => dispatch(setPaymentStep('form'))}
        />
      </ViewShell>
    )
  }

  const onSubmit = (data: FormValues) => {
    dispatch(setPaymentFormData(data))
    dispatch(setPaymentStep('confirmation'))
  }

  return (
    <ViewShell title="Internal Transfer" subtitle="Move funds to another EXBanka client.">
      <Card>
        <CardContent className="pt-6">
          <InternalTransferForm accounts={accounts} onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
