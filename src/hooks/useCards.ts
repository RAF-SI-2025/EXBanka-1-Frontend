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
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

export function useCards() {
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useQuery({
    queryKey: ['cards', 'client', clientId],
    queryFn: () => getCards(clientId),
    enabled: clientId > 0,
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
    mutationFn: ({
      account_number,
      owner_id,
      owner_type,
      card_brand,
    }: {
      account_number: string
      owner_id: number
      owner_type: 'CLIENT' | 'AUTHORIZED_PERSON'
      card_brand?: string
    }) => requestCard(account_number, owner_id, owner_type, card_brand),
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
    mutationFn: (payload: CreateAuthorizedPersonRequest & { account_id: number }) =>
      requestCardForAuthorizedPerson(payload),
  })
}
