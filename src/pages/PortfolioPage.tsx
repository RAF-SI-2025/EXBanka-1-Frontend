import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterBar } from '@/components/ui/FilterBar'
import { HoldingTable } from '@/components/portfolio/HoldingTable'
import { PortfolioSummaryCard } from '@/components/portfolio/PortfolioSummaryCard'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  usePortfolio,
  usePortfolioSummary,
  useMakePublic,
  useExerciseOption,
} from '@/hooks/usePortfolio'
import type { PortfolioFilters } from '@/types/portfolio'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const PORTFOLIO_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function PortfolioPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: PortfolioFilters = {
    page,
    page_size: PAGE_SIZE,
    security_type: (filterValues.security_type as PortfolioFilters['security_type']) || undefined,
  }

  const { data, isLoading } = usePortfolio(apiFilters)
  const { data: summary } = usePortfolioSummary()
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const makePublicMutation = useMakePublic()
  const exerciseMutation = useExerciseOption()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleSell = useCallback(
    (id: number) => {
      const holding = data?.holdings.find((h) => h.id === id)
      if (!holding) return
      navigate(
        `/securities/order/new?direction=sell&securityType=${holding.security_type}&ticker=${encodeURIComponent(holding.ticker)}`
      )
    },
    [navigate, data]
  )

  const handleRowClick = useCallback(
    (id: number) => {
      navigate(`/portfolio/holdings/${id}/transactions`)
    },
    [navigate]
  )

  const handleMakePublic = useCallback(
    (id: number) => {
      makePublicMutation.mutate({ id, payload: { quantity: 1 } })
    },
    [makePublicMutation]
  )

  const handleExercise = useCallback(
    (id: number) => {
      exerciseMutation.mutate(id)
    },
    [exerciseMutation]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {summary && <PortfolioSummaryCard summary={summary} />}

      <FilterBar
        fields={PORTFOLIO_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.holdings.length ? (
        <>
          <HoldingTable
            holdings={data.holdings}
            onRowClick={handleRowClick}
            onSell={handleSell}
            onMakePublic={handleMakePublic}
            onExercise={handleExercise}
          />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} holdings</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No holdings found.</p>
      )}
    </div>
  )
}
