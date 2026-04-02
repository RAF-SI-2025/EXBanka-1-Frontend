import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Actuary } from '@/types/actuary'

interface ActuaryTableProps {
  actuaries: Actuary[]
  onEditLimit: (actuary: Actuary) => void
  onResetLimit: (id: number) => void
  onToggleApproval: (id: number, currentApproval: boolean) => void
}

export function ActuaryTable({
  actuaries,
  onEditLimit,
  onResetLimit,
  onToggleApproval,
}: ActuaryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Limit</TableHead>
          <TableHead>Used Limit</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actuaries.map((actuary) => (
          <TableRow key={actuary.id}>
            <TableCell>
              {actuary.first_name} {actuary.last_name}
            </TableCell>
            <TableCell>{actuary.email}</TableCell>
            <TableCell>{actuary.position}</TableCell>
            <TableCell>{actuary.limit}</TableCell>
            <TableCell>{actuary.used_limit}</TableCell>
            <TableCell>{actuary.need_approval ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEditLimit(actuary)}>
                  Edit Limit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onResetLimit(actuary.id)}>
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleApproval(actuary.id, actuary.need_approval)}
                  aria-label="Toggle approval"
                >
                  Toggle Approval
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
