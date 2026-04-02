import type { Stock, Futures, Forex } from '@/types/security'

export function createMockStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchange_acronym: 'NASDAQ',
    ask: '175.50',
    bid: '175.40',
    price: '175.45',
    volume: 10000000,
    contract_size: 1,
    maintenance_margin: '10.00',
    change: '1.50',
    change_percent: '0.86',
    ...overrides,
  }
}

export function createMockFutures(overrides: Partial<Futures> = {}): Futures {
  return {
    id: 1,
    ticker: 'ES1',
    name: 'E-mini S&P 500 Futures',
    exchange_acronym: 'CME',
    ask: '4500.25',
    bid: '4500.00',
    price: '4500.10',
    volume: 500000,
    contract_size: 50,
    settlement_date: '2026-06-20',
    ...overrides,
  }
}

export function createMockForex(overrides: Partial<Forex> = {}): Forex {
  return {
    id: 1,
    base_currency: 'EUR',
    quote_currency: 'USD',
    exchange_rate: '1.0850',
    ask: '1.0860',
    bid: '1.0840',
    liquidity: 'high',
    ...overrides,
  }
}
