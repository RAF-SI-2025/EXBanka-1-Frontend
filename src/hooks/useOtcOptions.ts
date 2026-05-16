import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOtcOptionOffer,
  getOtcOptionOffer,
  getMyOtcOptionOffers,
  getAllOtcOptionOffers,
  placeBidOrCounter,
  getOtcOptionNegotiations,
  getMyOtcOptionNegotiations,
  counterOtcNegotiation,
  acceptOtcNegotiation,
  rejectOtcNegotiation,
  cancelOtcNegotiation,
  getOtcOptionContract,
  getMyOtcOptionContracts,
  exerciseOtcOptionContract,
} from '@/lib/api/otcOption'
import type {
  CreateOtcOfferPayload,
  PlaceBidPayload,
  CounterNegotiationPayload,
  AcceptNegotiationPayload,
  ExerciseContractPayload,
  MyOffersFilters,
  AllOffersFilters,
  MyNegotiationsFilters,
  MyContractsFilters,
} from '@/types/otcOption'

// -- Listings ---------------------------------------------------------------

export function useOtcOptionOffer(id: number | null) {
  return useQuery({
    queryKey: ['otc-option', 'offer', id],
    queryFn: () => getOtcOptionOffer(id!),
    enabled: id != null && id > 0,
  })
}

export function useMyOtcOptionOffers(
  filters: MyOffersFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['otc-option', 'me-offers', filters],
    queryFn: () => getMyOtcOptionOffers(filters),
    enabled: options?.enabled ?? true,
  })
}

export function useAllOtcOptionOffers(
  filters: AllOffersFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['otc-option', 'all-offers', filters],
    queryFn: () => getAllOtcOptionOffers(filters),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateOtcOptionOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOtcOfferPayload) => createOtcOptionOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'all-offers'] })
    },
  })
}

// -- Negotiation chains -----------------------------------------------------

export function useOtcOptionNegotiations(
  offerId: number | null,
  options?: { enabled?: boolean }
) {
  const hasId = offerId != null && offerId > 0
  return useQuery({
    queryKey: ['otc-option', 'negotiations', offerId],
    queryFn: () => getOtcOptionNegotiations(offerId!),
    enabled: hasId && (options?.enabled ?? true),
  })
}

export function useMyOtcOptionNegotiations(
  filters: MyNegotiationsFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['otc-option', 'me-negotiations', filters],
    queryFn: () => getMyOtcOptionNegotiations(filters),
    enabled: options?.enabled ?? true,
  })
}

export function usePlaceBidOnOtcOption(offerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    // Try bid first; if the caller already has a chain on this offer the
    // backend returns 409 and placeBidOrCounter transparently falls back
    // to countering the existing chain with the same terms.
    mutationFn: (payload: PlaceBidPayload) => placeBidOrCounter(offerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'negotiations', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-negotiations'] })
    },
  })
}

export function useCounterOtcNegotiation(offerId: number, negotiationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CounterNegotiationPayload) =>
      counterOtcNegotiation(offerId, negotiationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'negotiations', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-negotiations'] })
    },
  })
}

export function useAcceptOtcNegotiation(offerId: number, negotiationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AcceptNegotiationPayload) =>
      acceptOtcNegotiation(offerId, negotiationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'negotiations', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'offer', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-offers'] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useRejectOtcNegotiation(offerId: number, negotiationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => rejectOtcNegotiation(offerId, negotiationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'negotiations', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-negotiations'] })
    },
  })
}

export function useCancelOtcNegotiation(offerId: number, negotiationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cancelOtcNegotiation(offerId, negotiationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'negotiations', offerId] })
      queryClient.invalidateQueries({ queryKey: ['otc-option', 'me-negotiations'] })
    },
  })
}

// -- Contracts (unchanged URLs) ---------------------------------------------

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
