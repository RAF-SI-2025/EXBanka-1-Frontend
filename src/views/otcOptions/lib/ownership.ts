import type { OtcOptionRow } from '@/views/otcOptions/types'

// Result of decoding the many `seller_id` shapes /otc/options ships:
// numeric, "<owner_type>-<id>", bare "<id>", or a nested object with
// `id`/`owner_id`. `owner_type` is `null` when the raw shape didn't carry
// one (numeric or bare-string id). `id` is the stringified seller id, or
// `null` if we couldn't extract one.
interface SellerIdParts {
  owner_type: string | null
  id: string | null
}

function parseSellerId(sid: OtcOptionRow['seller_id']): SellerIdParts | null {
  if (sid == null) return null
  if (typeof sid === 'number') {
    return { owner_type: null, id: String(sid) }
  }
  if (typeof sid === 'string') {
    const dashIdx = sid.indexOf('-')
    if (dashIdx > 0) {
      return { owner_type: sid.slice(0, dashIdx), id: sid.slice(dashIdx + 1) }
    }
    return { owner_type: null, id: sid }
  }
  if (typeof sid === 'object') {
    const obj = sid as { owner_type?: string; owner_id?: unknown; id?: unknown }
    const idCandidate = obj.owner_id ?? obj.id
    return {
      owner_type: obj.owner_type ?? null,
      id: idCandidate == null ? null : String(idCandidate),
    }
  }
  return null
}

// Used by both the table (button label + row class) and the view (row-click
// dispatch). Accepts the many shapes `/otc/options` ships seller_id in:
// numeric, "client-7", bare "7", or nested objects with `id`/`owner_id`.
//
// Special case: an employee acts on behalf of their own bank, so a
// bank-owned LOCAL row (kind === 'local', seller_id resolves to owner_type
// 'bank') counts as "own" for an employee bidder. Remote bank-owned rows
// are always somebody else's bank, so they don't qualify.
export function isOwnRow(
  row: OtcOptionRow,
  bidder: { owner_type: string; owner_id: number | null } | null
): boolean {
  if (!bidder) return false
  const parts = parseSellerId(row.seller_id)
  if (!parts) return false

  if (bidder.owner_type === 'employee' && row.kind === 'local' && parts.owner_type === 'bank') {
    return true
  }

  if (bidder.owner_id == null) return false
  const expectedId = String(bidder.owner_id)

  if (parts.owner_type != null && parts.owner_type !== bidder.owner_type) return false
  return parts.id != null && parts.id === expectedId
}
