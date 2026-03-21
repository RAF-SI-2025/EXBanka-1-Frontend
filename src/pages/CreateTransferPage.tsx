import { useEffect } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useTransferPreview } from '@/hooks/useTransfers'
import {
  setTransferStep,
  setTransferFormData,
  resetTransferFlow,
  submitTransfer,
} from '@/store/slices/transferSlice'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'
import { TransferPreview } from '@/components/transfers/TransferPreview'
import { Button } from '@/components/ui/button'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useNavigate } from 'react-router-dom'

export function CreateTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const { step, formData, submitting, result } = useAppSelector((s) => s.transfer)
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const fromAcc = accounts.find((a) => a.account_number === formData?.from_account_number)
  const toAcc = accounts.find((a) => a.account_number === formData?.to_account_number)

  const { data: rateData } = useTransferPreview(
    fromAcc?.currency_code ?? '',
    toAcc?.currency_code ?? '',
    formData?.amount ?? 0
  )

  useEffect(() => {
    return () => {
      dispatch(resetTransferFlow())
    }
  }, [dispatch])

  if (isLoading) return <p>Učitavanje...</p>

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
        <h2 className="text-xl font-semibold">Transfer uspešan!</h2>
        <p>ID transakcije: {result.id}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/transfers/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetTransferFlow())}>
            Novi transfer
          </Button>
        </div>
      </div>
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
        rate={Number(rateData?.buy_rate ?? 0)}
        commission={0}
        finalAmount={(formData?.amount ?? 0) * Number(rateData?.buy_rate ?? 0)}
        onConfirm={handleConfirm}
        onBack={() => dispatch(setTransferStep('form'))}
        submitting={submitting}
      />
    )
  }

  return <CreateTransferForm accounts={accounts} onSubmit={handleFormSubmit} />
}
