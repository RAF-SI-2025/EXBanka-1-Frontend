import type { StockExchange } from '@/types/stockExchange'

export function createMockStockExchange(overrides: Partial<StockExchange> = {}): StockExchange {
  return {
    id: 1,
    name: 'New York Stock Exchange',
    acronym: 'NYSE',
    mic_code: 'XNYS',
    polity: 'United States',
    currency: 'Dollar',
    time_zone: '-5',
    ...overrides,
  }
}
