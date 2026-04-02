import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PaymentRecipient } from '@/types/payment'

interface RecipientListProps {
  recipients: PaymentRecipient[]
  onEdit: (recipient: PaymentRecipient) => void
  onDelete: (id: number) => void
}

export function RecipientList({ recipients, onEdit, onDelete }: RecipientListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Account Number</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipients.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.recipient_name}</TableCell>
            <TableCell className="font-mono text-sm">{r.account_number}</TableCell>
            <TableCell className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(r)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {recipients.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              No saved recipients.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
