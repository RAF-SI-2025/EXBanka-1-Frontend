import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPortfolio,
  getPortfolioSummary,
  makeHoldingPublic,
  exerciseOption,
  getHoldingTransactions,
} from '@/lib/api/portfolio'
import type { MakePublicPayload, HoldingTransactionsFilters } from '@/types/portfolio'

export function usePortfolio() {
  return useQuery({ queryKey: ['portfolio'], queryFn: () => getPortfolio() })
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => getPortfolioSummary(),
  })
}

export function useMakePublic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MakePublicPayload }) =>
      makeHoldingPublic(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}

export function useExerciseOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exerciseOption(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}

export function useHoldingTransactions(id: number, filters: HoldingTransactionsFilters = {}) {
  return useQuery({
    queryKey: ['holdingTransactions', id, filters],
    queryFn: () => getHoldingTransactions(id, filters),
    enabled: id > 0,
  })
}
