import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { notifySuccess } from '@/lib/errors'
import { TaxTable } from '@/views/tax/components/TaxTable'
import { useCollectTaxes, useTaxRecords } from '@/views/tax/hooks/useTax'
import type { TaxFilters } from '@/views/tax/types'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10
const TAX_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function TaxView() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: TaxFilters = {
    page,
    page_size: PAGE_SIZE,
    user_type: (filterValues.user_type as TaxFilters['user_type']) || undefined,
    search: (filterValues.search as string) || undefined,
  }

  const { data, isLoading } = useTaxRecords(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const collectMutation = useCollectTaxes()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  return (
    <ViewShell
      title="Tax Management"
      subtitle="Outstanding tax debts across clients and actuaries; trigger a collection sweep manually."
      actions={
        <Button
          onClick={() =>
            collectMutation.mutate(undefined, {
              onSuccess: () => notifySuccess('Taxes collected.'),
            })
          }
          disabled={collectMutation.isPending || (!isLoading && !data?.tax_records.length)}
        >
          {collectMutation.isPending ? 'Collecting...' : 'Collect Taxes'}
        </Button>
      }
    >
      <FilterBar fields={TAX_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {!isLoading && !data?.tax_records.length && <EmptyState title="No tax records found." />}
          {!isLoading && data?.tax_records.length ? (
            <>
              <TaxTable records={data.tax_records} />
              <p className="text-sm text-muted-foreground mt-2">{data.total_count} records</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
