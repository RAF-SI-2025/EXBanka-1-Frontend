import { useAllOrders, useApproveOrder, useDeclineOrder } from '@/hooks/useOrders'
import { OrdersTable } from '@/components/orders/OrdersTable'

export function AdminOrdersPage() {
  const { data, isLoading } = useAllOrders()
  const { mutate: approveOrder } = useApproveOrder()
  const { mutate: declineOrder } = useDeclineOrder()

  if (isLoading) return <p>Loading...</p>

  const orders = data?.orders ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Order Review</h1>
      <OrdersTable
        orders={orders}
        onApprove={(id) => approveOrder(id)}
        onDecline={(id) => declineOrder(id)}
      />
    </div>
  )
}
