import type { OrderStatus } from '@/types/order'

interface Props {
  status: OrderStatus
}

const config: Record<OrderStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', classes: 'bg-red-100 text-red-800' },
}

export function OrderStatusBadge({ status }: Props) {
  const { label, classes } = config[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  )
}
