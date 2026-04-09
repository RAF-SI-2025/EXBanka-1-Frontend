import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFees, createFee, updateFee, deleteFee } from '@/lib/api/fees'
import type { CreateFeePayload, UpdateFeePayload } from '@/types/fee'

export function useFees() {
  return useQuery({ queryKey: ['fees'], queryFn: getFees })
}

export function useCreateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFeePayload) => createFee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}

export function useUpdateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeePayload }) =>
      updateFee(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}

export function useDeleteFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteFee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}
