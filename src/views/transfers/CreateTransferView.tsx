import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useExecuteTransfer, useTransferPreview } from '@/hooks/useTransfers'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import {
  resetTransferFlow,
  setChallengeId,
  setTransferFormData,
  setTransferStep,
  setVerificationError,
  submitTransfer,
} from '@/store/slices/transferSlice'
import { createChallenge, submitVerificationCode } from '@/lib/api/verification'
import { VerificationStep } from '@/views/auth/verification/VerificationStep'
import { CreateTransferForm } from '@/views/transfers/components/CreateTransferForm'
import { TransferPreview } from '@/views/transfers/components/TransferPreview'
import { LoadingState, ViewShell } from '@/views/shared'

export function CreateTransferView() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const {
    step,
    formData,
    submitting,
    result,
    transactionId,
    challengeId,
    codeRequested,
    verificationError,
  } = useAppSelector((s) => s.transfer)
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const fromAcc = accounts.find((a) => a.account_number === formData?.from_account_number)
  const toAcc = accounts.find((a) => a.account_number === formData?.to_account_number)

  const { data: previewData } = useTransferPreview(formData ?? null)

  const executeTransfer = useExecuteTransfer()
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(resetTransferFlow())
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
          dispatch(setTransferStep('success'))
        },
        onError: () => {
          setVerifying(false)
          dispatch(setVerificationError('Transfer execution failed. Please try again.'))
        },
      }
    )
  }, [transactionId, challengeId, executeTransfer, dispatch])

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }

  const handleFormSubmit = (data: {
    from_account_number: string
    to_account_number: string
    amount: number
  }) => {
    dispatch(setTransferFormData(data))
    dispatch(setTransferStep('confirmation'))
  }

  const handleConfirm = () => {
    if (!formData) return
    dispatch(
      submitTransfer({
        from_account_number: formData.from_account_number,
        to_account_number: formData.to_account_number,
        amount: formData.amount,
      })
    )
  }

  if (step === 'success' && result) {
    return (
      <ViewShell title="Transfer successful!">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <p>Transaction ID: {result.id}</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate('/transfers/history')}>History</Button>
              <Button variant="outline" onClick={() => dispatch(resetTransferFlow())}>
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
          onBack={() => dispatch(setTransferStep('confirmation'))}
        />
      </ViewShell>
    )
  }

  if (step === 'confirmation' && formData) {
    return (
      <ViewShell title="Confirm transfer">
        <TransferPreview
          clientName={user?.email ?? ''}
          fromAccount={formData.from_account_number}
          toAccount={formData.to_account_number}
          amount={formData.amount}
          fromCurrency={previewData?.from_currency ?? fromAcc?.currency_code ?? ''}
          toCurrency={previewData?.to_currency ?? toAcc?.currency_code ?? ''}
          rate={Number(previewData?.exchange_rate ?? 1)}
          commission={Number(previewData?.total_fee ?? 0)}
          finalAmount={Number(previewData?.converted_amount ?? formData.amount)}
          onConfirm={handleConfirm}
          onBack={() => dispatch(setTransferStep('form'))}
          submitting={submitting}
        />
      </ViewShell>
    )
  }

  return (
    <ViewShell title="New Transfer" subtitle="Move funds between two of your accounts.">
      <Card>
        <CardContent className="pt-6">
          <CreateTransferForm accounts={accounts} onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
