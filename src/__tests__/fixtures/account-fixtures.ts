import type { Account } from '@/types/account'

export function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    account_number: '111000100000000011',
    name: 'Tekući RSD',
    currency: 'RSD',
    account_type: 'CURRENT',
    owner_type: 'PERSONAL',
    subtype: 'STANDARD',
    balance: 50000,
    available_balance: 49000,
    status: 'ACTIVE',
    owner_id: 1,
    owner_name: 'Petar Petrović',
    ...overrides,
  }
}
