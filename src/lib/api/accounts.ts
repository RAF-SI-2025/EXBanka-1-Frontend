import { apiClient } from '@/lib/api/axios'
import type {
  Account,
  AccountListResponse,
  AccountFilters,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@/types/account'

export async function getClientAccounts(): Promise<AccountListResponse> {
  const response = await apiClient.get<AccountListResponse>('/api/accounts/client')
  return response.data
}

export async function getAccount(id: number): Promise<Account> {
  const response = await apiClient.get<Account>(`/api/accounts/${id}`)
  return response.data
}

export async function createAccount(payload: CreateAccountRequest): Promise<Account> {
  const response = await apiClient.post<Account>('/api/accounts', payload)
  return response.data
}

export async function updateAccount(id: number, payload: UpdateAccountRequest): Promise<Account> {
  const response = await apiClient.put<Account>(`/api/accounts/${id}`, payload)
  return response.data
}

export async function getAllAccounts(filters?: AccountFilters): Promise<AccountListResponse> {
  const params = new URLSearchParams()
  if (filters?.owner_name) params.append('owner_name', filters.owner_name)
  if (filters?.account_number) params.append('account_number', filters.account_number)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<AccountListResponse>('/api/accounts', { params })
  return response.data
}
