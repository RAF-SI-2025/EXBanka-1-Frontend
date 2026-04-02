import type { UseFormSetValue } from 'react-hook-form'
import type { PaymentRecipient } from '@/types/payment'
import type { z } from 'zod'
import type { createPaymentSchema } from '@/lib/utils/validation'

type FormValues = z.infer<typeof createPaymentSchema>

export function useRecipientAutofill(
  recipients: PaymentRecipient[] | undefined,
  setValue: UseFormSetValue<FormValues>
) {
  const handleRecipientSelect = (id: string | null) => {
    if (!id) return
    const r = recipients?.find((rec) => String(rec.id) === id)
    if (r) {
      setValue('to_account_number', r.account_number)
      setValue('recipient_name', r.recipient_name)
    }
  }

  return { handleRecipientSelect }
}
