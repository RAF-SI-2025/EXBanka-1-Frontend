import { apiClient } from '@/lib/api/axios'
import type {
  ForexFilters,
  ForexListResponse,
  ForexPair,
  FuturesContract,
  FuturesFilters,
  FuturesListResponse,
  Option,
  OptionsFilters,
  OptionsListResponse,
  PriceHistoryFilters,
  PriceHistoryResponse,
  Stock,
  StockFilters,
  StockListResponse,
} from '@/types/security'

function flattenListing<T>(item: T): T {
  const raw = item as unknown as Record<string, unknown>
  if (raw && typeof raw === 'object' && 'listing' in raw && raw.listing) {
    const { listing, ...rest } = raw
    return { ...rest, ...(listing as Record<string, unknown>) } as T
  }
  return item
}

export async function getStocks(filters: StockFilters = {}): Promise<StockListResponse> {
  const { data } = await apiClient.get<StockListResponse>('/api/v1/securities/stocks', {
    params: filters,
  })
  return { ...data, stocks: (data.stocks ?? []).map(flattenListing) }
}

export async function getStock(id: number): Promise<Stock> {
  const { data } = await apiClient.get<Stock>(`/api/v1/securities/stocks/${id}`)
  return flattenListing(data)
}

export async function getStockHistory(
  id: number,
  filters: PriceHistoryFilters = {}
): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(
    `/api/v1/securities/stocks/${id}/history`,
    { params: filters }
  )
  return { ...data, history: data.history ?? [] }
}

export async function getFutures(filters: FuturesFilters = {}): Promise<FuturesListResponse> {
  const { data } = await apiClient.get<FuturesListResponse>('/api/v1/securities/futures', {
    params: filters,
  })
  return { ...data, futures: (data.futures ?? []).map(flattenListing) }
}

export async function getFuture(id: number): Promise<FuturesContract> {
  const { data } = await apiClient.get<FuturesContract>(`/api/v1/securities/futures/${id}`)
  return flattenListing(data)
}

export async function getFutureHistory(
  id: number,
  filters: PriceHistoryFilters = {}
): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(
    `/api/v1/securities/futures/${id}/history`,
    { params: filters }
  )
  return { ...data, history: data.history ?? [] }
}

export async function getForexPairs(filters: ForexFilters = {}): Promise<ForexListResponse> {
  const { data } = await apiClient.get<ForexListResponse>('/api/v1/securities/forex', {
    params: filters,
  })
  return { ...data, forex_pairs: (data.forex_pairs ?? []).map(flattenListing) }
}

export async function getForexPair(id: number): Promise<ForexPair> {
  const { data } = await apiClient.get<ForexPair>(`/api/v1/securities/forex/${id}`)
  return flattenListing(data)
}

export async function getForexHistory(
  id: number,
  filters: PriceHistoryFilters = {}
): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(
    `/api/v1/securities/forex/${id}/history`,
    { params: filters }
  )
  return { ...data, history: data.history ?? [] }
}

export async function getOptions(filters: OptionsFilters): Promise<OptionsListResponse> {
  const { data } = await apiClient.get<OptionsListResponse>('/api/v1/securities/options', {
    params: filters,
  })
  return { ...data, options: (data.options ?? []).map(flattenListing) }
}

export async function getOption(id: number): Promise<Option> {
  const { data } = await apiClient.get<Option>(`/api/v1/securities/options/${id}`)
  return flattenListing(data)
}
