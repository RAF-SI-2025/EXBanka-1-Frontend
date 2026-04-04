import { useState } from 'react'
import { useRoles, useCreateRole, useUpdateRolePermissions } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import type { Role, CreateRolePayload } from '@/types/roles'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { RolesTable } from '@/components/admin/RolesTable'
import { PermissionsTable } from '@/components/admin/PermissionsTable'
import { CreateRoleDialog } from '@/components/admin/CreateRoleDialog'
import { EditRolePermissionsDialog } from '@/components/admin/EditRolePermissionsDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export function AdminRolesPage() {
  const { data: rolesData, isLoading: rolesLoading } = useRoles()
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions()
  const createRoleMutation = useCreateRole()
  const updatePermissionsMutation = useUpdateRolePermissions()

  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)

  const roles = rolesData?.roles ?? []
  const permissions = permissionsData?.permissions ?? []
  const isLoading = rolesLoading || permissionsLoading

  function handleCreateRole(payload: CreateRolePayload) {
    createRoleMutation.mutate(payload, {
      onSuccess: () => setCreateOpen(false),
    })
  }

  function handleSavePermissions(roleId: number, permissionCodes: string[]) {
    updatePermissionsMutation.mutate(
      { id: roleId, permissionCodes },
      { onSuccess: () => setEditRole(null) }
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Roles &amp; Permissions</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Role</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs defaultValue="roles">
          <TabsList className="mb-4">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">All Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            {roles.length ? (
              <RolesTable roles={roles} onEditPermissions={setEditRole} />
            ) : (
              <p>No roles found.</p>
            )}
          </TabsContent>

          <TabsContent value="permissions">
            {permissions.length ? (
              <PermissionsTable permissions={permissions} />
            ) : (
              <p>No permissions found.</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        permissions={permissions}
        onSubmit={handleCreateRole}
        loading={createRoleMutation.isPending}
      />

      <EditRolePermissionsDialog
        open={editRole !== null}
        role={editRole}
        allPermissions={permissions}
        onClose={() => setEditRole(null)}
        onSave={handleSavePermissions}
        loading={updatePermissionsMutation.isPending}
      />
    </div>
  )
}
