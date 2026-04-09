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
  createAuthorizedPerson,
  createCard,
} from '@/lib/api/cards'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardRequestFilters } from '@/types/cardRequest'
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'
import type { CardBrand } from '@/types/card'

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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      account_number,
      card_brand,
      card_name,
    }: {
      account_number: string
      card_brand?: string
      card_name?: string
    }) => requestCard(account_number, card_brand, card_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
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

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      account,
      client,
      cardBrand,
    }: {
      account: Account
      client: Client
      cardBrand: CardBrand
    }) => {
      const ap = await createAuthorizedPerson({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        account_id: account.id,
      })
      return createCard({
        account_number: account.account_number,
        owner_id: ap.id,
        owner_type: 'AUTHORIZED_PERSON',
        card_brand: cardBrand,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cards', 'account', variables.account.account_number],
      })
    },
  })
}
