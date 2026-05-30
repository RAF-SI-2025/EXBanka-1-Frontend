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
import { RedeemFromFundDialog } from '@/views/funds/components/RedeemFromFundDialog'
import { MyPriceAlertsTable } from '@/views/priceAlerts/components/MyPriceAlertsTable'
import { PriceAlertDialog } from '@/views/priceAlerts/components/PriceAlertDialog'
import {
  usePortfolio,
  usePortfolioSummary,
  useMakePublic,
  useExerciseOption,
} from '@/hooks/usePortfolio'
import { useMyFundPositions, useRedeemFund } from '@/hooks/useFunds'
import { useDeletePriceAlert, usePriceAlerts, useUpdatePriceAlert } from '@/hooks/usePriceAlerts'
import { useListingMap } from '@/hooks/useSecurities'
import { useRemoveFromWatchlist, useWatchlist } from '@/hooks/useWatchlist'
import { useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { FavoritesTable } from '@/views/portfolio/components/FavoritesTable'
import { RecurringOrdersTable } from '@/views/portfolio/components/RecurringOrdersTable'
import {
  useRecurringOrders,
  usePauseRecurringOrder,
  useResumeRecurringOrder,
  useCancelRecurringOrder,
} from '@/hooks/useRecurringOrders'
import { notifySuccess } from '@/lib/errors'
import { getStocks } from '@/lib/api/securities'
import type { Holding, PortfolioFilters } from '@/types/portfolio'
import type { ClientFundPosition, RedeemPayload } from '@/types/fund'
import type { Account } from '@/types/account'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import type { CreatePriceAlertPayload, PriceAlert } from '@/types/priceAlert'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const PORTFOLIO_FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

type PortfolioTab = 'holdings' | 'funds' | 'alerts' | 'favorites' | 'recurring-orders'

function parseTab(value: string | null): PortfolioTab {
  if (value === 'funds') return 'funds'
  if (value === 'alerts') return 'alerts'
  if (value === 'favorites') return 'favorites'
  if (value === 'recurring-orders') return 'recurring-orders'
  return 'holdings'
}

export function PortfolioView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = parseTab(searchParams.get('tab'))
  const [tab, setTab] = useState<PortfolioTab>(initialTab)
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [makePublicHolding, setMakePublicHolding] = useState<Holding | null>(null)
  const [redeemPosition, setRedeemPosition] = useState<ClientFundPosition | null>(null)

  const apiFilters: PortfolioFilters = {
    page,
    page_size: PAGE_SIZE,
    security_type: (filterValues.security_type as PortfolioFilters['security_type']) || undefined,
  }

  const { data, isLoading } = usePortfolio(apiFilters)
  const { data: summary } = usePortfolioSummary()
  const { data: fundPositionsData } = useMyFundPositions()
  const fundPositions = fundPositionsData?.positions ?? []
  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'
  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts = isEmployee
    ? (bankAccountsData?.accounts ?? [])
    : (clientAccountsData?.accounts ?? [])
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const makePublicMutation = useMakePublic()
  const exerciseMutation = useExerciseOption()

  const handleTabChange = (next: string) => {
    const value = parseTab(next)
    setTab(value)
    if (value === 'holdings') searchParams.delete('tab')
    else searchParams.set('tab', value)
    setSearchParams(searchParams, { replace: true })
  }

  const { data: watchlistData } = useWatchlist()
  const watchlistItems = watchlistData?.items ?? []
  const removeFromWatchlistMutation = useRemoveFromWatchlist()
  const handleRemoveFavorite = (listingId: number) => removeFromWatchlistMutation.mutate(listingId)

  const { data: priceAlerts } = usePriceAlerts()
  const updateAlertMutation = useUpdatePriceAlert()
  const deleteAlertMutation = useDeletePriceAlert()
  const listingMap = useListingMap()
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null)
  const handlePauseAlert = (id: number) =>
    updateAlertMutation.mutate({ id, payload: { active: false } })
  const handleResumeAlert = (id: number) =>
    updateAlertMutation.mutate({ id, payload: { active: true } })
  const handleDeleteAlert = (id: number) => deleteAlertMutation.mutate(id)
  const handleEditAlertSubmit = (payload: CreatePriceAlertPayload) => {
    if (!editingAlert) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { listing_id, ...updatePayload } = payload
    updateAlertMutation.mutate(
      { id: editingAlert.id, payload: updatePayload },
      {
        onSuccess: () => {
          notifySuccess('Price alert updated.')
          setEditingAlert(null)
        },
      }
    )
  }

  const { data: recurringOrders } = useRecurringOrders()
  const pauseRecurringMutation = usePauseRecurringOrder()
  const resumeRecurringMutation = useResumeRecurringOrder()
  const cancelRecurringMutation = useCancelRecurringOrder()
  const handlePauseRecurring = (id: number) => pauseRecurringMutation.mutate(id)
  const handleResumeRecurring = (id: number) => resumeRecurringMutation.mutate(id)
  const handleCancelRecurring = (id: number) => cancelRecurringMutation.mutate(id)
  const recurringBusyId = pauseRecurringMutation.isPending
    ? pauseRecurringMutation.variables
    : resumeRecurringMutation.isPending
      ? resumeRecurringMutation.variables
      : cancelRecurringMutation.isPending
        ? cancelRecurringMutation.variables
        : undefined

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
          <TabsTrigger value="alerts">My Price Alerts</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recurring-orders">Recurring Orders</TabsTrigger>
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
            onRedeem={(p) => setRedeemPosition(p)}
          />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <MyPriceAlertsTable
            alerts={priceAlerts ?? []}
            onEdit={setEditingAlert}
            onPause={handlePauseAlert}
            onResume={handleResumeAlert}
            onDelete={handleDeleteAlert}
            busyId={
              updateAlertMutation.isPending
                ? updateAlertMutation.variables?.id
                : deleteAlertMutation.isPending
                  ? deleteAlertMutation.variables
                  : undefined
            }
          />
        </TabsContent>
        <TabsContent value="favorites" className="mt-4">
          <FavoritesTable
            items={watchlistItems}
            onRemove={handleRemoveFavorite}
            busyListingId={
              removeFromWatchlistMutation.isPending
                ? removeFromWatchlistMutation.variables
                : undefined
            }
          />
        </TabsContent>
        <TabsContent value="recurring-orders" className="mt-4">
          <RecurringOrdersTable
            orders={recurringOrders ?? []}
            onPause={handlePauseRecurring}
            onResume={handleResumeRecurring}
            onCancel={handleCancelRecurring}
            busyId={recurringBusyId}
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

      {redeemPosition && (
        <PortfolioRedeemConnector
          position={redeemPosition}
          accounts={accounts}
          asBank={isEmployee}
          onClose={() => setRedeemPosition(null)}
        />
      )}

      {editingAlert && (
        <PriceAlertDialog
          key={editingAlert.id}
          open
          onOpenChange={(o) => !o && setEditingAlert(null)}
          listing={{
            listing_id: editingAlert.listing_id,
            ticker:
              listingMap.get(editingAlert.listing_id)?.ticker ?? `#${editingAlert.listing_id}`,
            name: listingMap.get(editingAlert.listing_id)?.name ?? '',
          }}
          initialAlert={editingAlert}
          onSubmit={handleEditAlertSubmit}
          loading={updateAlertMutation.isPending}
        />
      )}
    </ViewShell>
  )
}

function PortfolioRedeemConnector({
  position,
  accounts,
  asBank,
  onClose,
}: {
  position: ClientFundPosition
  accounts: Account[]
  asBank: boolean
  onClose: () => void
}) {
  const mutation = useRedeemFund(position.fund_id)
  return (
    <RedeemFromFundDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      position={position}
      accounts={accounts}
      asBank={asBank}
      loading={mutation.isPending}
      onSubmit={(payload: RedeemPayload) =>
        mutation.mutate(payload, {
          onSuccess: () => {
            notifySuccess(`Redeemed from ${position.fund_name}.`)
            onClose()
          },
        })
      }
    />
  )
}
