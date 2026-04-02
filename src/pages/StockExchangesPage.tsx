import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { StockExchangeTable } from '@/components/stockExchanges/StockExchangeTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStockExchanges, useTestingMode, useSetTestingMode } from '@/hooks/useStockExchanges'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission } from '@/store/selectors/authSelectors'
import type { StockExchangeFilters } from '@/types/stockExchange'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const EXCHANGE_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function StockExchangesPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const canManageExchanges = useAppSelector((state) =>
    selectHasPermission(state, 'exchanges.manage')
  )

  const apiFilters: StockExchangeFilters = {
    page,
    page_size: PAGE_SIZE,
    search: (filterValues.search as string) || undefined,
  }

  const { data, isLoading } = useStockExchanges(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const { data: testingModeData } = useTestingMode()
  const setTestingModeMutation = useSetTestingMode()

  const isTestingMode = testingModeData?.testing_mode ?? false

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleToggleTestingMode = () => {
    setTestingModeMutation.mutate(!isTestingMode)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Exchanges</h1>
        {canManageExchanges && (
          <Button
            variant={isTestingMode ? 'destructive' : 'default'}
            onClick={handleToggleTestingMode}
            disabled={setTestingModeMutation.isPending}
          >
            {isTestingMode ? 'Disable Testing Mode' : 'Enable Testing Mode'}
          </Button>
        )}
      </div>

      <FilterBar
        fields={EXCHANGE_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.exchanges?.length ? (
        <>
          <StockExchangeTable exchanges={data.exchanges} />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} exchanges</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No exchanges found.</p>
      )}
    </div>
  )
}
