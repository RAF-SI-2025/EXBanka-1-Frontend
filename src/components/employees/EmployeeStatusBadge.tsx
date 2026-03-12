import { Badge } from '@/components/ui/badge'

interface EmployeeStatusBadgeProps {
  active: boolean
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  if (active) {
    return <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Active</Badge>
  }
  return <Badge variant="secondary">Inactive</Badge>
}
