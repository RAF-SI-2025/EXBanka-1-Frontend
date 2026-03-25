import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useTransferPreview } from '@/hooks/useTransfers'
import { useGenerateVerification, useValidateVerification } from '@/hooks/useVerification'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import {
  setTransferStep,
  setTransferFormData,
  resetTransferFlow,
  submitTransfer,
  setCodeRequested,
  setVerificationError,
} from '@/store/slices/transferSlice'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'
import { TransferPreview } from '@/components/transfers/TransferPreview'
import { VerificationStep } from '@/components/verification/VerificationStep'
import { Button } from '@/components/ui/button'

export function CreateTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const { step, formData, submitting, result, transactionId, codeRequested, verificationError } =
    useAppSelector((s) => s.transfer)
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const fromAcc = accounts.find((a) => a.account_number === formData?.from_account_number)
  const toAcc = accounts.find((a) => a.account_number === formData?.to_account_number)
  const sameCurrency = fromAcc?.currency_code === toAcc?.currency_code

  const { data: rateData } = useTransferPreview(
    fromAcc?.currency_code ?? '',
    toAcc?.currency_code ?? '',
    formData?.amount ?? 0
  )

  const generateVerification = useGenerateVerification()
  const validateVerification = useValidateVerification()

  useEffect(() => {
    return () => {
      dispatch(resetTransferFlow())
    }
  }, [dispatch])

  if (isLoading) return <p>Loading...</p>

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
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Transfer successful!</h2>
        <p>Transaction ID: {result.id}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/transfers/history')}>History</Button>
          <Button variant="outline" onClick={() => dispatch(resetTransferFlow())}>
            New Transfer
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'verification' && transactionId !== null && user !== null) {
    const clientId = user.id
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
            {
              client_id: clientId,
              transaction_id: transactionId,
              transaction_type: 'transfer',
              code,
            },
            {
              onSuccess: (res) => {
                if (res.valid) dispatch(setTransferStep('success'))
                else dispatch(setVerificationError('Invalid verification code'))
              },
              onError: () => dispatch(setVerificationError('Verification failed')),
            }
          )
        }}
        onBack={() => dispatch(setTransferStep('confirmation'))}
      />
    )
  }

  if (step === 'confirmation' && formData) {
    return (
      <TransferPreview
        clientName={user?.email ?? ''}
        fromAccount={formData.from_account_number}
        toAccount={formData.to_account_number}
        amount={formData.amount}
        fromCurrency={fromAcc?.currency_code ?? ''}
        toCurrency={toAcc?.currency_code ?? ''}
        rate={sameCurrency ? 1 : Number(rateData?.buy_rate ?? 0)}
        commission={0}
        finalAmount={
          sameCurrency ? formData.amount : (formData.amount ?? 0) * Number(rateData?.buy_rate ?? 0)
        }
        onConfirm={handleConfirm}
        onBack={() => dispatch(setTransferStep('form'))}
        submitting={submitting}
      />
    )
  }

  return <CreateTransferForm accounts={accounts} onSubmit={handleFormSubmit} />
}
