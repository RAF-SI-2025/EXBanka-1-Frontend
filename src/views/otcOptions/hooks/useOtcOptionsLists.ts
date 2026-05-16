import { useQuery } from '@tanstack/react-query'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type { OtcOptionsListFilters } from '@/views/otcOptions/types'

export const OTC_OPTIONS_QUERY_KEY = 'otc-options-view'

export function useAllOtcOptions(filters: OtcOptionsListFilters = {}) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'all', filters],
    queryFn: () => otcOptionsApi.listAll(filters),
  })
}

export function useMyOtcOptions(filters: OtcOptionsListFilters = {}) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'mine', filters],
    queryFn: () => otcOptionsApi.listMine(filters),
  })
}

export function useOtcOptionNegotiations(offerId: number | null) {
  return useQuery({
    queryKey: [OTC_OPTIONS_QUERY_KEY, 'negotiations', offerId],
    queryFn: () => otcOptionsApi.listNegotiations(offerId as number),
    enabled: offerId != null && offerId > 0,
  })
}
