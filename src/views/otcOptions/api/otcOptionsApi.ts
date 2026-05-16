// Self-contained API surface for the OTC Options view module.
// Only external dependency is the shared axios instance.

import { apiClient } from '@/lib/api/axios'
import type {
  AcceptNegotiationPayload,
  AcceptNegotiationResponse,
  CounterNegotiationPayload,
  CreateOtcOptionPayload,
  MyHoldingsResponse,
  MyOtcOptionsResponse,
  OtcNegotiation,
  OtcNegotiationsResponse,
  OtcOptionsDiscoveryResponse,
  OtcOptionsListFilters,
  OtcParty,
  PlaceBidPayload,
  StockCatalogResponse,
} from '@/views/otcOptions/types'

// The backend ships negotiation rows with flat `bidder_owner_type`/
// `bidder_owner_id` (+ `last_action_by_owner_type`/`_owner_id`) fields per
// §47.2 of the spec. The view code expects nested `bidder` / `last_action_by`
// parties, so we normalise on the way out.
type RawNegotiation = Partial<OtcNegotiation> & {
  bidder_owner_type?: string
  bidder_owner_id?: number | string | null
  bidder_name?: string
  last_action_by_owner_type?: string
  last_action_by_owner_id?: number | string | null
}

function buildParty(
  ownerType: string | undefined,
  ownerId: number | string | null | undefined
): OtcParty {
  const t = (ownerType as OtcParty['owner_type']) || 'client'
  const id =
    ownerId == null || ownerId === ''
      ? null
      : typeof ownerId === 'number'
        ? ownerId
        : Number.isNaN(Number(ownerId))
          ? null
          : Number(ownerId)
  return { owner_type: t, owner_id: id }
}

function normalizeNegotiation(raw: RawNegotiation): OtcNegotiation {
  const bidder: OtcParty = raw.bidder ?? buildParty(raw.bidder_owner_type, raw.bidder_owner_id)
  const lastBy: OtcParty | undefined =
    raw.last_action_by ??
    (raw.last_action_by_owner_type != null || raw.last_action_by_owner_id != null
      ? buildParty(raw.last_action_by_owner_type, raw.last_action_by_owner_id)
      : undefined)
  return {
    id: raw.id ?? 0,
    parent_offer_id: raw.parent_offer_id,
    offer_id: raw.offer_id,
    status: raw.status ?? 'open',
    bidder,
    bidder_name: raw.bidder_name,
    last_action_by: lastBy,
    quantity: raw.quantity ?? '',
    strike_price: raw.strike_price ?? '',
    premium: raw.premium ?? null,
    settlement_date: raw.settlement_date ?? '',
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
  }
}

async function listAll(filters: OtcOptionsListFilters = {}): Promise<OtcOptionsDiscoveryResponse> {
  const { data } = await apiClient.get<OtcOptionsDiscoveryResponse>('/otc/options', {
    params: filters,
  })
  return data
}

async function listMine(filters: OtcOptionsListFilters = {}): Promise<MyOtcOptionsResponse> {
  const { data } = await apiClient.get<MyOtcOptionsResponse>('/me/otc/options', {
    params: filters,
  })
  return data
}

async function createListing(payload: CreateOtcOptionPayload): Promise<{ offer: { id: number } }> {
  const { data } = await apiClient.post<{ offer: { id: number } }>('/me/otc/options', payload)
  return data
}

async function cancelListing(offerId: number): Promise<void> {
  await apiClient.delete(`/me/otc/options/${offerId}`)
}

async function placeBid(
  offerId: number,
  payload: PlaceBidPayload
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: RawNegotiation }>(
    `/otc/options/${offerId}/bid`,
    payload
  )
  return { negotiation: normalizeNegotiation(data.negotiation) }
}

async function counter(
  offerId: number,
  negotiationId: number,
  payload: CounterNegotiationPayload
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: RawNegotiation }>(
    `/me/otc/options/${offerId}/negotiations/${negotiationId}/counter`,
    payload
  )
  return { negotiation: normalizeNegotiation(data.negotiation) }
}

async function acceptNegotiation(
  offerId: number,
  negotiationId: number,
  payload: AcceptNegotiationPayload
): Promise<AcceptNegotiationResponse> {
  const { data } = await apiClient.post<
    Omit<AcceptNegotiationResponse, 'winning' | 'cancelled_siblings'> & {
      winning: RawNegotiation
      cancelled_siblings?: RawNegotiation[]
    }
  >(`/me/otc/options/${offerId}/negotiations/${negotiationId}/accept`, payload)
  return {
    ...data,
    winning: normalizeNegotiation(data.winning),
    cancelled_siblings: (data.cancelled_siblings ?? []).map(normalizeNegotiation),
  }
}

async function rejectNegotiation(
  offerId: number,
  negotiationId: number
): Promise<{ negotiation: OtcNegotiation }> {
  const { data } = await apiClient.post<{ negotiation: RawNegotiation }>(
    `/me/otc/options/${offerId}/negotiations/${negotiationId}/reject`
  )
  return { negotiation: normalizeNegotiation(data.negotiation) }
}

async function withdrawNegotiation(offerId: number, negotiationId: number): Promise<void> {
  await apiClient.delete(`/me/otc/options/${offerId}/negotiations/${negotiationId}`)
}

async function listNegotiations(offerId: number): Promise<OtcNegotiationsResponse> {
  const { data } = await apiClient.get<{ negotiations: RawNegotiation[]; total: number }>(
    `/otc/options/${offerId}/negotiations`
  )
  return {
    negotiations: (data.negotiations ?? []).map(normalizeNegotiation),
    total: data.total ?? 0,
  }
}

interface MyNegotiationsFilters {
  statuses?: string
  page?: number
  page_size?: number
}

async function listMyNegotiations(
  filters: MyNegotiationsFilters = {}
): Promise<OtcNegotiationsResponse> {
  const { data } = await apiClient.get<{ negotiations: RawNegotiation[]; total: number }>(
    '/me/otc/options/negotiations',
    { params: filters }
  )
  return {
    negotiations: (data.negotiations ?? []).map(normalizeNegotiation),
    total: data.total ?? 0,
  }
}

// Used by the New-Listing ticker picker (sell direction): the caller can only
// post sell options on shares they actually hold.
async function listMyHoldings(): Promise<MyHoldingsResponse> {
  const { data } = await apiClient.get<MyHoldingsResponse>('/me/portfolio', {
    params: { security_type: 'stock', page_size: 500 },
  })
  return { holdings: data.holdings ?? [], total_count: data.total_count ?? 0 }
}

// Used by the New-Listing ticker picker (buy direction): the caller can post
// a buy option on any tradable stock.
async function listStockCatalog(): Promise<StockCatalogResponse> {
  const { data } = await apiClient.get<StockCatalogResponse>('/securities/stocks', {
    params: { page_size: 500 },
  })
  return { stocks: data.stocks ?? [], total_count: data.total_count ?? 0 }
}

export const otcOptionsApi = {
  listAll,
  listMine,
  createListing,
  cancelListing,
  placeBid,
  counter,
  acceptNegotiation,
  rejectNegotiation,
  withdrawNegotiation,
  listNegotiations,
  listMyNegotiations,
  listMyHoldings,
  listStockCatalog,
}
