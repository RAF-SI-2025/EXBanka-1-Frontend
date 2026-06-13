import { useState, useCallback } from 'react'
import { FilterBar } from '@/components/ui/FilterBar'
import { ActuaryTable } from '@/views/actuaries/components/ActuaryTable'
import { EditLimitDialog } from '@/views/actuaries/components/EditLimitDialog'
import { PaginationControls } from '@/components/shared/PaginationControls'
import {
  useActuaries,
  useSetActuaryLimit,
  useResetActuaryLimit,
  useSetActuaryApproval,
} from '@/hooks/useActuaries'
import type { ActuaryFilters } from '@/types/actuary'
import type { Actuary } from '@/types/actuary'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const ACTUARY_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
]

export function ActuaryListView() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [editingActuary, setEditingActuary] = useState<Actuary | null>(null)

  const apiFilters: ActuaryFilters = {
    page,
    page_size: PAGE_SIZE,
    search: (filterValues.search as string) || undefined,
    position: (filterValues.position as string) || undefined,
  }

  const { data, isLoading } = useActuaries(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const setLimitMutation = useSetActuaryLimit()
  const resetLimitMutation = useResetActuaryLimit()
  const setApprovalMutation = useSetActuaryApproval()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleEditLimit = useCallback((actuary: Actuary) => {
    setEditingActuary(actuary)
  }, [])

  const handleConfirmLimit = useCallback(
    (limit: string) => {
      if (editingActuary) {
        setLimitMutation.mutate({ id: editingActuary.employee_id, payload: { limit } })
      }
      setEditingActuary(null)
    },
    [editingActuary, setLimitMutation]
  )

  const handleResetLimit = useCallback(
    (id: number) => {
      resetLimitMutation.mutate(id)
    },
    [resetLimitMutation]
  )

  const handleToggleApproval = useCallback(
    (id: number, currentApproval: boolean) => {
      setApprovalMutation.mutate({
        id,
        payload: { need_approval: !currentApproval },
      })
    },
    [setApprovalMutation]
  )

  return (
    <ViewShell
      title="Actuaries"
      subtitle="Trading employees — manage per-actuary limits and approval policy."
    >
      <FilterBar
        fields={ACTUARY_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingState />
      ) : data?.actuaries.length ? (
        <>
          <ActuaryTable
            actuaries={data.actuaries}
            onEditLimit={handleEditLimit}
            onResetLimit={handleResetLimit}
            onToggleApproval={handleToggleApproval}
          />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} actuaries</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No actuaries found." />
      )}

      <EditLimitDialog
        open={editingActuary !== null}
        actuary={editingActuary}
        onClose={() => setEditingActuary(null)}
        onConfirm={handleConfirmLimit}
      />
    </ViewShell>
  )
}
