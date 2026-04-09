import { apiClient } from '@/lib/api/axios'
import type {
  Transfer,
  TransferListResponse,
  TransferFilters,
  CreateTransferRequest,
  TransferPreviewResponse,
} from '@/types/transfer'

export async function createTransfer(payload: CreateTransferRequest): Promise<Transfer> {
  const response = await apiClient.post<Transfer>('/api/v1/me/transfers', payload)
  return response.data
}

export async function executeTransfer(id: number, challengeId: number): Promise<Transfer> {
  const response = await apiClient.post<Transfer>(`/api/v1/me/transfers/${id}/execute`, {
    challenge_id: challengeId,
  })
  return response.data
}

export async function getTransferPreview(
  payload: CreateTransferRequest
): Promise<TransferPreviewResponse> {
  const response = await apiClient.post<TransferPreviewResponse>(
    '/api/v1/me/transfers/preview',
    payload
  )
  return response.data
}

export async function getTransfers(filters?: TransferFilters): Promise<TransferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<TransferListResponse>('/api/v1/me/transfers', { params })
  return response.data
}
