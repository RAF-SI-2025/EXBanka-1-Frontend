import { apiClient } from '@/lib/api/axios'
import type {
  OtcOffer,
  OtcNegotiation,
  CreateOtcOfferPayload,
  PlaceBidPayload,
  CounterNegotiationPayload,
  AcceptNegotiationPayload,
  ExerciseContractPayload,
  OtcOfferDetailResponse,
  MyOffersFilters,
  AllOffersFilters,
  MyNegotiationsFilters,
  MyOtcOffersResponse,
  OtcNegotiationListResponse,
  MyContractsFilters,
  MyOtcContractsResponse,
  OptionContract,
  AcceptOtcOfferResponse,
  ExerciseOtcContractResponse,
} from '@/types/otcOption'

// -- Listings ----------------------------------------------------------------

export async function createOtcOptionOffer(
  payload: CreateOtcOfferPayload
): Promise<{ offer: OtcOffer }> {
  const { data } = await apiClient.post<{ offer: OtcOffer }>('/me/otc/options', payload)
  return data
}

export async function getOtcOptionOffer(id: number): Promise<OtcOfferDetailResponse> {
  const { data } = await apiClient.get<OtcOfferDetailResponse>(`/otc/options/${id}`)
  return data
}

export async function getMyOtcOptionOffers(
  filters: MyOffersFilters = {}
): Promise<MyOtcOffersResponse> {
  const { data } = await apiClient.get<MyOtcOffersResponse>('/me/otc/options', {
    params: filters,
  })
  return { ...data, offers: data.offers ?? [] }
}

export async function getAllOtcOptionOffers(
  filters: AllOffersFilters = {}
): Promise<MyOtcOffersResponse> {
  const { data } = await apiClient.get<MyOtcOffersResponse>('/otc/options', {
    params: filters,
  })
  return { ...data, offers: data.offers ?? [] }
}

// -- Negotiation chains ------------------------------------------------------

export async function placeBidOnOtcOption(
  offerId: number,
  payload: PlaceBidPayload
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: OtcNegotiation }>(
    `/otc/options/${offerId}/bid`,
    payload
  )
  return data
}

export async function getOtcOptionNegotiations(
  offerId: number
): Promise<OtcNegotiationListResponse> {
  const { data } = await apiClient.get<OtcNegotiationListResponse>(
    `/otc/options/${offerId}/negotiations`
  )
  return { ...data, negotiations: data.negotiations ?? [] }
}

export async function getMyOtcOptionNegotiations(
  filters: MyNegotiationsFilters = {}
): Promise<OtcNegotiationListResponse> {
  const { data } = await apiClient.get<OtcNegotiationListResponse>('/me/otc/options/negotiations', {
    params: filters,
  })
  return { ...data, negotiations: data.negotiations ?? [] }
}

export async function counterOtcNegotiation(
  offerId: number,
  negotiationId: number,
  payload: CounterNegotiationPayload
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: OtcNegotiation }>(
    `/me/otc/options/${offerId}/negotiations/${negotiationId}/counter`,
    payload
  )
  return data
}

export async function acceptOtcNegotiation(
  offerId: number,
  negotiationId: number,
  payload: AcceptNegotiationPayload
): Promise<AcceptOtcOfferResponse> {
  const { data } = await apiClient.post<AcceptOtcOfferResponse>(
    `/me/otc/options/${offerId}/negotiations/${negotiationId}/accept`,
    payload
  )
  return data
}

export async function rejectOtcNegotiation(
  offerId: number,
  negotiationId: number
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: OtcNegotiation }>(
    `/me/otc/options/${offerId}/negotiations/${negotiationId}/reject`
  )
  return data
}

export async function cancelOtcNegotiation(offerId: number, negotiationId: number): Promise<void> {
  await apiClient.delete(`/me/otc/options/${offerId}/negotiations/${negotiationId}`)
}

// -- Contracts ---------------------------------------------------------------

export async function getOtcOptionContract(id: number): Promise<{ contract: OptionContract }> {
  const { data } = await apiClient.get<{ contract: OptionContract }>(`/otc/contracts/${id}`)
  return data
}

export async function getMyOtcOptionContracts(
  filters: MyContractsFilters = {}
): Promise<MyOtcContractsResponse> {
  const { data } = await apiClient.get<MyOtcContractsResponse>('/me/otc/contracts', {
    params: filters,
  })
  return { ...data, contracts: data.contracts ?? [] }
}

export async function exerciseOtcOptionContract(
  id: number,
  payload: ExerciseContractPayload
): Promise<ExerciseOtcContractResponse> {
  const { data } = await apiClient.post<ExerciseOtcContractResponse>(
    `/otc/contracts/${id}/exercise`,
    payload
  )
  return data
}
