import type { Permission } from '@/types/roles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface PermissionsTableProps {
  permissions: Permission[]
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

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  const grouped = groupByCategory(permissions)
  const categories = Object.keys(grouped).sort()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) =>
          grouped[category].map((permission) => (
            <TableRow key={permission.id}>
              <TableCell>
                <code className="text-sm font-mono">{permission.code}</code>
              </TableCell>
              <TableCell>{permission.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{permission.category}</Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
