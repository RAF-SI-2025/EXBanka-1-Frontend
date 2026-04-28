import { useQuery } from '@tanstack/react-query'
import { getActuaryPerformance, getBankFundPositions } from '@/lib/api/profit'

export function useActuaryPerformance() {
  return useQuery({
    queryKey: ['profit', 'actuaries'],
    queryFn: getActuaryPerformance,
  })
}

export function useBankFundPositions() {
  return useQuery({
    queryKey: ['profit', 'bank-fund-positions'],
    queryFn: getBankFundPositions,
  })
}
