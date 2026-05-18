import { useState } from 'react'
import { useRoles, useCreateRole, useUpdateRolePermissions } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import type { Role, CreateRolePayload } from '@/types/roles'
import { RolesTable } from '@/views/roles/components/RolesTable'
import { PermissionsTable } from '@/views/roles/components/PermissionsTable'
import { CreateRoleDialog } from '@/views/roles/components/CreateRoleDialog'
import { EditRolePermissionsDialog } from '@/views/roles/components/EditRolePermissionsDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function RolesView() {
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
    <ViewShell
      title="Roles & Permissions"
      subtitle="Define what each employee role is allowed to do."
      actions={<Button onClick={() => setCreateOpen(true)}>Create Role</Button>}
    >
      {isLoading ? (
        <LoadingState />
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
              <EmptyState title="No roles found." />
            )}
          </TabsContent>

          <TabsContent value="permissions">
            {permissions.length ? (
              <PermissionsTable permissions={permissions} />
            ) : (
              <EmptyState title="No permissions found." />
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
    </ViewShell>
  )
}
