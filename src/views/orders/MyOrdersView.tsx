import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useCancelOrder, useMyOrders } from '@/hooks/useOrders'
import { useListingMap } from '@/hooks/useSecurities'
import type { MyOrderFilters } from '@/types/order'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { OrderTable } from '@/views/orders/components/OrderTable'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const ORDER_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function MyOrdersView() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: MyOrderFilters = {
    page,
    page_size: PAGE_SIZE,
    status: (filterValues.status as MyOrderFilters['status']) || undefined,
    direction: (filterValues.direction as MyOrderFilters['direction']) || undefined,
  }

  const { data, isLoading } = useMyOrders(apiFilters)
  const listingMap = useListingMap()
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const cancelMutation = useCancelOrder()

  const orders = useMemo(
    () =>
      (data?.orders ?? []).map((o) => ({
        ...o,
        ticker: o.ticker || listingMap.get(o.listing_id)?.ticker || '',
        security_name: o.security_name || listingMap.get(o.listing_id)?.name || '',
      })),
    [data?.orders, listingMap]
  )

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
    <ViewShell title="My Orders" subtitle="Orders you've placed; cancel any that are still open.">
      <FilterBar fields={ORDER_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {!isLoading && orders.length === 0 && <EmptyState title="No orders found." />}
          {!isLoading && orders.length > 0 && (
            <>
              <OrderTable orders={orders} onCancel={handleCancel} />
              <p className="text-sm text-muted-foreground mt-2">{data?.total_count} orders</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
