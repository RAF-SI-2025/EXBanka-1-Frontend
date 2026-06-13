import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { usePayments } from '@/hooks/usePayments'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { PaymentHistoryTable } from '@/views/payments/components/PaymentHistoryTable'
import { LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Rejected', value: 'FAILED' },
      { label: 'Processing', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min Amount', type: 'number' },
  { key: 'amount_max', label: 'Max Amount', type: 'number' },
]

export function PaymentHistoryView() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
    page,
    page_size: PAGE_SIZE,
  }

  const { data, isLoading } = usePayments(apiFilters)
  const payments = data?.payments ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <ViewShell title="Payment History" subtitle="Every payment you've sent.">
      <FilterBar
        fields={PAYMENT_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <PaymentHistoryTable payments={payments} />
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
