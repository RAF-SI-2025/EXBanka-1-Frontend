import { apiClient } from '@/lib/api/axios'
import type {
  StockExchangeListResponse,
  StockExchangeFilters,
  TestingModeResponse,
} from '@/types/stockExchange'

export async function getStockExchanges(
  filters: StockExchangeFilters = {}
): Promise<StockExchangeListResponse> {
  const { data } = await apiClient.get<StockExchangeListResponse>('/api/v1/stock-exchanges', {
    params: filters,
  })
  return { ...data, exchanges: data.exchanges ?? [] }
}

export async function getTestingMode(): Promise<TestingModeResponse> {
  const { data } = await apiClient.get<TestingModeResponse>('/api/v1/stock-exchanges/testing-mode')
  return data
}

export async function setTestingMode(enabled: boolean): Promise<TestingModeResponse> {
  const { data } = await apiClient.post<TestingModeResponse>(
    '/api/v1/stock-exchanges/testing-mode',
    {
      enabled,
    }
  )
  return data
}
