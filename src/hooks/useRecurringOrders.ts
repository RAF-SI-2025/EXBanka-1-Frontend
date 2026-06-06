import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelRecurringOrder,
  createRecurringOrder,
  getMyRecurringOrders,
  pauseRecurringOrder,
  resumeRecurringOrder,
} from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload } from '@/types/recurringOrder'

const KEY = ['recurring-orders'] as const

export function useRecurringOrders() {
  return useQuery({
    queryKey: KEY,
    queryFn: getMyRecurringOrders,
  })
}

export function useCreateRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRecurringOrderPayload) => createRecurringOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function usePauseRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pauseRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useResumeRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resumeRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useCancelRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}
