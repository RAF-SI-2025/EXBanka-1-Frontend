import { apiClient } from '@/lib/api/axios'
import type {
  Payment,
  PaymentListResponse,
  PaymentFilters,
  CreatePaymentRequest,
  CreateInternalTransferRequest,
  PaymentRecipient,
  CreatePaymentRecipientRequest,
} from '@/types/payment'

export async function createPayment(payload: CreatePaymentRequest): Promise<Payment> {
  const response = await apiClient.post<Payment>('/api/payments', payload)
  return response.data
}

export async function createInternalTransfer(
  payload: CreateInternalTransferRequest
): Promise<Payment> {
  const response = await apiClient.post<Payment>('/api/payments/internal', payload)
  return response.data
}

export async function getPayments(filters?: PaymentFilters): Promise<PaymentListResponse> {
  const params = new URLSearchParams()
  if (filters?.account_number) params.append('account_number', filters.account_number)
  if (filters?.from_date) params.append('from_date', filters.from_date)
  if (filters?.to_date) params.append('to_date', filters.to_date)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<PaymentListResponse>('/api/payments', { params })
  return response.data
}

export async function getPaymentRecipients(): Promise<PaymentRecipient[]> {
  const response = await apiClient.get<PaymentRecipient[]>('/api/payments/recipients')
  return response.data
}

export async function createPaymentRecipient(
  payload: CreatePaymentRecipientRequest
): Promise<PaymentRecipient> {
  const response = await apiClient.post<PaymentRecipient>('/api/payments/recipients', payload)
  return response.data
}

export async function updatePaymentRecipient(
  id: number,
  payload: Partial<CreatePaymentRecipientRequest>
): Promise<PaymentRecipient> {
  const response = await apiClient.put<PaymentRecipient>(`/api/payments/recipients/${id}`, payload)
  return response.data
}

export async function deletePaymentRecipient(id: number): Promise<void> {
  await apiClient.delete(`/api/payments/recipients/${id}`)
}
