import { apiClient } from '@/lib/api/axios'
import type {
  CreatePeerBankPayload,
  PeerBank,
  PeerBankListResponse,
  UpdatePeerBankPayload,
} from '@/views/peerBanks/types'

interface ListParams {
  active_only?: boolean
}

export const peerBanksApi = {
  async list(params?: ListParams): Promise<PeerBankListResponse> {
    const { data } = await apiClient.get<PeerBankListResponse>('/peer-banks', { params })
    return { peer_banks: data?.peer_banks ?? [] }
  },
  async get(id: number): Promise<PeerBank> {
    const { data } = await apiClient.get<PeerBank>(`/peer-banks/${id}`)
    return data
  },
  async create(payload: CreatePeerBankPayload): Promise<PeerBank> {
    const { data } = await apiClient.post<PeerBank>('/peer-banks', payload)
    return data
  },
  async update(id: number, payload: UpdatePeerBankPayload): Promise<PeerBank> {
    const { data } = await apiClient.put<PeerBank>(`/peer-banks/${id}`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/peer-banks/${id}`)
  },
}
