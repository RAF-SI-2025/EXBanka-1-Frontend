import { apiClient } from '@/lib/api/axios'
import type {
  CreateRecurringOrderPayload,
  CreateRecurringOrderResponse,
  RecurringOrder,
  RecurringOrderListResponse,
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

export async function getMyRecurringOrders(): Promise<RecurringOrder[]> {
  const { data } = await apiClient.get<RecurringOrderListResponse>('/me/recurring-orders')
  return data.recurring_orders ?? []
}

export async function pauseRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/pause`
  )
  return data.recurring_order
}

export async function resumeRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/resume`
  )
  return data.recurring_order
}

export async function cancelRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/cancel`
  )
  return data.recurring_order
}
