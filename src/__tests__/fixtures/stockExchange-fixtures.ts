import type { StockExchange } from '@/types/stockExchange'

export function createMockStockExchange(overrides: Partial<StockExchange> = {}): StockExchange {
  return {
    id: 1,
    exchange_name: 'New York Stock Exchange',
    exchange_acronym: 'NYSE',
    exchange_mic_code: 'XNYS',
    polity: 'United States',
    currency: 'Dollar',
    time_zone: '-5',
    ...overrides,
  }
}
