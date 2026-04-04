import { useState } from 'react'
import type { Permission, CreateRolePayload } from '@/types/roles'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissions: Permission[]
  onSubmit: (data: CreateRolePayload) => void
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

function CreateRoleDialogInner({
  permissions,
  onSubmit,
  loading,
}: Pick<CreateRoleDialogProps, 'permissions' | 'onSubmit' | 'loading'>) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())

  const grouped = groupByCategory(permissions)
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

  function handleSubmit() {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      permission_codes: selectedCodes.size > 0 ? Array.from(selectedCodes) : undefined,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Role</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="role-name">Name *</Label>
          <Input
            id="role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Role name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role-description">Description</Label>
          <Input
            id="role-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Role description"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Permissions</Label>
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {category}
              </span>
              {grouped[category].map((p) => (
                <div key={p.code} className="flex items-center gap-2">
                  <Checkbox
                    id={`create-perm-${p.code}`}
                    checked={selectedCodes.has(p.code)}
                    onCheckedChange={() => togglePermission(p.code)}
                  />
                  <Label htmlFor={`create-perm-${p.code}`} className="text-sm font-normal">
                    {p.code} - {p.description}
                  </Label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  permissions,
  onSubmit,
  loading,
}: CreateRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <CreateRoleDialogInner permissions={permissions} onSubmit={onSubmit} loading={loading} />
        )}
      </DialogContent>
    </Dialog>
  )
}
