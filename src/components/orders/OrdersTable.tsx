import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { DirectionBadge } from '@/components/shared/DirectionBadge'
import type { Order } from '@/types/order'

interface Props {
  orders: Order[]
  onApprove?: (id: number) => void
  onDecline?: (id: number) => void
}

export function OrdersTable({ orders, onApprove, onDecline }: Props) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground">No orders found.</p>
  }

  const showActions = !!onApprove && !!onDecline

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>User</TableHead>
          {showActions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.ticker}</TableCell>
            <TableCell>
              <DirectionBadge direction={order.direction} />
            </TableCell>
            <TableCell className="capitalize">{order.order_type.replace('_', ' ')}</TableCell>
            <TableCell className="text-right">{order.quantity}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>{order.security_name}</TableCell>
            {showActions && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => onApprove!(order.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDecline!(order.id)}>
                    Decline
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
