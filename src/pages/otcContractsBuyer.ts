import type { AuthUser } from '@/types/auth'
import type { OptionContract } from '@/types/otcOption'

// Whether the current user is the buyer party of `contract`.
//
// Rules (mirrors the employee-bank precedent established for OTC offer
// ownership in src/views/otcOptions/lib/ownership.ts):
//
//   1. contract.buyer.owner_id === user.id AND contract.buyer.owner_type
//      matches the user's role type ('employee' for employees, 'client'
//      for clients).
//   2. Employees act on behalf of the bank — if user.system_type ===
//      'employee' AND contract.buyer.owner_type === 'bank', also treat as
//      buyer.
//
// `user === null` (signed-out / unknown) always returns false.
export function isContractBuyer(user: AuthUser | null, contract: OptionContract): boolean {
  if (!user) return false
  const buyer = contract.buyer
  if (!buyer) return false

  if (user.system_type === 'employee' && buyer.owner_type === 'bank') return true

  const expectedType: 'employee' | 'client' =
    user.system_type === 'employee' ? 'employee' : 'client'
  return buyer.owner_type === expectedType && buyer.owner_id === user.id
}
