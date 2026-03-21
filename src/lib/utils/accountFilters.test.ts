import { filterAccountsByOwner } from '@/lib/utils/accountFilters'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import type { Client } from '@/types/client'

const makeClient = (id: number, first: string, last: string): Client => ({
  id,
  first_name: first,
  last_name: last,
  email: `${first}@test.com`,
  date_of_birth: 0,
})

describe('filterAccountsByOwner', () => {
  it('returns all accounts when search term is empty', () => {
    const accounts = [
      createMockAccount({ account_category: 'personal', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'business', owner_id: 2 }),
    ]
    const clientsById = { 1: makeClient(1, 'Ana', 'Anić'), 2: makeClient(2, 'Marko', 'Marković') }
    expect(filterAccountsByOwner(accounts, clientsById, '')).toHaveLength(2)
  })

  it('matches personal accounts by client first name', () => {
    const accounts = [
      createMockAccount({ account_category: 'personal', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'personal', owner_id: 2 }),
    ]
    const clientsById = {
      1: makeClient(1, 'Ana', 'Anić'),
      2: makeClient(2, 'Marko', 'Marković'),
    }
    const result = filterAccountsByOwner(accounts, clientsById, 'Ana')
    expect(result).toHaveLength(1)
    expect(result[0].owner_id).toBe(1)
  })

  it('matches personal accounts by client last name', () => {
    const accounts = [
      createMockAccount({ account_category: 'personal', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'personal', owner_id: 2 }),
    ]
    const clientsById = {
      1: makeClient(1, 'Ana', 'Anić'),
      2: makeClient(2, 'Marko', 'Marković'),
    }
    const result = filterAccountsByOwner(accounts, clientsById, 'Marković')
    expect(result).toHaveLength(1)
    expect(result[0].owner_id).toBe(2)
  })

  it('matches personal accounts case-insensitively', () => {
    const accounts = [createMockAccount({ account_category: 'personal', owner_id: 1 })]
    const clientsById = { 1: makeClient(1, 'Ana', 'Anić') }
    expect(filterAccountsByOwner(accounts, clientsById, 'ana')).toHaveLength(1)
    expect(filterAccountsByOwner(accounts, clientsById, 'ANA')).toHaveLength(1)
  })

  it('matches company accounts by owner first name', () => {
    const accounts = [
      createMockAccount({ id: 1, account_category: 'business', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'business', owner_id: 2 }),
    ]
    const clientsById = {
      1: makeClient(1, 'Jovana', 'Jović'),
      2: makeClient(2, 'Stefan', 'Stefanović'),
    }
    const result = filterAccountsByOwner(accounts, clientsById, 'Jovana')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('matches company accounts by owner last name', () => {
    const accounts = [
      createMockAccount({ id: 1, account_category: 'business', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'business', owner_id: 2 }),
    ]
    const clientsById = {
      1: makeClient(1, 'Jovana', 'Jović'),
      2: makeClient(2, 'Stefan', 'Stefanović'),
    }
    const result = filterAccountsByOwner(accounts, clientsById, 'Stefanović')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('matches company accounts case-insensitively', () => {
    const accounts = [createMockAccount({ account_category: 'business', owner_id: 1 })]
    const clientsById = { 1: makeClient(1, 'Jovana', 'Jović') }
    expect(filterAccountsByOwner(accounts, clientsById, 'jovana')).toHaveLength(1)
    expect(filterAccountsByOwner(accounts, clientsById, 'JOVANA')).toHaveLength(1)
  })

  it('excludes non-matching accounts', () => {
    const accounts = [
      createMockAccount({ account_category: 'personal', owner_id: 1 }),
      createMockAccount({ id: 2, account_category: 'business', owner_id: 2 }),
    ]
    const clientsById = {
      1: makeClient(1, 'Ana', 'Anić'),
      2: makeClient(2, 'Marko', 'Marković'),
    }
    expect(filterAccountsByOwner(accounts, clientsById, 'xyz')).toHaveLength(0)
  })

  it('handles account with no matching client entry', () => {
    const accounts = [
      createMockAccount({ account_category: 'personal', owner_id: 99 }),
      createMockAccount({ id: 2, account_category: 'business', owner_id: 99 }),
    ]
    expect(filterAccountsByOwner(accounts, {}, 'anything')).toHaveLength(0)
  })

  it('falls back to owner_name when client not in map', () => {
    const accounts = [
      createMockAccount({
        account_category: 'personal',
        owner_id: 99,
        owner_name: 'Petar Petrović',
      }),
    ]
    expect(filterAccountsByOwner(accounts, {}, 'Petar')).toHaveLength(1)
  })
})
