import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission } from '@/store/selectors/authSelectors'
import {
  useSetTestingMode,
  useStockExchanges,
  useTestingMode,
} from '@/views/stockExchanges/hooks/useStockExchanges'
import { StockExchangeTable } from '@/views/stockExchanges/components/StockExchangeTable'
import type { StockExchangeFilters } from '@/views/stockExchanges/types'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10
const EXCHANGE_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function StockExchangesView() {
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
    <ViewShell
      title="Stock Exchanges"
      subtitle="Browse and search supported global exchanges."
      actions={
        canManageExchanges && (
          <Button
            variant={isTestingMode ? 'destructive' : 'default'}
            onClick={handleToggleTestingMode}
            disabled={setTestingModeMutation.isPending}
          >
            {isTestingMode ? 'Disable Testing Mode' : 'Enable Testing Mode'}
          </Button>
        )
      }
    >
      <FilterBar
        fields={EXCHANGE_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {!isLoading && !data?.exchanges.length && <EmptyState title="No exchanges found." />}
          {!isLoading && data?.exchanges.length ? (
            <>
              <StockExchangeTable exchanges={data.exchanges} />
              <p className="text-sm text-muted-foreground mt-2">{data.total_count} exchanges</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
