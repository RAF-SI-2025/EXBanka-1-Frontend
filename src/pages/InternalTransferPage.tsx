import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  resetPaymentFlow,
} from '@/store/slices/paymentSlice'
import { Button } from '@/components/ui/button'
import { InternalTransferForm } from '@/components/payments/InternalTransferForm'
import { TransferConfirmation } from '@/components/payments/TransferConfirmation'
import { createInternalTransferSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof createInternalTransferSchema>

export function InternalTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result, formData } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Prenos uspešan!</h2>
        <p>Broj naloga: {result.order_number}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Novi prenos
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'confirmation' && formData) {
    const data = formData as FormValues
    return (
      <TransferConfirmation
        formData={data}
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
