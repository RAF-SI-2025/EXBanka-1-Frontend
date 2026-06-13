import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useAllOrders, useApproveOrder, useDeclineOrder } from '@/hooks/useOrders'
import { useListingMap } from '@/hooks/useSecurities'
import type { AdminOrderFilters } from '@/types/order'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { OrderTable } from '@/views/orders/components/OrderTable'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const ADMIN_ORDER_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
]

export function AdminOrdersView() {
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
  const listingMap = useListingMap()
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const approveMutation = useApproveOrder()
  const declineMutation = useDeclineOrder()

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
    <ViewShell
      title="Order Approval"
      subtitle="Pending client orders awaiting supervisor approval."
    >
      <FilterBar
        fields={ADMIN_ORDER_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {!isLoading && orders.length === 0 && <EmptyState title="No orders found." />}
          {!isLoading && orders.length > 0 && (
            <>
              <OrderTable orders={orders} onApprove={handleApprove} onDecline={handleDecline} />
              <p className="text-sm text-muted-foreground mt-2">{data?.total_count} orders</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
