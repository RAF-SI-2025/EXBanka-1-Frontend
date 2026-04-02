import { useState, useCallback } from 'react'
import { FilterBar } from '@/components/ui/FilterBar'
import { OrderTable } from '@/components/orders/OrderTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useMyOrders, useCancelOrder } from '@/hooks/useOrders'
import type { MyOrderFilters } from '@/types/order'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const ORDER_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function MyOrdersPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: MyOrderFilters = {
    page,
    page_size: PAGE_SIZE,
    status: (filterValues.status as MyOrderFilters['status']) || undefined,
    direction: (filterValues.direction as MyOrderFilters['direction']) || undefined,
  }

  const { data, isLoading } = useMyOrders(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const cancelMutation = useCancelOrder()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleCancel = useCallback(
    (id: number) => {
      cancelMutation.mutate(id)
    },
    [cancelMutation]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <FilterBar fields={ORDER_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.orders.length ? (
        <>
          <OrderTable orders={data.orders} onCancel={handleCancel} />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} orders</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  )
}
