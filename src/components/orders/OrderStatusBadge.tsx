import type { OrderStatus } from '@/types/order'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { StatusTone } from '@/lib/utils/statusTone'

interface Props {
  status: OrderStatus
}

const TONE: Record<OrderStatus, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
  cancelled: 'neutral',
  filled: 'info',
  partial: 'warning',
}

const LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
  cancelled: 'Cancelled',
  filled: 'Filled',
  partial: 'Partial',
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <StatusBadge tone={TONE[status]} status={status}>
      {LABEL[status]}
    </StatusBadge>
  )
}
