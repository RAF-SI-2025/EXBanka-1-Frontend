import { apiClient } from '@/lib/api/axios'
import type {
  StockExchangeFilters,
  StockExchangeListResponse,
  TestingModeResponse,
} from '@/views/stockExchanges/types'

export const stockExchangesApi = {
  async list(filters: StockExchangeFilters = {}): Promise<StockExchangeListResponse> {
    const { data } = await apiClient.get<StockExchangeListResponse>('/stock-exchanges', {
      params: filters,
    })
    return { ...data, exchanges: data.exchanges ?? [] }
  },
  async getTestingMode(): Promise<TestingModeResponse> {
    const { data } = await apiClient.get<TestingModeResponse>('/stock-exchanges/testing-mode')
    return data
  },
  async setTestingMode(enabled: boolean): Promise<TestingModeResponse> {
    const { data } = await apiClient.post<TestingModeResponse>('/stock-exchanges/testing-mode', {
      enabled,
    })
    return data
  },
}
