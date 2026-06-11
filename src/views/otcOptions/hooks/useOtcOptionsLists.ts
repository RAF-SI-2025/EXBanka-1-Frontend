import { useQuery } from '@tanstack/react-query'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { toPrincipalId } from '@/views/otcOptions/lib/actor'
import type {
  OtcNegotiationRevision,
  OtcOptionsListFilters,
  OtcParty,
} from '@/views/otcOptions/types'

export const OTC_OPTIONS_QUERY_KEY = 'otc-options-view'

export function useAllOtcOptions(filters: OtcOptionsListFilters = {}) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'all', filters],
    queryFn: () => otcOptionsApi.listAll(filters),
  })
}

export function useMyOtcOptions(filters: OtcOptionsListFilters = {}) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'mine', filters],
    queryFn: () => otcOptionsApi.listMine(filters),
  })
}

export function useOtcOptionNegotiations(offerId: number | null) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'negotiations', offerId],
    queryFn: () => otcOptionsApi.listNegotiations(offerId as number),
    enabled: offerId != null && offerId > 0,
  })
}

// Every chain the caller is a party to (any status). Used by the bidder's
// "Your bidding history" view to locate their own chain on a listing without
// peeking at competitors' chains via the listing-scoped endpoint. We bump
// page_size to the spec max (200) so a single fetch usually covers the
// caller's activity; callers filter client-side per listing.
export function useAllMyOtcNegotiations() {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'my-negotiations', 'all'],
    queryFn: () => otcOptionsApi.listMyNegotiations({ page_size: 200 }),
  })
}

// Full bid → counter → counter → accept/reject audit log for one chain.
// Disabled until the caller provides a real negotiation id so the panels can
// pass `null` while no chain is selected.
export function useOtcNegotiationRevisions(negotiationId: number | null) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'revisions', negotiationId],
    queryFn: () => otcOptionsApi.listNegotiationRevisions(negotiationId as number),
    enabled: negotiationId != null && negotiationId > 0,
  })
}

// A single revision row tagged with the chain it belongs to, so the owner's
// History table can show "which bidder" alongside the action.
export interface RevisionWithChain extends OtcNegotiationRevision {
  chain_id: number
  chain_bidder: OtcParty
  chain_bidder_name?: string
}

// Cross-chain activity timeline for a listing the caller owns. One call to
// GET /otc/options/:id/timeline returns every bidder's revisions merged
// server-side, so the owner History table no longer fans out per chain. Each
// timeline entry carries its bidder identity flat; we lift it onto the shared
// `RevisionWithChain` shape so OfferHistoryTable renders the rows unchanged.
// Disabled until a real offer id is supplied (panels pass `null` while idle).
export function useOtcOfferTimeline(offerId: number | null): {
  revisions: RevisionWithChain[]
  isLoading: boolean
  error: unknown
} {
  const { data, isLoading, error } = useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'timeline', offerId],
    queryFn: () => otcOptionsApi.getOfferTimeline(offerId as number),
    enabled: offerId != null && offerId > 0,
  })

  const revisions: RevisionWithChain[] = (data?.timeline ?? []).map((e) => ({
    id: e.revision_number,
    negotiation_id: e.negotiation_id,
    revision_number: e.revision_number,
    action: e.action,
    quantity: e.quantity,
    strike_price: e.strike_price,
    premium: e.premium,
    settlement_date: e.settlement_date,
    action_by_principal_type: e.action_by_principal_type,
    action_by_principal_id: toPrincipalId(
      e.action_by_principal_id ?? e.action_by_owner_id ?? e.action_by_id ?? e.actor_id
    ),
    created_at: e.created_at,
    chain_id: e.negotiation_id,
    chain_bidder: { owner_type: e.bidder_owner_type, owner_id: e.bidder_owner_id },
  }))
  // Spec returns ASC by created_at; show newest-first to match the prior UX.
  revisions.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return { revisions, isLoading, error }
}
