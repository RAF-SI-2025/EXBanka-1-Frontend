import type { OtcOptionRow } from '@/views/otcOptions/types'

// Used by both the table (button label + row class) and the view (row-click
// dispatch). Accepts the many shapes `/otc/options` ships seller_id in:
// numeric, "client-7", bare "7", or nested objects with `id`/`owner_id`.
export function isOwnRow(
  row: OtcOptionRow,
  bidder: { owner_type: string; owner_id: number | null } | null
): boolean {
  if (!bidder || bidder.owner_id == null) return false
  const expectedId = String(bidder.owner_id)
  const sid: unknown = row.seller_id
  if (sid == null) return false
  if (typeof sid === 'number') {
    return String(sid) === expectedId
  }
  if (typeof sid === 'string') {
    const dashIdx = sid.indexOf('-')
    if (dashIdx > 0) {
      return sid.slice(0, dashIdx) === bidder.owner_type && sid.slice(dashIdx + 1) === expectedId
    }
    return sid === expectedId
  }
  if (typeof sid === 'object') {
    const obj = sid as { owner_type?: string; owner_id?: unknown; id?: unknown }
    if (obj.owner_type && obj.owner_type !== bidder.owner_type) return false
    const idCandidate = obj.owner_id ?? obj.id
    return idCandidate != null && String(idCandidate) === expectedId
  }
  return false
}
