import { apiClient } from '@/lib/api/axios'
import type { Card } from '@/types/card'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

export async function getCards(clientId: number): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>(`/api/cards/client/${clientId}`)
  return response.data.cards
}

export async function getAccountCards(accountNumber: string): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>(`/api/cards/account/${accountNumber}`)
  return response.data.cards
}

export async function requestCard(
  account_number: string,
  owner_id: number,
  owner_type: 'CLIENT' | 'AUTHORIZED_PERSON',
  card_brand?: string
): Promise<Card> {
  const response = await apiClient.post<Card>('/api/cards', {
    account_number,
    owner_id,
    owner_type,
    ...(card_brand ? { card_brand } : {}),
  })
  return response.data
}

// NOTE: No matching endpoint found in REST API spec for card verification
export async function confirmCardRequest(account_number: string, code: string): Promise<Card> {
  const response = await apiClient.post<Card>('/api/cards/confirm', { account_number, code })
  return response.data
}

export async function blockCard(cardId: number): Promise<void> {
  await apiClient.put(`/api/cards/${cardId}/block`)
}

export async function unblockCard(cardId: number): Promise<void> {
  await apiClient.put(`/api/cards/${cardId}/unblock`)
}

export async function deactivateCard(cardId: number): Promise<void> {
  await apiClient.put(`/api/cards/${cardId}/deactivate`)
}

export async function requestCardForAuthorizedPerson(
  authorized_person: CreateAuthorizedPersonRequest & { account_id: number }
): Promise<{ id: number }> {
  const response = await apiClient.post<{ id: number }>(
    '/api/cards/authorized-person',
    authorized_person
  )
  return response.data
}
