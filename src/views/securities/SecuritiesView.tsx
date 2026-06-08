import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useStocks, useFutures, useForexPairs } from '@/hooks/useSecurities'
import { useCreatePriceAlert } from '@/hooks/usePriceAlerts'
import { useAddToWatchlistItems, useWatchlistMembership, useWatchlists } from '@/hooks/useWatchlist'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { notifySuccess } from '@/lib/errors'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import type { Stock, FuturesContract, ForexPair } from '@/types/security'
import type { CreatePriceAlertPayload } from '@/types/priceAlert'
import { ForexTable } from '@/views/securities/components/ForexTable'
import { FuturesTable } from '@/views/securities/components/FuturesTable'
import { OptionsTab } from '@/views/securities/components/OptionsTab'
import { StockTable } from '@/views/securities/components/StockTable'
import { AddToWatchlistDialog } from '@/views/securities/components/AddToWatchlistDialog'
import { PriceAlertDialog } from '@/views/priceAlerts/components/PriceAlertDialog'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

interface AlertListing {
  listing_id: number
  ticker: string
  name: string
}

const PAGE_SIZE = 10

const STOCK_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'exchange_acronym', label: 'Exchange', type: 'text' },
  { key: 'min_price', label: 'Min Price', type: 'number' },
  { key: 'max_price', label: 'Max Price', type: 'number' },
]

const FUTURES_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'exchange_acronym', label: 'Exchange', type: 'text' },
  { key: 'min_price', label: 'Min Price', type: 'number' },
  { key: 'max_price', label: 'Max Price', type: 'number' },
  { key: 'settlement_date_from', label: 'Settle From', type: 'date' },
  { key: 'settlement_date_to', label: 'Settle To', type: 'date' },
]

const FOREX_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'base_currency', label: 'Base Currency', type: 'text' },
  { key: 'quote_currency', label: 'Quote Currency', type: 'text' },
]

export function SecuritiesView() {
  const navigate = useNavigate()
  const userType = useAppSelector(selectUserType)
  const isClient = userType === 'client'

  const [stockFilters, setStockFilters] = useState<FilterValues>({})
  const [stockPage, setStockPage] = useState(1)
  const stockApiFilters = {
    page: stockPage,
    page_size: PAGE_SIZE,
    search: (stockFilters.search as string) || undefined,
    exchange_acronym: (stockFilters.exchange_acronym as string) || undefined,
    min_price: (stockFilters.min_price as string) || undefined,
    max_price: (stockFilters.max_price as string) || undefined,
  }
  const { data: stockData, isLoading: stockLoading } = useStocks(stockApiFilters)

  const [futuresFilters, setFuturesFilters] = useState<FilterValues>({})
  const [futuresPage, setFuturesPage] = useState(1)
  const futuresApiFilters = {
    page: futuresPage,
    page_size: PAGE_SIZE,
    search: (futuresFilters.search as string) || undefined,
    exchange_acronym: (futuresFilters.exchange_acronym as string) || undefined,
    min_price: (futuresFilters.min_price as string) || undefined,
    max_price: (futuresFilters.max_price as string) || undefined,
    settlement_date_from: (futuresFilters.settlement_date_from as string) || undefined,
    settlement_date_to: (futuresFilters.settlement_date_to as string) || undefined,
  }
  const { data: futuresData, isLoading: futuresLoading } = useFutures(futuresApiFilters)

  const [forexFilters, setForexFilters] = useState<FilterValues>({})
  const [forexPage, setForexPage] = useState(1)
  const forexApiFilters = {
    page: forexPage,
    page_size: PAGE_SIZE,
    search: (forexFilters.search as string) || undefined,
    base_currency: (forexFilters.base_currency as string) || undefined,
    quote_currency: (forexFilters.quote_currency as string) || undefined,
  }
  const { data: forexData, isLoading: forexLoading } = useForexPairs(forexApiFilters)

  const handleBuyStock = useCallback(
    (stock: Stock) => {
      navigate(`/securities/order/new?listingId=${stock.listing_id ?? stock.id}&direction=buy`)
    },
    [navigate]
  )

  const handleBuyFutures = useCallback(
    (futures: FuturesContract) => {
      navigate(`/securities/order/new?listingId=${futures.listing_id ?? futures.id}&direction=buy`)
    },
    [navigate]
  )

  const handleBuyForex = useCallback(
    (pair: ForexPair) => {
      navigate(
        `/securities/order/new?listingId=${pair.listing_id ?? pair.id}&direction=buy&securityType=forex`
      )
    },
    [navigate]
  )

  const [alertListing, setAlertListing] = useState<AlertListing | null>(null)
  const createAlertMutation = useCreatePriceAlert()

  const openAlertForStock = useCallback((s: Stock) => {
    setAlertListing({ listing_id: s.listing_id ?? s.id, ticker: s.ticker, name: s.name })
  }, [])
  const openAlertForFutures = useCallback((f: FuturesContract) => {
    setAlertListing({ listing_id: f.listing_id ?? f.id, ticker: f.ticker, name: f.name })
  }, [])
  const openAlertForForex = useCallback((p: ForexPair) => {
    setAlertListing({ listing_id: p.listing_id ?? p.id, ticker: p.ticker, name: p.name })
  }, [])

  const handleCreateAlert = (payload: CreatePriceAlertPayload) => {
    createAlertMutation.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Price alert created.')
        setAlertListing(null)
      },
    })
  }

  const watchlistIds = useWatchlistMembership()
  const { data: watchlists } = useWatchlists()
  const addToWatchlistMutation = useAddToWatchlistItems()
  const [watchlistListing, setWatchlistListing] = useState<{
    listing_id: number
    ticker: string
  } | null>(null)
  const handleOpenWatchlist = useCallback(
    (listingId: number, ticker: string) => setWatchlistListing({ listing_id: listingId, ticker }),
    []
  )
  const handleAddToWatchlist = (watchlistId: number) => {
    if (!watchlistListing) return
    addToWatchlistMutation.mutate(
      { watchlistId, listingId: watchlistListing.listing_id },
      {
        onSuccess: () => {
          notifySuccess(`Added ${watchlistListing.ticker} to watchlist.`)
          setWatchlistListing(null)
        },
      }
    )
  }

  return (
    <ViewShell
      title="Securities"
      subtitle="Browse and trade stocks, futures, forex pairs, and options."
    >
      <Tabs defaultValue="stocks">
        <TabsList className="mb-4">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
          {!isClient && <TabsTrigger value="forex">Forex</TabsTrigger>}
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks">
          <FilterBar
            fields={STOCK_FILTER_FIELDS}
            values={stockFilters}
            onChange={(v) => {
              setStockFilters(v)
              setStockPage(1)
            }}
          />
          <Card>
            <CardContent className="pt-6">
              {stockLoading && <LoadingState />}
              {!stockLoading && !stockData?.stocks.length && (
                <EmptyState title="No stocks found." />
              )}
              {!stockLoading && stockData?.stocks.length ? (
                <>
                  <StockTable
                    stocks={stockData.stocks}
                    onRowClick={(id) => navigate(`/securities/stocks/${id}`)}
                    onBuy={handleBuyStock}
                    onCreateAlert={openAlertForStock}
                    watchlistIds={watchlistIds}
                    onOpenWatchlist={handleOpenWatchlist}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {stockData.total_count} stocks
                  </p>
                  <PaginationControls
                    page={stockPage}
                    totalPages={Math.max(1, Math.ceil((stockData.total_count ?? 0) / PAGE_SIZE))}
                    onPageChange={setStockPage}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="futures">
          <FilterBar
            fields={FUTURES_FILTER_FIELDS}
            values={futuresFilters}
            onChange={(v) => {
              setFuturesFilters(v)
              setFuturesPage(1)
            }}
          />
          <Card>
            <CardContent className="pt-6">
              {futuresLoading && <LoadingState />}
              {!futuresLoading && !futuresData?.futures.length && (
                <EmptyState title="No futures found." />
              )}
              {!futuresLoading && futuresData?.futures.length ? (
                <>
                  <FuturesTable
                    futures={futuresData.futures}
                    onRowClick={(id) => navigate(`/securities/futures/${id}`)}
                    onBuy={handleBuyFutures}
                    onCreateAlert={openAlertForFutures}
                    watchlistIds={watchlistIds}
                    onOpenWatchlist={handleOpenWatchlist}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {futuresData.total_count} futures
                  </p>
                  <PaginationControls
                    page={futuresPage}
                    totalPages={Math.max(1, Math.ceil((futuresData.total_count ?? 0) / PAGE_SIZE))}
                    onPageChange={setFuturesPage}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {!isClient && (
          <TabsContent value="forex">
            <FilterBar
              fields={FOREX_FILTER_FIELDS}
              values={forexFilters}
              onChange={(v) => {
                setForexFilters(v)
                setForexPage(1)
              }}
            />
            <Card>
              <CardContent className="pt-6">
                {forexLoading && <LoadingState />}
                {!forexLoading && !forexData?.forex_pairs.length && (
                  <EmptyState title="No forex pairs found." />
                )}
                {!forexLoading && forexData?.forex_pairs.length ? (
                  <>
                    <ForexTable
                      pairs={forexData.forex_pairs}
                      onRowClick={(id) => navigate(`/securities/forex/${id}`)}
                      onBuy={handleBuyForex}
                      onCreateAlert={openAlertForForex}
                      watchlistIds={watchlistIds}
                      onOpenWatchlist={handleOpenWatchlist}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {forexData.total_count} forex pairs
                    </p>
                    <PaginationControls
                      page={forexPage}
                      totalPages={Math.max(1, Math.ceil((forexData.total_count ?? 0) / PAGE_SIZE))}
                      onPageChange={setForexPage}
                    />
                  </>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="options">
          <Card>
            <CardContent className="pt-6">
              <OptionsTab watchlistIds={watchlistIds} onOpenWatchlist={handleOpenWatchlist} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {alertListing && (
        <PriceAlertDialog
          open
          onOpenChange={(o) => !o && setAlertListing(null)}
          listing={alertListing}
          onSubmit={handleCreateAlert}
          loading={createAlertMutation.isPending}
        />
      )}

      {watchlistListing && (
        <AddToWatchlistDialog
          open
          onOpenChange={(o) => !o && setWatchlistListing(null)}
          listing={watchlistListing}
          watchlists={watchlists ?? []}
          onSubmit={handleAddToWatchlist}
          loading={addToWatchlistMutation.isPending}
        />
      )}
    </ViewShell>
  )
}
