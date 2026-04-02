import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPortfolio,
  getPortfolioSummary,
  makeHoldingPublic,
  exerciseOption,
} from '@/lib/api/portfolio'
import type { PortfolioFilters, MakePublicPayload } from '@/types/portfolio'

export function usePortfolio(filters: PortfolioFilters = {}) {
  return useQuery({ queryKey: ['portfolio', filters], queryFn: () => getPortfolio(filters) })
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
