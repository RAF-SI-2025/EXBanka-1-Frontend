import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransfers, executeTransfer } from '@/lib/api/transfers'
import { getExchangeRate } from '@/lib/api/exchange'
import type { TransferFilters } from '@/types/transfer'

export function useTransfers(filters?: TransferFilters) {
  return useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => getTransfers(filters),
  })
}

export function useTransferPreview(fromCurrency: string, toCurrency: string, amount: number) {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency, amount],
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency && amount > 0,
  })
}

export function useExecuteTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, verificationCode }: { id: number; verificationCode: string }) =>
      executeTransfer(id, verificationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}
