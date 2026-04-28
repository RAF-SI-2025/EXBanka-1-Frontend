import { apiClient } from '@/lib/api/axios'
import type { ExchangeRate, ConversionResult, ConvertCurrencyRequest } from '@/types/exchange'

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const response = await apiClient.get<{ rates: ExchangeRate[] }>('/exchange/rates')
  return response.data.rates
}

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
  const response = await apiClient.get<ExchangeRate>(`/exchange/rates/${from}/${to}`)
  return response.data
}

export async function convertCurrency(params: ConvertCurrencyRequest): Promise<ConversionResult> {
  const rateData = await getExchangeRate(params.from_currency, params.to_currency)
  const rate = Number(rateData.buy_rate)
  return {
    from_amount: params.amount,
    from_currency: params.from_currency,
    to_amount: params.amount * rate,
    to_currency: params.to_currency,
    rate,
  }
}
