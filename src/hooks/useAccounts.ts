import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientAccounts,
  getAccount,
  createAccount,
  updateAccountName,
  updateAccountLimits,
  getAllAccounts,
} from '@/lib/api/accounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type {
  AccountFilters,
  CreateAccountRequest,
  UpdateAccountNameRequest,
  UpdateAccountLimitsRequest,
} from '@/types/account'

export function useClientAccounts() {
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useQuery({
    queryKey: ['accounts', 'client', clientId],
    queryFn: () => getClientAccounts(clientId),
    enabled: clientId > 0,
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
