import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { NotificationTemplate } from '@/views/notificationTemplates/types'
import { hoverLift, rowEnter } from '@/views/shared'

interface Props {
  templates: NotificationTemplate[]
  onEdit: (t: NotificationTemplate) => void
}

export function TemplatesTable({ templates, onEdit }: Props) {
  if (templates.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No templates found.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Current subject</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((t) => (
          <TableRow
            key={`${t.channel}:${t.type}`}
            onClick={() => onEdit(t)}
            className={`${hoverLift} ${rowEnter}`}
          >
            <TableCell className="font-medium">{t.type}</TableCell>
            <TableCell className="text-xs uppercase text-muted-foreground">{t.channel}</TableCell>
            <TableCell className="text-xs text-muted-foreground max-w-[320px] truncate">
              {t.description}
            </TableCell>
            <TableCell className="text-xs max-w-[260px] truncate">{t.current_subject}</TableCell>
            <TableCell>
              {t.is_customized ? (
                <Badge variant="secondary">Customized</Badge>
              ) : (
                <Badge variant="outline">Default</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(t)
                }}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
