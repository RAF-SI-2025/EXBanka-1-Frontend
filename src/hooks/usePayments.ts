import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPayments,
  getPaymentRecipients,
  createPaymentRecipient,
  updatePaymentRecipient,
  deletePaymentRecipient,
} from '@/lib/api/payments'
import type { PaymentFilters, CreatePaymentRecipientRequest } from '@/types/payment'

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPayments(filters),
  })
}

export function usePaymentRecipients() {
  return useQuery({
    queryKey: ['payment-recipients'],
    queryFn: getPaymentRecipients,
  })
}

export function useCreatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePaymentRecipientRequest) => createPaymentRecipient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useUpdatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<CreatePaymentRecipientRequest>) =>
      updatePaymentRecipient(id, payload),
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
