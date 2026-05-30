# Recurring Orders Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Recurring Orders" tab to the Portfolio page that lists the signed-in user's recurring securities-order templates and lets them Pause, Resume, and Cancel each one.

**Architecture:** Extend the existing pure API layer and React Query hooks for recurring orders (list + 3 lifecycle mutations), build a presentational `RecurringOrdersTable` (modeled on `MyPriceAlertsTable`) plus a `Dialog`-based cancel-confirmation, and wire a new tab into `PortfolioView` using the exact same `busyId`/mutation wiring the Favorites and Alerts tabs already use.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Shadcn UI (Table, Button, Badge, Dialog), Jest + React Testing Library, Cypress.

**Conventions enforced by this codebase (do not deviate):**
- Per CLAUDE.md, `.tsx`/`.ts` logic edits go through the `react-typescript-coder` agent. Tests are written FIRST (TDD).
- Error handling: queries/mutations rely on the global query/mutation cache `onError` toast. Do NOT add empty `onError`/`catch`. No custom `onError` is needed here.
- The query key for recurring orders is `['recurring-orders']` — it MUST match, because `useCreateRecurringOrder` already invalidates that exact key.
- `RecurringOrderListResponse` already exists in `src/types/recurringOrder.ts` (`{ recurring_orders: RecurringOrder[] }`). Do NOT redefine it.

**Run all commands from the repo root `/Users/marija/exBanka-1-frontend`.**

---

### Task 1: API layer — list + pause/resume/cancel

**Files:**
- Modify: `src/lib/api/recurringOrders.ts`
- Modify (test): `src/lib/api/recurringOrders.test.ts`

- [ ] **Step 1: Add the failing tests**

Append these `describe` blocks to `src/lib/api/recurringOrders.test.ts`. The existing file already mocks `apiClient` with `{ post: jest.fn() }` — change that mock line to also include `get`, and add `mockGet`:

Change the existing mock + handle setup near the top of the file from:
```ts
jest.mock('@/lib/api/axios', () => ({
  apiClient: { post: jest.fn() },
}))

const mockPost = jest.mocked(apiClient.post)
```
to:
```ts
jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
```

Then add the new imports to the existing import line:
```ts
import {
  cancelRecurringOrder,
  createRecurringOrder,
  getMyRecurringOrders,
  pauseRecurringOrder,
  resumeRecurringOrder,
} from '@/lib/api/recurringOrders'
```

Append after the existing `describe('createRecurringOrder', ...)` block (reuse the existing `sampleOrder` fixture already defined in the file):
```ts
describe('getMyRecurringOrders', () => {
  it('GETs /me/recurring-orders and returns the recurring_orders array', async () => {
    mockGet.mockResolvedValue({ data: { recurring_orders: [sampleOrder] } })

    const result = await getMyRecurringOrders()

    expect(mockGet).toHaveBeenCalledWith('/me/recurring-orders')
    expect(result).toEqual([sampleOrder])
  })

  it('defaults to [] when the backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { recurring_orders: null } })

    const result = await getMyRecurringOrders()

    expect(result).toEqual([])
  })
})

describe('pauseRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/pause and returns the recurring_order', async () => {
    const paused = { ...sampleOrder, status: 'paused' as const }
    mockPost.mockResolvedValue({ data: { recurring_order: paused } })

    const result = await pauseRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/pause')
    expect(result).toEqual(paused)
  })
})

describe('resumeRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/resume and returns the recurring_order', async () => {
    mockPost.mockResolvedValue({ data: { recurring_order: sampleOrder } })

    const result = await resumeRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/resume')
    expect(result).toEqual(sampleOrder)
  })
})

describe('cancelRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/cancel and returns the recurring_order', async () => {
    const cancelled = { ...sampleOrder, status: 'cancelled' as const }
    mockPost.mockResolvedValue({ data: { recurring_order: cancelled } })

    const result = await cancelRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/cancel')
    expect(result).toEqual(cancelled)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/api/recurringOrders.test.ts`
Expected: FAIL — `getMyRecurringOrders`/`pauseRecurringOrder`/`resumeRecurringOrder`/`cancelRecurringOrder` are not exported.

- [ ] **Step 3: Implement the API functions**

Replace the contents of `src/lib/api/recurringOrders.ts` with:
```ts
import { apiClient } from '@/lib/api/axios'
import type {
  CreateRecurringOrderPayload,
  CreateRecurringOrderResponse,
  RecurringOrder,
  RecurringOrderListResponse,
} from '@/types/recurringOrder'

export async function createRecurringOrder(
  payload: CreateRecurringOrderPayload
): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    '/me/recurring-orders',
    payload
  )
  return data.recurring_order
}

export async function getMyRecurringOrders(): Promise<RecurringOrder[]> {
  const { data } = await apiClient.get<RecurringOrderListResponse>('/me/recurring-orders')
  return data.recurring_orders ?? []
}

export async function pauseRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/pause`
  )
  return data.recurring_order
}

export async function resumeRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/resume`
  )
  return data.recurring_order
}

export async function cancelRecurringOrder(id: number): Promise<RecurringOrder> {
  const { data } = await apiClient.post<CreateRecurringOrderResponse>(
    `/me/recurring-orders/${id}/cancel`
  )
  return data.recurring_order
}
```

(The pause/resume/cancel responses are `{ recurring_order }`, identical shape to `CreateRecurringOrderResponse`, so we reuse that type.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/api/recurringOrders.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/recurringOrders.ts src/lib/api/recurringOrders.test.ts
git commit -m "feat(recurring-orders): add list/pause/resume/cancel API functions"
```

---

### Task 2: React Query hooks — list query + 3 lifecycle mutations

**Files:**
- Modify: `src/hooks/useRecurringOrders.ts`
- Modify (test): `src/hooks/useRecurringOrders.test.ts`

- [ ] **Step 1: Add the failing tests**

In `src/hooks/useRecurringOrders.test.ts`, expand the import from the hook module and add `waitFor`:
```ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useCancelRecurringOrder,
  useCreateRecurringOrder,
  usePauseRecurringOrder,
  useRecurringOrders,
  useResumeRecurringOrder,
} from '@/hooks/useRecurringOrders'
```

Append these describe blocks after the existing `useCreateRecurringOrder` block (the file already defines `order` as `{ id: 1, status: 'active' } as RecurringOrder`):
```ts
describe('useRecurringOrders', () => {
  it('returns the list from getMyRecurringOrders', async () => {
    jest.mocked(recurringOrdersApi.getMyRecurringOrders).mockResolvedValue([order])

    const { result } = renderHook(() => useRecurringOrders(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([order])
  })
})

describe('usePauseRecurringOrder', () => {
  it('calls pauseRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.pauseRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => usePauseRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.pauseRecurringOrder).toHaveBeenCalledWith(1)
  })
})

describe('useResumeRecurringOrder', () => {
  it('calls resumeRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.resumeRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useResumeRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.resumeRecurringOrder).toHaveBeenCalledWith(1)
  })
})

describe('useCancelRecurringOrder', () => {
  it('calls cancelRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.cancelRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useCancelRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.cancelRecurringOrder).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/hooks/useRecurringOrders.test.ts`
Expected: FAIL — the new hooks are not exported.

- [ ] **Step 3: Implement the hooks**

Replace the contents of `src/hooks/useRecurringOrders.ts` with:
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelRecurringOrder,
  createRecurringOrder,
  getMyRecurringOrders,
  pauseRecurringOrder,
  resumeRecurringOrder,
} from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload } from '@/types/recurringOrder'

const KEY = ['recurring-orders'] as const

export function useRecurringOrders() {
  return useQuery({
    queryKey: KEY,
    queryFn: getMyRecurringOrders,
  })
}

export function useCreateRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRecurringOrderPayload) => createRecurringOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function usePauseRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pauseRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useResumeRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resumeRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useCancelRecurringOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelRecurringOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/hooks/useRecurringOrders.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRecurringOrders.ts src/hooks/useRecurringOrders.test.ts
git commit -m "feat(recurring-orders): add list query + pause/resume/cancel mutation hooks"
```

---

### Task 3: CancelRecurringOrderDialog component

A small confirmation dialog on the existing Shadcn `Dialog`. Extracted so the table stays focused and under 150 lines.

**Files:**
- Create: `src/views/portfolio/components/CancelRecurringOrderDialog.tsx`
- Create (test): `src/views/portfolio/__tests__/CancelRecurringOrderDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/views/portfolio/__tests__/CancelRecurringOrderDialog.test.tsx`:
```tsx
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CancelRecurringOrderDialog } from '@/views/portfolio/components/CancelRecurringOrderDialog'

describe('CancelRecurringOrderDialog', () => {
  it('shows the irreversible-cancel warning when open', () => {
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={() => {}} onConfirm={() => {}} />
    )
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = jest.fn()
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={() => {}} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes without confirming when "Keep order" is clicked', () => {
    const onConfirm = jest.fn()
    const onOpenChange = jest.fn()
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: /keep order/i }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/views/portfolio/__tests__/CancelRecurringOrderDialog.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the component**

Create `src/views/portfolio/components/CancelRecurringOrderDialog.tsx`:
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function CancelRecurringOrderDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel recurring order?</DialogTitle>
          <DialogDescription>
            This permanently cancels the recurring order. No further orders will be placed. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/views/portfolio/__tests__/CancelRecurringOrderDialog.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/portfolio/components/CancelRecurringOrderDialog.tsx src/views/portfolio/__tests__/CancelRecurringOrderDialog.test.tsx
git commit -m "feat(recurring-orders): add cancel confirmation dialog"
```

---

### Task 4: RecurringOrdersTable component

Presentational table modeled on `MyPriceAlertsTable`. Resolves ticker via `useListingMap`, shows a status badge, renders status-dependent actions, and opens the cancel dialog from Task 3.

**Files:**
- Create: `src/views/portfolio/components/RecurringOrdersTable.tsx`
- Create (test): `src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx`:
```tsx
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { RecurringOrdersTable } from '@/views/portfolio/components/RecurringOrdersTable'
import type { RecurringOrder } from '@/types/recurringOrder'

function makeOrder(overrides: Partial<RecurringOrder> = {}): RecurringOrder {
  return {
    id: 1,
    listing_id: 7,
    side: 'buy',
    quantity: 10,
    account_id: 42,
    interval: 'monthly',
    day_of_month: 15,
    start_date_unix: 1731699200,
    end_date_unix: 0,
    status: 'active',
    created_at: '2026-05-30T00:00:00Z',
    updated_at: '2026-05-30T00:00:00Z',
    ...overrides,
  }
}

const noop = () => {}

describe('RecurringOrdersTable', () => {
  it('shows an empty-state message when there are no orders', () => {
    renderWithProviders(
      <RecurringOrdersTable orders={[]} onPause={noop} onResume={noop} onCancel={noop} />
    )
    expect(screen.getByText(/no recurring orders/i)).toBeInTheDocument()
  })

  it('renders an active order with Pause and Cancel actions', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^resume$/i })).not.toBeInTheDocument()
  })

  it('renders a paused order with Resume and Cancel actions', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'paused' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.getByRole('button', { name: /^resume$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument()
  })

  it('renders a cancelled order with no action buttons', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'cancelled' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^resume$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })

  it('calls onPause with the order id when Pause is clicked', () => {
    const onPause = jest.fn()
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 99, status: 'active' })]}
        onPause={onPause}
        onResume={noop}
        onCancel={noop}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))
    expect(onPause).toHaveBeenCalledWith(99)
  })

  it('opens the confirmation dialog and calls onCancel only after confirming', () => {
    const onCancel = jest.fn()
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 5, status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    // Dialog open — onCancel not fired yet
    expect(onCancel).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))
    expect(onCancel).toHaveBeenCalledWith(5)
  })

  it('disables the row actions while busyId matches', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 7, status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
        busyId={7}
      />
    )
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the component**

Create `src/views/portfolio/components/RecurringOrdersTable.tsx`:
```tsx
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useListingMap } from '@/hooks/useSecurities'
import { CancelRecurringOrderDialog } from '@/views/portfolio/components/CancelRecurringOrderDialog'
import type { RecurringOrder, RecurringOrderStatus } from '@/types/recurringOrder'

interface RecurringOrdersTableProps {
  orders: RecurringOrder[]
  onPause: (id: number) => void
  onResume: (id: number) => void
  onCancel: (id: number) => void
  /** When set, the row with this id renders its action buttons disabled. */
  busyId?: number
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatFrequency(o: RecurringOrder): string {
  if (o.interval === 'weekly') {
    const day = o.day_of_week != null ? WEEKDAYS[o.day_of_week] : ''
    return day ? `Weekly · ${day}` : 'Weekly'
  }
  return o.day_of_month != null ? `Monthly · day ${o.day_of_month}` : 'Monthly'
}

function StatusBadge({ status }: { status: RecurringOrderStatus }) {
  if (status === 'active') return <Badge>Active</Badge>
  if (status === 'paused') return <Badge variant="secondary">Paused</Badge>
  return <Badge variant="outline">Cancelled</Badge>
}

export function RecurringOrdersTable({
  orders,
  onPause,
  onResume,
  onCancel,
  busyId,
}: RecurringOrdersTableProps) {
  const listingMap = useListingMap()
  const [cancelId, setCancelId] = useState<number | null>(null)

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You have no recurring orders. Schedule one from a security's order page.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Security</TableHead>
            <TableHead>Side</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            const busy = busyId === o.id
            const listing = listingMap.get(o.listing_id)
            return (
              <TableRow key={o.id}>
                <TableCell className="font-mono font-semibold">
                  {listing?.ticker ?? `#${o.listing_id}`}
                </TableCell>
                <TableCell className="capitalize">{o.side}</TableCell>
                <TableCell className="text-right">{o.quantity}</TableCell>
                <TableCell>{formatFrequency(o)}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {o.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPause(o.id)}
                        disabled={busy}
                      >
                        Pause
                      </Button>
                    )}
                    {o.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResume(o.id)}
                        disabled={busy}
                      >
                        Resume
                      </Button>
                    )}
                    {o.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCancelId(o.id)}
                        disabled={busy}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <CancelRecurringOrderDialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelId(null)
        }}
        loading={cancelId !== null && busyId === cancelId}
        onConfirm={() => {
          if (cancelId !== null) onCancel(cancelId)
          setCancelId(null)
        }}
      />
    </>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx`
Expected: PASS (all cases green).

- [ ] **Step 5: Commit**

```bash
git add src/views/portfolio/components/RecurringOrdersTable.tsx src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx
git commit -m "feat(recurring-orders): add RecurringOrdersTable with status-aware actions"
```

---

### Task 5: Wire the "Recurring Orders" tab into PortfolioView

**Files:**
- Modify: `src/views/portfolio/PortfolioView.tsx`
- Modify (test): `src/views/portfolio/__tests__/PortfolioView.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/views/portfolio/__tests__/PortfolioView.test.tsx`, add a mock for the recurring-orders API and a test. First add to the existing top-of-file mocks:
```ts
import * as recurringOrdersApi from '@/lib/api/recurringOrders'
```
and add to the `jest.mock(...)` calls near the top:
```ts
jest.mock('@/lib/api/recurringOrders')
```
In the existing `beforeEach`, add a default resolved value:
```ts
jest.mocked(recurringOrdersApi.getMyRecurringOrders).mockResolvedValue([
  {
    id: 1,
    listing_id: 7,
    side: 'buy',
    quantity: 10,
    account_id: 42,
    interval: 'monthly',
    day_of_month: 15,
    start_date_unix: 1731699200,
    end_date_unix: 0,
    status: 'active',
    created_at: '2026-05-30T00:00:00Z',
    updated_at: '2026-05-30T00:00:00Z',
  },
])
```

Add this test inside the `describe('PortfolioView', ...)` block:
```ts
it('shows recurring orders when the Recurring Orders tab is selected', async () => {
  const user = userEvent.setup()
  renderWithProviders(<PortfolioView />)

  await user.click(screen.getByRole('tab', { name: /recurring orders/i }))

  expect(await screen.findByText(/^Quantity$/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/views/portfolio/__tests__/PortfolioView.test.tsx -t "Recurring Orders tab"`
Expected: FAIL — no such tab is rendered.

- [ ] **Step 3: Implement the wiring**

Make these edits to `src/views/portfolio/PortfolioView.tsx`:

(a) Add imports near the other view/hook imports:
```ts
import { RecurringOrdersTable } from '@/views/portfolio/components/RecurringOrdersTable'
import {
  useRecurringOrders,
  usePauseRecurringOrder,
  useResumeRecurringOrder,
  useCancelRecurringOrder,
} from '@/hooks/useRecurringOrders'
```

(b) Extend the tab union and `parseTab`:
```ts
type PortfolioTab = 'holdings' | 'funds' | 'alerts' | 'favorites' | 'recurring-orders'

function parseTab(value: string | null): PortfolioTab {
  if (value === 'funds') return 'funds'
  if (value === 'alerts') return 'alerts'
  if (value === 'favorites') return 'favorites'
  if (value === 'recurring-orders') return 'recurring-orders'
  return 'holdings'
}
```

(c) Add the hooks + handlers next to the other tab hooks (e.g. after the price-alerts handlers, before `handleFilterChange`):
```ts
  const { data: recurringOrders } = useRecurringOrders()
  const pauseRecurringMutation = usePauseRecurringOrder()
  const resumeRecurringMutation = useResumeRecurringOrder()
  const cancelRecurringMutation = useCancelRecurringOrder()
  const handlePauseRecurring = (id: number) => pauseRecurringMutation.mutate(id)
  const handleResumeRecurring = (id: number) => resumeRecurringMutation.mutate(id)
  const handleCancelRecurring = (id: number) => cancelRecurringMutation.mutate(id)
  const recurringBusyId = pauseRecurringMutation.isPending
    ? pauseRecurringMutation.variables
    : resumeRecurringMutation.isPending
      ? resumeRecurringMutation.variables
      : cancelRecurringMutation.isPending
        ? cancelRecurringMutation.variables
        : undefined
```

(d) Add the trigger to `<TabsList>` after the Favorites trigger:
```tsx
          <TabsTrigger value="recurring-orders">Recurring Orders</TabsTrigger>
```

(e) Add the tab content after the favorites `<TabsContent>` (before the closing `</Tabs>`):
```tsx
        <TabsContent value="recurring-orders" className="mt-4">
          <RecurringOrdersTable
            orders={recurringOrders ?? []}
            onPause={handlePauseRecurring}
            onResume={handleResumeRecurring}
            onCancel={handleCancelRecurring}
            busyId={recurringBusyId}
          />
        </TabsContent>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/views/portfolio/__tests__/PortfolioView.test.tsx`
Expected: PASS (new test + all existing portfolio tests).

- [ ] **Step 5: Commit**

```bash
git add src/views/portfolio/PortfolioView.tsx src/views/portfolio/__tests__/PortfolioView.test.tsx
git commit -m "feat(recurring-orders): add Recurring Orders tab to Portfolio"
```

---

### Task 6: Cypress e2e coverage (MANDATORY per CLAUDE.md)

**Files:**
- Create: `cypress/fixtures/recurring-orders.json`
- Create: `cypress/e2e/recurring-orders.cy.ts`

- [ ] **Step 1: Create the fixture**

Create `cypress/fixtures/recurring-orders.json`:
```json
{
  "recurring_orders": [
    {
      "id": 1,
      "listing_id": 7,
      "side": "buy",
      "quantity": 10,
      "account_id": 42,
      "interval": "monthly",
      "day_of_month": 15,
      "start_date_unix": 1731699200,
      "end_date_unix": 0,
      "status": "active",
      "created_at": "2026-05-30T00:00:00Z",
      "updated_at": "2026-05-30T00:00:00Z"
    },
    {
      "id": 2,
      "listing_id": 8,
      "side": "buy",
      "quantity": 5,
      "account_id": 42,
      "interval": "weekly",
      "day_of_week": 1,
      "start_date_unix": 1731699200,
      "end_date_unix": 0,
      "status": "paused",
      "created_at": "2026-05-30T00:00:00Z",
      "updated_at": "2026-05-30T00:00:00Z"
    }
  ]
}
```

- [ ] **Step 2: Write the e2e spec**

Create `cypress/e2e/recurring-orders.cy.ts`. Intercepts use the host-agnostic `**/api/v3/...` glob per the Cypress-maintenance rule:
```ts
describe('Recurring Orders tab', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: { holdings: [], total_count: 0 },
    }).as('getPortfolio')
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      fixture: 'portfolio-summary.json',
    }).as('getSummary')
    cy.intercept('GET', '**/api/v3/me/recurring-orders', {
      fixture: 'recurring-orders.json',
    }).as('getRecurring')
  })

  it('lists the user\'s recurring orders with status-aware actions', () => {
    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.contains('th', 'Frequency').should('be.visible')
    cy.contains('td', 'Monthly · day 15').should('be.visible')
    cy.contains('td', 'Weekly · Monday').should('be.visible')

    // Active row (id 1) has Pause + Cancel; paused row (id 2) has Resume + Cancel
    cy.get('tbody tr').eq(0).contains('button', 'Pause').should('be.visible')
    cy.get('tbody tr').eq(0).contains('button', 'Cancel').should('be.visible')
    cy.get('tbody tr').eq(1).contains('button', 'Resume').should('be.visible')
  })

  it('pauses an active recurring order', () => {
    cy.intercept('POST', '**/api/v3/me/recurring-orders/1/pause', {
      statusCode: 200,
      body: { recurring_order: { id: 1, status: 'paused' } },
    }).as('pause')

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.get('tbody tr').eq(0).contains('button', 'Pause').click()
    cy.wait('@pause').its('request.url').should('include', '/recurring-orders/1/pause')
  })

  it('resumes a paused recurring order', () => {
    cy.intercept('POST', '**/api/v3/me/recurring-orders/2/resume', {
      statusCode: 200,
      body: { recurring_order: { id: 2, status: 'active' } },
    }).as('resume')

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.get('tbody tr').eq(1).contains('button', 'Resume').click()
    cy.wait('@resume').its('request.url').should('include', '/recurring-orders/2/resume')
  })

  it('cancels a recurring order only after confirming in the dialog', () => {
    cy.intercept('POST', '**/api/v3/me/recurring-orders/1/cancel', {
      statusCode: 200,
      body: { recurring_order: { id: 1, status: 'cancelled' } },
    }).as('cancel')

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.get('tbody tr').eq(0).contains('button', 'Cancel').click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cannot be undone/i).should('be.visible')
      cy.contains('button', 'Cancel order').click()
    })
    cy.wait('@cancel').its('request.url').should('include', '/recurring-orders/1/cancel')
  })
})
```

- [ ] **Step 3: Verify no stale API versions and the intercepts use v3**

Run: `grep -rE "/api/v[0-9]" cypress/e2e/recurring-orders.cy.ts`
Expected: every match is `/api/v3/...`. (No v1/v2.)

- [ ] **Step 4: Run the new e2e spec**

Run: `npx cypress run --spec "cypress/e2e/recurring-orders.cy.ts"`
Expected: all 4 tests pass. (If the local runner needs the dev server, start it per the project's usual Cypress workflow, e.g. `npm run dev` in another shell, then re-run.)

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/recurring-orders.json cypress/e2e/recurring-orders.cy.ts
git commit -m "test(recurring-orders): add Cypress e2e coverage for the Recurring Orders tab"
```

---

### Task 7: Quality gates, specification.md, and final verification

**Files:**
- Modify: `specification.md`

- [ ] **Step 1: Run the full quality-gate suite**

Run each and confirm it passes:
```bash
npm test
npm run lint
npx tsc --noEmit
npx prettier --check "src/**/*.{ts,tsx}"
npm run build
```
Expected: all green. Fix any prettier issues with `npx prettier --write` on the touched files and re-commit.

- [ ] **Step 2: Update coverage numbers**

Run: `npm test -- --coverage --coverageReporters=text`
Note the new files' coverage for the specification update.

- [ ] **Step 3: Update `specification.md`**

Per CLAUDE.md's Specification Maintenance rule, update `specification.md`:
- **Project Structure:** add `src/views/portfolio/components/RecurringOrdersTable.tsx`, `src/views/portfolio/components/CancelRecurringOrderDialog.tsx`, `cypress/e2e/recurring-orders.cy.ts`, `cypress/fixtures/recurring-orders.json`.
- **Pages:** note the Portfolio page now has a "Recurring Orders" tab (`?tab=recurring-orders`).
- **Components:** add `RecurringOrdersTable` and `CancelRecurringOrderDialog` with one-line descriptions.
- **API Layer:** add `getMyRecurringOrders`, `pauseRecurringOrder`, `resumeRecurringOrder`, `cancelRecurringOrder`.
- **Custom Hooks:** add `useRecurringOrders`, `usePauseRecurringOrder`, `useResumeRecurringOrder`, `useCancelRecurringOrder`.
- **Test Coverage:** refresh the coverage table and the `_Last updated_` date to `2026-05-30`.

- [ ] **Step 4: Commit**

```bash
git add specification.md
git commit -m "docs(recurring-orders): update specification for Recurring Orders tab"
```

---

## Notes / out of scope

- **Frequencies:** the backend accepts only `weekly` and `monthly` for recurring securities orders (`docs/REST_API_v3.md` §45), and `ScheduleOrderFields.tsx` already offers both. No frequency changes are made — verify this remains true; do not add daily/quarterly.
- No edit UI for recurring orders in this change.
- Recurring **fund** investments (§46) are a separate feature and out of scope.
