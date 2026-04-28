import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query'
import { notifyError } from './errors/notify'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.suppressGlobalError) return
        notifyError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.options.onError) return
        notifyError(error)
      },
    }),
  })
}
