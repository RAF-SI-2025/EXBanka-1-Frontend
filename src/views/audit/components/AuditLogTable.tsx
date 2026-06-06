import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuditChangelogEntry } from '@/types/audit'

interface AuditLogTableProps {
  entries: AuditChangelogEntry[]
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit entries.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Field</TableHead>
          <TableHead>Old value</TableHead>
          <TableHead>New value</TableHead>
          <TableHead className="text-right">Actor</TableHead>
          <TableHead>When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="font-mono text-xs">{e.id}</TableCell>
            <TableCell>
              <span className="font-medium">{e.entity_type}</span>
              <span className="text-muted-foreground"> #{e.entity_id}</span>
            </TableCell>
            <TableCell className="capitalize">{e.action}</TableCell>
            <TableCell className="font-mono text-xs">{e.field_name || '—'}</TableCell>
            <TableCell className="max-w-[14ch] truncate font-mono text-xs" title={e.old_value}>
              {e.old_value || '—'}
            </TableCell>
            <TableCell className="max-w-[14ch] truncate font-mono text-xs" title={e.new_value}>
              {e.new_value || '—'}
            </TableCell>
            <TableCell className="text-right">#{e.actor_id}</TableCell>
            <TableCell>{new Date(e.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
