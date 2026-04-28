import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientAccounts,
  getAccount,
  getClientAccount,
  createAccount,
  updateAccountName,
  updateAccountLimits,
  getAllAccounts,
  getAccountsByClient,
  getBankAccounts,
  getAccountActivity,
} from '@/lib/api/accounts'
import type {
  AccountFilters,
  CreateAccountRequest,
  UpdateAccountNameRequest,
  UpdateAccountLimitsRequest,
  AccountActivityFilters,
} from '@/types/account'

export function useClientAccounts() {
  return useQuery({
    queryKey: ['accounts', 'me'],
    queryFn: () => getClientAccounts(),
  })
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccount(id),
    enabled: id > 0,
  })
}

export function useClientAccount(id: number) {
  return useQuery({
    queryKey: ['account', 'me', id],
    queryFn: () => getClientAccount(id),
    enabled: id > 0,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountRequest) => createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateAccountName(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAccountNameRequest) => updateAccountName(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account', id] })
    },
  })
}

export function useUpdateAccountLimits(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAccountLimitsRequest) => updateAccountLimits(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account', id] })
    },
  })
}

export function useAllAccounts(filters?: AccountFilters) {
  return useQuery({
    queryKey: ['accounts', 'all', filters],
    queryFn: () => getAllAccounts(filters),
  })
}

export function useBankAccounts() {
  return useQuery({
    queryKey: ['accounts', 'bank'],
    queryFn: () => getBankAccounts(),
  })
}

export function useAccountsByClient(clientId: number) {
  return useQuery({
    queryKey: ['accounts', 'client', clientId],
    queryFn: () => getAccountsByClient(clientId),
    enabled: clientId > 0,
  })
}

export function useSearchAccounts(query: string) {
  return useQuery({
    queryKey: ['accounts', 'search', query],
    queryFn: () => getAllAccounts({ account_number_filter: query, page_size: 10 }),
    enabled: query.length > 0,
  })
}

export function useAccountActivity(id: number, filters: AccountActivityFilters = {}) {
  return useQuery({
    queryKey: ['accountActivity', id, filters],
    queryFn: () => getAccountActivity(id, filters),
    enabled: id > 0,
  })
}
