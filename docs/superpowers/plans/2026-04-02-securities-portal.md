# Securities Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Securities Portal — a full trading interface with securities browsing (stocks/futures/forex tabs), detail pages with price charts, options chain display, order creation, personal orders, portfolio management, admin order approval, and tax management.

**Architecture:** Single tabbed page for securities browsing (`/securities`). Detail pages per security type with Recharts price charts. Create Order form page. My Orders + Portfolio for personal views. Admin Orders + Tax for supervisor/admin views. All server data via TanStack Query. Existing FilterBar, PaginationControls, Dialog patterns reused throughout.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Recharts, Shadcn UI, Tailwind CSS, Jest + RTL

**Dependencies to install:** `recharts` (+ `@types/recharts` if needed)

---

## Scope & Access Control

| Page | Route | Access | Notes |
|---|---|---|---|
| Securities Portal | `/securities` | Any authenticated | Clients: stocks+futures tabs only. Actuaries/employees: all tabs |
| Stock Detail | `/securities/stocks/:id` | Any authenticated | Includes options chain |
| Futures Detail | `/securities/futures/:id` | Any authenticated | |
| Forex Detail | `/securities/forex/:id` | Any authenticated | |
| Create Order | `/securities/order/new` | Any authenticated | Query param `?listingId=X&direction=buy` |
| My Orders | `/orders` | Any authenticated | |
| Portfolio | `/portfolio` | Any authenticated | |
| Admin Orders | `/admin/orders` | `orders.approve` permission | Supervisor approval page |
| Tax | `/admin/tax` | `tax.manage` permission | Tax records + collect |

---

## File Structure

### Types (no TDD — config-like, per CLAUDE.md exceptions)
| File | Purpose |
|---|---|
| `src/types/security.ts` | Stock, FuturesContract, ForexPair, Option, Listing interfaces + filters |
| `src/types/order.ts` | Order, CreateOrderPayload, OrderFilters |
| `src/types/portfolio.ts` | Holding, PortfolioSummary, PortfolioFilters |
| `src/types/tax.ts` | TaxRecord, TaxFilters, CollectTaxResponse |

### Fixtures
| File | Purpose |
|---|---|
| `src/__tests__/fixtures/security-fixtures.ts` | createMockStock, createMockFutures, createMockForex, createMockOption, createMockPriceHistory |
| `src/__tests__/fixtures/order-fixtures.ts` | createMockOrder |
| `src/__tests__/fixtures/portfolio-fixtures.ts` | createMockHolding, createMockPortfolioSummary |
| `src/__tests__/fixtures/tax-fixtures.ts` | createMockTaxRecord |

### API Layer (TDD)
| File | Functions |
|---|---|
| `src/lib/api/securities.ts` | getStocks, getStock, getStockHistory, getFutures, getFuture, getFutureHistory, getForexPairs, getForexPair, getForexHistory, getOptions, getOption |
| `src/lib/api/orders.ts` | createOrder, getMyOrders, getMyOrder, cancelOrder, getAllOrders, approveOrder, declineOrder |
| `src/lib/api/portfolio.ts` | getPortfolio, getPortfolioSummary, makeHoldingPublic, exerciseOption |
| `src/lib/api/tax.ts` | getTaxRecords, collectTaxes |

### Hooks (TDD)
| File | Hooks |
|---|---|
| `src/hooks/useSecurities.ts` | useStocks, useStock, useStockHistory, useFutures, useFuture, useFutureHistory, useForexPairs, useForexPair, useForexHistory, useOptions |
| `src/hooks/useOrders.ts` | useMyOrders, useCreateOrder, useCancelOrder, useAllOrders, useApproveOrder, useDeclineOrder |
| `src/hooks/usePortfolio.ts` | usePortfolio, usePortfolioSummary, useMakePublic, useExerciseOption |
| `src/hooks/useTax.ts` | useTaxRecords, useCollectTaxes |

### Components (TDD)
| File | Purpose |
|---|---|
| `src/components/securities/StockTable.tsx` | Table for stocks list |
| `src/components/securities/FuturesTable.tsx` | Table for futures list |
| `src/components/securities/ForexTable.tsx` | Table for forex pairs list |
| `src/components/securities/PriceChart.tsx` | Recharts line chart with period selector |
| `src/components/securities/SecurityInfoPanel.tsx` | Detail info panel (key-value display) |
| `src/components/securities/OptionsChain.tsx` | Calls/Puts options chain table with ITM/OTM coloring |
| `src/components/orders/CreateOrderForm.tsx` | Order form (direction, type, quantity, limit/stop values, account) |
| `src/components/orders/OrderTable.tsx` | Reusable orders table |
| `src/components/portfolio/HoldingTable.tsx` | Holdings table |
| `src/components/portfolio/PortfolioSummaryCard.tsx` | Summary stats card |
| `src/components/tax/TaxTable.tsx` | Tax records table |

### Pages (TDD)
| File | Purpose |
|---|---|
| `src/pages/SecuritiesPage.tsx` | Tabbed (Stocks/Futures/Forex) with FilterBar + pagination |
| `src/pages/StockDetailPage.tsx` | Chart + info + options chain |
| `src/pages/FuturesDetailPage.tsx` | Chart + info |
| `src/pages/ForexDetailPage.tsx` | Chart + info |
| `src/pages/CreateOrderPage.tsx` | Order creation form page |
| `src/pages/MyOrdersPage.tsx` | User's orders list |
| `src/pages/PortfolioPage.tsx` | Holdings + summary |
| `src/pages/AdminOrdersPage.tsx` | Supervisor order approval |
| `src/pages/TaxPage.tsx` | Tax management |

### Modified Files
| File | Change |
|---|---|
| `src/App.tsx` | Add all new routes |
| `src/components/layout/Sidebar.tsx` | Add Securities, Orders, Portfolio links to both ClientNav and EmployeeNav; Admin Orders + Tax to EmployeeNav |
| `package.json` | Add `recharts` dependency |

---

## Chunk 1: Types, Fixtures, and Dependencies

### Task 1: Install Recharts

- [ ] **Step 1: Install recharts**

Run: `npm install recharts`

- [ ] **Step 2: Verify installation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts dependency for price charts"
```

---

### Task 2: Security Types

**Files:**
- Create: `src/types/security.ts`

- [ ] **Step 1: Create security types**

```typescript
// src/types/security.ts

export interface Stock {
  id: number
  ticker: string
  name: string
  outstanding_shares: number
  dividend_yield: number
  exchange_acronym: string
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  market_cap: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface FuturesContract {
  id: number
  ticker: string
  name: string
  contract_size: number
  contract_unit: string
  settlement_date: string
  exchange_acronym: string
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface ForexPair {
  id: number
  ticker: string
  name: string
  base_currency: string
  quote_currency: string
  exchange_rate: string
  liquidity: 'high' | 'medium' | 'low'
  price: string
  ask: string
  bid: string
  change: string
  volume: number
  last_refresh: string
  maintenance_margin: string
  initial_margin_cost: string
}

export interface Option {
  id: number
  ticker: string
  name: string
  stock_listing_id: number
  option_type: 'call' | 'put'
  strike_price: string
  implied_volatility: string
  premium: string
  open_interest: number
  settlement_date: string
  price: string
  ask: string
  bid: string
  volume: number
}

export interface PriceHistoryEntry {
  date: string
  price: string
  high: string
  low: string
  change: string
  volume: number
}

export interface PriceHistoryResponse {
  history: PriceHistoryEntry[]
  total_count: number
}

export type SecurityType = 'stock' | 'futures' | 'forex'
export type PriceHistoryPeriod = 'day' | 'week' | 'month' | 'year' | '5y' | 'all'
export type SortOrder = 'asc' | 'desc'

export interface StockListResponse {
  stocks: Stock[]
  total_count: number
}

export interface FuturesListResponse {
  futures: FuturesContract[]
  total_count: number
}

export interface ForexListResponse {
  forex_pairs: ForexPair[]
  total_count: number
}

export interface OptionsListResponse {
  options: Option[]
  total_count: number
}

export interface StockFilters {
  page?: number
  page_size?: number
  search?: string
  exchange_acronym?: string
  min_price?: string
  max_price?: string
  min_volume?: number
  max_volume?: number
  sort_by?: 'price' | 'volume' | 'change' | 'margin'
  sort_order?: SortOrder
}

export interface FuturesFilters {
  page?: number
  page_size?: number
  search?: string
  exchange_acronym?: string
  min_price?: string
  max_price?: string
  settlement_date_from?: string
  settlement_date_to?: string
  sort_by?: string
  sort_order?: SortOrder
}

export interface ForexFilters {
  page?: number
  page_size?: number
  search?: string
  base_currency?: string
  quote_currency?: string
  liquidity?: 'high' | 'medium' | 'low'
  sort_by?: string
  sort_order?: SortOrder
}

export interface OptionsFilters {
  stock_id: number
  page?: number
  page_size?: number
  option_type?: 'call' | 'put'
  settlement_date?: string
  min_strike?: string
  max_strike?: string
}

export interface PriceHistoryFilters {
  period?: PriceHistoryPeriod
  page?: number
  page_size?: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/types/security.ts
git commit -m "feat: add security types (Stock, Futures, Forex, Option, filters)"
```

---

### Task 3: Order, Portfolio, Tax Types

**Files:**
- Create: `src/types/order.ts`
- Create: `src/types/portfolio.ts`
- Create: `src/types/tax.ts`

- [ ] **Step 1: Create order types**

```typescript
// src/types/order.ts

export type OrderDirection = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type OrderStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'filled' | 'partial'

export interface Order {
  id: number
  listing_id: number
  holding_id: number | null
  direction: OrderDirection
  order_type: OrderType
  status: OrderStatus
  quantity: number
  limit_value: string | null
  stop_value: string | null
  all_or_none: boolean
  margin: boolean
  account_id: number
  ticker: string
  security_name: string
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  listing_id?: number
  holding_id?: number
  direction: OrderDirection
  order_type: OrderType
  quantity: number
  limit_value?: string
  stop_value?: string
  all_or_none?: boolean
  margin?: boolean
  account_id?: number
}

export interface OrderListResponse {
  orders: Order[]
  total_count: number
}

export interface MyOrderFilters {
  page?: number
  page_size?: number
  status?: OrderStatus
  direction?: OrderDirection
  order_type?: OrderType
}

export interface AdminOrderFilters extends MyOrderFilters {
  agent_email?: string
}
```

- [ ] **Step 2: Create portfolio types**

```typescript
// src/types/portfolio.ts

export interface Holding {
  id: number
  security_type: 'stock' | 'futures' | 'option'
  ticker: string
  security_name: string
  quantity: number
  average_price: string
  current_price: string
  total_value: string
  profit_loss: string
  profit_loss_percent: string
  is_public: boolean
  public_quantity: number
}

export interface PortfolioSummary {
  total_value: string
  total_cost: string
  total_profit_loss: string
  total_profit_loss_percent: string
  holdings_count: number
}

export interface HoldingListResponse {
  holdings: Holding[]
  total_count: number
}

export interface PortfolioFilters {
  page?: number
  page_size?: number
  security_type?: 'stock' | 'futures' | 'option'
}

export interface MakePublicPayload {
  quantity: number
}
```

- [ ] **Step 3: Create tax types**

```typescript
// src/types/tax.ts

export interface TaxRecord {
  id: number
  user_type: 'client' | 'actuary'
  user_name: string
  user_email: string
  taxable_amount: string
  tax_amount: string
  status: string
  created_at: string
}

export interface TaxListResponse {
  tax_records: TaxRecord[]
  total_count: number
}

export interface TaxFilters {
  page?: number
  page_size?: number
  user_type?: 'client' | 'actuary'
  search?: string
}

export interface CollectTaxResponse {
  collected_count: number
  total_collected_rsd: string
  failed_count: number
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/types/order.ts src/types/portfolio.ts src/types/tax.ts
git commit -m "feat: add Order, Portfolio, and Tax types"
```

---

### Task 4: Test Fixtures

**Files:**
- Create: `src/__tests__/fixtures/security-fixtures.ts`
- Create: `src/__tests__/fixtures/order-fixtures.ts`
- Create: `src/__tests__/fixtures/portfolio-fixtures.ts`
- Create: `src/__tests__/fixtures/tax-fixtures.ts`

- [ ] **Step 1: Create security fixtures**

```typescript
// src/__tests__/fixtures/security-fixtures.ts
import type { Stock, FuturesContract, ForexPair, Option, PriceHistoryEntry } from '@/types/security'

export function createMockStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: 1, ticker: 'AAPL', name: 'Apple Inc.',
    outstanding_shares: 15000000000, dividend_yield: 0.006,
    exchange_acronym: 'NYSE', price: '178.50', ask: '178.60', bid: '178.40',
    change: '2.30', volume: 52000000, last_refresh: '2026-04-01T15:30:00Z',
    market_cap: '2677500000000', maintenance_margin: '89.25',
    initial_margin_cost: '98.18', ...overrides,
  }
}

export function createMockFutures(overrides: Partial<FuturesContract> = {}): FuturesContract {
  return {
    id: 1, ticker: 'CLJ26', name: 'Crude Oil Futures',
    contract_size: 1000, contract_unit: 'Barrel',
    settlement_date: '2026-04-15', exchange_acronym: 'NYMEX',
    price: '72.50', ask: '72.60', bid: '72.40',
    change: '-0.80', volume: 350000, last_refresh: '2026-04-01T15:30:00Z',
    maintenance_margin: '7250.00', initial_margin_cost: '7975.00', ...overrides,
  }
}

export function createMockForex(overrides: Partial<ForexPair> = {}): ForexPair {
  return {
    id: 1, ticker: 'EUR/USD', name: 'Euro to US Dollar',
    base_currency: 'EUR', quote_currency: 'USD',
    exchange_rate: '1.0850', liquidity: 'high',
    price: '1.0850', ask: '1.0852', bid: '1.0848',
    change: '0.0012', volume: 1500000, last_refresh: '2026-04-01T15:30:00Z',
    maintenance_margin: '108.50', initial_margin_cost: '119.35', ...overrides,
  }
}

export function createMockOption(overrides: Partial<Option> = {}): Option {
  return {
    id: 1, ticker: 'AAPL260417C00180000', name: 'Apple Call Option',
    stock_listing_id: 1, option_type: 'call', strike_price: '180.00',
    implied_volatility: '0.25', premium: '5.50', open_interest: 1200,
    settlement_date: '2026-04-17', price: '5.50', ask: '5.60', bid: '5.40',
    volume: 3500, ...overrides,
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
```

- [ ] **Step 2: Create order fixtures**

```typescript
// src/__tests__/fixtures/order-fixtures.ts
import type { Order } from '@/types/order'

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1, listing_id: 42, holding_id: null, direction: 'buy',
    order_type: 'market', status: 'pending', quantity: 10,
    limit_value: null, stop_value: null, all_or_none: false,
    margin: false, account_id: 1, ticker: 'AAPL', security_name: 'Apple Inc.',
    created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z',
    ...overrides,
  }
}
```

- [ ] **Step 3: Create portfolio fixtures**

```typescript
// src/__tests__/fixtures/portfolio-fixtures.ts
import type { Holding, PortfolioSummary } from '@/types/portfolio'

export function createMockHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 1, security_type: 'stock', ticker: 'AAPL', security_name: 'Apple Inc.',
    quantity: 10, average_price: '170.00', current_price: '178.50',
    total_value: '1785.00', profit_loss: '85.00', profit_loss_percent: '5.00',
    is_public: false, public_quantity: 0, ...overrides,
  }
}

export function createMockPortfolioSummary(overrides: Partial<PortfolioSummary> = {}): PortfolioSummary {
  return {
    total_value: '25000.00', total_cost: '22000.00',
    total_profit_loss: '3000.00', total_profit_loss_percent: '13.64',
    holdings_count: 5, ...overrides,
  }
}
```

- [ ] **Step 4: Create tax fixtures**

```typescript
// src/__tests__/fixtures/tax-fixtures.ts
import type { TaxRecord } from '@/types/tax'

export function createMockTaxRecord(overrides: Partial<TaxRecord> = {}): TaxRecord {
  return {
    id: 1, user_type: 'client', user_name: 'John Doe',
    user_email: 'john@test.com', taxable_amount: '5000.00',
    tax_amount: '750.00', status: 'pending',
    created_at: '2026-04-01T10:00:00Z', ...overrides,
  }
}
```

- [ ] **Step 5: Verify and commit**

Run: `npx tsc --noEmit`

```bash
git add src/__tests__/fixtures/security-fixtures.ts src/__tests__/fixtures/order-fixtures.ts src/__tests__/fixtures/portfolio-fixtures.ts src/__tests__/fixtures/tax-fixtures.ts
git commit -m "test: add security, order, portfolio, and tax mock fixtures"
```

---

## Chunk 2: API Layer

### Task 5: Securities API

**Files:**
- Create: `src/lib/api/securities.test.ts`
- Create: `src/lib/api/securities.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/api/securities.test.ts
import { apiClient } from '@/lib/api/axios'
import {
  getStocks, getStock, getStockHistory,
  getFutures, getFuture, getFutureHistory,
  getForexPairs, getForexPair, getForexHistory,
  getOptions, getOption,
} from '@/lib/api/securities'
import { createMockStock, createMockFutures, createMockForex, createMockOption, createMockPriceHistory } from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
beforeEach(() => jest.clearAllMocks())

describe('stocks', () => {
  it('getStocks fetches with filters', async () => {
    const response = { stocks: [createMockStock()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStocks({ search: 'AAPL', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks', { params: { search: 'AAPL', page: 1, page_size: 10 } })
    expect(result).toEqual(response)
  })

  it('getStock fetches by ID', async () => {
    const stock = createMockStock()
    mockGet.mockResolvedValue({ data: stock })
    const result = await getStock(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks/1')
    expect(result).toEqual(stock)
  })

  it('getStockHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStockHistory(1, { period: 'month' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks/1/history', { params: { period: 'month' } })
    expect(result).toEqual(response)
  })
})

describe('futures', () => {
  it('getFutures fetches with filters', async () => {
    const response = { futures: [createMockFutures()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getFutures({ search: 'CL' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures', { params: { search: 'CL' } })
    expect(result).toEqual(response)
  })

  it('getFuture fetches by ID', async () => {
    const futures = createMockFutures()
    mockGet.mockResolvedValue({ data: futures })
    const result = await getFuture(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures/1')
    expect(result).toEqual(futures)
  })

  it('getFutureHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getFutureHistory(1, { period: 'week' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures/1/history', { params: { period: 'week' } })
    expect(result).toEqual(response)
  })
})

describe('forex', () => {
  it('getForexPairs fetches with filters', async () => {
    const response = { forex_pairs: [createMockForex()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getForexPairs({ base_currency: 'EUR' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex', { params: { base_currency: 'EUR' } })
    expect(result).toEqual(response)
  })

  it('getForexPair fetches by ID', async () => {
    const forex = createMockForex()
    mockGet.mockResolvedValue({ data: forex })
    const result = await getForexPair(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex/1')
    expect(result).toEqual(forex)
  })

  it('getForexHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getForexHistory(1, { period: 'year' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex/1/history', { params: { period: 'year' } })
    expect(result).toEqual(response)
  })
})

describe('options', () => {
  it('getOptions fetches for a stock', async () => {
    const response = { options: [createMockOption()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getOptions({ stock_id: 1 })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/options', { params: { stock_id: 1 } })
    expect(result).toEqual(response)
  })

  it('getOption fetches by ID', async () => {
    const option = createMockOption()
    mockGet.mockResolvedValue({ data: option })
    const result = await getOption(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/options/1')
    expect(result).toEqual(option)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- --testPathPattern=securities.test.ts --no-coverage`

- [ ] **Step 3: Implement securities API**

```typescript
// src/lib/api/securities.ts
import { apiClient } from '@/lib/api/axios'
import type {
  Stock, StockListResponse, StockFilters,
  FuturesContract, FuturesListResponse, FuturesFilters,
  ForexPair, ForexListResponse, ForexFilters,
  Option, OptionsListResponse, OptionsFilters,
  PriceHistoryResponse, PriceHistoryFilters,
} from '@/types/security'

export async function getStocks(filters: StockFilters = {}): Promise<StockListResponse> {
  const { data } = await apiClient.get<StockListResponse>('/api/securities/stocks', { params: filters })
  return data
}

export async function getStock(id: number): Promise<Stock> {
  const { data } = await apiClient.get<Stock>(`/api/securities/stocks/${id}`)
  return data
}

export async function getStockHistory(id: number, filters: PriceHistoryFilters = {}): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(`/api/securities/stocks/${id}/history`, { params: filters })
  return data
}

export async function getFutures(filters: FuturesFilters = {}): Promise<FuturesListResponse> {
  const { data } = await apiClient.get<FuturesListResponse>('/api/securities/futures', { params: filters })
  return data
}

export async function getFuture(id: number): Promise<FuturesContract> {
  const { data } = await apiClient.get<FuturesContract>(`/api/securities/futures/${id}`)
  return data
}

export async function getFutureHistory(id: number, filters: PriceHistoryFilters = {}): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(`/api/securities/futures/${id}/history`, { params: filters })
  return data
}

export async function getForexPairs(filters: ForexFilters = {}): Promise<ForexListResponse> {
  const { data } = await apiClient.get<ForexListResponse>('/api/securities/forex', { params: filters })
  return data
}

export async function getForexPair(id: number): Promise<ForexPair> {
  const { data } = await apiClient.get<ForexPair>(`/api/securities/forex/${id}`)
  return data
}

export async function getForexHistory(id: number, filters: PriceHistoryFilters = {}): Promise<PriceHistoryResponse> {
  const { data } = await apiClient.get<PriceHistoryResponse>(`/api/securities/forex/${id}/history`, { params: filters })
  return data
}

export async function getOptions(filters: OptionsFilters): Promise<OptionsListResponse> {
  const { data } = await apiClient.get<OptionsListResponse>('/api/securities/options', { params: filters })
  return data
}

export async function getOption(id: number): Promise<Option> {
  const { data } = await apiClient.get<Option>(`/api/securities/options/${id}`)
  return data
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- --testPathPattern=securities.test.ts --no-coverage`

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/securities.ts src/lib/api/securities.test.ts
git commit -m "feat: add securities API functions with tests"
```

---

### Task 6: Orders API

**Files:**
- Create: `src/lib/api/orders.test.ts`
- Create: `src/lib/api/orders.ts`

Follow same TDD pattern as Task 5. API functions:

```typescript
// src/lib/api/orders.ts
import { apiClient } from '@/lib/api/axios'
import type { Order, OrderListResponse, CreateOrderPayload, MyOrderFilters, AdminOrderFilters } from '@/types/order'

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>('/api/me/orders', payload)
  return data
}

export async function getMyOrders(filters: MyOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/api/me/orders', { params: filters })
  return data
}

export async function getMyOrder(id: number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/api/me/orders/${id}`)
  return data
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/me/orders/${id}/cancel`)
  return data
}

export async function getAllOrders(filters: AdminOrderFilters = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/api/orders', { params: filters })
  return data
}

export async function approveOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/orders/${id}/approve`)
  return data
}

export async function declineOrder(id: number): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/orders/${id}/decline`)
  return data
}
```

Tests follow the exact same pattern as `securities.test.ts` — mock `apiClient`, verify endpoints + params.

- [ ] **Step 1: Write failing tests** (follow Task 5 pattern for each function)
- [ ] **Step 2: Run tests — expect FAIL**
- [ ] **Step 3: Implement** (code above)
- [ ] **Step 4: Run tests — expect PASS**
- [ ] **Step 5: Commit**

```bash
git add src/lib/api/orders.ts src/lib/api/orders.test.ts
git commit -m "feat: add orders API functions with tests"
```

---

### Task 7: Portfolio API

**Files:**
- Create: `src/lib/api/portfolio.test.ts`
- Create: `src/lib/api/portfolio.ts`

```typescript
// src/lib/api/portfolio.ts
import { apiClient } from '@/lib/api/axios'
import type { HoldingListResponse, PortfolioSummary, PortfolioFilters, Holding, MakePublicPayload } from '@/types/portfolio'

export async function getPortfolio(filters: PortfolioFilters = {}): Promise<HoldingListResponse> {
  const { data } = await apiClient.get<HoldingListResponse>('/api/me/portfolio', { params: filters })
  return data
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>('/api/me/portfolio/summary')
  return data
}

export async function makeHoldingPublic(id: number, payload: MakePublicPayload): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/me/portfolio/${id}/make-public`, payload)
  return data
}

export async function exerciseOption(id: number): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/me/portfolio/${id}/exercise`)
  return data
}
```

- [ ] **Step 1-5: TDD cycle** (same pattern as Task 5/6)

```bash
git commit -m "feat: add portfolio API functions with tests"
```

---

### Task 8: Tax API

**Files:**
- Create: `src/lib/api/tax.test.ts`
- Create: `src/lib/api/tax.ts`

```typescript
// src/lib/api/tax.ts
import { apiClient } from '@/lib/api/axios'
import type { TaxListResponse, TaxFilters, CollectTaxResponse } from '@/types/tax'

export async function getTaxRecords(filters: TaxFilters = {}): Promise<TaxListResponse> {
  const { data } = await apiClient.get<TaxListResponse>('/api/tax', { params: filters })
  return data
}

export async function collectTaxes(): Promise<CollectTaxResponse> {
  const { data } = await apiClient.post<CollectTaxResponse>('/api/tax/collect')
  return data
}
```

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add tax API functions with tests"
```

---

## Chunk 3: React Query Hooks

### Task 9: Securities Hooks

**Files:**
- Create: `src/hooks/useSecurities.test.ts`
- Create: `src/hooks/useSecurities.ts`

```typescript
// src/hooks/useSecurities.ts
import { useQuery } from '@tanstack/react-query'
import {
  getStocks, getStock, getStockHistory,
  getFutures, getFuture, getFutureHistory,
  getForexPairs, getForexPair, getForexHistory,
  getOptions,
} from '@/lib/api/securities'
import type { StockFilters, FuturesFilters, ForexFilters, OptionsFilters, PriceHistoryFilters } from '@/types/security'

export function useStocks(filters: StockFilters = {}) {
  return useQuery({ queryKey: ['stocks', filters], queryFn: () => getStocks(filters) })
}

export function useStock(id: number) {
  return useQuery({ queryKey: ['stock', id], queryFn: () => getStock(id), enabled: id > 0 })
}

export function useStockHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({ queryKey: ['stock-history', id, filters], queryFn: () => getStockHistory(id, filters), enabled: id > 0 })
}

export function useFutures(filters: FuturesFilters = {}) {
  return useQuery({ queryKey: ['futures', filters], queryFn: () => getFutures(filters) })
}

export function useFuture(id: number) {
  return useQuery({ queryKey: ['future', id], queryFn: () => getFuture(id), enabled: id > 0 })
}

export function useFutureHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({ queryKey: ['future-history', id, filters], queryFn: () => getFutureHistory(id, filters), enabled: id > 0 })
}

export function useForexPairs(filters: ForexFilters = {}) {
  return useQuery({ queryKey: ['forex', filters], queryFn: () => getForexPairs(filters) })
}

export function useForexPair(id: number) {
  return useQuery({ queryKey: ['forex-pair', id], queryFn: () => getForexPair(id), enabled: id > 0 })
}

export function useForexHistory(id: number, filters: PriceHistoryFilters = {}) {
  return useQuery({ queryKey: ['forex-history', id, filters], queryFn: () => getForexHistory(id, filters), enabled: id > 0 })
}

export function useOptions(filters: OptionsFilters) {
  return useQuery({ queryKey: ['options', filters], queryFn: () => getOptions(filters), enabled: filters.stock_id > 0 })
}
```

Tests follow the same pattern as `useEmployees.test.ts` — renderHook + createQueryWrapper + mock API.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add securities React Query hooks with tests"
```

---

### Task 10: Orders Hooks

**Files:**
- Create: `src/hooks/useOrders.test.ts`
- Create: `src/hooks/useOrders.ts`

```typescript
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, getMyOrders, cancelOrder, getAllOrders, approveOrder, declineOrder } from '@/lib/api/orders'
import type { MyOrderFilters, AdminOrderFilters, CreateOrderPayload } from '@/types/order'

export function useMyOrders(filters: MyOrderFilters = {}) {
  return useQuery({ queryKey: ['my-orders', filters], queryFn: () => getMyOrders(filters) })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-orders'] }); qc.invalidateQueries({ queryKey: ['portfolio'] }) },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-orders'] }),
  })
}

export function useAllOrders(filters: AdminOrderFilters = {}) {
  return useQuery({ queryKey: ['all-orders', filters], queryFn: () => getAllOrders(filters) })
}

export function useApproveOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-orders'] }),
  })
}

export function useDeclineOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => declineOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-orders'] }),
  })
}
```

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add orders React Query hooks with tests"
```

---

### Task 11: Portfolio + Tax Hooks

**Files:**
- Create: `src/hooks/usePortfolio.ts` + `.test.ts`
- Create: `src/hooks/useTax.ts` + `.test.ts`

```typescript
// src/hooks/usePortfolio.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortfolio, getPortfolioSummary, makeHoldingPublic, exerciseOption } from '@/lib/api/portfolio'
import type { PortfolioFilters, MakePublicPayload } from '@/types/portfolio'

export function usePortfolio(filters: PortfolioFilters = {}) {
  return useQuery({ queryKey: ['portfolio', filters], queryFn: () => getPortfolio(filters) })
}

export function usePortfolioSummary() {
  return useQuery({ queryKey: ['portfolio', 'summary'], queryFn: () => getPortfolioSummary() })
}

export function useMakePublic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MakePublicPayload }) => makeHoldingPublic(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}

export function useExerciseOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exerciseOption(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}
```

```typescript
// src/hooks/useTax.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTaxRecords, collectTaxes } from '@/lib/api/tax'
import type { TaxFilters } from '@/types/tax'

export function useTaxRecords(filters: TaxFilters = {}) {
  return useQuery({ queryKey: ['tax', filters], queryFn: () => getTaxRecords(filters) })
}

export function useCollectTaxes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => collectTaxes(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tax'] }),
  })
}
```

- [ ] **Step 1-5: TDD cycle for each**

```bash
git commit -m "feat: add portfolio and tax React Query hooks with tests"
```

---

## Chunk 4: Securities Components

### Task 12: StockTable Component

**Files:**
- Create: `src/components/securities/StockTable.tsx` + `.test.tsx`

Table columns: Ticker, Name, Price, Change, Volume, Exchange, Initial Margin Cost, Actions (Buy button).

```tsx
// src/components/securities/StockTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Stock } from '@/types/security'

interface StockTableProps {
  stocks: Stock[]
  onRowClick: (id: number) => void
  onBuy: (stock: Stock) => void
}

export function StockTable({ stocks, onRowClick, onBuy }: StockTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Margin Cost</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.id} className="cursor-pointer" onClick={() => onRowClick(stock.id)}>
            <TableCell className="font-mono font-semibold">{stock.ticker}</TableCell>
            <TableCell>{stock.name}</TableCell>
            <TableCell>{stock.price}</TableCell>
            <TableCell className={Number(stock.change) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Number(stock.change) >= 0 ? '+' : ''}{stock.change}
            </TableCell>
            <TableCell>{stock.volume.toLocaleString()}</TableCell>
            <TableCell>{stock.exchange_acronym}</TableCell>
            <TableCell>{stock.initial_margin_cost}</TableCell>
            <TableCell>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onBuy(stock) }}>Buy</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add StockTable component with tests"
```

---

### Task 13: FuturesTable + ForexTable Components

Same pattern as StockTable. FuturesTable adds Settlement Date column. ForexTable shows Base/Quote Currency, Exchange Rate, Liquidity instead of exchange-specific fields.

- [ ] **Step 1-5: TDD for FuturesTable**
- [ ] **Step 6-10: TDD for ForexTable**

```bash
git commit -m "feat: add FuturesTable and ForexTable components with tests"
```

---

### Task 14: PriceChart Component

**Files:**
- Create: `src/components/securities/PriceChart.tsx` + `.test.tsx`

Uses Recharts `LineChart` with period selector buttons (Day, Week, Month, Year, 5Y, All).

```tsx
// src/components/securities/PriceChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import type { PriceHistoryEntry, PriceHistoryPeriod } from '@/types/security'

interface PriceChartProps {
  data: PriceHistoryEntry[]
  selectedPeriod: PriceHistoryPeriod
  onPeriodChange: (period: PriceHistoryPeriod) => void
  isLoading?: boolean
}

const PERIODS: { label: string; value: PriceHistoryPeriod }[] = [
  { label: '1D', value: 'day' },
  { label: '1W', value: 'week' },
  { label: '1M', value: 'month' },
  { label: '1Y', value: 'year' },
  { label: '5Y', value: '5y' },
  { label: 'All', value: 'all' },
]

export function PriceChart({ data, selectedPeriod, onPeriodChange, isLoading }: PriceChartProps) {
  const chartData = data.map((entry) => ({
    date: entry.date,
    price: Number(entry.price),
    high: Number(entry.high),
    low: Number(entry.low),
  }))

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={selectedPeriod === p.value ? 'default' : 'outline'}
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading chart...</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
```

Tests: verify period buttons render, period change callback fires, loading state, chart renders when data present.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add PriceChart component with Recharts"
```

---

### Task 15: SecurityInfoPanel Component

Key-value detail panel for any security type. Accepts generic `entries: { label: string; value: string }[]`.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add SecurityInfoPanel component with tests"
```

---

### Task 16: OptionsChain Component

**Files:**
- Create: `src/components/securities/OptionsChain.tsx` + `.test.tsx`

Complex table with CALLS | Strike | PUTS layout. ITM fields green, OTM fields red/white. Strike count filter.

```tsx
// src/components/securities/OptionsChain.tsx
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Option } from '@/types/security'

interface OptionsChainProps {
  calls: Option[]
  puts: Option[]
  sharedPrice: number
  settlementDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function OptionsChain({ calls, puts, sharedPrice, settlementDates, selectedDate, onDateChange }: OptionsChainProps) {
  const [strikeCount, setStrikeCount] = useState(5)

  // Group by strike price, pair calls and puts
  const strikeMap = new Map<string, { call?: Option; put?: Option }>()
  calls.forEach((c) => {
    const entry = strikeMap.get(c.strike_price) || {}
    entry.call = c
    strikeMap.set(c.strike_price, entry)
  })
  puts.forEach((p) => {
    const entry = strikeMap.get(p.strike_price) || {}
    entry.put = p
    strikeMap.set(p.strike_price, entry)
  })

  const sortedStrikes = [...strikeMap.keys()].map(Number).sort((a, b) => a - b)
  const sharedIdx = sortedStrikes.findIndex((s) => s >= sharedPrice)
  const start = Math.max(0, sharedIdx - strikeCount)
  const end = Math.min(sortedStrikes.length, sharedIdx + strikeCount + 1)
  const visibleStrikes = sortedStrikes.slice(start, end)

  const isCallITM = (strike: number) => strike < sharedPrice
  const isPutITM = (strike: number) => strike > sharedPrice

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <Label>Settlement Date</Label>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          >
            {settlementDates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="strike-count">Strikes shown</Label>
          <Input
            id="strike-count"
            type="number"
            min={1}
            value={strikeCount}
            onChange={(e) => setStrikeCount(Number(e.target.value) || 1)}
            className="w-20 ml-2 inline-block"
          />
        </div>
        <p className="text-sm font-semibold">Market Price: ${sharedPrice.toFixed(2)}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={6} className="text-center border-r">CALLS</TableHead>
            <TableHead className="text-center">Strike</TableHead>
            <TableHead colSpan={6} className="text-center border-l">PUTS</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Last</TableHead><TableHead>Bid</TableHead><TableHead>Ask</TableHead>
            <TableHead>Vol</TableHead><TableHead>OI</TableHead><TableHead className="border-r">Premium</TableHead>
            <TableHead className="text-center font-bold">Price</TableHead>
            <TableHead className="border-l">Last</TableHead><TableHead>Bid</TableHead><TableHead>Ask</TableHead>
            <TableHead>Vol</TableHead><TableHead>OI</TableHead><TableHead>Premium</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStrikes.map((strike) => {
            const pair = strikeMap.get(String(strike)) || strikeMap.get(strike.toFixed(2))
            const call = pair?.call
            const put = pair?.put
            const callBg = isCallITM(strike) ? 'bg-green-50 dark:bg-green-950' : ''
            const putBg = isPutITM(strike) ? 'bg-green-50 dark:bg-green-950' : ''

            return (
              <TableRow key={strike}>
                <TableCell className={callBg}>{call?.price ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.bid ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.ask ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.volume ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.open_interest ?? '—'}</TableCell>
                <TableCell className={`${callBg} border-r`}>{call?.premium ?? '—'}</TableCell>
                <TableCell className="text-center font-bold">${strike.toFixed(2)}</TableCell>
                <TableCell className={`${putBg} border-l`}>{put?.price ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.bid ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.ask ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.volume ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.open_interest ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.premium ?? '—'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
```

Tests: renders headers (CALLS/PUTS/Strike), renders strike rows, ITM calls colored green, strike count filter works, settlement date select.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add OptionsChain component with ITM/OTM coloring"
```

---

## Chunk 5: Securities Pages

### Task 17: SecuritiesPage (Tabbed)

**Files:**
- Create: `src/pages/SecuritiesPage.tsx` + `.test.tsx`

Main securities portal with tabs: Stocks, Futures, Forex. Each tab has its own FilterBar + table + pagination. Clients see only Stocks + Futures tabs; actuaries see all.

```tsx
// src/pages/SecuritiesPage.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterBar } from '@/components/ui/FilterBar'
import { StockTable } from '@/components/securities/StockTable'
import { FuturesTable } from '@/components/securities/FuturesTable'
import { ForexTable } from '@/components/securities/ForexTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStocks } from '@/hooks/useSecurities'
import { useFutures } from '@/hooks/useSecurities'
import { useForexPairs } from '@/hooks/useSecurities'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import type { Stock, FuturesContract } from '@/types/security'

const PAGE_SIZE = 10

const STOCK_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'exchange_acronym', label: 'Exchange', type: 'text' },
  { key: 'min_price', label: 'Min Price', type: 'number' },
  { key: 'max_price', label: 'Max Price', type: 'number' },
]

const FUTURES_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'exchange_acronym', label: 'Exchange', type: 'text' },
  { key: 'min_price', label: 'Min Price', type: 'number' },
  { key: 'max_price', label: 'Max Price', type: 'number' },
  { key: 'settlement_date_from', label: 'Settle From', type: 'date' },
  { key: 'settlement_date_to', label: 'Settle To', type: 'date' },
]

const FOREX_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'base_currency', label: 'Base Currency', type: 'text' },
  { key: 'quote_currency', label: 'Quote Currency', type: 'text' },
]

export function SecuritiesPage() {
  const navigate = useNavigate()
  const userType = useAppSelector(selectUserType)
  const isClient = userType === 'client'

  // Stocks state
  const [stockFilters, setStockFilters] = useState<FilterValues>({})
  const [stockPage, setStockPage] = useState(1)
  const stockApiFilters = { page: stockPage, page_size: PAGE_SIZE, search: (stockFilters.search as string) || undefined, exchange_acronym: (stockFilters.exchange_acronym as string) || undefined, min_price: (stockFilters.min_price as string) || undefined, max_price: (stockFilters.max_price as string) || undefined }
  const { data: stockData, isLoading: stockLoading } = useStocks(stockApiFilters)

  // Futures state
  const [futuresFilters, setFuturesFilters] = useState<FilterValues>({})
  const [futuresPage, setFuturesPage] = useState(1)
  const futuresApiFilters = { page: futuresPage, page_size: PAGE_SIZE, search: (futuresFilters.search as string) || undefined, exchange_acronym: (futuresFilters.exchange_acronym as string) || undefined, min_price: (futuresFilters.min_price as string) || undefined, max_price: (futuresFilters.max_price as string) || undefined, settlement_date_from: (futuresFilters.settlement_date_from as string) || undefined, settlement_date_to: (futuresFilters.settlement_date_to as string) || undefined }
  const { data: futuresData, isLoading: futuresLoading } = useFutures(futuresApiFilters)

  // Forex state (only for non-clients)
  const [forexFilters, setForexFilters] = useState<FilterValues>({})
  const [forexPage, setForexPage] = useState(1)
  const forexApiFilters = { page: forexPage, page_size: PAGE_SIZE, search: (forexFilters.search as string) || undefined, base_currency: (forexFilters.base_currency as string) || undefined, quote_currency: (forexFilters.quote_currency as string) || undefined }
  const { data: forexData, isLoading: forexLoading } = useForexPairs(forexApiFilters)

  const handleBuyStock = useCallback((stock: Stock) => {
    navigate(`/securities/order/new?listingId=${stock.id}&direction=buy`)
  }, [navigate])

  const handleBuyFutures = useCallback((futures: FuturesContract) => {
    navigate(`/securities/order/new?listingId=${futures.id}&direction=buy`)
  }, [navigate])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Securities</h1>
      <Tabs defaultValue="stocks">
        <TabsList className="mb-4">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
          {!isClient && <TabsTrigger value="forex">Forex</TabsTrigger>}
        </TabsList>

        <TabsContent value="stocks">
          <FilterBar fields={STOCK_FILTER_FIELDS} values={stockFilters} onChange={(v) => { setStockFilters(v); setStockPage(1) }} />
          {stockLoading ? <LoadingSpinner /> : stockData?.stocks.length ? (
            <>
              <StockTable stocks={stockData.stocks} onRowClick={(id) => navigate(`/securities/stocks/${id}`)} onBuy={handleBuyStock} />
              <p className="text-sm text-muted-foreground mt-2">{stockData.total_count} stocks</p>
              <PaginationControls page={stockPage} totalPages={Math.max(1, Math.ceil((stockData.total_count ?? 0) / PAGE_SIZE))} onPageChange={setStockPage} />
            </>
          ) : <p>No stocks found.</p>}
        </TabsContent>

        <TabsContent value="futures">
          <FilterBar fields={FUTURES_FILTER_FIELDS} values={futuresFilters} onChange={(v) => { setFuturesFilters(v); setFuturesPage(1) }} />
          {futuresLoading ? <LoadingSpinner /> : futuresData?.futures.length ? (
            <>
              <FuturesTable futures={futuresData.futures} onRowClick={(id) => navigate(`/securities/futures/${id}`)} onBuy={handleBuyFutures} />
              <p className="text-sm text-muted-foreground mt-2">{futuresData.total_count} futures</p>
              <PaginationControls page={futuresPage} totalPages={Math.max(1, Math.ceil((futuresData.total_count ?? 0) / PAGE_SIZE))} onPageChange={setFuturesPage} />
            </>
          ) : <p>No futures found.</p>}
        </TabsContent>

        {!isClient && (
          <TabsContent value="forex">
            <FilterBar fields={FOREX_FILTER_FIELDS} values={forexFilters} onChange={(v) => { setForexFilters(v); setForexPage(1) }} />
            {forexLoading ? <LoadingSpinner /> : forexData?.forex_pairs.length ? (
              <>
                <ForexTable forexPairs={forexData.forex_pairs} onRowClick={(id) => navigate(`/securities/forex/${id}`)} />
                <p className="text-sm text-muted-foreground mt-2">{forexData.total_count} forex pairs</p>
                <PaginationControls page={forexPage} totalPages={Math.max(1, Math.ceil((forexData.total_count ?? 0) / PAGE_SIZE))} onPageChange={setForexPage} />
              </>
            ) : <p>No forex pairs found.</p>}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
```

Tests: renders tabs, clients see only Stocks+Futures tabs, employees see all 3, stocks table loads, filter works, pagination works, buy navigates.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add SecuritiesPage with tabbed Stocks/Futures/Forex views"
```

---

### Task 18: StockDetailPage

**Files:**
- Create: `src/pages/StockDetailPage.tsx` + `.test.tsx`

Fetches stock by `:id`, displays PriceChart + SecurityInfoPanel + OptionsChain.

```tsx
// src/pages/StockDetailPage.tsx (simplified structure)
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/securities/PriceChart'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'
import { OptionsChain } from '@/components/securities/OptionsChain'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStock, useStockHistory, useOptions } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'

export function StockDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stockId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')
  const [optionDate, setOptionDate] = useState('')

  const { data: stock, isLoading } = useStock(stockId)
  const { data: history, isLoading: historyLoading } = useStockHistory(stockId, { period })
  const { data: optionsData } = useOptions({ stock_id: stockId, settlement_date: optionDate || undefined })

  if (isLoading) return <LoadingSpinner />
  if (!stock) return <p>Stock not found.</p>

  const infoEntries = [
    { label: 'Ticker', value: stock.ticker },
    { label: 'Name', value: stock.name },
    { label: 'Price', value: stock.price },
    { label: 'Change', value: stock.change },
    { label: 'Volume', value: stock.volume.toLocaleString() },
    { label: 'Exchange', value: stock.exchange_acronym },
    { label: 'Market Cap', value: stock.market_cap },
    { label: 'Dividend Yield', value: `${(stock.dividend_yield * 100).toFixed(2)}%` },
    { label: 'Maintenance Margin', value: stock.maintenance_margin },
    { label: 'Initial Margin Cost', value: stock.initial_margin_cost },
  ]

  const calls = optionsData?.options.filter((o) => o.option_type === 'call') ?? []
  const puts = optionsData?.options.filter((o) => o.option_type === 'put') ?? []
  const settlementDates = [...new Set(optionsData?.options.map((o) => o.settlement_date) ?? [])]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{stock.ticker} — {stock.name}</h1>
        <Button onClick={() => navigate(`/securities/order/new?listingId=${stock.id}&direction=buy`)}>Buy</Button>
      </div>

      <PriceChart data={history?.history ?? []} selectedPeriod={period} onPeriodChange={setPeriod} isLoading={historyLoading} />

      <div className="mt-6">
        <SecurityInfoPanel entries={infoEntries} />
      </div>

      {settlementDates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Options Chain</h2>
          <OptionsChain
            calls={calls}
            puts={puts}
            sharedPrice={Number(stock.price)}
            settlementDates={settlementDates}
            selectedDate={optionDate || settlementDates[0]}
            onDateChange={setOptionDate}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add StockDetailPage with chart, info, and options chain"
```

---

### Task 19: FuturesDetailPage + ForexDetailPage

Same structure as StockDetailPage but without OptionsChain section. Each fetches its own security type and history.

- [ ] **Step 1-5: TDD for FuturesDetailPage**
- [ ] **Step 6-10: TDD for ForexDetailPage**

```bash
git commit -m "feat: add FuturesDetailPage and ForexDetailPage with charts"
```

---

## Chunk 6: Orders, Portfolio, Tax Components + Pages

### Task 20: CreateOrderForm + CreateOrderPage

**Files:**
- Create: `src/components/orders/CreateOrderForm.tsx` + `.test.tsx`
- Create: `src/pages/CreateOrderPage.tsx` + `.test.tsx`

Form fields: Direction (buy/sell), Order Type (market/limit/stop/stop_limit), Quantity, Limit Value (conditional), Stop Value (conditional), All or None checkbox, Margin checkbox, Account selector (for buy).

Reads `listingId` and `direction` from URL query params.

- [ ] **Step 1-5: TDD for CreateOrderForm**
- [ ] **Step 6-10: TDD for CreateOrderPage**

```bash
git commit -m "feat: add CreateOrderForm and CreateOrderPage"
```

---

### Task 21: OrderTable + MyOrdersPage

**Files:**
- Create: `src/components/orders/OrderTable.tsx` + `.test.tsx`
- Create: `src/pages/MyOrdersPage.tsx` + `.test.tsx`

OrderTable columns: Ticker, Security, Direction, Type, Quantity, Status, Date, Actions (Cancel for pending).
MyOrdersPage: FilterBar (status, direction, type) + OrderTable + pagination.

- [ ] **Step 1-5: TDD for OrderTable**
- [ ] **Step 6-10: TDD for MyOrdersPage**

```bash
git commit -m "feat: add OrderTable and MyOrdersPage with filters"
```

---

### Task 22: HoldingTable + PortfolioSummaryCard + PortfolioPage

**Files:**
- Create: `src/components/portfolio/HoldingTable.tsx` + `.test.tsx`
- Create: `src/components/portfolio/PortfolioSummaryCard.tsx` + `.test.tsx`
- Create: `src/pages/PortfolioPage.tsx` + `.test.tsx`

HoldingTable columns: Ticker, Name, Type, Qty, Avg Price, Current, P&L, P&L%, Public, Actions.
PortfolioSummaryCard: total value, cost, P&L, holdings count.
PortfolioPage: Summary card + security_type filter + HoldingTable + pagination.

- [ ] **Step 1-5: TDD for HoldingTable**
- [ ] **Step 6-10: TDD for PortfolioSummaryCard**
- [ ] **Step 11-15: TDD for PortfolioPage**

```bash
git commit -m "feat: add Portfolio page with holdings table and summary"
```

---

### Task 23: AdminOrdersPage

**Files:**
- Create: `src/pages/AdminOrdersPage.tsx` + `.test.tsx`

Supervisor view: FilterBar (status, direction, agent_email, type) + OrderTable with Approve/Decline buttons. Protected by `orders.approve` permission.

- [ ] **Step 1-5: TDD cycle**

```bash
git commit -m "feat: add AdminOrdersPage for supervisor order approval"
```

---

### Task 24: TaxTable + TaxPage

**Files:**
- Create: `src/components/tax/TaxTable.tsx` + `.test.tsx`
- Create: `src/pages/TaxPage.tsx` + `.test.tsx`

TaxTable columns: User, Email, Type, Taxable Amount, Tax Amount, Status, Date.
TaxPage: FilterBar (user_type, search) + TaxTable + pagination + "Collect Taxes" button.

- [ ] **Step 1-5: TDD for TaxTable**
- [ ] **Step 6-10: TDD for TaxPage**

```bash
git commit -m "feat: add TaxPage with tax records and collect action"
```

---

## Chunk 7: Routing, Navigation, and Quality Gates

### Task 25: Add Routes to App.tsx

**Files:**
- Modify: `src/App.tsx`

Add imports and routes:

```tsx
// New imports
import { SecuritiesPage } from '@/pages/SecuritiesPage'
import { StockDetailPage } from '@/pages/StockDetailPage'
import { FuturesDetailPage } from '@/pages/FuturesDetailPage'
import { ForexDetailPage } from '@/pages/ForexDetailPage'
import { CreateOrderPage } from '@/pages/CreateOrderPage'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import { TaxPage } from '@/pages/TaxPage'

// Shared routes (any authenticated user)
<Route path="/securities" element={<SecuritiesPage />} />
<Route path="/securities/stocks/:id" element={<StockDetailPage />} />
<Route path="/securities/futures/:id" element={<FuturesDetailPage />} />
<Route path="/securities/forex/:id" element={<ForexDetailPage />} />
<Route path="/securities/order/new" element={<CreateOrderPage />} />
<Route path="/orders" element={<MyOrdersPage />} />
<Route path="/portfolio" element={<PortfolioPage />} />

// Employee-only admin routes
<Route path="/admin/orders" element={
  <ProtectedRoute requiredPermission="orders.approve"><AdminOrdersPage /></ProtectedRoute>
} />
<Route path="/admin/tax" element={
  <ProtectedRoute requiredPermission="tax.manage"><TaxPage /></ProtectedRoute>
} />
```

- [ ] **Step 1: Add routes**
- [ ] **Step 2: Verify build** — `npm run build`
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add routes for securities portal, orders, portfolio, admin"
```

---

### Task 26: Update Sidebar Navigation

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**ClientNav** — add after Loans link:
```tsx
<div className="mt-2">
  <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">Trading</p>
  <Link to="/securities" className={navLinkClass}>Securities</Link>
  <Link to="/orders" className={navLinkClass}>My Orders</Link>
  <Link to="/portfolio" className={navLinkClass}>Portfolio</Link>
</div>
```

**EmployeeNav** — add after Stock Exchanges link (from previous plan):
```tsx
<Link to="/securities" className={navLinkClass}>Securities</Link>
<Link to="/orders" className={navLinkClass}>My Orders</Link>
<Link to="/portfolio" className={navLinkClass}>Portfolio</Link>
<Link to="/admin/orders" className={navLinkClass}>Order Approval</Link>
<Link to="/admin/tax" className={navLinkClass}>Tax</Link>
```

Note: "Order Approval" should be conditionally rendered for users with `orders.approve` permission. "Tax" for `tax.manage`. Follow the same `canManageAgents` prop pattern from the actuaries plan — pass additional boolean props to `EmployeeNav`.

- [ ] **Step 1: Update Sidebar**
- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add Trading section to sidebar navigation"
```

---

### Task 27: Quality Gates

- [ ] **Step 1:** `npm test -- --no-coverage` — all pass
- [ ] **Step 2:** `npm run lint` — no errors
- [ ] **Step 3:** `npx tsc --noEmit` — no errors
- [ ] **Step 4:** `npx prettier --check "src/**/*.{ts,tsx}"` — formatted (fix if needed)
- [ ] **Step 5:** `npm run build` — success

---

### Task 28: Update specification.md

Update all sections: Project Structure, Routes, Pages, Components, State Management, API Layer, Custom Hooks, Types & Interfaces, Test Coverage.

- [ ] **Step 1: Update specification.md**
- [ ] **Step 2: Commit**

```bash
git commit -m "docs: update specification with securities portal, orders, portfolio, tax"
```
