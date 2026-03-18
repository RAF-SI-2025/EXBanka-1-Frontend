import { useQuery } from '@tanstack/react-query'
import { getTransfers } from '@/lib/api/transfers'
import { getExchangeRate } from '@/lib/api/exchange'
import type { TransferFilters } from '@/types/transfer'

export function useTransfers(filters: TransferFilters) {
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
