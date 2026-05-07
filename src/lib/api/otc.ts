import { apiClient } from '@/lib/api/axios'
import type {
  OtcOfferListResponse,
  OtcFilters,
  OtcBuyRequest,
  OtcBuyOnBehalfRequest,
  PeerOtcNegotiationRequest,
  PeerOtcNegotiationResponse,
} from '@/types/otc'

export async function getOtcOffers(filters?: OtcFilters): Promise<OtcOfferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.security_type) params.append('security_type', filters.security_type)
  if (filters?.ticker) params.append('ticker', filters.ticker)
  if (filters?.kind) params.append('kind', filters.kind)
  if (filters?.bank_code) params.append('bank_code', filters.bank_code)
  const response = await apiClient.get<OtcOfferListResponse>('/otc/offers', { params })
  const data = response.data
  return {
    offers: data.offers ?? [],
    total_count: data.total_count ?? 0,
    peers_total: data.peers_total ?? 0,
    peers_reached: data.peers_reached ?? 0,
    partial: data.partial ?? false,
    last_refresh: data.last_refresh ?? '',
  }
}

export async function buyOtcOffer(id: number, payload: OtcBuyRequest): Promise<void> {
  await apiClient.post(`/otc/offers/${id}/buy`, payload)
}

export async function buyOtcOfferOnBehalf(
  id: number,
  payload: OtcBuyOnBehalfRequest
): Promise<void> {
  await apiClient.post(`/otc/offers/${id}/buy-on-behalf`, payload)
}

export async function createPeerOtcNegotiation(
  payload: PeerOtcNegotiationRequest
): Promise<PeerOtcNegotiationResponse> {
  const { data } = await apiClient.post<PeerOtcNegotiationResponse>(
    '/me/peer-otc/negotiations',
    payload
  )
  return data
}
