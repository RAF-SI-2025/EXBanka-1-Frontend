import type { Account } from '@/types/account'

export function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    account_number: '111000100000000011',
    account_name: 'Tekući RSD',
    currency_code: 'RSD',
    account_kind: 'CHECKING',
    account_type: 'CURRENT',
    account_category: 'PERSONAL',
    balance: 50000,
    available_balance: 49000,
    status: 'ACTIVE',
    owner_id: 1,
    owner_name: 'Petar Petrović',
    ...overrides,
  }
}
