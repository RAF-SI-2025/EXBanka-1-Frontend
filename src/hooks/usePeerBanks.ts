import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPeerBanks, createPeerBank, updatePeerBank, deletePeerBank } from '@/lib/api/peerBanks'
import type { CreatePeerBankPayload, UpdatePeerBankPayload } from '@/types/peerBank'

export function usePeerBanks() {
  return useQuery({ queryKey: ['peer-banks'], queryFn: () => getPeerBanks() })
}

export function useCreatePeerBank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePeerBankPayload) => createPeerBank(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['peer-banks'] }),
  })
}

export function useUpdatePeerBank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePeerBankPayload }) =>
      updatePeerBank(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['peer-banks'] }),
  })
}

export function useDeletePeerBank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePeerBank(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['peer-banks'] }),
  })
}
