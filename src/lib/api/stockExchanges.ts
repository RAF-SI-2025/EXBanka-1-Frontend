import { apiClient } from '@/lib/api/axios'
import type {
  StockExchangeListResponse,
  StockExchangeFilters,
  TestingModeResponse,
} from '@/types/stockExchange'

export async function getStockExchanges(
  filters: StockExchangeFilters = {}
): Promise<StockExchangeListResponse> {
  const { data } = await apiClient.get<StockExchangeListResponse>('/api/stock-exchanges', {
    params: filters,
  })
  return data
}

export async function getTestingMode(): Promise<TestingModeResponse> {
  const { data } = await apiClient.get<TestingModeResponse>('/api/stock-exchanges/testing-mode')
  return data
}

export async function setTestingMode(enabled: boolean): Promise<TestingModeResponse> {
  const { data } = await apiClient.post<TestingModeResponse>('/api/stock-exchanges/testing-mode', {
    enabled,
  })
  return data
}
