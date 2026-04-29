import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query'
import { notifyError } from './errors/notify'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        // Auto-refresh active queries every 5s so the user always sees fresh
        // data on whichever page they're viewing. Background tabs are skipped
        // to avoid wasted requests when the user is elsewhere.
        refetchInterval: 5_000,
        refetchIntervalInBackground: false,
      },
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
