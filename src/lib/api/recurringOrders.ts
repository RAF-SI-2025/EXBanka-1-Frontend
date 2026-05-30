import { apiClient } from '@/lib/api/axios'
import type {
  CreateRecurringOrderPayload,
  CreateRecurringOrderResponse,
  RecurringOrder,
} from '@/types/recurringOrder'

export async function createRecurringOrder(
  payload: CreateRecurringOrderPayload
): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    '/me/recurring-orders',
    payload
  )
  return data.recurring_order
}
