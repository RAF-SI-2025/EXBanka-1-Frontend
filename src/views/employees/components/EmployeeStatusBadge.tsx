import { StatusBadge } from '@/components/shared/StatusBadge'

interface EmployeeStatusBadgeProps {
  active: boolean
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  return (
    <StatusBadge tone={active ? 'success' : 'neutral'}>
      {active ? 'Active' : 'Inactive'}
    </StatusBadge>
  )
}
