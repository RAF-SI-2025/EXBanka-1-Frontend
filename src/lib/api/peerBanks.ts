import { apiClient } from '@/lib/api/axios'
import type {
  PeerBank,
  PeerBankListResponse,
  CreatePeerBankPayload,
  UpdatePeerBankPayload,
} from '@/types/peerBank'

interface ListParams {
  active_only?: boolean
}

export async function getPeerBanks(params?: ListParams): Promise<PeerBankListResponse> {
  const { data } = await apiClient.get<PeerBankListResponse>('/peer-banks', { params })
  return { peer_banks: data?.peer_banks ?? [] }
}

export async function getPeerBank(id: number): Promise<PeerBank> {
  const { data } = await apiClient.get<PeerBank>(`/peer-banks/${id}`)
  return data
}

export async function createPeerBank(payload: CreatePeerBankPayload): Promise<PeerBank> {
  const { data } = await apiClient.post<PeerBank>('/peer-banks', payload)
  return data
}

export async function updatePeerBank(
  id: number,
  payload: UpdatePeerBankPayload
): Promise<PeerBank> {
  const { data } = await apiClient.put<PeerBank>(`/peer-banks/${id}`, payload)
  return data
}

export async function deletePeerBank(id: number): Promise<void> {
  await apiClient.delete(`/peer-banks/${id}`)
}
