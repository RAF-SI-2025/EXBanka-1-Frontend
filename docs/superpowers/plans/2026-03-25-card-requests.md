# Admin Card Requests Page — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin page listing pending card requests with approve/deny actions, following the AdminLoanRequestsPage pattern.

**Architecture:** New types, API functions, and hooks extend the existing cards layer; a `CardRequestDenyDialog` component encapsulates dialog state; `AdminCardRequestsPage` composes these with `useAllClients()` for client name lookup, pagination, and the deny dialog.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Shadcn UI (Dialog, Button, Textarea, Table), React Router v6, Jest + RTL.

**Intentional spec divergences:**
- `CardRequestStatus` uses lowercase (`'pending' | 'approved' | 'rejected'`) to match the REST API response — the spec's URL example shows uppercase but that is a documentation inconsistency; the actual API returns lowercase.
- `CardRequestDenyDialog.onConfirm` is typed `(reason: string) => void` (not `reason?: string`) — the plan intentionally tightens the spec signature so consumers never receive `undefined`; callers pass `''` when the textarea is blank.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types/cardRequest.ts` | Create | `CardRequest`, `CardRequestListResponse`, `CardRequestFilters` types |
| `src/components/ui/textarea.tsx` | Create (shadcn) | Textarea UI primitive |
| `src/__tests__/fixtures/card-fixtures.ts` | Modify | Add `createMockCardRequest` factory |
| `src/lib/api/cards.ts` | Modify | Add `getCardRequests`, `approveCardRequest`, `rejectCardRequest` |
| `src/hooks/useCards.ts` | Modify | Add `useCardRequests`, `useApproveCardRequest`, `useRejectCardRequest` |
| `src/components/cards/CardRequestDenyDialog.tsx` | Create | Deny dialog with optional reason textarea |
| `src/components/cards/CardRequestDenyDialog.test.tsx` | Create | Dialog unit tests |
| `src/pages/AdminCardRequestsPage.tsx` | Create | Admin page: table + approve/deny + pagination |
| `src/pages/AdminCardRequestsPage.test.tsx` | Create | Page integration tests |
| `src/App.tsx` | Modify | Add route `/admin/cards/requests` |
| `src/components/layout/Sidebar.tsx` | Modify | Add "Card Requests" nav link |

---

## Chunk 1: Foundation — Types, Fixture, API, Hooks

### Task 1: Types

**Files:**
- Create: `src/types/cardRequest.ts`

No tests needed — pure type definitions, no logic.

Note: The REST API returns lowercase status values (`"pending"`, `"approved"`, `"rejected"`). `CardRequestStatus` uses lowercase to match the API contract. (The existing `LoanRequestStatus` uses uppercase for legacy reasons — do not copy that inconsistency here.)

- [ ] **Step 1: Create the type file**

```typescript
// src/types/cardRequest.ts
export type CardRequestStatus = 'pending' | 'approved' | 'rejected'

export interface CardRequest {
  id: number
  client_id: number
  account_number: string
  card_brand: string
  card_type: string
  card_name: string
  status: CardRequestStatus
  reason: string
  approved_by: number
  created_at: string
  updated_at: string
}

export interface CardRequestListResponse {
  requests: CardRequest[]
  total: number
}

export interface CardRequestFilters {
  status?: CardRequestStatus
  page?: number
  page_size?: number
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/cardRequest.ts
git commit -m "feat: add CardRequest types"
```

---

### Task 2: Install Textarea component

**Files:**
- Create: `src/components/ui/textarea.tsx` (via shadcn)

Shadcn installs are exempt from TDD per project policy.

- [ ] **Step 1: Install via shadcn**

Run: `npx shadcn@latest add textarea`
Expected: `src/components/ui/textarea.tsx` created, no prompts needed

- [ ] **Step 2: Verify TypeScript is still clean**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/textarea.tsx
git commit -m "feat: add Textarea shadcn component"
```

---

### Task 3: Test fixture

**Files:**
- Modify: `src/__tests__/fixtures/card-fixtures.ts`

The existing file imports `Card` from `@/types/card` and exports `createMockCard`. Add `createMockCardRequest` below it.

- [ ] **Step 1: Add import for CardRequest type at the top of card-fixtures.ts**

The existing first line is:
```typescript
import type { Card } from '@/types/card'
```

Add a new line **after** that import (do not replace or remove anything):
```typescript
import type { CardRequest } from '@/types/cardRequest'
```

- [ ] **Step 2: Add the factory function at the bottom of card-fixtures.ts**

```typescript
export function createMockCardRequest(overrides: Partial<CardRequest> = {}): CardRequest {
  return {
    id: 1,
    client_id: 1,
    account_number: '111000100000000011',
    card_brand: 'visa',
    card_type: 'debit',
    card_name: 'My Main Card',
    status: 'pending',
    reason: '',
    approved_by: 0,
    created_at: '2026-03-25T10:00:00Z',
    updated_at: '2026-03-25T10:00:00Z',
    ...overrides,
  }
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/fixtures/card-fixtures.ts
git commit -m "feat: add createMockCardRequest fixture factory"
```

---

### Task 4: API functions

**Files:**
- Modify: `src/lib/api/cards.ts`

No standalone tests for API functions — they are pure axios wrappers with no conditional logic. Behavior is covered by the `AdminCardRequestsPage` integration tests in Task 7, which mock these hooks end-to-end. (TDD exception: thin data-fetching wrappers with no branching logic.)

Add three functions at the bottom of the existing file. The API endpoints are:
- `GET /api/cards/requests` — query params: `status`, `page`, `page_size`
- `PUT /api/cards/requests/:id/approve` — no body
- `PUT /api/cards/requests/:id/reject` — body: `{ reason: string }` (send empty string if user provides no reason)

- [ ] **Step 1: Add import for new types**

The last import line in `src/lib/api/cards.ts` is:
```typescript
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
```

Add a new line **after** that line (do not replace anything):
```typescript
import type { CardRequestListResponse, CardRequestFilters } from '@/types/cardRequest'
```

- [ ] **Step 2: Add three API functions at the bottom of cards.ts**

```typescript
export async function getCardRequests(
  filters?: CardRequestFilters
): Promise<CardRequestListResponse> {
  const response = await apiClient.get<CardRequestListResponse>('/api/cards/requests', {
    params: filters,
  })
  return response.data
}

export async function approveCardRequest(id: number): Promise<void> {
  await apiClient.put(`/api/cards/requests/${id}/approve`)
}

export async function rejectCardRequest(id: number, reason: string): Promise<void> {
  await apiClient.put(`/api/cards/requests/${id}/reject`, { reason })
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/api/cards.ts
git commit -m "feat: add getCardRequests, approveCardRequest, rejectCardRequest API functions"
```

---

### Task 5: Hooks

**Files:**
- Modify: `src/hooks/useCards.ts`

No standalone tests for hooks — they are thin TanStack Query wrappers. Behavior is covered by the `AdminCardRequestsPage` integration tests in Task 7 which mock these hooks. (TDD exception: hooks with no conditional logic beyond invalidating a query key.)

The existing file already imports from `@/lib/api/cards` and `@tanstack/react-query`. Add three new exports at the bottom.

- [ ] **Step 1: Extend the import from @/lib/api/cards**

Find this block in `src/hooks/useCards.ts` (only replace this import — leave all other imports untouched):
```typescript
import {
  getCards,
  getAccountCards,
  requestCard,
  confirmCardRequest,
  blockCard,
  unblockCard,
  deactivateCard,
  requestCardForAuthorizedPerson,
} from '@/lib/api/cards'
```

Replace it with:
```typescript
import {
  getCards,
  getAccountCards,
  requestCard,
  confirmCardRequest,
  blockCard,
  unblockCard,
  deactivateCard,
  requestCardForAuthorizedPerson,
  getCardRequests,
  approveCardRequest,
  rejectCardRequest,
} from '@/lib/api/cards'
```

- [ ] **Step 2: Add import for CardRequestFilters**

The last import line in `src/hooks/useCards.ts` is:
```typescript
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
```

Add a new line **after** that line (do not replace anything):
```typescript
import type { CardRequestFilters } from '@/types/cardRequest'
```

- [ ] **Step 3: Add three hooks at the bottom of useCards.ts**

```typescript
export function useCardRequests(filters?: CardRequestFilters) {
  return useQuery({
    queryKey: ['card-requests', filters],
    queryFn: () => getCardRequests(filters),
  })
}

export function useApproveCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveCardRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}

export function useRejectCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectCardRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCards.ts
git commit -m "feat: add useCardRequests, useApproveCardRequest, useRejectCardRequest hooks"
```

---

## Chunk 2: UI — Dialog, Page, Route, Sidebar

### Task 6: CardRequestDenyDialog component

**Files:**
- Create: `src/components/cards/CardRequestDenyDialog.tsx`
- Create: `src/components/cards/CardRequestDenyDialog.test.tsx`

Props: `open: boolean`, `onClose: () => void`, `onConfirm: (reason: string) => void`

The dialog resets its internal textarea to `''` whenever it closes (via `useEffect` watching `open`).

- [ ] **Step 1: Write the failing tests**

```typescript
// src/components/cards/CardRequestDenyDialog.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestDenyDialog } from '@/components/cards/CardRequestDenyDialog'

describe('CardRequestDenyDialog', () => {
  const onClose = jest.fn()
  const onConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and textarea when open', () => {
    renderWithProviders(
      <CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.getByText(/deny card request/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/reason/i)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    renderWithProviders(
      <CardRequestDenyDialog open={false} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.queryByText(/deny card request/i)).not.toBeInTheDocument()
  })

  it('calls onConfirm with typed reason when Confirm Deny clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />
    )
    await user.type(screen.getByPlaceholderText(/reason/i), 'Insufficient history')
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(onConfirm).toHaveBeenCalledWith('Insufficient history')
  })

  it('calls onConfirm with empty string when textarea is blank', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />
    )
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })

  it('calls onClose when Cancel clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />
    )
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=CardRequestDenyDialog --no-coverage`
Expected: FAIL — `Cannot find module '@/components/cards/CardRequestDenyDialog'`

- [ ] **Step 3: Implement CardRequestDenyDialog**

```typescript
// src/components/cards/CardRequestDenyDialog.tsx
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CardRequestDenyDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function CardRequestDenyDialog({ open, onClose, onConfirm }: CardRequestDenyDialogProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) setReason('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny Card Request</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)}>
            Confirm Deny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=CardRequestDenyDialog --no-coverage`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/cards/CardRequestDenyDialog.tsx src/components/cards/CardRequestDenyDialog.test.tsx
git commit -m "feat: add CardRequestDenyDialog component"
```

---

### Task 7: AdminCardRequestsPage

**Files:**
- Create: `src/pages/AdminCardRequestsPage.tsx`
- Create: `src/pages/AdminCardRequestsPage.test.tsx`

Reference: `src/pages/AdminLoanRequestsPage.tsx` for the overall pattern.

The page fetches only `status: 'pending'` requests. Client first/last names are resolved via `useAllClients()` clientsById lookup. The deny dialog is rendered once outside the table, controlled by `selectedRequestId` state.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/pages/AdminCardRequestsPage.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminCardRequestsPage } from '@/pages/AdminCardRequestsPage'
import * as useCardsHook from '@/hooks/useCards'
import * as useClientsHook from '@/hooks/useClients'
import { createMockCardRequest } from '@/__tests__/fixtures/card-fixtures'

jest.mock('@/hooks/useCards')
jest.mock('@/hooks/useClients')

const mockClient = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
  date_of_birth: 0,
}

const mockRequest = createMockCardRequest({
  id: 1,
  client_id: 1,
  account_number: '111000100000000011',
  card_type: 'debit',
})

describe('AdminCardRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useApproveCardRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useCardsHook.useRejectCardRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByText(/card requests/i)).toBeInTheDocument()
  })

  it('renders table rows with client name, account number and card type', () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Anić')).toBeInTheDocument()
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
    expect(screen.getByText('debit')).toBeInTheDocument()
  })

  it('calls approve mutation with request id when Approve clicked', async () => {
    const approveMutate = jest.fn()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useApproveCardRequest).mockReturnValue({
      mutate: approveMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^approve$/i }))
    expect(approveMutate).toHaveBeenCalledWith(1)
  })

  it('opens deny dialog when Deny clicked', async () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^deny$/i }))
    expect(screen.getByText(/deny card request/i)).toBeInTheDocument()
  })

  it('calls reject mutation with reason when dialog confirmed', async () => {
    const rejectMutate = jest.fn()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useRejectCardRequest).mockReturnValue({
      mutate: rejectMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^deny$/i }))
    await user.type(screen.getByPlaceholderText(/reason/i), 'Not eligible')
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(rejectMutate).toHaveBeenCalledWith({ id: 1, reason: 'Not eligible' })
  })

  it('calls useCardRequests with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(useCardsHook.useCardRequests).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('calls useCardRequests with page 2 when next arrow clicked', async () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminCardRequestsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useCardsHook.useCardRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=AdminCardRequestsPage --no-coverage`
Expected: FAIL — `Cannot find module '@/pages/AdminCardRequestsPage'`

- [ ] **Step 3: Implement AdminCardRequestsPage**

```typescript
// src/pages/AdminCardRequestsPage.tsx
import { useState } from 'react'
import { useCardRequests, useApproveCardRequest, useRejectCardRequest } from '@/hooks/useCards'
import { useAllClients } from '@/hooks/useClients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { CardRequestDenyDialog } from '@/components/cards/CardRequestDenyDialog'

const PAGE_SIZE = 10

export function AdminCardRequestsPage() {
  const [page, setPage] = useState(1)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

  const { data, isLoading } = useCardRequests({ status: 'pending', page, page_size: PAGE_SIZE })
  const { data: clientsData } = useAllClients()
  const approve = useApproveCardRequest()
  const reject = useRejectCardRequest()

  const requests = data?.requests ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const clientsById = Object.fromEntries((clientsData?.clients ?? []).map((c) => [c.id, c]))

  const isDisabled = approve.isPending || reject.isPending

  const handleDenyConfirm = (reason: string) => {
    if (selectedRequestId !== null) {
      reject.mutate({ id: selectedRequestId, reason })
    }
    setSelectedRequestId(null)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Card Requests</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Card Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => {
                const client = clientsById[req.client_id]
                return (
                  <TableRow key={req.id}>
                    <TableCell>{client?.first_name ?? '—'}</TableCell>
                    <TableCell>{client?.last_name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{req.account_number}</TableCell>
                    <TableCell>{req.card_type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve.mutate(req.id)}
                          disabled={isDisabled}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedRequestId(req.id)}
                          disabled={isDisabled}
                        >
                          Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
      <CardRequestDenyDialog
        open={selectedRequestId !== null}
        onClose={() => setSelectedRequestId(null)}
        onConfirm={handleDenyConfirm}
      />
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=AdminCardRequestsPage --no-coverage`
Expected: 7 tests PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminCardRequestsPage.tsx src/pages/AdminCardRequestsPage.test.tsx
git commit -m "feat: add AdminCardRequestsPage with approve/deny and pagination"
```

---

### Task 8: Route and Sidebar

**Files:**
- Modify: `src/App.tsx` (add import + route)
- Modify: `src/components/layout/Sidebar.tsx` (add nav link)

No new tests — routing wiring is covered by the page's own tests.

- [ ] **Step 1: Add import to App.tsx**

After the existing line:
```typescript
import { AdminLoanRequestsPage } from '@/pages/AdminLoanRequestsPage'
```

Add:
```typescript
import { AdminCardRequestsPage } from '@/pages/AdminCardRequestsPage'
```

- [ ] **Step 2: Add route to App.tsx**

After the existing `/admin/loans/requests` route block:
```typescript
<Route
  path="/admin/loans/requests"
  element={
    <ProtectedRoute requiredRole="Employee">
      <AdminLoanRequestsPage />
    </ProtectedRoute>
  }
/>
```

Add:
```typescript
<Route
  path="/admin/cards/requests"
  element={
    <ProtectedRoute requiredRole="Employee">
      <AdminCardRequestsPage />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: Add nav link to Sidebar.tsx**

In the `EmployeeNav` component, after the existing "Loan Requests" link:
```typescript
<Link to="/admin/loans/requests" className={navLinkClass}>
  Loan Requests
</Link>
```

Add:
```typescript
<Link to="/admin/cards/requests" className={navLinkClass}>
  Card Requests
</Link>
```

- [ ] **Step 4: Run TypeScript check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: wire AdminCardRequestsPage route and sidebar link"
```
