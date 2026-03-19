import { useQuery } from '@tanstack/react-query'
import { getTransfers } from '@/lib/api/transfers'
import { getExchangeRate } from '@/lib/api/exchange'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type { TransferFilters } from '@/types/transfer'

export function useTransfers(filters?: TransferFilters) {
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useQuery({
    queryKey: ['transfers', clientId, filters],
    queryFn: () => getTransfers(clientId, filters),
    enabled: clientId > 0,
  })
}

export function useTransferPreview(fromCurrency: string, toCurrency: string, amount: number) {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency, amount],
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency && amount > 0,
  })
}
