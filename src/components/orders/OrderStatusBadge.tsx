import type { OrderStatus, OrderState } from '@/types/order'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { StatusTone } from '@/lib/utils/statusTone'

interface Props {
  /** Backend may surface either `status` (legacy) or `state` (new) — accept either. */
  status: OrderStatus | OrderState | string
}

const TONE: Record<string, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
  cancelled: 'neutral',
  filled: 'success',
  partial: 'warning',
  filling: 'warning',
}

const LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
  cancelled: 'Cancelled',
  filled: 'Filled',
  partial: 'Partial',
  filling: 'Filling',
}

export function OrderStatusBadge({ status }: Props) {
  const key = (status ?? '').toString().toLowerCase()
  return (
    <StatusBadge tone={TONE[key] ?? 'neutral'} status={key}>
      {LABEL[key] ?? status}
    </StatusBadge>
  )
}
