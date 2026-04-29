import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOtcOptionOffer,
  counterOtcOptionOffer,
  acceptOtcOptionOffer,
  rejectOtcOptionOffer,
  getOtcOptionOffer,
  getMyOtcOptionOffers,
  getOtcOptionContract,
  getMyOtcOptionContracts,
  exerciseOtcOptionContract,
} from '@/lib/api/otcOption'
import type {
  CreateOtcOfferPayload,
  CounterOtcOfferPayload,
  AcceptOtcOfferPayload,
  ExerciseContractPayload,
  MyOffersFilters,
  MyContractsFilters,
} from '@/types/otcOption'

export function useOtcOptionOffer(id: number | null) {
  return useQuery({
    queryKey: ['otc-option', 'offer', id],
    queryFn: () => getOtcOptionOffer(id!),
    enabled: id != null && id > 0,
  })
}

export function useMyOtcOptionOffers(filters: MyOffersFilters = {}) {
  return useQuery({
    queryKey: ['otc-option', 'me-offers', filters],
    queryFn: () => getMyOtcOptionOffers(filters),
  })
}

export function useCreateOtcOptionOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOtcOfferPayload) => createOtcOptionOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
    },
  })
}

export function useCounterOtcOptionOffer(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CounterOtcOfferPayload) => counterOtcOptionOffer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'offer', id] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
    },
  })
}

export function useAcceptOtcOptionOffer(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AcceptOtcOfferPayload) => acceptOtcOptionOffer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'offer', id] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useRejectOtcOptionOffer(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => rejectOtcOptionOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'offer', id] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
    },
  })
}

export function useOtcOptionContract(id: number | null) {
  return useQuery({
    queryKey: ['otc-option', 'contract', id],
    queryFn: () => getOtcOptionContract(id!),
    enabled: id != null && id > 0,
  })
}

export function useMyOtcOptionContracts(filters: MyContractsFilters = {}) {
  return useQuery({
    queryKey: ['otc-option', 'me-contracts', filters],
    queryFn: () => getMyOtcOptionContracts(filters),
  })
}

export function useExerciseOtcOptionContract(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExerciseContractPayload) => exerciseOtcOptionContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'contract', id] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
