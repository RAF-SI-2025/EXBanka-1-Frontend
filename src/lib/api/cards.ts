import { apiClient } from '@/lib/api/axios'
import type { Card, CreateCardPayload } from '@/types/card'
import type {
  CreateAuthorizedPersonRequest,
  CreateAuthorizedPersonPayload,
  AuthorizedPerson,
} from '@/types/authorized-person'
import type { CardRequest, CardRequestListResponse, CardRequestFilters } from '@/types/cardRequest'

export async function getCards(): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>('/api/v1/me/cards')
  return response.data.cards
}

export async function getAccountCards(accountNumber: string): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>('/api/v1/cards', {
    params: { account_number: accountNumber },
  })
  return response.data.cards
}

export async function requestCard(
  account_number: string,
  card_brand?: string,
  card_name?: string
): Promise<CardRequest> {
  const response = await apiClient.post<CardRequest>('/api/v1/me/cards/requests', {
    account_number,
    ...(card_brand ? { card_brand } : {}),
    ...(card_name ? { card_name } : {}),
  })
  return response.data
}

export async function temporaryBlockCard(
  cardId: number,
  durationHours: number = 12,
  reason?: string
): Promise<void> {
  await apiClient.post(`/api/v1/me/cards/${cardId}/temporary-block`, {
    duration_hours: durationHours,
    ...(reason ? { reason } : {}),
  })
}

export async function blockCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/v1/cards/${cardId}/block`)
}

export async function unblockCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/v1/cards/${cardId}/unblock`)
}

export async function deactivateCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/v1/cards/${cardId}/deactivate`)
}

export async function requestCardForAuthorizedPerson(
  authorized_person: CreateAuthorizedPersonRequest & { account_id: number }
): Promise<{ id: number }> {
  const response = await apiClient.post<{ id: number }>(
    '/api/v1/cards/authorized-person',
    authorized_person
  )
  return response.data
}

export async function getCardRequests(
  filters?: CardRequestFilters
): Promise<CardRequestListResponse> {
  const response = await apiClient.get<CardRequestListResponse>('/api/v1/cards/requests', {
    params: filters,
  })
  return response.data
}

export async function approveCardRequest(id: number): Promise<void> {
  await apiClient.post(`/api/v1/cards/requests/${id}/approve`)
}

export async function rejectCardRequest(id: number, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/cards/requests/${id}/reject`, { reason })
}

export async function createAuthorizedPerson(
  payload: CreateAuthorizedPersonPayload
): Promise<AuthorizedPerson & { id: number }> {
  const response = await apiClient.post<AuthorizedPerson & { id: number }>(
    '/api/v1/cards/authorized-person',
    payload
  )
  return response.data
}

export async function createCard(payload: CreateCardPayload): Promise<Card> {
  const response = await apiClient.post<Card>('/api/v1/cards', payload)
  return response.data
}
