import { useState } from 'react'
import type { Role, Permission } from '@/types/roles'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface EditRolePermissionsDialogProps {
  open: boolean
  role: Role | null
  allPermissions: Permission[]
  onClose: () => void
  onSave: (roleId: number, permissionCodes: string[]) => void
  loading: boolean
}

function groupByCategory(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const p of permissions) {
    if (!groups[p.category]) {
      groups[p.category] = []
    }
    groups[p.category].push(p)
  }
  return groups
}

function EditRolePermissionsInner({
  role,
  allPermissions,
  onSave,
  loading,
}: {
  role: Role
  allPermissions: Permission[]
  onSave: (roleId: number, permissionCodes: string[]) => void
  loading: boolean
}) {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set(role.permissions))

  const grouped = groupByCategory(allPermissions)
  const categories = Object.keys(grouped).sort()

  function togglePermission(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Permissions - {role.name}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {category}
            </span>
            {grouped[category].map((p) => (
              <div key={p.code} className="flex items-center gap-2">
                <Checkbox
                  id={`edit-perm-${p.code}`}
                  checked={selectedCodes.has(p.code)}
                  onCheckedChange={() => togglePermission(p.code)}
                />
                <Label htmlFor={`edit-perm-${p.code}`} className="text-sm font-normal">
                  {p.code} - {p.description}
                </Label>
              </div>
            ))}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={() => onSave(role.id, Array.from(selectedCodes))} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditRolePermissionsDialog({
  open,
  role,
  allPermissions,
  onClose,
  onSave,
  loading,
}: EditRolePermissionsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && role && (
          <EditRolePermissionsInner
            role={role}
            allPermissions={allPermissions}
            onSave={onSave}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
