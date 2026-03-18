import type { Client } from '@/types/client'

export function createMockClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    first_name: 'Petar',
    last_name: 'Petrović',
    date_of_birth: 631152000,
    gender: 'Male',
    email: 'petar@test.com',
    phone: '+38161000001',
    address: 'Bulevar Kralja Aleksandra 1, Beograd',
    jmbg: '1234567890123',
    ...overrides,
  }
}
