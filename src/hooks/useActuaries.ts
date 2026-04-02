import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActuaries,
  setActuaryLimit,
  resetActuaryLimit,
  setActuaryApproval,
} from '@/lib/api/actuaries'
import type { ActuaryFilters, SetLimitPayload, SetApprovalPayload } from '@/types/actuary'

export function useActuaries(filters: ActuaryFilters = {}) {
  return useQuery({
    queryKey: ['actuaries', filters],
    queryFn: () => getActuaries(filters),
  })
}

export function useSetActuaryLimit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SetLimitPayload }) =>
      setActuaryLimit(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}

export function useResetActuaryLimit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resetActuaryLimit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}

export function useSetActuaryApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SetApprovalPayload }) =>
      setActuaryApproval(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}
