import type { Stock, FuturesContract, ForexPair, Option, PriceHistoryEntry } from '@/types/security'

export function createMockStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    outstanding_shares: 15000000000,
    dividend_yield: 0.006,
    exchange_acronym: 'NYSE',
    price: '178.50',
    ask: '178.60',
    bid: '178.40',
    change: '2.30',
    volume: 52000000,
    last_refresh: '2026-04-01T15:30:00Z',
    market_cap: '2677500000000',
    maintenance_margin: '89.25',
    initial_margin_cost: '98.18',
    ...overrides,
  }
}

export function createMockFutures(overrides: Partial<FuturesContract> = {}): FuturesContract {
  return {
    id: 1,
    ticker: 'CLJ26',
    name: 'Crude Oil Futures',
    contract_size: 1000,
    contract_unit: 'Barrel',
    settlement_date: '2026-04-15',
    exchange_acronym: 'NYMEX',
    price: '72.50',
    ask: '72.60',
    bid: '72.40',
    change: '-0.80',
    volume: 350000,
    last_refresh: '2026-04-01T15:30:00Z',
    maintenance_margin: '7250.00',
    initial_margin_cost: '7975.00',
    ...overrides,
  }
}

export function createMockForex(overrides: Partial<ForexPair> = {}): ForexPair {
  return {
    id: 1,
    ticker: 'EUR/USD',
    name: 'Euro to US Dollar',
    base_currency: 'EUR',
    quote_currency: 'USD',
    exchange_rate: '1.0850',
    liquidity: 'high',
    price: '1.0850',
    ask: '1.0852',
    bid: '1.0848',
    change: '0.0012',
    volume: 1500000,
    last_refresh: '2026-04-01T15:30:00Z',
    maintenance_margin: '108.50',
    initial_margin_cost: '119.35',
    ...overrides,
  }
}

export function createMockOption(overrides: Partial<Option> = {}): Option {
  return {
    id: 1,
    ticker: 'AAPL260417C00180000',
    name: 'Apple Call Option',
    stock_listing_id: 1,
    option_type: 'call',
    strike_price: '180.00',
    implied_volatility: '0.25',
    premium: '5.50',
    open_interest: 1200,
    settlement_date: '2026-04-17',
    price: '5.50',
    ask: '5.60',
    bid: '5.40',
    volume: 3500,
    ...overrides,
  }
}

export function createMockPriceHistory(count = 5): PriceHistoryEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-03-${String(25 + i).padStart(2, '0')}`,
    price: String(175 + i * 0.5),
    high: String(176 + i * 0.5),
    low: String(174 + i * 0.5),
    change: String(0.5 * (i % 2 === 0 ? 1 : -1)),
    volume: 50000000 + i * 1000000,
  }))
}
