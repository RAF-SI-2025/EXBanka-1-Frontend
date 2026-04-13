import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  getStocks,
  getStock,
  getStockHistory,
  getFutures,
  getFuture,
  getFutureHistory,
  getForexPairs,
  getForexPair,
  getForexHistory,
  getOptions,
} from '@/lib/api/securities'
import type {
  StockFilters,
  FuturesFilters,
  ForexFilters,
  OptionsFilters,
  PriceHistoryFilters,
} from '@/types/security'

export function useStocks(filters: StockFilters = {}) {
  return useQuery({ queryKey: ['stocks', filters], queryFn: () => getStocks(filters) })
}

export function useStock(id: number) {
  return useQuery({ queryKey: ['stock', id], queryFn: () => getStock(id), enabled: id > 0 })
}

export function useStockHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({
    queryKey: ['stock-history', id, filters],
    queryFn: () => getStockHistory(id, filters),
    enabled: id > 0,
  })
}

export function useFutures(filters: FuturesFilters = {}) {
  return useQuery({ queryKey: ['futures', filters], queryFn: () => getFutures(filters) })
}

export function useFuture(id: number) {
  return useQuery({ queryKey: ['future', id], queryFn: () => getFuture(id), enabled: id > 0 })
}

export function useFutureHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({
    queryKey: ['future-history', id, filters],
    queryFn: () => getFutureHistory(id, filters),
    enabled: id > 0,
  })
}

export function useForexPairs(filters: ForexFilters = {}) {
  return useQuery({ queryKey: ['forex', filters], queryFn: () => getForexPairs(filters) })
}

export function useForexPair(id: number) {
  return useQuery({
    queryKey: ['forex-pair', id],
    queryFn: () => getForexPair(id),
    enabled: id > 0,
  })
}

export function useForexHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({
    queryKey: ['forex-history', id, filters],
    queryFn: () => getForexHistory(id, filters),
    enabled: id > 0,
  })
}

export function useOptions(filters: OptionsFilters) {
  return useQuery({
    queryKey: ['options', filters],
    queryFn: () => getOptions(filters),
    enabled: filters.stock_id > 0,
  })
}

/** Builds a Map<listingId, {ticker, name}> from all stocks, futures, and forex pairs. */
export function useListingMap(): Map<number, { ticker: string; name: string }> {
  const { data: stocksData } = useStocks({ page_size: 500 })
  const { data: futuresData } = useFutures({ page_size: 500 })
  const { data: forexData } = useForexPairs({ page_size: 500 })

  return useMemo(() => {
    const map = new Map<number, { ticker: string; name: string }>()
    for (const s of stocksData?.stocks ?? []) map.set(s.id, { ticker: s.ticker, name: s.name })
    for (const f of futuresData?.futures ?? []) map.set(f.id, { ticker: f.ticker, name: f.name })
    for (const fx of forexData?.forex_pairs ?? [])
      map.set(fx.id, { ticker: fx.ticker, name: fx.name })
    return map
  }, [stocksData, futuresData, forexData])
}
