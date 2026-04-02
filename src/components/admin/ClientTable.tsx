import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Client } from '@/types/client'

interface ClientTableProps {
  clients: Client[]
  onEdit: (clientId: number) => void
}

export function ClientTable({ clients, onEdit }: ClientTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.first_name}</TableCell>
            <TableCell>{client.last_name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone ?? '—'}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline" onClick={() => onEdit(client.id)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No clients.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
