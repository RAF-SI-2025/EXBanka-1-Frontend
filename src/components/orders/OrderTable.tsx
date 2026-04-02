import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types/order'

interface OrderTableProps {
  orders: Order[]
  onCancel?: (id: number) => void
  onApprove?: (id: number) => void
  onDecline?: (id: number) => void
}

export function OrderTable({ orders, onCancel, onApprove, onDecline }: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Security</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono font-semibold">{order.ticker}</TableCell>
            <TableCell>{order.security_name}</TableCell>
            <TableCell>{order.direction}</TableCell>
            <TableCell>{order.order_type}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {onCancel && order.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => onCancel(order.id)}>
                    Cancel
                  </Button>
                )}
                {onApprove && order.status === 'pending' && (
                  <Button size="sm" onClick={() => onApprove(order.id)}>
                    Approve
                  </Button>
                )}
                {onDecline && order.status === 'pending' && (
                  <Button size="sm" variant="destructive" onClick={() => onDecline(order.id)}>
                    Decline
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
