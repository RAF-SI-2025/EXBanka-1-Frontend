import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStockExchanges, getTestingMode, setTestingMode } from '@/lib/api/stockExchanges'
import type { StockExchangeFilters } from '@/types/stockExchange'

export function useStockExchanges(filters: StockExchangeFilters = {}) {
  return useQuery({
    queryKey: ['stock-exchanges', filters],
    queryFn: () => getStockExchanges(filters),
  })
}

export function useTestingMode() {
  return useQuery({
    queryKey: ['stock-exchanges', 'testing-mode'],
    queryFn: () => getTestingMode(),
  })
}

export function useSetTestingMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => setTestingMode(enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['stock-exchanges', 'testing-mode'] }),
  })
}
