import { apiClient } from '@/lib/api/axios'
import type {
  Transfer,
  TransferListResponse,
  TransferFilters,
  CreateTransferRequest,
} from '@/types/transfer'

export async function createTransfer(payload: CreateTransferRequest): Promise<Transfer> {
  const response = await apiClient.post<Transfer>('/api/transfers', payload)
  return response.data
}

export async function getTransfers(
  clientId: number,
  filters?: TransferFilters
): Promise<TransferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<TransferListResponse>(`/api/transfers/client/${clientId}`, {
    params,
  })
  return response.data
}
