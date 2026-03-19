import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { QueryKey } from '@tanstack/react-query'

interface UseMutationWithRedirectOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateKeys?: QueryKey[]
  redirectTo: string
}

export function useMutationWithRedirect<TData = unknown, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  redirectTo,
}: UseMutationWithRedirectOptions<TData, TVariables>) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      navigate(redirectTo)
    },
  })
}
