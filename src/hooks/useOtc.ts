import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOtcOffers, buyOtcOffer, buyOtcOfferOnBehalf } from '@/lib/api/otc'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type { OtcFilters } from '@/types/otc'
import type { PlaceBidPayload } from '@/views/otcOptions/types'

export function useOtcOffers(filters?: OtcFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['otc-offers', filters],
    queryFn: () => getOtcOffers(filters),
    enabled: options?.enabled ?? true,
  })
}

export function useBuyOtcOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      quantity,
      account_id,
    }: {
      id: number
      quantity: number
      account_id: number
    }) => buyOtcOffer(id, { quantity, account_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-offers'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useBuyOtcOfferOnBehalf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      client_id,
      account_id,
      quantity,
    }: {
      id: number
      client_id: number
      account_id: number
      quantity: number
    }) => buyOtcOfferOnBehalf(id, { client_id, account_id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-offers'] })
    },
  })
}

export function useRemoteOptionOffers() {
  return useQuery({
    queryKey: ['otc-option-offers', 'remote'],
    queryFn: () => otcOptionsApi.listAll({ kind: 'remote' }),
  })
}

export function usePlaceBidOnRemoteOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ offerId, ...payload }: { offerId: number } & PlaceBidPayload) =>
      otcOptionsApi.placeBid(offerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-offers'] })
      queryClient.invalidateQueries({ queryKey: ['otc-option-offers'] })
    },
  })
}
