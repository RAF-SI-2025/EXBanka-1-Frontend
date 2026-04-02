import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTaxRecords, collectTaxes } from '@/lib/api/tax'
import type { TaxFilters } from '@/types/tax'

export function useTaxRecords(filters?: TaxFilters) {
  return useQuery({
    queryKey: ['tax-records', filters],
    queryFn: () => getTaxRecords(filters),
  })
}

export function useCollectTaxes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: collectTaxes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-records'] })
    },
  })
}
