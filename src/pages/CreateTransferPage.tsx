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

  const fromAcc = accounts.find((a) => a.account_number === formData?.from_account)
  const toAcc = accounts.find((a) => a.account_number === formData?.to_account)

  const { data: rateData } = useTransferPreview(
    fromAcc?.currency ?? '',
    toAcc?.currency ?? '',
    formData?.amount ?? 0
  )

  useEffect(() => {
    return () => {
      dispatch(resetTransferFlow())
    }
  }, [dispatch])

  if (isLoading) return <p>Učitavanje...</p>

  const handleFormSubmit = (data: { from_account: string; to_account: string; amount: number }) => {
    dispatch(setTransferFormData(data))
    dispatch(setTransferStep('confirmation'))
  }

  const handleConfirm = () => {
    if (!formData) return
    dispatch(
      submitTransfer({
        from_account: formData.from_account,
        to_account: formData.to_account,
        amount: formData.amount,
      })
    )
  }

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Transfer uspešan!</h2>
        <p>Broj naloga: {result.order_number}</p>
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
        fromAccount={formData.from_account}
        toAccount={formData.to_account}
        amount={formData.amount}
        fromCurrency={fromAcc?.currency ?? ''}
        toCurrency={toAcc?.currency ?? ''}
        rate={rateData?.rate ?? 0}
        commission={rateData?.commission ?? 0}
        finalAmount={rateData?.to_amount ?? 0}
        onConfirm={handleConfirm}
        onBack={() => dispatch(setTransferStep('form'))}
        submitting={submitting}
      />
    )
  }

  return <CreateTransferForm accounts={accounts} onSubmit={handleFormSubmit} />
}
