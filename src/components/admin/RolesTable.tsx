import type { Role } from '@/types/roles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RolesTableProps {
  roles: Role[]
  onEditPermissions: (role: Role) => void
}

export function RolesTable({ roles, onEditPermissions }: RolesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {role.permissions.length}{' '}
                {role.permissions.length === 1 ? 'permission' : 'permissions'}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onEditPermissions(role)}>
                Edit Permissions
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
