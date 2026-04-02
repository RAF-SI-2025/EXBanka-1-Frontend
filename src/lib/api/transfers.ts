import { apiClient } from '@/lib/api/axios'
import type {
  Transfer,
  TransferListResponse,
  TransferFilters,
  CreateTransferRequest,
} from '@/types/transfer'

export async function createTransfer(payload: CreateTransferRequest): Promise<Transfer> {
  const response = await apiClient.post<Transfer>('/api/me/transfers', payload)
  return response.data
}

export async function executeTransfer(id: number, verificationCode: string): Promise<Transfer> {
  const response = await apiClient.post<Transfer>(`/api/me/transfers/${id}/execute`, {
    verification_code: verificationCode,
  })
  return response.data
}

export async function getTransfers(filters?: TransferFilters): Promise<TransferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<TransferListResponse>('/api/me/transfers', { params })
  return response.data
}
