import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRecurringOrder } from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload } from '@/types/recurringOrder'

export function useCreateRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRecurringOrderPayload) => createRecurringOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-orders'] })
    },
  })
}
