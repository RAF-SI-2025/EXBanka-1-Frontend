import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInterestRateTiers,
  createTier,
  updateTier,
  deleteTier,
  applyTier,
} from '@/lib/api/interestRateTiers'
import type { CreateTierPayload } from '@/types/interestRateTiers'

export function useInterestRateTiers() {
  return useQuery({ queryKey: ['interestRateTiers'], queryFn: getInterestRateTiers })
}

export function useCreateTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTierPayload) => createTier(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useUpdateTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateTierPayload }) =>
      updateTier(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useDeleteTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useApplyTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => applyTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}
