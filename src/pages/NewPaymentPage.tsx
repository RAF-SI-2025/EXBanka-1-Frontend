import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePaymentRecipients } from '@/hooks/usePayments'
import {
  submitPayment,
  setPaymentStep,
  setPaymentFormData,
  resetPaymentFlow,
} from '@/store/slices/paymentSlice'
import { Button } from '@/components/ui/button'
import { NewPaymentForm } from '@/components/payments/NewPaymentForm'
import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation'
import type { CreatePaymentRequest } from '@/types/payment'

export function NewPaymentPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result, formData } = useAppSelector((s) => s.payment)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const { data: recipients } = usePaymentRecipients()

  useEffect(() => {
    return () => {
      dispatch(resetPaymentFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Uplata uspešna!</h2>
        <p>Broj naloga: {result.order_number}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/payments/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetPaymentFlow())}>
            Nova uplata
          </Button>
        </div>
      </div>
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
