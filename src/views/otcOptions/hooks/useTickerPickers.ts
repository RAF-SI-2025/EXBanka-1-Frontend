import { useQuery } from '@tanstack/react-query'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { OTC_OPTIONS_QUERY_KEY } from '@/views/otcOptions/hooks/useOtcOptionsLists'

// Sell-direction ticker picker source: only tickers the caller actually
// holds. Fetched lazily — only when the New-Listing dialog opens with
// direction=sell.
export function useMyStockHoldings(enabled: boolean) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'my-holdings'],
    queryFn: () => otcOptionsApi.listMyHoldings(),
    enabled,
  })
}

// Buy-direction ticker picker source: every tradable stock.
export function useStockCatalog(enabled: boolean) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'stock-catalog'],
    queryFn: () => otcOptionsApi.listStockCatalog(),
    enabled,
  })
}
