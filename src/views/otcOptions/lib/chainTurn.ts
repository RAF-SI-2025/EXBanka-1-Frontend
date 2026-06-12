import type { OtcNegotiationRevision, OtcOptionDirection, OtcParty } from '@/views/otcOptions/types'
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

// Whether a revision's author is the chain's BIDDER.
//   - Concrete principal (local chains): match owner_type + id against the bidder.
//   - Trade role only (remote chains): 'buyer' is the bidder on a sell listing,
//     'seller' is the bidder on a buy listing.
function authoredByBidder(
  type: string,
  id: number | null,
  bidder: OtcParty,
  direction: OtcOptionDirection
): boolean {
  if (type === 'buyer') return direction === 'sell_initiated'
  if (type === 'seller') return direction === 'buy_initiated'
  return type === bidder.owner_type && id === bidder.owner_id
}

// Whether the chain's latest revision was authored by the BIDDER. When true it
// is the listing OWNER's turn (show Accept/Counter/Reject); when false the owner
// moved last (show "Waiting on bidder"). Returns null when turn can't be
// determined (no revisions yet). Derived from the revision author — NOT the
// negotiation-level can_* flags.
//   - Concrete principal (local chains): author IS the bidder iff its
//     owner_type + id match neg.bidder.
//   - Trade role only (remote chains): map the role to the bidder by listing
//     direction — on a sell listing the bidder is the buyer; on a buy listing
//     the bidder is the seller.
export function bidderAuthoredLatest(
  timeline: RevisionWithChain[],
  negotiationId: number,
  bidder: OtcParty,
  direction: OtcOptionDirection
): boolean | null {
  const latest = latestRevisionForChain(timeline, negotiationId)
  if (!latest) return null
  return authoredByBidder(
    latest.action_by_principal_type,
    latest.action_by_principal_id,
    bidder,
    direction
  )
}

// Whether the BIDDER authored the most recent revision of a single chain
// (the bidder panel's own revisions list). true ⇒ owner's turn (bidder waits);
// false ⇒ bidder's turn (Counter/Accept); null ⇒ no revisions yet.
export function bidderAuthoredLatestRevision(
  revisions: OtcNegotiationRevision[],
  bidder: OtcParty,
  direction: OtcOptionDirection
): boolean | null {
  let latest: OtcNegotiationRevision | null = null
  for (const r of revisions) {
    if (!latest || r.revision_number > latest.revision_number) latest = r
  }
  if (!latest) return null
  return authoredByBidder(
    latest.action_by_principal_type,
    latest.action_by_principal_id,
    bidder,
    direction
  )
}
