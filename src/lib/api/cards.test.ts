import { apiClient } from '@/lib/api/axios'
import { createAuthorizedPerson, createCard } from '@/lib/api/cards'
import type { CreateAuthorizedPersonPayload, AuthorizedPerson } from '@/types/authorized-person'
import type { CreateCardPayload, Card } from '@/types/card'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { post: jest.fn() },
}))

const mockAuthorizedPerson: AuthorizedPerson & { id: number } = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  date_of_birth: 892857600000,
  gender: 'F',
  email: 'ana@example.com',
  phone: '+381 60 123 4567',
  address: '123 Main St',
}

const mockCard: Card = {
  id: 1,
  card_number: '4111111111111111',
  card_type: 'DEBIT',
  card_name: 'My Card',
  brand: 'VISA',
  created_at: '2026-04-06T10:00:00Z',
  expires_at: '2028-04-06T10:00:00Z',
  account_number: '265-0000000010-00',
  cvv: '123',
  limit: 5000,
  status: 'ACTIVE',
  owner_name: 'Ana Anić',
}

beforeEach(() => jest.clearAllMocks())

describe('createAuthorizedPerson', () => {
  it('posts payload to /api/cards/authorized-person and returns response data', async () => {
    const payload: CreateAuthorizedPersonPayload = {
      first_name: 'Ana',
      last_name: 'Anić',
      account_id: 10,
    }

    jest.mocked(apiClient.post).mockResolvedValue({ data: mockAuthorizedPerson })

    const result = await createAuthorizedPerson(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/cards/authorized-person', payload)
    expect(result).toEqual(mockAuthorizedPerson)
  })
})

describe('createCard', () => {
  it('posts payload to /api/cards and returns response data', async () => {
    const payload: CreateCardPayload = {
      account_number: '265-0000000010-00',
      owner_id: 42,
      owner_type: 'AUTHORIZED_PERSON',
      card_brand: 'VISA',
    }

    jest.mocked(apiClient.post).mockResolvedValue({ data: mockCard })

    const result = await createCard(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/cards', payload)
    expect(result).toEqual(mockCard)
  })
})
