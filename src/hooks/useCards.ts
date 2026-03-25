import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCards,
  getAccountCards,
  requestCard,
  blockCard,
  unblockCard,
  deactivateCard,
  temporaryBlockCard,
  requestCardForAuthorizedPerson,
  getCardRequests,
  approveCardRequest,
  rejectCardRequest,
} from '@/lib/api/cards'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardRequestFilters } from '@/types/cardRequest'

export function useCards() {
  return useQuery({
    queryKey: ['cards', 'me'],
    queryFn: () => getCards(),
  })
}

export function useAccountCards(accountNumber: string) {
  return useQuery({
    queryKey: ['cards', 'account', accountNumber],
    queryFn: () => getAccountCards(accountNumber),
    enabled: !!accountNumber,
  })
}

export function useRequestCard() {
  return useMutation({
    mutationFn: ({ account_number, card_brand }: { account_number: string; card_brand?: string }) =>
      requestCard(account_number, card_brand),
  })
}

export function useTemporaryBlockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      cardId,
      durationHours = 12,
      reason,
    }: {
      cardId: number
      durationHours?: number
      reason?: string
    }) => temporaryBlockCard(cardId, durationHours, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useBlockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => blockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useUnblockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => unblockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useDeactivateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => deactivateCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useRequestCardForAuthorizedPerson() {
  return useMutation({
    mutationFn: (payload: CreateAuthorizedPersonRequest & { account_id: number }) =>
      requestCardForAuthorizedPerson(payload),
  })
}

export function useCardRequests(filters?: CardRequestFilters) {
  return useQuery({
    queryKey: ['card-requests', filters],
    queryFn: () => getCardRequests(filters),
  })
}

export function useApproveCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveCardRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}

export function useRejectCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectCardRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}
