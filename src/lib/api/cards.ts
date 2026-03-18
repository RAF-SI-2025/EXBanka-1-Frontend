import { apiClient } from '@/lib/api/axios'
import type { Card } from '@/types/card'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

export async function getCards(): Promise<Card[]> {
  const response = await apiClient.get<Card[]>('/api/cards')
  return response.data
}

export async function getAccountCards(accountId: number): Promise<Card[]> {
  const response = await apiClient.get<Card[]>(`/api/accounts/${accountId}/cards`)
  return response.data
}

export async function requestCard(account_number: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/api/cards/request', {
    account_number,
  })
  return response.data
}

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
  account_number: string,
  authorized_person: CreateAuthorizedPersonRequest
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/api/cards/request-authorized', {
    account_number,
    authorized_person,
  })
  return response.data
}
