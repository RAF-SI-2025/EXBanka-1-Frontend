import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBankMargins, updateBankMargin } from '@/lib/api/bankMargins'

export function useBankMargins() {
  return useQuery({ queryKey: ['bankMargins'], queryFn: getBankMargins })
}

export function useUpdateBankMargin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, margin }: { id: number; margin: number }) => updateBankMargin(id, margin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bankMargins'] }),
  })
}
