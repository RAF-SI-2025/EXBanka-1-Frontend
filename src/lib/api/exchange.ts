import { apiClient } from '@/lib/api/axios'
import type { ExchangeRate, ConversionResult, ConvertCurrencyRequest } from '@/types/exchange'
import type { ExchangeRateResult } from '@/types/transfer'

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const response = await apiClient.get<ExchangeRate[]>('/api/exchange/rates')
  return response.data
}

export async function convertCurrency(params: ConvertCurrencyRequest): Promise<ConversionResult> {
  const response = await apiClient.post<ConversionResult>('/api/exchange/convert', params)
  return response.data
}

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRateResult> {
  const response = await apiClient.get<ExchangeRateResult>(`/api/exchange/rate`, {
    params: { from, to },
  })
  return response.data
}
