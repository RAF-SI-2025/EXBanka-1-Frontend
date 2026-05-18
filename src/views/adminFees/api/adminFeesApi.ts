import { apiClient } from '@/lib/api/axios'
import type {
  TransferFee,
  FeeListResponse,
  CreateFeePayload,
  UpdateFeePayload,
} from '@/views/adminFees/types'

export const adminFeesApi = {
  async list(): Promise<FeeListResponse> {
    const { data } = await apiClient.get<FeeListResponse>('/fees')
    return { ...data, fees: data.fees ?? [] }
  },
  async create(payload: CreateFeePayload): Promise<TransferFee> {
    const { data } = await apiClient.post<TransferFee>('/fees', payload)
    return data
  },
  async update(id: number, payload: UpdateFeePayload): Promise<TransferFee> {
    const { data } = await apiClient.put<TransferFee>(`/fees/${id}`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/fees/${id}`)
  },
}
