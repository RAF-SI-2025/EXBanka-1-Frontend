import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTaxRecords, collectTaxes } from '@/lib/api/tax'
import type { TaxFilters } from '@/types/tax'

export function useTaxRecords(filters: TaxFilters = {}) {
  return useQuery({ queryKey: ['tax', filters], queryFn: () => getTaxRecords(filters) })
}

export function useCollectTaxes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => collectTaxes(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tax'] }),
  })
}
