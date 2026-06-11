import type { OtcParty } from '@/views/otcOptions/types'

// Render the "By" / actor label for a revision row.
//
// The backend identifies a revision's actor in one of two ways:
//   1. A concrete principal — `owner_type` + numeric `owner_id` (e.g. the
//      spec's "client-42"). Rendered as "<type>-<id>", or "You" when it is the
//      caller.
//   2. Trade role only — "buyer" / "seller" with NO numeric id (the live shape
//      that produced the "buyer-undefined" bug: the naive `${type}-${id}`
//      template stringified the missing id). With no id we show the role.
export function formatActor(
  type: string | null | undefined,
  id: number | null | undefined,
  currentPrincipal?: OtcParty | null
): string {
  if (id != null) {
    if (
      currentPrincipal &&
      currentPrincipal.owner_type === type &&
      currentPrincipal.owner_id === id
    ) {
      return 'You'
    }
    return `${type}-${id}`
  }
  return prettyRole(type)
}

function prettyRole(type: string | null | undefined): string {
  if (!type) return '—'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Coerce a principal/actor id that may arrive as a number, a numeric string, an
// empty string, or be absent into `number | null`.
export function toPrincipalId(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? null : n
}
