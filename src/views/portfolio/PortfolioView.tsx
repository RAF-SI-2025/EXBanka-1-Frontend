import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterBar } from '@/components/ui/FilterBar'
import { HoldingTable } from '@/views/portfolio/components/HoldingTable'
import { MakePublicDialog } from '@/views/portfolio/components/MakePublicDialog'
import { PortfolioSummaryCard } from '@/views/portfolio/components/PortfolioSummaryCard'
import { PortfolioProfitChart } from '@/views/portfolio/components/PortfolioProfitChart'
import { PortfolioHoldingsPieChart } from '@/views/portfolio/components/PortfolioHoldingsPieChart'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MyFundsList } from '@/views/funds/components/MyFundsList'
import {
  usePortfolio,
  usePortfolioSummary,
  useMakePublic,
  useExerciseOption,
} from '@/hooks/usePortfolio'
import { useMyFundPositions } from '@/hooks/useFunds'
import { getStocks } from '@/lib/api/securities'
import type { Holding, PortfolioFilters } from '@/types/portfolio'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const PORTFOLIO_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function PortfolioView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'funds' ? 'funds' : 'holdings'
  const [tab, setTab] = useState<'holdings' | 'funds'>(initialTab)
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [makePublicHolding, setMakePublicHolding] = useState<Holding | null>(null)

  const apiFilters: PortfolioFilters = {
    page,
    page_size: PAGE_SIZE,
    security_type: (filterValues.security_type as PortfolioFilters['security_type']) || undefined,
  }

  const { data, isLoading } = usePortfolio(apiFilters)
  const { data: summary } = usePortfolioSummary()
  const { data: fundPositionsData } = useMyFundPositions()
  const fundPositions = fundPositionsData?.positions ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const makePublicMutation = useMakePublic()
  const exerciseMutation = useExerciseOption()

  const handleTabChange = (next: string) => {
    const value = next === 'funds' ? 'funds' : 'holdings'
    setTab(value)
    if (value === 'funds') searchParams.set('tab', 'funds')
    else searchParams.delete('tab')
    setSearchParams(searchParams, { replace: true })
  }

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
      const holding = data?.holdings.find((h) => h.id === id)
      if (!holding) return
      setMakePublicHolding(holding)
    },
    [data]
  )

  const handleMakePublicSubmit = async (quantity: number) => {
    if (!makePublicHolding) return
    // /me/otc/stocks (sell direction) requires price_per_unit. Look it up
    // from the live stock listing matching this holding's ticker; if the
    // lookup fails we still submit so the backend can return a clear error.
    let price_per_unit: string | undefined
    try {
      const resp = await getStocks({ search: makePublicHolding.ticker, page_size: 5 })
      price_per_unit = resp.stocks.find((s) => s.ticker === makePublicHolding.ticker)?.price
    } catch {
      // Lookup failed — submit without; global error handling will surface
      // a backend rejection if price is genuinely required.
    }
    makePublicMutation.mutate(
      { id: makePublicHolding.id, payload: { quantity, price_per_unit } },
      { onSuccess: () => setMakePublicHolding(null) }
    )
  }

  const handleExercise = useCallback(
    (id: number) => {
      exerciseMutation.mutate(id)
    },
    [exerciseMutation]
  )

  return (
    <ViewShell title="Portfolio" subtitle="Your investment holdings and fund positions.">
      {summary && <PortfolioSummaryCard summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mb-4">
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle>Realised Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioProfitChart summary={summary} />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Holdings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioHoldingsPieChart holdings={data?.holdings ?? []} />
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="holdings">My Holdings</TabsTrigger>
          <TabsTrigger value="funds">My Funds</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="mt-4">
          <FilterBar
            fields={PORTFOLIO_FILTER_FIELDS}
            values={filterValues}
            onChange={handleFilterChange}
          />
          {isLoading ? (
            <LoadingState />
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
            <EmptyState title="No holdings found." />
          )}
        </TabsContent>
        <TabsContent value="funds" className="mt-4">
          <MyFundsList
            positions={fundPositions}
            onInvest={(p) => navigate(`/funds/${p.fund_id}`)}
            onRedeem={(p) => navigate(`/funds/${p.fund_id}`)}
          />
        </TabsContent>
      </Tabs>

      {makePublicHolding && (
        <MakePublicDialog
          open
          onOpenChange={(open) => {
            if (!open) setMakePublicHolding(null)
          }}
          holding={makePublicHolding}
          onSubmit={handleMakePublicSubmit}
          loading={makePublicMutation.isPending}
        />
      )}
    </ViewShell>
  )
}
