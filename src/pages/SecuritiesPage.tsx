import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterBar } from '@/components/ui/FilterBar'
import { StockTable } from '@/components/securities/StockTable'
import { FuturesTable } from '@/components/securities/FuturesTable'
import { ForexTable } from '@/components/securities/ForexTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStocks, useFutures, useForexPairs } from '@/hooks/useSecurities'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import type { Stock, FuturesContract, ForexPair } from '@/types/security'

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

export function SecuritiesPage() {
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
      navigate(`/securities/order/new?listingId=${stock.id}&direction=buy`)
    },
    [navigate]
  )

  const handleBuyFutures = useCallback(
    (futures: FuturesContract) => {
      navigate(`/securities/order/new?listingId=${futures.id}&direction=buy`)
    },
    [navigate]
  )

  const handleBuyForex = useCallback(
    (pair: ForexPair) => {
      navigate(`/securities/order/new?listingId=${pair.id}&direction=buy`)
    },
    [navigate]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Securities</h1>
      <Tabs defaultValue="stocks">
        <TabsList className="mb-4">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
          {!isClient && <TabsTrigger value="forex">Forex</TabsTrigger>}
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
          {stockLoading ? (
            <LoadingSpinner />
          ) : stockData?.stocks.length ? (
            <>
              <StockTable
                stocks={stockData.stocks}
                onRowClick={(id) => navigate(`/securities/stocks/${id}`)}
                onBuy={handleBuyStock}
              />
              <p className="text-sm text-muted-foreground mt-2">{stockData.total_count} stocks</p>
              <PaginationControls
                page={stockPage}
                totalPages={Math.max(1, Math.ceil((stockData.total_count ?? 0) / PAGE_SIZE))}
                onPageChange={setStockPage}
              />
            </>
          ) : (
            <p>No stocks found.</p>
          )}
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
          {futuresLoading ? (
            <LoadingSpinner />
          ) : futuresData?.futures.length ? (
            <>
              <FuturesTable
                futures={futuresData.futures}
                onRowClick={(id) => navigate(`/securities/futures/${id}`)}
                onBuy={handleBuyFutures}
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
          ) : (
            <p>No futures found.</p>
          )}
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
            {forexLoading ? (
              <LoadingSpinner />
            ) : forexData?.forex_pairs.length ? (
              <>
                <ForexTable
                  pairs={forexData.forex_pairs}
                  onRowClick={(id) => navigate(`/securities/forex/${id}`)}
                  onBuy={handleBuyForex}
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
            ) : (
              <p>No forex pairs found.</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
