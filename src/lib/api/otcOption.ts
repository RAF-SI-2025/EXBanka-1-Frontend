import { apiClient } from '@/lib/api/axios'
import type {
  OtcOffer,
  CreateOtcOfferPayload,
  CounterOtcOfferPayload,
  AcceptOtcOfferPayload,
  ExerciseContractPayload,
  OtcOfferDetailResponse,
  MyOffersFilters,
  MyOtcOffersResponse,
  MyContractsFilters,
  MyOtcContractsResponse,
  OptionContract,
  AcceptOtcOfferResponse,
  ExerciseOtcContractResponse,
} from '@/types/otcOption'

export async function createOtcOptionOffer(
  payload: CreateOtcOfferPayload
): Promise<{ offer: OtcOffer }> {
  const { data } = await apiClient.post<{ offer: OtcOffer }>('/otc/offers', payload)
  return data
}

export async function counterOtcOptionOffer(
  id: number,
  payload: CounterOtcOfferPayload
): Promise<{ offer: OtcOffer }> {
  const { data } = await apiClient.post<{ offer: OtcOffer }>(`/otc/offers/${id}/counter`, payload)
  return data
}

export async function acceptOtcOptionOffer(
  id: number,
  payload: AcceptOtcOfferPayload
): Promise<AcceptOtcOfferResponse> {
  const { data } = await apiClient.post<AcceptOtcOfferResponse>(`/otc/offers/${id}/accept`, payload)
  return data
}

export async function rejectOtcOptionOffer(id: number): Promise<{ offer: OtcOffer }> {
  const { data } = await apiClient.post<{ offer: OtcOffer }>(`/otc/offers/${id}/reject`)
  return data
}

export async function getOtcOptionOffer(id: number): Promise<OtcOfferDetailResponse> {
  const { data } = await apiClient.get<OtcOfferDetailResponse>(`/otc/offers/${id}`)
  return { ...data, revisions: data.revisions ?? [] }
}

export async function getMyOtcOptionOffers(
  filters: MyOffersFilters = {}
): Promise<MyOtcOffersResponse> {
  const { data } = await apiClient.get<MyOtcOffersResponse>('/me/otc/offers', {
    params: filters,
  })
  return { ...data, offers: data.offers ?? [] }
}

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
