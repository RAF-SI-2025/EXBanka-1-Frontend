import { useQuery, useMutation } from '@tanstack/react-query'
import { getExchangeRates, convertCurrency, getExchangeRate } from '@/lib/api/exchange'
import type { ConvertCurrencyRequest } from '@/types/exchange'

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRates,
  })
}

export function useConvertCurrency() {
  return useMutation({
    mutationFn: (params: ConvertCurrencyRequest) => convertCurrency(params),
  })
}

export function useExchangeRate(from: string, to: string) {
  return useQuery({
    queryKey: ['exchange-rate', from, to],
    queryFn: () => getExchangeRate(from, to),
    enabled: !!from && !!to && from !== to,
  })
}
