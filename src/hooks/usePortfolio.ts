import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPortfolio,
  getPortfolioSummary,
  makePublicHolding,
  exerciseOption,
} from '@/lib/api/portfolio'
import type { HoldingType } from '@/types/portfolio'

export function usePortfolio(securityType?: HoldingType, page?: number) {
  return useQuery({
    queryKey: ['portfolio', securityType, page],
    queryFn: () => getPortfolio(securityType, page),
  })
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: getPortfolioSummary,
  })
}

export function useMakePublic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      makePublicHolding(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useExerciseOption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exerciseOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
