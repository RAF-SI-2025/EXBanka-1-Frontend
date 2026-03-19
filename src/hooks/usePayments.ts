import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPayments,
  getPaymentRecipients,
  createPaymentRecipient,
  updatePaymentRecipient,
  deletePaymentRecipient,
} from '@/lib/api/payments'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type { PaymentFilters, CreatePaymentRecipientRequest } from '@/types/payment'

export function usePayments(accountNumber: string | undefined, filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', accountNumber, filters],
    queryFn: () => getPayments(accountNumber!, filters),
    enabled: !!accountNumber,
  })
}

export function usePaymentRecipients() {
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useQuery({
    queryKey: ['payment-recipients', clientId],
    queryFn: () => getPaymentRecipients(clientId),
    enabled: clientId > 0,
  })
}

export function useCreatePaymentRecipient() {
  const queryClient = useQueryClient()
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useMutation({
    mutationFn: (payload: Omit<CreatePaymentRecipientRequest, 'client_id'>) =>
      createPaymentRecipient({ ...payload, client_id: clientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useUpdatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: number } & Partial<
      Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>
    >) => updatePaymentRecipient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useDeletePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePaymentRecipient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}
