import { apiClient } from '@/lib/api/axios'
import type {
  Order,
  OrderListResponse,
  CreateOrderPayload,
  CreateOrderOnBehalfPayload,
  MyOrderFilters,
  AdminOrderFilters,
} from '@/types/order'

function normalizeOrder(raw: unknown): Order {
  const r = raw as Record<string, unknown>
  const { listing, ...rest } = r as { listing?: Record<string, unknown> } & Record<string, unknown>
  const merged: Record<string, unknown> = listing ? { ...rest, ...listing } : { ...rest }
  if (!merged.security_name && merged.name) {
    merged.security_name = merged.name
  }
  return merged as unknown as Order
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>('/me/orders', payload)
  return data
}

export async function createOrderOnBehalf(payload: CreateOrderOnBehalfPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders', payload)
  return data
}

export async function getMyOrders(filters: MyOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/me/orders', { params: filters })
  return { ...data, orders: (data.orders ?? []).map(normalizeOrder) }
}

export async function getMyOrder(id: number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/me/orders/${id}`)
  return data
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/me/orders/${id}/cancel`)
  return data
}

export async function getAllOrders(filters: AdminOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/orders', { params: filters })
  return { ...data, orders: (data.orders ?? []).map(normalizeOrder) }
}

export async function approveOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${id}/approve`)
  return data
}

export async function declineOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${id}/reject`)
  return data
}
