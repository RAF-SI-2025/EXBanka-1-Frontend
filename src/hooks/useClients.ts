import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClients, getClient, getClientMe, createClient, updateClient } from '@/lib/api/clients'
import type { ClientFilters, CreateClientRequest, UpdateClientRequest } from '@/types/client'

export function useSearchClients(query: string) {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: () => getClients({ name: query }),
    enabled: query.length > 0,
  })
}

export function useAllClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: ['clients', 'all', filters],
    queryFn: () => getClients(filters),
  })
}

export function useClient(id: number) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClient(id),
    enabled: id > 0,
  })
}

export function useClientMe() {
  return useQuery({
    queryKey: ['client', 'me'],
    queryFn: () => getClientMe(),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateClientRequest) => createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateClientRequest) => updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', id] })
    },
  })
}
