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
  if (filters?.name) params.append('name', filters.name)
  if (filters?.email) params.append('email', filters.email)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<ClientListResponse>('/api/clients', { params })
  return response.data
}

export async function getClient(id: number): Promise<Client> {
  const response = await apiClient.get<Client>(`/api/clients/${id}`)
  return response.data
}

export async function createClient(payload: CreateClientRequest): Promise<Client> {
  const response = await apiClient.post<Client>('/api/clients', payload)
  return response.data
}

export async function updateClient(id: number, payload: UpdateClientRequest): Promise<Client> {
  const response = await apiClient.put<Client>(`/api/clients/${id}`, payload)
  return response.data
}
