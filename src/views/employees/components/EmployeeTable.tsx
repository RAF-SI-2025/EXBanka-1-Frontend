import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmployeeStatusBadge } from '@/views/employees/components/EmployeeStatusBadge'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
  employees: Employee[]
  onRowClick: (id: number) => void
}

export function EmployeeTable({ employees, onRowClick }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id} className="cursor-pointer" onClick={() => onRowClick(emp.id)}>
            <TableCell>
              {emp.first_name} {emp.last_name}
            </TableCell>
            <TableCell>{emp.email}</TableCell>
            <TableCell>{emp.position}</TableCell>
            <TableCell>{emp.phone}</TableCell>
            <TableCell>
              <EmployeeStatusBadge active={emp.active} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
