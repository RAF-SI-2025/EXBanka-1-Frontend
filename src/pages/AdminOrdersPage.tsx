import { useState, useCallback } from 'react'
import { FilterBar } from '@/components/ui/FilterBar'
import { OrderTable } from '@/components/orders/OrderTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAllOrders, useApproveOrder, useDeclineOrder } from '@/hooks/useOrders'
import type { AdminOrderFilters } from '@/types/order'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const ADMIN_ORDER_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
]

export function AdminOrdersPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: AdminOrderFilters = {
    page,
    page_size: PAGE_SIZE,
    status: (filterValues.status as AdminOrderFilters['status']) || undefined,
    direction: (filterValues.direction as AdminOrderFilters['direction']) || undefined,
    order_type: (filterValues.order_type as AdminOrderFilters['order_type']) || undefined,
    agent_email: (filterValues.agent_email as string) || undefined,
  }

  const { data, isLoading } = useAllOrders(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const approveMutation = useApproveOrder()
  const declineMutation = useDeclineOrder()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleApprove = useCallback(
    (id: number) => {
      approveMutation.mutate(id)
    },
    [approveMutation]
  )

  const handleDecline = useCallback(
    (id: number) => {
      declineMutation.mutate(id)
    },
    [declineMutation]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Approval</h1>

      <FilterBar
        fields={ADMIN_ORDER_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.orders.length ? (
        <>
          <OrderTable orders={data.orders} onApprove={handleApprove} onDecline={handleDecline} />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} orders</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  )
}
