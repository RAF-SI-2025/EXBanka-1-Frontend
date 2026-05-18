import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { peerBanksApi } from '@/views/peerBanks/api/peerBanksApi'
import type { CreatePeerBankPayload, UpdatePeerBankPayload } from '@/views/peerBanks/types'

const KEY = ['peer-banks'] as const

export function usePeerBanks() {
  return useQuery({ queryKey: KEY, queryFn: () => peerBanksApi.list() })
}

export function useCreatePeerBank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePeerBankPayload) => peerBanksApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdatePeerBank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePeerBankPayload }) =>
      peerBanksApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeletePeerBank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => peerBanksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
