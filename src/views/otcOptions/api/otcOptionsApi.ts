// Self-contained API surface for the OTC Options view module.
// Only external dependency is the shared axios instance.

import { apiClient } from '@/lib/api/axios'
import { toPrincipalId } from '@/views/otcOptions/lib/actor'
import { getPortfolio } from '@/lib/api/portfolio'
import type { PortfolioResponse } from '@/types/portfolio'
import type {
  AcceptNegotiationPayload,
  AcceptNegotiationResponse,
  CounterNegotiationPayload,
  CreateOtcOptionPayload,
  MyOtcOptionsResponse,
  OtcNegotiation,
  OtcNegotiationRevision,
  OtcNegotiationRevisionsResponse,
  OtcNegotiationsResponse,
  OtcOfferTimelineResponse,
  OtcOptionsDiscoveryResponse,
  OtcOptionsListFilters,
  OtcParty,
  PlaceBidPayload,
  StockCatalogResponse,
  UpdateOtcOptionPayload,
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
    viewer_role: raw.viewer_role ?? '',
    last_action_mine: raw.last_action_mine ?? false,
    awaiting_viewer: raw.awaiting_viewer ?? false,
    can_accept: raw.can_accept ?? false,
    can_counter: raw.can_counter ?? false,
    can_reject: raw.can_reject ?? false,
    can_withdraw: raw.can_withdraw ?? false,
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

// PUT /me/otc/options/:id — owner-only. Re-sizes the listing's amount of stock.
// The backend returns the updated listing; the FE re-fetches the lists on
// success instead of consuming the body, so the call resolves to void.
async function updateListing(offerId: number, payload: UpdateOtcOptionPayload): Promise<void> {
  await apiClient.put(`/me/otc/options/${offerId}`, payload)
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

// Revisions are read-only audit rows ordered by revision_number ASC.
// Either the bidder or the listing's poster can call this; anyone else gets 403.
// The backend's revision rows carry the actor either as a concrete principal
// (`action_by_principal_type` + a numeric id) or by trade role
// (`action_by_principal_type: "buyer"|"seller"`) with the numeric id — when it
// exists at all — under one of several keys. Reading only `action_by_principal_id`
// rendered "buyer-undefined" in the "By" column. Normalize to a stable
// `{ type, id|null }` so the UI (`formatActor`) can show "<type>-<id>", "You",
// or the bare role.
type RawRevision = Partial<OtcNegotiationRevision> & {
  action_by_owner_type?: string
  actor_type?: string
  action_by_owner_id?: number | string | null
  action_by_id?: number | string | null
  actor_id?: number | string | null
  by_id?: number | string | null
}

function normalizeRevision(raw: RawRevision): OtcNegotiationRevision {
  return {
    id: raw.id ?? 0,
    negotiation_id: raw.negotiation_id ?? 0,
    revision_number: raw.revision_number ?? 0,
    action: raw.action ?? 'BID',
    quantity: raw.quantity ?? '',
    strike_price: raw.strike_price ?? '',
    premium: raw.premium ?? null,
    settlement_date: raw.settlement_date ?? '',
    action_by_principal_type:
      raw.action_by_principal_type ?? raw.action_by_owner_type ?? raw.actor_type ?? '',
    action_by_principal_id: toPrincipalId(
      raw.action_by_principal_id ??
        raw.action_by_owner_id ??
        raw.action_by_id ??
        raw.actor_id ??
        raw.by_id
    ),
    created_at: raw.created_at ?? '',
    mine: raw.mine ?? false,
    is_latest: raw.is_latest ?? false,
  }
}

async function listNegotiationRevisions(
  negotiationId: number
): Promise<OtcNegotiationRevisionsResponse> {
  const { data } = await apiClient.get<{ revisions?: RawRevision[] }>(
    `/me/otc/options/negotiations/${negotiationId}/revisions`
  )
  return { revisions: (data.revisions ?? []).map(normalizeRevision) }
}

// Cross-chain activity timeline for a listing the caller OWNS — every bidder's
// bid/counter/accept/reject revisions merged server-side into one stream
// (spec §47.2 `GET /otc/options/:id/timeline`). One call replaces the per-chain
// revisions fan-out the owner Activity view used to do.
async function getOfferTimeline(offerId: number): Promise<OtcOfferTimelineResponse> {
  const { data } = await apiClient.get<OtcOfferTimelineResponse>(`/otc/options/${offerId}/timeline`)
  return { offer: data.offer, timeline: data.timeline ?? [] }
}

// Used by the New-Listing ticker picker (sell direction): the caller can only
// post sell options on shares they actually hold. Delegates to the shared
// portfolio loader so this module can't drift from spec §48.1 again — that
// was the bug that left this picker silently empty after Plan B.
async function listMyHoldings(): Promise<PortfolioResponse> {
  return getPortfolio()
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
  updateListing,
  cancelListing,
  placeBid,
  counter,
  acceptNegotiation,
  rejectNegotiation,
  withdrawNegotiation,
  listNegotiations,
  listMyNegotiations,
  listNegotiationRevisions,
  getOfferTimeline,
  listMyHoldings,
  listStockCatalog,
}
