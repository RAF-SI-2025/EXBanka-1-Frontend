import type { Account } from '@/types/account'
import type { Client } from '@/types/client'

export function filterAccountsByOwner(
  accounts: Account[],
  clientsById: Record<number, Client>,
  term: string
): Account[] {
  if (!term) return accounts
  const lower = term.toLowerCase()
  return accounts.filter((acc) => {
    const client = clientsById[acc.owner_id]
    if (client) {
      return `${client.first_name} ${client.last_name}`.toLowerCase().includes(lower)
    }
    return (acc.owner_name ?? '').toLowerCase().includes(lower)
  })
}
