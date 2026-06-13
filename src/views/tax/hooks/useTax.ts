import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taxApi } from '@/views/tax/api/taxApi'
import type { TaxFilters } from '@/views/tax/types'

const KEY = ['tax'] as const

export function useTaxRecords(filters: TaxFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => taxApi.list(filters),
  })
}

export function useCollectTaxes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => taxApi.collect(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
