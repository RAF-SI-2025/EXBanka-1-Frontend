import { apiClient } from '@/lib/api/axios'
import type {
  Client,
  ClientListResponse,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/types/client'

export async function getClients(filters?: ClientFilters): Promise<ClientListResponse> {
  const params = new URLSearchParams()
  if (filters?.name) params.append('name_filter', filters.name)
  if (filters?.email) params.append('email_filter', filters.email)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<ClientListResponse>('/clients', { params })
  return response.data
}

export async function getClient(id: number): Promise<Client> {
  const response = await apiClient.get<Client>(`/clients/${id}`)
  return response.data
}

export async function getClientMe(): Promise<Client> {
  const response = await apiClient.get<Client>('/me')
  return response.data
}

export async function createClient(payload: CreateClientRequest): Promise<Client> {
  const response = await apiClient.post<Client>('/clients', payload)
  return response.data
}

export async function updateClient(id: number, payload: UpdateClientRequest): Promise<Client> {
  const response = await apiClient.put<Client>(`/clients/${id}`, payload)
  return response.data
}
