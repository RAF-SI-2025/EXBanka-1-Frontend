import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPermissions, setEmployeeRoles, setEmployeePermissions } from '@/lib/api/permissions'

export function usePermissions() {
  return useQuery({ queryKey: ['permissions'], queryFn: getPermissions })
}

export function useSetEmployeeRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleNames }: { id: number; roleNames: string[] }) =>
      setEmployeeRoles(id, roleNames),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useSetEmployeePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: number; permissionCodes: string[] }) =>
      setEmployeePermissions(id, permissionCodes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}
