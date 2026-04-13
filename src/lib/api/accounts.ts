import { apiClient } from '@/lib/api/axios'
import type {
  Account,
  AccountListResponse,
  AccountFilters,
  CreateAccountRequest,
  UpdateAccountNameRequest,
  UpdateAccountLimitsRequest,
} from '@/types/account'

export async function getClientAccounts(): Promise<AccountListResponse> {
  const response = await apiClient.get<AccountListResponse>('/api/v1/me/accounts')
  return response.data
}

export async function getAccount(id: number): Promise<Account> {
  const response = await apiClient.get<Account>(`/api/v1/accounts/${id}`)
  return response.data
}

export async function getClientAccount(id: number): Promise<Account> {
  const response = await apiClient.get<Account>(`/api/v1/me/accounts/${id}`)
  return response.data
}

export async function createAccount(payload: CreateAccountRequest): Promise<Account> {
  const response = await apiClient.post<Account>('/api/v1/accounts', payload)
  return response.data
}

export async function updateAccountName(
  id: number,
  payload: UpdateAccountNameRequest
): Promise<Account> {
  const response = await apiClient.put<Account>(`/api/v1/accounts/${id}/name`, payload)
  return response.data
}

export async function updateAccountLimits(
  id: number,
  payload: UpdateAccountLimitsRequest
): Promise<Account> {
  const response = await apiClient.put<Account>(`/api/v1/accounts/${id}/limits`, payload)
  return response.data
}

export async function getAllAccounts(filters?: AccountFilters): Promise<AccountListResponse> {
  const params = new URLSearchParams()
  if (filters?.name_filter) params.append('name_filter', filters.name_filter)
  if (filters?.account_number_filter)
    params.append('account_number_filter', filters.account_number_filter)
  if (filters?.type_filter) params.append('type_filter', filters.type_filter)
  if (filters?.client_id) params.append('client_id', String(filters.client_id))
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<AccountListResponse>('/api/v1/accounts', { params })
  return response.data
}

export async function getBankAccounts(): Promise<AccountListResponse> {
  const response = await apiClient.get<{ accounts: Account[] }>('/api/v1/bank-accounts')
  return { accounts: response.data.accounts, total: response.data.accounts.length }
}
