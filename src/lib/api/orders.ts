import { apiClient } from '@/lib/api/axios'
import type {
  Order,
  OrderListResponse,
  CreateOrderPayload,
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
  const { data } = await apiClient.post<Order>('/api/v1/me/orders', payload)
  return data
}

export async function getMyOrders(filters: MyOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/api/v1/me/orders', { params: filters })
  return { ...data, orders: (data.orders ?? []).map(normalizeOrder) }
}

export async function getMyOrder(id: number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/api/v1/me/orders/${id}`)
  return data
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/v1/me/orders/${id}/cancel`)
  return data
}

export async function getAllOrders(filters: AdminOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/api/v1/orders', { params: filters })
  return { ...data, orders: (data.orders ?? []).map(normalizeOrder) }
}

export async function approveOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/v1/orders/${id}/approve`)
  return data
}

export async function declineOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/v1/orders/${id}/decline`)
  return data
}
