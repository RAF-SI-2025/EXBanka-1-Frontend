import { apiClient } from '@/lib/api/axios'
import type {
  OtcOfferListResponse,
  OtcFilters,
  OtcBuyRequest,
  OtcBuyOnBehalfRequest,
} from '@/types/otc'

export async function getOtcOffers(filters?: OtcFilters): Promise<OtcOfferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.security_type) params.append('security_type', filters.security_type)
  if (filters?.ticker) params.append('ticker', filters.ticker)
  const response = await apiClient.get<OtcOfferListResponse>('/otc/offers', { params })
  const data = response.data
  return { ...data, offers: data.offers ?? [] }
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
