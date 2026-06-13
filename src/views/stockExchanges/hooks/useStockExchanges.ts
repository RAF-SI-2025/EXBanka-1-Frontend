import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stockExchangesApi } from '@/views/stockExchanges/api/stockExchangesApi'
import type { StockExchangeFilters } from '@/views/stockExchanges/types'

const KEY = ['stock-exchanges'] as const
const TESTING_MODE_KEY = ['stock-exchanges', 'testing-mode'] as const

export function useStockExchanges(filters: StockExchangeFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => stockExchangesApi.list(filters),
  })
}

export function useTestingMode() {
  return useQuery({
    queryKey: TESTING_MODE_KEY,
    queryFn: () => stockExchangesApi.getTestingMode(),
  })
}

export function useSetTestingMode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => stockExchangesApi.setTestingMode(enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: TESTING_MODE_KEY }),
  })
}
