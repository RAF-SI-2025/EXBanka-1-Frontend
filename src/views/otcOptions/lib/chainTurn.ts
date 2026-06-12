import type { OtcNegotiationRevision } from '@/views/otcOptions/types'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'

// The most recent revision of one chain within the merged offer timeline,
// chosen by the highest revision_number (order-independent). null when the
// chain has no revisions in the timeline yet.
export function latestRevisionForChain(
  timeline: RevisionWithChain[],
  negotiationId: number
): RevisionWithChain | null {
  let latest: RevisionWithChain | null = null
  for (const r of timeline) {
    if (r.negotiation_id !== negotiationId) continue
    if (!latest || r.revision_number > latest.revision_number) latest = r
  }
  return latest
}

// The most recent revision in a single chain's own revision list.
export function latestChainRevision(
  revisions: OtcNegotiationRevision[]
): OtcNegotiationRevision | null {
  let latest: OtcNegotiationRevision | null = null
  for (const r of revisions) {
    if (!latest || r.revision_number > latest.revision_number) latest = r
  }
  return latest
}

// Whether the COUNTERPARTY (not the caller) authored the chain's latest revision
// in the merged owner timeline — i.e. it is the caller's turn to act. Uses the
// backend's per-caller `mine` flag (identity-robust across client/employee/bank),
// NOT principal matching. Returns null when the chain has no revisions yet.
export function counterpartyAuthoredLatest(
  timeline: RevisionWithChain[],
  negotiationId: number
): boolean | null {
  const latest = latestRevisionForChain(timeline, negotiationId)
  return latest ? latest.mine === false : null
}

// Same, for a single chain's own revision list (the bidder panel).
export function counterpartyAuthoredLatestRevision(
  revisions: OtcNegotiationRevision[]
): boolean | null {
  const latest = latestChainRevision(revisions)
  return latest ? latest.mine === false : null
}
