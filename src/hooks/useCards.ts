import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCards,
  getAccountCards,
  requestCard,
  confirmCardRequest,
  blockCard,
  unblockCard,
  deactivateCard,
  requestCardForAuthorizedPerson,
} from '@/lib/api/cards'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  })
}

export function useAccountCards(accountId: number) {
  return useQuery({
    queryKey: ['cards', 'account', accountId],
    queryFn: () => getAccountCards(accountId),
    enabled: accountId > 0,
  })
}

export function useRequestCard() {
  return useMutation({
    mutationFn: ({ account_number, card_brand }: { account_number: string; card_brand?: string }) =>
      requestCard(account_number, card_brand),
  })
}

export function useConfirmCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ account_number, code }: { account_number: string; code: string }) =>
      confirmCardRequest(account_number, code),
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
    mutationFn: ({
      account_number,
      authorized_person,
    }: {
      account_number: string
      authorized_person: CreateAuthorizedPersonRequest
    }) => requestCardForAuthorizedPerson(account_number, authorized_person),
  })
}
