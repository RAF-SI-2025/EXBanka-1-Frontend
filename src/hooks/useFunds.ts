import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFunds,
  getFund,
  createFund,
  updateFund,
  investInFund,
  redeemFromFund,
  getMyFundPositions,
} from '@/lib/api/funds'
import type {
  FundFilters,
  CreateFundPayload,
  UpdateFundPayload,
  InvestPayload,
  RedeemPayload,
} from '@/types/fund'

export function useFunds(filters: FundFilters = {}) {
  return useQuery({
    queryKey: ['funds', filters],
    queryFn: () => getFunds(filters),
  })
}

export function useFund(id: number | null) {
  return useQuery({
    queryKey: ['funds', id],
    queryFn: () => getFund(id!),
    enabled: id != null && id > 0,
  })
}

export function useMyFundPositions() {
  return useQuery({
    queryKey: ['funds', 'me'],
    queryFn: getMyFundPositions,
  })
}

export function useCreateFund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFundPayload) => createFund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}

export function useUpdateFund(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateFundPayload) => updateFund(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] })
      queryClient.invalidateQueries({ queryKey: ['funds', id] })
    },
  })
}

export function useInvestFund(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InvestPayload) => investInFund(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds', id] })
      queryClient.invalidateQueries({ queryKey: ['funds', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useRedeemFund(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RedeemPayload) => redeemFromFund(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds', id] })
      queryClient.invalidateQueries({ queryKey: ['funds', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
