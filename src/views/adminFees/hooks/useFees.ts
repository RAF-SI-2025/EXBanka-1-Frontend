import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminFeesApi } from '@/views/adminFees/api/adminFeesApi'
import type { CreateFeePayload, UpdateFeePayload } from '@/views/adminFees/types'

const FEES_KEY = ['admin-fees'] as const

export function useFees() {
  return useQuery({ queryKey: FEES_KEY, queryFn: adminFeesApi.list })
}

export function useCreateFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFeePayload) => adminFeesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: FEES_KEY }),
  })
}

export function useUpdateFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeePayload }) =>
      adminFeesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: FEES_KEY }),
  })
}

export function useDeleteFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminFeesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: FEES_KEY }),
  })
}
