import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterBar } from '@/components/ui/FilterBar'
import { HoldingTable } from '@/views/portfolio/components/HoldingTable'
import { PortfolioSummaryCard } from '@/views/portfolio/components/PortfolioSummaryCard'
import { PortfolioProfitChart } from '@/views/portfolio/components/PortfolioProfitChart'
import { PortfolioHoldingsPieChart } from '@/views/portfolio/components/PortfolioHoldingsPieChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MyFundsList } from '@/views/funds/components/MyFundsList'
import { RedeemFromFundDialog } from '@/views/funds/components/RedeemFromFundDialog'
import { MyPriceAlertsTable } from '@/views/priceAlerts/components/MyPriceAlertsTable'
import { PriceAlertDialog } from '@/views/priceAlerts/components/PriceAlertDialog'
import { usePortfolio, usePortfolioSummary, useExerciseOption } from '@/hooks/usePortfolio'
import { useMyFundPositions, useRedeemFund } from '@/hooks/useFunds'
import { useDeletePriceAlert, usePriceAlerts, useUpdatePriceAlert } from '@/hooks/usePriceAlerts'
import { useListingMap } from '@/hooks/useSecurities'
import { useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { WatchlistPanel } from '@/views/portfolio/components/WatchlistPanel'
import { RecurringOrdersTable } from '@/views/portfolio/components/RecurringOrdersTable'
import {
  useRecurringOrders,
  usePauseRecurringOrder,
  useResumeRecurringOrder,
  useCancelRecurringOrder,
} from '@/hooks/useRecurringOrders'
import { notifySuccess } from '@/lib/errors'
import type { ClientFundPosition, RedeemPayload } from '@/types/fund'
import type { Account } from '@/types/account'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import type { CreatePriceAlertPayload, PriceAlert } from '@/types/priceAlert'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

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
  const [redeemPosition, setRedeemPosition] = useState<ClientFundPosition | null>(null)

  const { data, isLoading } = usePortfolio()
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

  const allPositions = useMemo(() => data?.securities.positions ?? [], [data])
  const searchTerm = ((filterValues.search as string) || '').trim().toLowerCase()
  const filteredPositions = useMemo(
    () =>
      searchTerm
        ? allPositions.filter((p) => p.symbol.toLowerCase().includes(searchTerm))
        : allPositions,
    [allPositions, searchTerm]
  )

  const exerciseMutation = useExerciseOption()

  const handleTabChange = (next: string) => {
    const value = parseTab(next)
    setTab(value)
    if (value === 'holdings') searchParams.delete('tab')
    else searchParams.set('tab', value)
    setSearchParams(searchParams, { replace: true })
  }

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

  const handleFilterChange = (newFilters: FilterValues) => setFilterValues(newFilters)

  const findPosition = useCallback(
    (holdingId: number) => allPositions.find((p) => p.holding_id === holdingId),
    [allPositions]
  )

  const handleSell = useCallback(
    (holdingId: number) => {
      const position = findPosition(holdingId)
      if (!position) return
      navigate(
        `/securities/order/new?direction=sell&securityType=${position.asset_type}&ticker=${encodeURIComponent(position.symbol)}`
      )
    },
    [navigate, findPosition]
  )

  const handleRowClick = useCallback(
    (holdingId: number) => {
      navigate(`/portfolio/holdings/${holdingId}/transactions`)
    },
    [navigate]
  )

  const handleExercise = useCallback(
    (holdingId: number) => {
      exerciseMutation.mutate(holdingId)
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
            <PortfolioHoldingsPieChart positions={allPositions} />
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
          ) : filteredPositions.length ? (
            <>
              <HoldingTable
                positions={filteredPositions}
                onRowClick={handleRowClick}
                onSell={handleSell}
                onExercise={handleExercise}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {filteredPositions.length} holdings
              </p>
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
          <WatchlistPanel />
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
