import { apiClient } from '@/lib/api/axios'
import type { TransferFee, FeeListResponse, CreateFeePayload, UpdateFeePayload } from '@/types/fee'

export async function getFees(): Promise<FeeListResponse> {
  const { data } = await apiClient.get<FeeListResponse>('/api/v1/fees')
  return { ...data, fees: data.fees ?? [] }
}

export async function createFee(payload: CreateFeePayload): Promise<TransferFee> {
  const { data } = await apiClient.post<TransferFee>('/api/v1/fees', payload)
  return data
}

export async function updateFee(id: number, payload: UpdateFeePayload): Promise<TransferFee> {
  const { data } = await apiClient.put<TransferFee>(`/api/v1/fees/${id}`, payload)
  return data
}

export async function deleteFee(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/fees/${id}`)
}
