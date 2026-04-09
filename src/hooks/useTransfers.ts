import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransfers, getTransferPreview, executeTransfer } from '@/lib/api/transfers'
import type { TransferFilters, CreateTransferRequest } from '@/types/transfer'

export function useTransfers(filters?: TransferFilters) {
  return useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => getTransfers(filters),
  })
}

export function useTransferPreview(payload: CreateTransferRequest | null) {
  return useQuery({
    queryKey: ['transfer-preview', payload],
    queryFn: () => getTransferPreview(payload!),
    enabled:
      !!payload &&
      !!payload.from_account_number &&
      !!payload.to_account_number &&
      payload.amount > 0,
  })
}

export function useExecuteTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, challengeId }: { id: number; challengeId: number }) =>
      executeTransfer(id, challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}
