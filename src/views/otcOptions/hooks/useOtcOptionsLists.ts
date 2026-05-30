import { useQueries, useQuery } from '@tanstack/react-query'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type {
  OtcNegotiation,
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

// Used as the upfront "have I already bid on this listing?" precheck so the
// row's button can show "Counter" instead of "Bid". Filtered to active
// statuses only — terminal chains (cancelled/rejected/expired) don't block a
// fresh /bid call, so they shouldn't drive the label either.
//
// `enabled` gates the query — the only consumer is the marketplace table, so
// the parent view passes `false` while a detail panel is open to suppress
// the network call.
export function useMyActiveOtcNegotiations(enabled = true) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'my-negotiations', 'open,countered'],
    queryFn: () => otcOptionsApi.listMyNegotiations({ statuses: 'open,countered' }),
    enabled,
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

// Fan-out: fetch /me/otc/options/negotiations/:nid/revisions for every chain
// on a listing in parallel and aggregate into one flat list. The result is
// sorted newest-first by revision.created_at so the owner sees the full bid
// activity timeline, not just the latest snapshot per chain.
export function useAllOfferRevisions(chains: OtcNegotiation[]): {
  revisions: RevisionWithChain[]
  isLoading: boolean
  error: unknown
} {
  const results = useQueries({
    queries: chains.map((c) => ({
      queryKey: [OTC_OPTIONS_QUERY_KEY, 'revisions', c.id],
      queryFn: () => otcOptionsApi.listNegotiationRevisions(c.id),
      enabled: c.id > 0,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const error = results.find((r) => r.error)?.error ?? null

  const revisions: RevisionWithChain[] = []
  results.forEach((r, i) => {
    const chain = chains[i]
    if (!chain) return
    for (const rev of r.data?.revisions ?? []) {
      revisions.push({
        ...rev,
        chain_id: chain.id,
        chain_bidder: chain.bidder,
        chain_bidder_name: chain.bidder_name,
      })
    }
  })
  revisions.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return { revisions, isLoading, error }
}
