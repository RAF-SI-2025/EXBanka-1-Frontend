export interface ExchangeRate {
  from_currency: string
  to_currency: string
  buy_rate: number
  sell_rate: number
  updated_at: string
}

export interface ConversionResult {
  from_amount: number
  from_currency: string
  to_amount: number
  to_currency: string
  rate: number
}

export interface ConvertCurrencyRequest {
  from_currency: string
  to_currency: string
  amount: number
}
