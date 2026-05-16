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
  // The single-offer endpoint may return the seller as a flat string
  // (`seller_id: "bank-0"`) instead of a nested `initiator` object.
  // The detail page's viewer-type-gated isPoster check needs
  // `initiator.owner_type` populated, otherwise an employee viewing a
  // bank-owned offer sees no Counter/Accept/Decline actions.
  const normalizedOffer = normalizeOtcOffer(
    data.offer as unknown as Record<string, unknown>
  )
  return { ...data, offer: normalizedOffer }
}

/**
 * The two listing endpoints disagree on field names:
 *
 *   /me/otc/options    → { id, status, stock_id, quantity, initiator, ... }
 *   /otc/options       → { offer_id, ticker, amount, seller_id, ... }
 *     • no `status` (open-only view)
 *     • no `initiator` object — instead a `seller_id` string like "client-7"
 *
 * The UI renders both through one `OtcOptionOffersTable`, so we normalize
 * both responses into the same `OtcOffer` shape. Each raw row passes
 * through unchanged otherwise.
 */
function parseSellerId(
  raw: unknown
): import('@/types/otcOption').OtcParty | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'number') {
    return { owner_type: 'client', owner_id: raw }
  }
  if (typeof raw === 'string') {
    // Accepts "client-7", "employee-3", or a bare numeric id.
    const dashIdx = raw.indexOf('-')
    if (dashIdx > 0) {
      const type = raw.slice(0, dashIdx) as import('@/types/otcOption').OtcParty['owner_type']
      const idPart = Number(raw.slice(dashIdx + 1))
      if (!Number.isNaN(idPart)) return { owner_type: type, owner_id: idPart }
    }
    const asNum = Number(raw)
    if (!Number.isNaN(asNum)) return { owner_type: 'client', owner_id: asNum }
  }
  return undefined
}

function normalizeOtcOffer(raw: Record<string, unknown>): import('@/types/otcOption').OtcOffer {
  const idFromOfferId =
    raw.offer_id != null ? Number(raw.offer_id as string | number) : undefined
  const id = (raw.id as number | undefined) ?? idFromOfferId ?? 0
  const quantity =
    raw.quantity != null ? String(raw.quantity) : raw.amount != null ? String(raw.amount) : ''
  const status = (raw.status as import('@/types/otcOption').OtcOfferStatus | undefined) ?? 'open'

  const initiator =
    (raw.initiator as import('@/types/otcOption').OtcParty | undefined) ??
    parseSellerId(raw.seller_id) ?? { owner_type: 'client', owner_id: null }
  const counterparty =
    (raw.counterparty as import('@/types/otcOption').OtcParty | undefined) ?? {
      owner_type: 'client',
      owner_id: null,
    }

  return {
    ...(raw as object),
    id,
    quantity,
    status,
    initiator,
    counterparty,
  } as import('@/types/otcOption').OtcOffer
}

export async function getMyOtcOptionOffers(
  filters: MyOffersFilters = {}
): Promise<MyOtcOffersResponse> {
  const { data } = await apiClient.get<MyOtcOffersResponse>('/me/otc/options', {
    params: filters,
  })
  const offers = (data.offers ?? []).map((o) =>
    normalizeOtcOffer(o as unknown as Record<string, unknown>)
  )
  return { ...data, offers }
}

export async function getAllOtcOptionOffers(
  filters: AllOffersFilters = {}
): Promise<MyOtcOffersResponse> {
  const { data } = await apiClient.get<MyOtcOffersResponse>('/otc/options', {
    params: filters,
  })
  const offers = (data.offers ?? []).map((o) =>
    normalizeOtcOffer(o as unknown as Record<string, unknown>)
  )
  return { ...data, offers }
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

/**
 * Backend negotiation rows aren't fully typed in the spec; some come back
 * without a nested `bidder` / `last_action_by` object. Synthesise sane
 * defaults so downstream UI code can always rely on these fields existing.
 */
function normalizeOtcNegotiation(
  raw: Record<string, unknown>
): import('@/types/otcOption').OtcNegotiation {
  const bidder =
    (raw.bidder as import('@/types/otcOption').OtcParty | undefined) ??
    parseSellerId((raw as { bidder_id?: unknown }).bidder_id) ?? {
      owner_type: 'client',
      owner_id: null,
    }
  const last_action_by =
    (raw.last_action_by as import('@/types/otcOption').OtcParty | undefined) ?? bidder
  return {
    ...(raw as object),
    bidder,
    last_action_by,
  } as import('@/types/otcOption').OtcNegotiation
}

export async function getOtcOptionNegotiations(
  offerId: number
): Promise<OtcNegotiationListResponse> {
  const { data } = await apiClient.get<OtcNegotiationListResponse>(
    `/otc/options/${offerId}/negotiations`
  )
  const negotiations = (data.negotiations ?? []).map((n) =>
    normalizeOtcNegotiation(n as unknown as Record<string, unknown>)
  )
  return { ...data, negotiations }
}

export async function getMyOtcOptionNegotiations(
  filters: MyNegotiationsFilters = {}
): Promise<OtcNegotiationListResponse> {
  const { data } = await apiClient.get<OtcNegotiationListResponse>('/me/otc/options/negotiations', {
    params: filters,
  })
  const negotiations = (data.negotiations ?? []).map((n) =>
    normalizeOtcNegotiation(n as unknown as Record<string, unknown>)
  )
  return { ...data, negotiations }
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
