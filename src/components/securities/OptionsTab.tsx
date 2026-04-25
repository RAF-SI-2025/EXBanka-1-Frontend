import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { OptionsTable } from '@/components/securities/OptionsTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStocks, useOptions } from '@/hooks/useSecurities'
import type { Stock, Option } from '@/types/security'

const PAGE_SIZE = 10

export function OptionsTab() {
  const navigate = useNavigate()
  const [stockSearch, setStockSearch] = useState('')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [optionType, setOptionType] = useState<'call' | 'put' | ''>('')
  const [settlementDate, setSettlementDate] = useState('')
  const [optionPage, setOptionPage] = useState(1)

  const { data: stockResults } = useStocks(
    stockSearch.length >= 1 && !selectedStock ? { search: stockSearch, page_size: 10 } : {}
  )

  const { data: optionsData, isLoading: optionsLoading } = useOptions({
    stock_id: selectedStock?.id ?? 0,
    option_type: optionType || undefined,
    settlement_date: settlementDate || undefined,
    page: optionPage,
    page_size: PAGE_SIZE,
  })

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock)
    setStockSearch('')
    setOptionPage(1)
  }

  const handleClearStock = () => {
    setSelectedStock(null)
    setStockSearch('')
    setOptionPage(1)
  }

  const handleBuyOption = useCallback(
    (option: Option) => {
      navigate(`/securities/order/new?optionId=${option.id}&direction=buy&securityType=option`)
    },
    [navigate]
  )

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Label>Stock</Label>
        {selectedStock ? (
          <div className="flex items-center justify-between mt-1 p-2 border rounded text-sm">
            <span>
              {selectedStock.ticker} — {selectedStock.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClearStock}>
              Clear
            </Button>
          </div>
        ) : (
          <div className="relative mt-1">
            <Input
              aria-label="Search stock"
              placeholder="Search stock by ticker..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
            />
            {stockResults && stockResults.stocks.length > 0 && stockSearch && (
              <ul className="absolute z-10 w-full bg-background border rounded shadow-md max-h-48 overflow-auto text-sm">
                {stockResults.stocks.map((stock) => (
                  <li
                    key={stock.id}
                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSelectStock(stock)}
                  >
                    {stock.ticker} — {stock.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedStock && (
        <>
          <div className="flex gap-4 flex-wrap">
            <div>
              <Label htmlFor="option-type">Type</Label>
              <select
                id="option-type"
                className="block border rounded px-3 py-2 text-sm mt-1"
                value={optionType}
                onChange={(e) => {
                  setOptionType(e.target.value as 'call' | 'put' | '')
                  setOptionPage(1)
                }}
              >
                <option value="">All</option>
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>
            <div>
              <Label htmlFor="settlement-date">Settlement Date</Label>
              <input
                id="settlement-date"
                type="date"
                className="block border rounded px-3 py-2 text-sm mt-1"
                value={settlementDate}
                onChange={(e) => {
                  setSettlementDate(e.target.value)
                  setOptionPage(1)
                }}
              />
            </div>
          </div>

          {optionsLoading ? (
            <LoadingSpinner />
          ) : optionsData?.options.length ? (
            <>
              <OptionsTable
                options={optionsData.options}
                onRowClick={(id) => navigate(`/securities/options/${id}`)}
                onBuy={handleBuyOption}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {optionsData.total_count} options
              </p>
              <PaginationControls
                page={optionPage}
                totalPages={Math.max(1, Math.ceil((optionsData.total_count ?? 0) / PAGE_SIZE))}
                onPageChange={setOptionPage}
              />
            </>
          ) : (
            <p>No options found.</p>
          )}
        </>
      )}

      {!selectedStock && (
        <p className="text-sm text-muted-foreground">
          Select a stock above to view its options chain.
        </p>
      )}
    </div>
  )
}
