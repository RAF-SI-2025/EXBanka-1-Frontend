import { useState } from 'react'
import { FilterBar } from '@/components/ui/FilterBar'
import { TaxTable } from '@/components/tax/TaxTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useTaxRecords, useCollectTaxes } from '@/hooks/useTax'
import { usePiggy } from '@/hooks/usePiggy'
import { notifySuccess } from '@/lib/errors'
import type { TaxFilters } from '@/types/tax'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const TAX_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function TaxPage() {
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
  const { triggerMrKrabs } = usePiggy()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tax Management</h1>
        <Button
          onClick={() =>
            collectMutation.mutate(undefined, {
              onSuccess: () => {
                triggerMrKrabs()
                notifySuccess('Taxes collected.')
              },
            })
          }
          disabled={collectMutation.isPending}
        >
          {collectMutation.isPending ? 'Collecting...' : 'Collect Taxes'}
        </Button>
      </div>

      <FilterBar fields={TAX_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.tax_records.length ? (
        <>
          <TaxTable records={data.tax_records} />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} records</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No tax records found.</p>
      )}
    </div>
  )
}
