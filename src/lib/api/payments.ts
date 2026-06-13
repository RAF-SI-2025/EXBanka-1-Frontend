import { apiClient } from '@/lib/api/axios'
import type {
  Payment,
  PaymentListResponse,
  PaymentFilters,
  CreatePaymentRequest,
  PaymentRecipient,
  CreatePaymentRecipientRequest,
} from '@/types/payment'

export async function createPayment(payload: CreatePaymentRequest): Promise<Payment> {
  const response = await apiClient.post<Payment>('/me/payments', payload)
  return response.data
}

export async function executePayment(id: number, challengeId: number): Promise<Payment> {
  const response = await apiClient.post<Payment>(`/me/payments/${id}/execute`, {
    challenge_id: challengeId,
  })
  return response.data
}

export async function getPayments(filters?: PaymentFilters): Promise<PaymentListResponse> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.status_filter) params.append('status_filter', filters.status_filter)
  if (filters?.amount_min) params.append('amount_min', String(filters.amount_min))
  if (filters?.amount_max) params.append('amount_max', String(filters.amount_max))
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<PaymentListResponse>('/me/payments', { params })
  return response.data
}

export async function getPaymentRecipients(): Promise<PaymentRecipient[]> {
  const response = await apiClient.get<{ recipients: PaymentRecipient[] }>('/me/payment-recipients')
  return response.data.recipients
}

export async function createPaymentRecipient(
  payload: Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>
): Promise<PaymentRecipient> {
  const response = await apiClient.post<PaymentRecipient>('/me/payment-recipients', payload)
  return response.data
}

export async function updatePaymentRecipient(
  id: number,
  payload: Partial<Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>>
): Promise<PaymentRecipient> {
  const response = await apiClient.put<PaymentRecipient>(`/me/payment-recipients/${id}`, payload)
  return response.data
}

export async function deletePaymentRecipient(id: number): Promise<void> {
  await apiClient.delete(`/me/payment-recipients/${id}`)
}
