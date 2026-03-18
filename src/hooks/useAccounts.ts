import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientAccounts,
  getAccount,
  createAccount,
  updateAccount,
  getAllAccounts,
} from '@/lib/api/accounts'
import type { AccountFilters, CreateAccountRequest, UpdateAccountRequest } from '@/types/account'

export function useClientAccounts() {
  return useQuery({
    queryKey: ['accounts', 'client'],
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

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountRequest) => createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateAccount(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAccountRequest) => updateAccount(id, payload),
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
