import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPriceAlert,
  deletePriceAlert,
  getMyPriceAlerts,
  updatePriceAlert,
} from '@/lib/api/priceAlerts'
import type { CreatePriceAlertPayload, UpdatePriceAlertPayload } from '@/types/priceAlert'

const PRICE_ALERTS_KEY = ['price-alerts', 'me'] as const

export function usePriceAlerts() {
  return useQuery({
    queryKey: PRICE_ALERTS_KEY,
    queryFn: getMyPriceAlerts,
  })
}

export function useCreatePriceAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePriceAlertPayload) => createPriceAlert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICE_ALERTS_KEY })
    },
  })
}

export function useUpdatePriceAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePriceAlertPayload }) =>
      updatePriceAlert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICE_ALERTS_KEY })
    },
  })
}

export function useDeletePriceAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICE_ALERTS_KEY })
    },
  })
}
