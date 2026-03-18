export interface ExchangeRate {
  currency_code: string
  currency_name: string
  buy_rate: number
  sell_rate: number
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
