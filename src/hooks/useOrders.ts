import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrder,
  createOrderOnBehalf,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  approveOrder,
  declineOrder,
} from '@/lib/api/orders'
import type {
  MyOrderFilters,
  AdminOrderFilters,
  CreateOrderPayload,
  CreateOrderOnBehalfPayload,
} from '@/types/order'

export function useMyOrders(filters: MyOrderFilters = {}) {
  return useQuery({ queryKey: ['my-orders', filters], queryFn: () => getMyOrders(filters) })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useCreateOrderOnBehalf() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderOnBehalfPayload) => createOrderOnBehalf(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-orders'] }),
  })
}

export function useAllOrders(filters: AdminOrderFilters = {}) {
  return useQuery({ queryKey: ['all-orders', filters], queryFn: () => getAllOrders(filters) })
}

export function useApproveOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-orders'] }),
  })
}

export function useDeclineOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => declineOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-orders'] }),
  })
}
