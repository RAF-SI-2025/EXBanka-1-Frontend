import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  exerciseOtcOptionContract,
  getMyOtcOptionContracts,
  getOtcOptionContract,
} from '@/lib/api/otcOption'
import type { ExerciseContractPayload, MyContractsFilters } from '@/types/otcOption'

export function useOtcOptionContract(id: number | null) {
  return useQuery({
    queryKey: ['otc-option', 'contract', id],
    queryFn: () => getOtcOptionContract(id!),
    enabled: id != null && id > 0,
  })
}

export function useMyOtcOptionContracts(filters: MyContractsFilters = {}) {
  return useQuery({
    queryKey: ['otc-option', 'me-contracts', filters],
    queryFn: () => getMyOtcOptionContracts(filters),
  })
}

export function useExerciseOtcOptionContract(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExerciseContractPayload) => exerciseOtcOptionContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'contract', id] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
