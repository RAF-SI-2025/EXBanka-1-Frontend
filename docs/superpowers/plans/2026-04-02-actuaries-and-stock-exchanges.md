# Actuaries & Stock Exchanges Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Actuary Management page (supervisor portal for managing trading agents) and a Stock Exchanges page (display exchanges with testing-mode toggle) to the employee/admin portal.

**Architecture:** Two new pages follow existing patterns exactly: TanStack Query for server data, FilterBar for filtering, PaginationControls for pagination, Dialog for modals. New types/API/hooks/components/pages mirror the Employee module structure. Routes use ProtectedRoute with `requiredPermission` for access control.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Shadcn UI, Tailwind CSS, Jest + RTL

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/types/actuary.ts` | Actuary interface, list response, filters |
| `src/types/stockExchange.ts` | StockExchange interface, list response, filters |
| `src/__tests__/fixtures/actuary-fixtures.ts` | Mock actuary factory |
| `src/__tests__/fixtures/stockExchange-fixtures.ts` | Mock stock exchange factory |
| `src/lib/api/actuaries.ts` | Actuary API functions |
| `src/lib/api/actuaries.test.ts` | Actuary API tests |
| `src/lib/api/stockExchanges.ts` | Stock Exchange API functions |
| `src/lib/api/stockExchanges.test.ts` | Stock Exchange API tests |
| `src/hooks/useActuaries.ts` | React Query hooks for actuaries |
| `src/hooks/useActuaries.test.ts` | Actuary hooks tests |
| `src/hooks/useStockExchanges.ts` | React Query hooks for stock exchanges |
| `src/hooks/useStockExchanges.test.ts` | Stock exchange hooks tests |
| `src/components/actuaries/ActuaryTable.tsx` | Table displaying actuaries |
| `src/components/actuaries/ActuaryTable.test.tsx` | ActuaryTable tests |
| `src/components/actuaries/EditLimitDialog.tsx` | Dialog for editing agent's limit |
| `src/components/actuaries/EditLimitDialog.test.tsx` | EditLimitDialog tests |
| `src/components/stockExchanges/StockExchangeTable.tsx` | Table displaying exchanges |
| `src/components/stockExchanges/StockExchangeTable.test.tsx` | StockExchangeTable tests |
| `src/pages/ActuaryListPage.tsx` | Actuary management page |
| `src/pages/ActuaryListPage.test.tsx` | ActuaryListPage tests |
| `src/pages/StockExchangesPage.tsx` | Stock exchanges page |
| `src/pages/StockExchangesPage.test.tsx` | StockExchangesPage tests |

### Modified Files

| File | Change |
|---|---|
| `src/App.tsx` | Add routes for `/admin/actuaries` and `/admin/stock-exchanges` |
| `src/components/layout/Sidebar.tsx` | Add "Actuaries" and "Stock Exchanges" links to EmployeeNav |

---

## Chunk 1: Types, Fixtures, and API Layer

### Task 1: Actuary Types

**Files:**
- Create: `src/types/actuary.ts`

- [ ] **Step 1: Create the actuary types file**

```typescript
// src/types/actuary.ts

export interface Actuary {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  active: boolean
  limit: string
  used_limit: string
  need_approval: boolean
}

export interface ActuaryListResponse {
  actuaries: Actuary[]
  total_count: number
}

export interface ActuaryFilters {
  page?: number
  page_size?: number
  search?: string
  position?: string
}

export interface SetLimitPayload {
  limit: string
}

export interface SetApprovalPayload {
  need_approval: boolean
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to actuary types.

- [ ] **Step 3: Commit**

```bash
git add src/types/actuary.ts
git commit -m "feat: add Actuary types"
```

---

### Task 2: Stock Exchange Types

**Files:**
- Create: `src/types/stockExchange.ts`

- [ ] **Step 1: Create the stock exchange types file**

```typescript
// src/types/stockExchange.ts

export interface StockExchange {
  id: number
  exchange_name: string
  exchange_acronym: string
  exchange_mic_code: string
  polity: string
  currency: string
  time_zone: string
}

export interface StockExchangeListResponse {
  exchanges: StockExchange[]
  total_count: number
}

export interface StockExchangeFilters {
  page?: number
  page_size?: number
  search?: string
}

export interface TestingModeResponse {
  testing_mode: boolean
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to stockExchange types.

- [ ] **Step 3: Commit**

```bash
git add src/types/stockExchange.ts
git commit -m "feat: add StockExchange types"
```

---

### Task 3: Test Fixtures

**Files:**
- Create: `src/__tests__/fixtures/actuary-fixtures.ts`
- Create: `src/__tests__/fixtures/stockExchange-fixtures.ts`

- [ ] **Step 1: Create actuary fixtures**

```typescript
// src/__tests__/fixtures/actuary-fixtures.ts
import type { Actuary } from '@/types/actuary'

export function createMockActuary(overrides: Partial<Actuary> = {}): Actuary {
  return {
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'agent.smith@example.com',
    phone: '+38161000000',
    position: 'Agent',
    department: 'Trading',
    active: true,
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
    ...overrides,
  }
}
```

- [ ] **Step 2: Create stock exchange fixtures**

```typescript
// src/__tests__/fixtures/stockExchange-fixtures.ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/fixtures/actuary-fixtures.ts src/__tests__/fixtures/stockExchange-fixtures.ts
git commit -m "test: add actuary and stock exchange mock fixtures"
```

---

### Task 4: Actuary API Functions

**Files:**
- Create: `src/lib/api/actuaries.test.ts`
- Create: `src/lib/api/actuaries.ts`

- [ ] **Step 1: Write failing tests for all actuary API functions**

```typescript
// src/lib/api/actuaries.test.ts
import { apiClient } from '@/lib/api/axios'
import {
  getActuaries,
  setActuaryLimit,
  resetActuaryLimit,
  setActuaryApproval,
} from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPut = jest.mocked(apiClient.put)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getActuaries', () => {
  it('fetches actuaries with filters', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getActuaries({ search: 'Smith', page: 1, page_size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/api/actuaries', {
      params: { search: 'Smith', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches actuaries with no filters', async () => {
    const response = { actuaries: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getActuaries()

    expect(mockGet).toHaveBeenCalledWith('/api/actuaries', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('setActuaryLimit', () => {
  it('sends PUT with limit payload', async () => {
    const actuary = createMockActuary({ limit: '200000.00' })
    mockPut.mockResolvedValue({ data: actuary })

    const result = await setActuaryLimit(1, { limit: '200000.00' })

    expect(mockPut).toHaveBeenCalledWith('/api/actuaries/1/limit', { limit: '200000.00' })
    expect(result).toEqual(actuary)
  })
})

describe('resetActuaryLimit', () => {
  it('sends POST to reset limit', async () => {
    const actuary = createMockActuary({ used_limit: '0' })
    mockPost.mockResolvedValue({ data: actuary })

    const result = await resetActuaryLimit(1)

    expect(mockPost).toHaveBeenCalledWith('/api/actuaries/1/reset-limit')
    expect(result).toEqual(actuary)
  })
})

describe('setActuaryApproval', () => {
  it('sends PUT with need_approval payload', async () => {
    const actuary = createMockActuary({ need_approval: false })
    mockPut.mockResolvedValue({ data: actuary })

    const result = await setActuaryApproval(1, { need_approval: false })

    expect(mockPut).toHaveBeenCalledWith('/api/actuaries/1/approval', { need_approval: false })
    expect(result).toEqual(actuary)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=actuaries.test.ts --no-coverage`
Expected: FAIL — module `@/lib/api/actuaries` not found.

- [ ] **Step 3: Implement actuaries API**

```typescript
// src/lib/api/actuaries.ts
import { apiClient } from '@/lib/api/axios'
import type {
  Actuary,
  ActuaryListResponse,
  ActuaryFilters,
  SetLimitPayload,
  SetApprovalPayload,
} from '@/types/actuary'

export async function getActuaries(filters: ActuaryFilters = {}): Promise<ActuaryListResponse> {
  const { data } = await apiClient.get<ActuaryListResponse>('/api/actuaries', {
    params: filters,
  })
  return data
}

export async function setActuaryLimit(id: number, payload: SetLimitPayload): Promise<Actuary> {
  const { data } = await apiClient.put<Actuary>(`/api/actuaries/${id}/limit`, payload)
  return data
}

export async function resetActuaryLimit(id: number): Promise<Actuary> {
  const { data } = await apiClient.post<Actuary>(`/api/actuaries/${id}/reset-limit`)
  return data
}

export async function setActuaryApproval(
  id: number,
  payload: SetApprovalPayload
): Promise<Actuary> {
  const { data } = await apiClient.put<Actuary>(`/api/actuaries/${id}/approval`, payload)
  return data
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=actuaries.test.ts --no-coverage`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/actuaries.ts src/lib/api/actuaries.test.ts
git commit -m "feat: add actuary API functions with tests"
```

---

### Task 5: Stock Exchange API Functions

**Files:**
- Create: `src/lib/api/stockExchanges.test.ts`
- Create: `src/lib/api/stockExchanges.ts`

- [ ] **Step 1: Write failing tests for all stock exchange API functions**

```typescript
// src/lib/api/stockExchanges.test.ts
import { apiClient } from '@/lib/api/axios'
import {
  getStockExchanges,
  getTestingMode,
  setTestingMode,
} from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getStockExchanges', () => {
  it('fetches exchanges with filters', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getStockExchanges({ search: 'NYSE', page: 1, page_size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/api/stock-exchanges', {
      params: { search: 'NYSE', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches exchanges with no filters', async () => {
    const response = { exchanges: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getStockExchanges()

    expect(mockGet).toHaveBeenCalledWith('/api/stock-exchanges', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('getTestingMode', () => {
  it('fetches current testing mode status', async () => {
    mockGet.mockResolvedValue({ data: { testing_mode: false } })

    const result = await getTestingMode()

    expect(mockGet).toHaveBeenCalledWith('/api/stock-exchanges/testing-mode')
    expect(result).toEqual({ testing_mode: false })
  })
})

describe('setTestingMode', () => {
  it('posts testing mode enabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: true } })

    const result = await setTestingMode(true)

    expect(mockPost).toHaveBeenCalledWith('/api/stock-exchanges/testing-mode', { enabled: true })
    expect(result).toEqual({ testing_mode: true })
  })

  it('posts testing mode disabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: false } })

    const result = await setTestingMode(false)

    expect(mockPost).toHaveBeenCalledWith('/api/stock-exchanges/testing-mode', { enabled: false })
    expect(result).toEqual({ testing_mode: false })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=stockExchanges.test.ts --no-coverage`
Expected: FAIL — module `@/lib/api/stockExchanges` not found.

- [ ] **Step 3: Implement stock exchanges API**

```typescript
// src/lib/api/stockExchanges.ts
import { apiClient } from '@/lib/api/axios'
import type {
  StockExchangeListResponse,
  StockExchangeFilters,
  TestingModeResponse,
} from '@/types/stockExchange'

export async function getStockExchanges(
  filters: StockExchangeFilters = {}
): Promise<StockExchangeListResponse> {
  const { data } = await apiClient.get<StockExchangeListResponse>('/api/stock-exchanges', {
    params: filters,
  })
  return data
}

export async function getTestingMode(): Promise<TestingModeResponse> {
  const { data } = await apiClient.get<TestingModeResponse>('/api/stock-exchanges/testing-mode')
  return data
}

export async function setTestingMode(enabled: boolean): Promise<TestingModeResponse> {
  const { data } = await apiClient.post<TestingModeResponse>('/api/stock-exchanges/testing-mode', {
    enabled,
  })
  return data
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=stockExchanges.test.ts --no-coverage`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/stockExchanges.ts src/lib/api/stockExchanges.test.ts
git commit -m "feat: add stock exchange API functions with tests"
```

---

## Chunk 2: React Query Hooks

### Task 6: Actuary Hooks

**Files:**
- Create: `src/hooks/useActuaries.test.ts`
- Create: `src/hooks/useActuaries.ts`

- [ ] **Step 1: Write failing tests for actuary hooks**

```typescript
// src/hooks/useActuaries.test.ts
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useActuaries, useSetActuaryLimit, useResetActuaryLimit, useSetActuaryApproval } from '@/hooks/useActuaries'
import * as actuariesApi from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

jest.mock('@/lib/api/actuaries')

beforeEach(() => jest.clearAllMocks())

describe('useActuaries', () => {
  it('fetches actuaries with no filters by default', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue(response)

    const { result } = renderHook(() => useActuaries(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(actuariesApi.getActuaries).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue(response)

    const filters = { search: 'Smith', page: 1, page_size: 10 }
    const { result } = renderHook(() => useActuaries(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actuariesApi.getActuaries).toHaveBeenCalledWith(filters)
  })
})

describe('useSetActuaryLimit', () => {
  it('calls setActuaryLimit and invalidates query', async () => {
    const actuary = createMockActuary({ limit: '200000.00' })
    jest.mocked(actuariesApi.setActuaryLimit).mockResolvedValue(actuary)

    const { result } = renderHook(() => useSetActuaryLimit(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, payload: { limit: '200000.00' } })
    })

    expect(actuariesApi.setActuaryLimit).toHaveBeenCalledWith(1, { limit: '200000.00' })
  })
})

describe('useResetActuaryLimit', () => {
  it('calls resetActuaryLimit', async () => {
    const actuary = createMockActuary({ used_limit: '0' })
    jest.mocked(actuariesApi.resetActuaryLimit).mockResolvedValue(actuary)

    const { result } = renderHook(() => useResetActuaryLimit(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(actuariesApi.resetActuaryLimit).toHaveBeenCalledWith(1)
  })
})

describe('useSetActuaryApproval', () => {
  it('calls setActuaryApproval', async () => {
    const actuary = createMockActuary({ need_approval: false })
    jest.mocked(actuariesApi.setActuaryApproval).mockResolvedValue(actuary)

    const { result } = renderHook(() => useSetActuaryApproval(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, payload: { need_approval: false } })
    })

    expect(actuariesApi.setActuaryApproval).toHaveBeenCalledWith(1, { need_approval: false })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=useActuaries.test.ts --no-coverage`
Expected: FAIL — module `@/hooks/useActuaries` not found.

- [ ] **Step 3: Implement actuary hooks**

```typescript
// src/hooks/useActuaries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActuaries,
  setActuaryLimit,
  resetActuaryLimit,
  setActuaryApproval,
} from '@/lib/api/actuaries'
import type { ActuaryFilters, SetLimitPayload, SetApprovalPayload } from '@/types/actuary'

export function useActuaries(filters: ActuaryFilters = {}) {
  return useQuery({
    queryKey: ['actuaries', filters],
    queryFn: () => getActuaries(filters),
  })
}

export function useSetActuaryLimit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SetLimitPayload }) =>
      setActuaryLimit(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}

export function useResetActuaryLimit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resetActuaryLimit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}

export function useSetActuaryApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SetApprovalPayload }) =>
      setActuaryApproval(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actuaries'] }),
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=useActuaries.test.ts --no-coverage`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useActuaries.ts src/hooks/useActuaries.test.ts
git commit -m "feat: add React Query hooks for actuaries"
```

---

### Task 7: Stock Exchange Hooks

**Files:**
- Create: `src/hooks/useStockExchanges.test.ts`
- Create: `src/hooks/useStockExchanges.ts`

- [ ] **Step 1: Write failing tests for stock exchange hooks**

```typescript
// src/hooks/useStockExchanges.test.ts
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useStockExchanges, useTestingMode, useSetTestingMode } from '@/hooks/useStockExchanges'
import * as stockExchangesApi from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

jest.mock('@/lib/api/stockExchanges')

beforeEach(() => jest.clearAllMocks())

describe('useStockExchanges', () => {
  it('fetches exchanges with no filters by default', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue(response)

    const { result } = renderHook(() => useStockExchanges(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue(response)

    const filters = { search: 'NYSE', page: 1, page_size: 10 }
    const { result } = renderHook(() => useStockExchanges(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith(filters)
  })
})

describe('useTestingMode', () => {
  it('fetches current testing mode', async () => {
    jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: false })

    const { result } = renderHook(() => useTestingMode(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ testing_mode: false })
  })
})

describe('useSetTestingMode', () => {
  it('calls setTestingMode', async () => {
    jest.mocked(stockExchangesApi.setTestingMode).mockResolvedValue({ testing_mode: true })

    const { result } = renderHook(() => useSetTestingMode(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(true)
    })

    expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=useStockExchanges.test.ts --no-coverage`
Expected: FAIL — module `@/hooks/useStockExchanges` not found.

- [ ] **Step 3: Implement stock exchange hooks**

```typescript
// src/hooks/useStockExchanges.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStockExchanges, getTestingMode, setTestingMode } from '@/lib/api/stockExchanges'
import type { StockExchangeFilters } from '@/types/stockExchange'

export function useStockExchanges(filters: StockExchangeFilters = {}) {
  return useQuery({
    queryKey: ['stock-exchanges', filters],
    queryFn: () => getStockExchanges(filters),
  })
}

export function useTestingMode() {
  return useQuery({
    queryKey: ['stock-exchanges', 'testing-mode'],
    queryFn: () => getTestingMode(),
  })
}

export function useSetTestingMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => setTestingMode(enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['stock-exchanges', 'testing-mode'] }),
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=useStockExchanges.test.ts --no-coverage`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStockExchanges.ts src/hooks/useStockExchanges.test.ts
git commit -m "feat: add React Query hooks for stock exchanges"
```

---

## Chunk 3: Actuary Components and Page

### Task 8: ActuaryTable Component

**Files:**
- Create: `src/components/actuaries/ActuaryTable.test.tsx`
- Create: `src/components/actuaries/ActuaryTable.tsx`

The ActuaryTable displays a table of agents with columns: Name, Email, Position, Limit, Used Limit, Approval Required, and Actions (Edit Limit, Reset Used Limit).

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/actuaries/ActuaryTable.test.tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActuaryTable } from '@/components/actuaries/ActuaryTable'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

const mockActuaries = [
  createMockActuary({
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'smith@test.com',
    position: 'Agent',
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
  }),
  createMockActuary({
    id: 2,
    first_name: 'Agent',
    last_name: 'Jones',
    email: 'jones@test.com',
    position: 'Agent',
    limit: '50000.00',
    used_limit: '0',
    need_approval: false,
  }),
]

describe('ActuaryTable', () => {
  const defaultProps = {
    actuaries: mockActuaries,
    onEditLimit: jest.fn(),
    onResetLimit: jest.fn(),
    onToggleApproval: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
    expect(screen.getByText('Used Limit')).toBeInTheDocument()
    expect(screen.getByText('Approval')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders actuary rows', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Agent Smith')).toBeInTheDocument()
    expect(screen.getByText('smith@test.com')).toBeInTheDocument()
    expect(screen.getByText('Agent Jones')).toBeInTheDocument()
    expect(screen.getByText('jones@test.com')).toBeInTheDocument()
  })

  it('displays limit and used_limit values', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('100000.00')).toBeInTheDocument()
    expect(screen.getByText('15000.00')).toBeInTheDocument()
    expect(screen.getByText('50000.00')).toBeInTheDocument()
  })

  it('displays approval status as Yes/No', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('calls onEditLimit when Edit Limit button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const editButtons = screen.getAllByRole('button', { name: /edit limit/i })
    fireEvent.click(editButtons[0])
    expect(defaultProps.onEditLimit).toHaveBeenCalledWith(mockActuaries[0])
  })

  it('calls onResetLimit when Reset button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const resetButtons = screen.getAllByRole('button', { name: /reset/i })
    fireEvent.click(resetButtons[0])
    expect(defaultProps.onResetLimit).toHaveBeenCalledWith(1)
  })

  it('calls onToggleApproval when approval toggle button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const toggleButtons = screen.getAllByRole('button', { name: /toggle approval/i })
    fireEvent.click(toggleButtons[0])
    expect(defaultProps.onToggleApproval).toHaveBeenCalledWith(1, false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=ActuaryTable.test --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ActuaryTable**

```tsx
// src/components/actuaries/ActuaryTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Actuary } from '@/types/actuary'

interface ActuaryTableProps {
  actuaries: Actuary[]
  onEditLimit: (actuary: Actuary) => void
  onResetLimit: (id: number) => void
  onToggleApproval: (id: number, currentApproval: boolean) => void
}

export function ActuaryTable({
  actuaries,
  onEditLimit,
  onResetLimit,
  onToggleApproval,
}: ActuaryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Limit</TableHead>
          <TableHead>Used Limit</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actuaries.map((actuary) => (
          <TableRow key={actuary.id}>
            <TableCell>
              {actuary.first_name} {actuary.last_name}
            </TableCell>
            <TableCell>{actuary.email}</TableCell>
            <TableCell>{actuary.position}</TableCell>
            <TableCell>{actuary.limit}</TableCell>
            <TableCell>{actuary.used_limit}</TableCell>
            <TableCell>{actuary.need_approval ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEditLimit(actuary)}>
                  Edit Limit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onResetLimit(actuary.id)}>
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleApproval(actuary.id, actuary.need_approval)}
                  aria-label="Toggle approval"
                >
                  Toggle Approval
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=ActuaryTable.test --no-coverage`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/actuaries/ActuaryTable.tsx src/components/actuaries/ActuaryTable.test.tsx
git commit -m "feat: add ActuaryTable component with tests"
```

---

### Task 9: EditLimitDialog Component

**Files:**
- Create: `src/components/actuaries/EditLimitDialog.test.tsx`
- Create: `src/components/actuaries/EditLimitDialog.tsx`

Dialog for editing an agent's trading limit. Follows the same pattern as `CardRequestDenyDialog` with an inner component for state reset.

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/actuaries/EditLimitDialog.test.tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditLimitDialog } from '@/components/actuaries/EditLimitDialog'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

describe('EditLimitDialog', () => {
  const actuary = createMockActuary({ id: 1, first_name: 'Agent', last_name: 'Smith', limit: '100000.00' })

  const defaultProps = {
    open: true,
    actuary,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with agent name', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    expect(screen.getByText(/edit limit.*agent smith/i)).toBeInTheDocument()
  })

  it('renders input pre-filled with current limit', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    const input = screen.getByDisplayValue('100000.00')
    expect(input).toBeInTheDocument()
  })

  it('calls onConfirm with new limit value when Save is clicked', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    const input = screen.getByDisplayValue('100000.00')
    fireEvent.change(input, { target: { value: '200000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith('200000.00')
  })

  it('calls onClose when Cancel is clicked', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('does not render content when open is false', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} open={false} />)
    expect(screen.queryByText(/edit limit/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=EditLimitDialog.test --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement EditLimitDialog**

```tsx
// src/components/actuaries/EditLimitDialog.tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Actuary } from '@/types/actuary'

interface EditLimitDialogProps {
  open: boolean
  actuary: Actuary | null
  onClose: () => void
  onConfirm: (limit: string) => void
}

function EditLimitDialogInner({
  actuary,
  onClose,
  onConfirm,
}: Pick<EditLimitDialogProps, 'actuary' | 'onClose' | 'onConfirm'>) {
  const [limit, setLimit] = useState(actuary?.limit ?? '')

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Edit Limit — {actuary?.first_name} {actuary?.last_name}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="limit-input">New Limit</Label>
        <Input
          id="limit-input"
          type="text"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="mt-1"
        />
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(limit)}>Save</Button>
      </DialogFooter>
    </>
  )
}

export function EditLimitDialog({ open, actuary, onClose, onConfirm }: EditLimitDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && actuary && (
          <EditLimitDialogInner actuary={actuary} onClose={onClose} onConfirm={onConfirm} />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=EditLimitDialog.test --no-coverage`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/actuaries/EditLimitDialog.tsx src/components/actuaries/EditLimitDialog.test.tsx
git commit -m "feat: add EditLimitDialog component with tests"
```

---

### Task 10: ActuaryListPage

**Files:**
- Create: `src/pages/ActuaryListPage.test.tsx`
- Create: `src/pages/ActuaryListPage.tsx`

The main supervisor portal page. Lists agents with server-side filtering (search, position) and pagination. Actions: edit limit, reset used limit, toggle approval.

- [ ] **Step 1: Write failing tests**

```tsx
// src/pages/ActuaryListPage.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActuaryListPage } from '@/pages/ActuaryListPage'
import * as actuariesApi from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/actuaries')

const mockActuaries = [
  createMockActuary({
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'smith@test.com',
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
  }),
  createMockActuary({
    id: 2,
    first_name: 'Agent',
    last_name: 'Jones',
    email: 'jones@test.com',
    limit: '50000.00',
    used_limit: '0',
    need_approval: false,
  }),
]

const supervisorAuth = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read', 'agents.manage'],
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(actuariesApi.getActuaries).mockResolvedValue({
    actuaries: mockActuaries,
    total_count: 2,
  })
  jest.mocked(actuariesApi.setActuaryLimit).mockResolvedValue(mockActuaries[0])
  jest.mocked(actuariesApi.resetActuaryLimit).mockResolvedValue(mockActuaries[0])
  jest.mocked(actuariesApi.setActuaryApproval).mockResolvedValue(mockActuaries[0])
})

describe('ActuaryListPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    expect(screen.getByText('Actuaries')).toBeInTheDocument()
  })

  it('displays all actuaries on load', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')
    expect(screen.getByText('Agent Jones')).toBeInTheDocument()
  })

  it('calls API with search filter when typing', async () => {
    jest.mocked(actuariesApi.getActuaries).mockImplementation(async (filters = {}) => {
      if (filters.search === 'Smith') {
        return { actuaries: [mockActuaries[0]], total_count: 1 }
      }
      return { actuaries: mockActuaries, total_count: 2 }
    })

    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const searchInput = screen.getByPlaceholderText(/^search$/i)
    fireEvent.change(searchInput, { target: { value: 'Smith' } })

    await waitFor(() =>
      expect(actuariesApi.getActuaries).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Smith', page: 1, page_size: 10 })
      )
    )
  })

  it('shows loading state', () => {
    jest.mocked(actuariesApi.getActuaries).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No actuaries found." when API returns empty array', async () => {
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue({
      actuaries: [],
      total_count: 0,
    })
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('No actuaries found.')
  })

  it('calls resetActuaryLimit when Reset button is clicked', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const resetButtons = screen.getAllByRole('button', { name: /reset/i })
    fireEvent.click(resetButtons[0])

    await waitFor(() =>
      expect(actuariesApi.resetActuaryLimit).toHaveBeenCalledWith(1)
    )
  })

  it('calls setActuaryApproval when Toggle Approval button is clicked', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const toggleButtons = screen.getAllByRole('button', { name: /toggle approval/i })
    fireEvent.click(toggleButtons[0])

    await waitFor(() =>
      expect(actuariesApi.setActuaryApproval).toHaveBeenCalledWith(1, { need_approval: false })
    )
  })

  it('opens edit limit dialog and calls setActuaryLimit on save', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const editButtons = screen.getAllByRole('button', { name: /edit limit/i })
    fireEvent.click(editButtons[0])

    const input = await screen.findByDisplayValue('100000.00')
    fireEvent.change(input, { target: { value: '200000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(actuariesApi.setActuaryLimit).toHaveBeenCalledWith(1, { limit: '200000.00' })
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=ActuaryListPage.test --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ActuaryListPage**

```tsx
// src/pages/ActuaryListPage.tsx
import { useState, useCallback } from 'react'
import { FilterBar } from '@/components/ui/FilterBar'
import { ActuaryTable } from '@/components/actuaries/ActuaryTable'
import { EditLimitDialog } from '@/components/actuaries/EditLimitDialog'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  useActuaries,
  useSetActuaryLimit,
  useResetActuaryLimit,
  useSetActuaryApproval,
} from '@/hooks/useActuaries'
import type { ActuaryFilters } from '@/types/actuary'
import type { Actuary } from '@/types/actuary'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const ACTUARY_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
]

export function ActuaryListPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [editingActuary, setEditingActuary] = useState<Actuary | null>(null)

  const apiFilters: ActuaryFilters = {
    page,
    page_size: PAGE_SIZE,
    search: (filterValues.search as string) || undefined,
    position: (filterValues.position as string) || undefined,
  }

  const { data, isLoading } = useActuaries(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const setLimitMutation = useSetActuaryLimit()
  const resetLimitMutation = useResetActuaryLimit()
  const setApprovalMutation = useSetActuaryApproval()

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleEditLimit = useCallback((actuary: Actuary) => {
    setEditingActuary(actuary)
  }, [])

  const handleConfirmLimit = useCallback(
    (limit: string) => {
      if (editingActuary) {
        setLimitMutation.mutate({ id: editingActuary.id, payload: { limit } })
      }
      setEditingActuary(null)
    },
    [editingActuary, setLimitMutation]
  )

  const handleResetLimit = useCallback(
    (id: number) => {
      resetLimitMutation.mutate(id)
    },
    [resetLimitMutation]
  )

  const handleToggleApproval = useCallback(
    (id: number, currentApproval: boolean) => {
      setApprovalMutation.mutate({
        id,
        payload: { need_approval: !currentApproval },
      })
    },
    [setApprovalMutation]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Actuaries</h1>

      <FilterBar
        fields={ACTUARY_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.actuaries.length ? (
        <>
          <ActuaryTable
            actuaries={data.actuaries}
            onEditLimit={handleEditLimit}
            onResetLimit={handleResetLimit}
            onToggleApproval={handleToggleApproval}
          />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} actuaries</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No actuaries found.</p>
      )}

      <EditLimitDialog
        open={editingActuary !== null}
        actuary={editingActuary}
        onClose={() => setEditingActuary(null)}
        onConfirm={handleConfirmLimit}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=ActuaryListPage.test --no-coverage`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ActuaryListPage.tsx src/pages/ActuaryListPage.test.tsx
git commit -m "feat: add ActuaryListPage with filtering, pagination, and actions"
```

---

## Chunk 4: Stock Exchange Components and Page

### Task 11: StockExchangeTable Component

**Files:**
- Create: `src/components/stockExchanges/StockExchangeTable.test.tsx`
- Create: `src/components/stockExchanges/StockExchangeTable.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/stockExchanges/StockExchangeTable.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockExchangeTable } from '@/components/stockExchanges/StockExchangeTable'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

const mockExchanges = [
  createMockStockExchange({
    id: 1,
    exchange_name: 'New York Stock Exchange',
    exchange_acronym: 'NYSE',
    exchange_mic_code: 'XNYS',
    polity: 'United States',
    currency: 'Dollar',
    time_zone: '-5',
  }),
  createMockStockExchange({
    id: 2,
    exchange_name: 'London Stock Exchange',
    exchange_acronym: 'LSE',
    exchange_mic_code: 'XLON',
    polity: 'United Kingdom',
    currency: 'Pound',
    time_zone: '0',
  }),
]

describe('StockExchangeTable', () => {
  it('renders table headers', () => {
    renderWithProviders(<StockExchangeTable exchanges={mockExchanges} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Acronym')).toBeInTheDocument()
    expect(screen.getByText('MIC Code')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByText('Currency')).toBeInTheDocument()
    expect(screen.getByText('Time Zone')).toBeInTheDocument()
  })

  it('renders exchange rows', () => {
    renderWithProviders(<StockExchangeTable exchanges={mockExchanges} />)
    expect(screen.getByText('New York Stock Exchange')).toBeInTheDocument()
    expect(screen.getByText('NYSE')).toBeInTheDocument()
    expect(screen.getByText('XNYS')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('London Stock Exchange')).toBeInTheDocument()
    expect(screen.getByText('LSE')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=StockExchangeTable.test --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement StockExchangeTable**

```tsx
// src/components/stockExchanges/StockExchangeTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StockExchange } from '@/types/stockExchange'

interface StockExchangeTableProps {
  exchanges: StockExchange[]
}

export function StockExchangeTable({ exchanges }: StockExchangeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Acronym</TableHead>
          <TableHead>MIC Code</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Time Zone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchanges.map((exchange) => (
          <TableRow key={exchange.id}>
            <TableCell>{exchange.exchange_name}</TableCell>
            <TableCell>{exchange.exchange_acronym}</TableCell>
            <TableCell>{exchange.exchange_mic_code}</TableCell>
            <TableCell>{exchange.polity}</TableCell>
            <TableCell>{exchange.currency}</TableCell>
            <TableCell>UTC{Number(exchange.time_zone) >= 0 ? '+' : ''}{exchange.time_zone}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=StockExchangeTable.test --no-coverage`
Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/stockExchanges/StockExchangeTable.tsx src/components/stockExchanges/StockExchangeTable.test.tsx
git commit -m "feat: add StockExchangeTable component with tests"
```

---

### Task 12: StockExchangesPage

**Files:**
- Create: `src/pages/StockExchangesPage.test.tsx`
- Create: `src/pages/StockExchangesPage.tsx`

Displays list of stock exchanges with search filter, pagination, and a testing mode toggle button (only visible if user has `exchanges.manage` permission).

- [ ] **Step 1: Write failing tests**

```tsx
// src/pages/StockExchangesPage.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockExchangesPage } from '@/pages/StockExchangesPage'
import * as stockExchangesApi from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/stockExchanges')

const mockExchanges = [
  createMockStockExchange({ id: 1, exchange_name: 'NYSE', exchange_acronym: 'NYSE' }),
  createMockStockExchange({ id: 2, exchange_name: 'LSE', exchange_acronym: 'LSE' }),
]

const authWithExchangePermission = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read', 'exchanges.manage'],
  }),
})

const authWithoutExchangePermission = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read'],
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue({
    exchanges: mockExchanges,
    total_count: 2,
  })
  jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: false })
  jest.mocked(stockExchangesApi.setTestingMode).mockResolvedValue({ testing_mode: true })
})

describe('StockExchangesPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    expect(screen.getByText('Stock Exchanges')).toBeInTheDocument()
  })

  it('displays exchanges on load', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('NYSE')
    expect(screen.getByText('LSE')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No exchanges found." when empty', async () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue({
      exchanges: [],
      total_count: 0,
    })
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('No exchanges found.')
  })

  it('shows testing mode toggle when user has exchanges.manage permission', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('NYSE')
    expect(screen.getByRole('button', { name: /enable testing mode/i })).toBeInTheDocument()
  })

  it('hides testing mode toggle when user lacks exchanges.manage permission', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithoutExchangePermission },
    })
    await screen.findByText('NYSE')
    expect(screen.queryByRole('button', { name: /testing mode/i })).not.toBeInTheDocument()
  })

  it('calls setTestingMode(true) when Enable button is clicked', async () => {
    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('NYSE')

    fireEvent.click(screen.getByRole('button', { name: /enable testing mode/i }))

    await waitFor(() =>
      expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(true)
    )
  })

  it('shows Disable button and calls setTestingMode(false) when testing mode is active', async () => {
    jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: true })

    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('NYSE')

    const disableBtn = screen.getByRole('button', { name: /disable testing mode/i })
    expect(disableBtn).toBeInTheDocument()

    fireEvent.click(disableBtn)

    await waitFor(() =>
      expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(false)
    )
  })

  it('calls API with search filter when typing', async () => {
    jest.mocked(stockExchangesApi.getStockExchanges).mockImplementation(async (filters = {}) => {
      if (filters.search === 'NYSE') {
        return { exchanges: [mockExchanges[0]], total_count: 1 }
      }
      return { exchanges: mockExchanges, total_count: 2 }
    })

    renderWithProviders(<StockExchangesPage />, {
      preloadedState: { auth: authWithExchangePermission },
    })
    await screen.findByText('NYSE')

    const searchInput = screen.getByPlaceholderText(/^search$/i)
    fireEvent.change(searchInput, { target: { value: 'NYSE' } })

    await waitFor(() =>
      expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'NYSE', page: 1, page_size: 10 })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=StockExchangesPage.test --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement StockExchangesPage**

```tsx
// src/pages/StockExchangesPage.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { StockExchangeTable } from '@/components/stockExchanges/StockExchangeTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStockExchanges, useTestingMode, useSetTestingMode } from '@/hooks/useStockExchanges'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission } from '@/store/selectors/authSelectors'
import type { StockExchangeFilters } from '@/types/stockExchange'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const EXCHANGE_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'search', label: 'Search', type: 'text' },
]

export function StockExchangesPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const canManageExchanges = useAppSelector((state) =>
    selectHasPermission(state, 'exchanges.manage')
  )

  const apiFilters: StockExchangeFilters = {
    page,
    page_size: PAGE_SIZE,
    search: (filterValues.search as string) || undefined,
  }

  const { data, isLoading } = useStockExchanges(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const { data: testingModeData } = useTestingMode()
  const setTestingModeMutation = useSetTestingMode()

  const isTestingMode = testingModeData?.testing_mode ?? false

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleToggleTestingMode = () => {
    setTestingModeMutation.mutate(!isTestingMode)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Exchanges</h1>
        {canManageExchanges && (
          <Button
            variant={isTestingMode ? 'destructive' : 'default'}
            onClick={handleToggleTestingMode}
            disabled={setTestingModeMutation.isPending}
          >
            {isTestingMode ? 'Disable Testing Mode' : 'Enable Testing Mode'}
          </Button>
        )}
      </div>

      <FilterBar
        fields={EXCHANGE_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.exchanges.length ? (
        <>
          <StockExchangeTable exchanges={data.exchanges} />
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} exchanges</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No exchanges found.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=StockExchangesPage.test --no-coverage`
Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/StockExchangesPage.tsx src/pages/StockExchangesPage.test.tsx
git commit -m "feat: add StockExchangesPage with search, pagination, and testing mode toggle"
```

---

## Chunk 5: Routing and Navigation

### Task 13: Add Routes to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports and routes**

Add these imports at the top of `App.tsx`:
```typescript
import { ActuaryListPage } from '@/pages/ActuaryListPage'
import { StockExchangesPage } from '@/pages/StockExchangesPage'
```

Add these routes after the existing employee routes (after the `/admin/loans` route block, before `{/* Client routes */}`):

```tsx
<Route
  path="/admin/actuaries"
  element={
    <ProtectedRoute requiredPermission="agents.manage">
      <ActuaryListPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/stock-exchanges"
  element={
    <ProtectedRoute requiredRole="Employee">
      <StockExchangesPage />
    </ProtectedRoute>
  }
/>
```

Note: `/admin/actuaries` requires `agents.manage` permission (supervisors only), while `/admin/stock-exchanges` requires `Employee` role (all employees can view exchanges, but only those with `exchanges.manage` can toggle testing mode — that permission check is inside the page itself).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add routes for actuaries and stock exchanges pages"
```

---

### Task 14: Add Sidebar Navigation Links

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Update EmployeeNav to accept `canManageAgents` prop and add links**

1. Update the `EmployeeNav` function signature to accept a new `canManageAgents` prop:

```tsx
function EmployeeNav({ isAdmin, canManageAgents }: { isAdmin: boolean; canManageAgents: boolean }) {
```

2. Add the permission-gated "Actuaries" link and unconditional "Stock Exchanges" link after the "All Loans" link:

```tsx
      {canManageAgents && (
        <Link to="/admin/actuaries" className={navLinkClass}>
          Actuaries
        </Link>
      )}
      <Link to="/admin/stock-exchanges" className={navLinkClass}>
        Stock Exchanges
      </Link>
```

3. In the `Sidebar` component, add the permission check and pass it as a prop:

```tsx
import { selectHasPermission } from '@/store/selectors/authSelectors'
// ... inside Sidebar():
const canManageAgents = useAppSelector((state) => selectHasPermission(state, 'agents.manage'))
// ... in JSX:
<EmployeeNav isAdmin={isAdmin} canManageAgents={canManageAgents} />
```

Note: `selectHasPermission` is already imported in `ProtectedRoute.tsx` from `@/store/selectors/authSelectors` — add the import to Sidebar.tsx.

- [ ] **Step 2: Verify the app renders without errors**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Actuaries and Stock Exchanges links to sidebar"
```

---

### Task 15: Run All Quality Gates

- [ ] **Step 1: Run all tests**

Run: `npm test -- --no-coverage`
Expected: All tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Run format check**

Run: `npx prettier --check "src/**/*.{ts,tsx}"`
Expected: All files formatted. If not, run `npx prettier --write "src/**/*.{ts,tsx}"` and commit the formatting fix.

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit any fixes**

If any quality gate required fixes, commit them:
```bash
git commit -m "chore: fix lint/format issues"
```

---

### Task 16: Update specification.md

**Files:**
- Modify: `specification.md`

- [ ] **Step 1: Update the specification**

Update the following sections in `specification.md`:

1. **Project Structure** — Add new files:
   - `src/types/actuary.ts`
   - `src/types/stockExchange.ts`
   - `src/lib/api/actuaries.ts`
   - `src/lib/api/stockExchanges.ts`
   - `src/hooks/useActuaries.ts`
   - `src/hooks/useStockExchanges.ts`
   - `src/components/actuaries/ActuaryTable.tsx`
   - `src/components/actuaries/EditLimitDialog.tsx`
   - `src/components/stockExchanges/StockExchangeTable.tsx`
   - `src/pages/ActuaryListPage.tsx`
   - `src/pages/StockExchangesPage.tsx`
   - `src/__tests__/fixtures/actuary-fixtures.ts`
   - `src/__tests__/fixtures/stockExchange-fixtures.ts`

2. **Routes** — Add:
   - `/admin/actuaries` | ActuaryListPage | `agents.manage`
   - `/admin/stock-exchanges` | StockExchangesPage | Employee

3. **Pages** — Add descriptions for ActuaryListPage and StockExchangesPage

4. **Components** — Add descriptions for ActuaryTable, EditLimitDialog, StockExchangeTable

5. **API Layer** — Add Actuaries API and Stock Exchanges API sections

6. **Custom Hooks** — Add useActuaries, useSetActuaryLimit, useResetActuaryLimit, useSetActuaryApproval, useStockExchanges, useTestingMode, useSetTestingMode

7. **Types & Interfaces** — Add Actuary and StockExchange type definitions

8. **Test Coverage** — Run `npm test -- --coverage --coverageReporters=text` and update the coverage table

- [ ] **Step 2: Commit**

```bash
git add specification.md
git commit -m "docs: update specification with actuaries and stock exchanges"
```
