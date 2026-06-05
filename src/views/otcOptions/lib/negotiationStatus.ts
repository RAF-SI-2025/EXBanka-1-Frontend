import type { OtcNegotiationStatus } from '@/views/otcOptions/types'

// A negotiation chain is "active" — i.e. the listing owner can still
// Accept / Counter / Reject it — while it is `open` (local), `countered`, or
// `ongoing` (the peer status vocabulary cross-bank/remote chains use, spec
// §47.2). Every other status is terminal and only the read-only history
// remains available.
export function isNegotiationActive(status: OtcNegotiationStatus): boolean {
  return status === 'open' || status === 'countered' || status === 'ongoing'
}
