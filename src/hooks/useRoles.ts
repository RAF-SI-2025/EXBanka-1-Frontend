import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoles, createRole, updateRolePermissions } from '@/lib/api/roles'
import type { CreateRolePayload } from '@/types/roles'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: getRoles })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: number; permissionCodes: string[] }) =>
      updateRolePermissions(id, permissionCodes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}
