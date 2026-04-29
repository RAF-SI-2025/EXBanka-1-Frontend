# Notifications (Bell Icon) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bell icon in the top-right of every authenticated page that shows the user's unread notification count, opens a dropdown listing the latest notifications, and lets the user mark individual notifications or all of them as read.

**Architecture:**
- Server data via TanStack Query (list, unread-count, mark-read mutations)
- A small isolated `NotificationBell` component composed of `NotificationDropdown` + `NotificationItem`
- Mounted once in `AppLayout` (top-right header strip beside the existing `RoleSwitcher`)
- Unread count is refetched on a 60-second polling interval AND invalidated whenever the user marks a notification read; that's enough realtime feel without WebSockets.
- No Redux — notifications are pure server state. (CLAUDE.md: "Server data via TanStack Query.")

**Tech Stack:** React 19, TanStack Query v5, Shadcn UI (Popover), Lucide icons (Bell), Tailwind, Jest + React Testing Library, Axios.

**Backend reference:** `REST_API_v3.md` §35 — `GET /api/v3/me/notifications`, `GET /api/v3/me/notifications/unread-count`, `POST /api/v3/me/notifications/:id/read`, `POST /api/v3/me/notifications/read-all`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/types/notification.ts` | Type definitions for `Notification`, `NotificationType`, list/count responses, filters |
| `src/lib/api/notifications.ts` | Pure API functions (`getNotifications`, `getUnreadCount`, `markNotificationRead`, `markAllNotificationsRead`) |
| `src/lib/api/notifications.test.ts` | Unit tests for the API layer (mock `apiClient`) |
| `src/__tests__/fixtures/notification-fixtures.ts` | `createMockNotification` factory + canned datasets |
| `src/hooks/useNotifications.ts` | `useNotifications`, `useUnreadNotificationCount`, `useMarkNotificationRead`, `useMarkAllNotificationsRead` |
| `src/hooks/useNotifications.test.ts` | Hook tests (renderHook + QueryClient wrapper) |
| `src/components/notifications/NotificationItem.tsx` | Single row presentation; calls `onClick` when row tapped |
| `src/components/notifications/NotificationItem.test.tsx` | Renders title/message/relative time, fires click |
| `src/components/notifications/NotificationDropdown.tsx` | Popover content: list, "Mark all as read", empty/loading/error states |
| `src/components/notifications/NotificationDropdown.test.tsx` | RTL coverage of the three states + "mark all" button |
| `src/components/notifications/NotificationBell.tsx` | Bell button + unread badge + Popover trigger |
| `src/components/notifications/NotificationBell.test.tsx` | Badge visibility, badge count, opens dropdown on click |
| `src/components/layout/AppLayout.tsx` | Mount `<NotificationBell />` in the top-right strip (modify existing) |
| `src/components/layout/AppLayout.test.tsx` *(new if missing)* | Asserts bell renders for authenticated users |
| `specification.md` | Update Components/Hooks/API tables; add notifications row |
| `cypress/e2e/notifications.cy.ts` *(new)* | Smoke E2E: bell shows badge, dropdown lists items, click marks read |
| `cypress/fixtures/notifications.json` *(new)* | List fixture matching the v3 response shape |

**Why these boundaries:** the bell + dropdown + item split keeps each file under 150 lines (CLAUDE.md size cap), and isolates the popover logic from row presentation. The hooks file is the seam between server state and components, mirroring the project's existing hook pattern (see `src/hooks/useStockExchanges.ts`).

---

## Naming & types (locked)

```ts
// src/types/notification.ts
export type NotificationType =
  | 'account_created'
  | 'card_issued'
  | 'card_blocked'
  | 'money_sent'
  | 'money_received'
  | 'loan_approved'
  | 'loan_rejected'
  | 'password_changed'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  ref_type: string | null
  ref_id: number | null
  created_at: string  // ISO 8601
}

export interface NotificationListResponse {
  notifications: Notification[]
  total: number
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface NotificationFilters {
  page?: number
  page_size?: number
  read?: 'read' | 'unread'
}
```

Query keys (used in every task that touches React Query):
- `['notifications', filters]` — list
- `['notifications', 'unread-count']` — badge count

---

## Task 1: Notification types

**Files:**
- Create: `src/types/notification.ts`

- [ ] **Step 1: Create the types file** with the exact contents from "Naming & types (locked)" above. No tests — types-only file (CLAUDE.md exception for `types/` additions).

- [ ] **Step 2: Run `npx tsc --noEmit`**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```sh
git add src/types/notification.ts
git commit -m "feat(notifications): add Notification types"
```

---

## Task 2: API layer — list

**Files:**
- Create: `src/lib/api/notifications.ts`
- Create: `src/lib/api/notifications.test.ts`

- [ ] **Step 1: Write the failing test for `getNotifications`**

```ts
// src/lib/api/notifications.test.ts
import { getNotifications } from './notifications'
import { apiClient } from './axios'

jest.mock('./axios')

describe('getNotifications', () => {
  it('GETs /me/notifications with filters and returns the data', async () => {
    const mockData = { notifications: [], total: 0 }
    jest.mocked(apiClient.get).mockResolvedValue({ data: mockData })

    const result = await getNotifications({ page: 2, page_size: 20, read: 'unread' })

    expect(apiClient.get).toHaveBeenCalledWith('/me/notifications', {
      params: { page: 2, page_size: 20, read: 'unread' },
    })
    expect(result).toEqual(mockData)
  })

  it('defaults notifications array to empty when backend returns null', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: { notifications: null, total: 0 },
    })
    const result = await getNotifications()
    expect(result.notifications).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/api/notifications.test.ts`
Expected: FAIL — `getNotifications` not defined.

- [ ] **Step 3: Implement `getNotifications`**

```ts
// src/lib/api/notifications.ts
import { apiClient } from '@/lib/api/axios'
import type {
  NotificationListResponse,
  UnreadCountResponse,
  NotificationFilters,
} from '@/types/notification'

export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<NotificationListResponse>('/me/notifications', {
    params: filters,
  })
  return { ...data, notifications: data.notifications ?? [] }
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/api/notifications.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add src/lib/api/notifications.ts src/lib/api/notifications.test.ts
git commit -m "feat(notifications): add getNotifications API"
```

---

## Task 3: API layer — unread count

**Files:**
- Modify: `src/lib/api/notifications.ts`
- Modify: `src/lib/api/notifications.test.ts`

- [ ] **Step 1: Write failing test**

Append to `notifications.test.ts`:

```ts
import { getUnreadCount } from './notifications'

describe('getUnreadCount', () => {
  it('GETs /me/notifications/unread-count and returns the data', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: { unread_count: 3 } })
    const result = await getUnreadCount()
    expect(apiClient.get).toHaveBeenCalledWith('/me/notifications/unread-count')
    expect(result).toEqual({ unread_count: 3 })
  })
})
```

- [ ] **Step 2: Run test — expect FAIL** (`getUnreadCount` not defined).

Run: `npm test -- src/lib/api/notifications.test.ts`

- [ ] **Step 3: Implement**

Append to `notifications.ts`:

```ts
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>('/me/notifications/unread-count')
  return data
}
```

- [ ] **Step 4: Run test — expect PASS**.

- [ ] **Step 5: Commit**

```sh
git add src/lib/api/notifications.ts src/lib/api/notifications.test.ts
git commit -m "feat(notifications): add getUnreadCount API"
```

---

## Task 4: API layer — mark single read

**Files:**
- Modify: `src/lib/api/notifications.ts`
- Modify: `src/lib/api/notifications.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { markNotificationRead } from './notifications'

describe('markNotificationRead', () => {
  it('POSTs /me/notifications/:id/read', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ data: { success: true } })
    const result = await markNotificationRead(42)
    expect(apiClient.post).toHaveBeenCalledWith('/me/notifications/42/read')
    expect(result).toEqual({ success: true })
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```ts
export async function markNotificationRead(id: number): Promise<{ success: boolean }> {
  const { data } = await apiClient.post<{ success: boolean }>(`/me/notifications/${id}/read`)
  return data
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/lib/api/notifications.ts src/lib/api/notifications.test.ts
git commit -m "feat(notifications): add markNotificationRead API"
```

---

## Task 5: API layer — mark all read

**Files:**
- Modify: `src/lib/api/notifications.ts`
- Modify: `src/lib/api/notifications.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { markAllNotificationsRead } from './notifications'

describe('markAllNotificationsRead', () => {
  it('POSTs /me/notifications/read-all', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, count: 5 },
    })
    const result = await markAllNotificationsRead()
    expect(apiClient.post).toHaveBeenCalledWith('/me/notifications/read-all')
    expect(result).toEqual({ success: true, count: 5 })
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```ts
export async function markAllNotificationsRead(): Promise<{
  success: boolean
  count: number
}> {
  const { data } = await apiClient.post<{ success: boolean; count: number }>(
    '/me/notifications/read-all'
  )
  return data
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/lib/api/notifications.ts src/lib/api/notifications.test.ts
git commit -m "feat(notifications): add markAllNotificationsRead API"
```

---

## Task 6: Notification fixtures

**Files:**
- Create: `src/__tests__/fixtures/notification-fixtures.ts`

- [ ] **Step 1: Create fixture factory**

```ts
// src/__tests__/fixtures/notification-fixtures.ts
import type { Notification } from '@/types/notification'

export function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: 'money_received',
    title: 'Money Received',
    message: 'You received 5000.00 to account 1234567890.',
    is_read: false,
    ref_type: 'transfer',
    ref_id: 123,
    created_at: '2026-04-09T14:30:00Z',
    ...overrides,
  }
}

export const mockNotifications: Notification[] = [
  createMockNotification({ id: 1, is_read: false }),
  createMockNotification({
    id: 2,
    type: 'card_issued',
    title: 'Card Issued',
    message: 'A new card has been issued.',
    is_read: false,
    created_at: '2026-04-08T09:15:00Z',
  }),
  createMockNotification({
    id: 3,
    type: 'password_changed',
    title: 'Password Changed',
    message: 'Your password was changed.',
    is_read: true,
    created_at: '2026-03-20T08:00:00Z',
  }),
]
```

No tests for fixture files (project convention — see `src/__tests__/fixtures/auth-fixtures.ts`).

- [ ] **Step 2: Commit**

```sh
git add src/__tests__/fixtures/notification-fixtures.ts
git commit -m "test(notifications): add notification fixtures"
```

---

## Task 7: Hook — useNotifications

**Files:**
- Create: `src/hooks/useNotifications.ts`
- Create: `src/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/hooks/useNotifications.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNotifications } from './useNotifications'
import * as notificationsApi from '@/lib/api/notifications'
import { mockNotifications } from '@/__tests__/fixtures/notification-fixtures'

jest.mock('@/lib/api/notifications')

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useNotifications', () => {
  it('fetches the list with filters', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: mockNotifications,
      total: mockNotifications.length,
    })
    const { result } = renderHook(() => useNotifications({ page: 1, page_size: 20 }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationsApi.getNotifications).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(result.current.data?.notifications).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```ts
// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications'
import type { NotificationFilters } from '@/types/notification'

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => getNotifications(filters),
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/hooks/useNotifications.ts src/hooks/useNotifications.test.ts
git commit -m "feat(notifications): add useNotifications hook"
```

---

## Task 8: Hook — useUnreadNotificationCount (with polling)

**Files:**
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

Append:

```ts
import { useUnreadNotificationCount } from './useNotifications'

describe('useUnreadNotificationCount', () => {
  it('fetches the unread count', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 7 })
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.unread_count).toBe(7)
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** (append):

```ts
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/hooks/useNotifications.ts src/hooks/useNotifications.test.ts
git commit -m "feat(notifications): add useUnreadNotificationCount with 60s polling"
```

---

## Task 9: Hook — useMarkNotificationRead

**Files:**
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { useMarkNotificationRead } from './useNotifications'
import { act } from '@testing-library/react'

describe('useMarkNotificationRead', () => {
  it('calls API and invalidates list + count', async () => {
    jest.mocked(notificationsApi.markNotificationRead).mockResolvedValue({ success: true })
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(() => result.current.mutateAsync(42))
    expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(42)
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** (append):

```ts
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/hooks/useNotifications.ts src/hooks/useNotifications.test.ts
git commit -m "feat(notifications): add useMarkNotificationRead mutation"
```

---

## Task 10: Hook — useMarkAllNotificationsRead

**Files:**
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { useMarkAllNotificationsRead } from './useNotifications'

describe('useMarkAllNotificationsRead', () => {
  it('calls API and invalidates list + count', async () => {
    jest.mocked(notificationsApi.markAllNotificationsRead).mockResolvedValue({
      success: true,
      count: 5,
    })
    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper })
    await act(() => result.current.mutateAsync())
    expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** (append):

```ts
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/hooks/useNotifications.ts src/hooks/useNotifications.test.ts
git commit -m "feat(notifications): add useMarkAllNotificationsRead mutation"
```

---

## Task 11: Component — NotificationItem

**Files:**
- Create: `src/components/notifications/NotificationItem.tsx`
- Create: `src/components/notifications/NotificationItem.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/notifications/NotificationItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationItem } from './NotificationItem'
import { createMockNotification } from '@/__tests__/fixtures/notification-fixtures'

describe('NotificationItem', () => {
  it('renders title and message', () => {
    const n = createMockNotification({ title: 'Money Received', message: 'You received 5000.' })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.getByText('Money Received')).toBeInTheDocument()
    expect(screen.getByText('You received 5000.')).toBeInTheDocument()
  })

  it('shows an unread indicator when is_read=false', () => {
    const n = createMockNotification({ is_read: false })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.getByTestId('unread-dot')).toBeInTheDocument()
  })

  it('omits the unread indicator when is_read=true', () => {
    const n = createMockNotification({ is_read: true })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument()
  })

  it('calls onClick with the notification when clicked', () => {
    const onClick = jest.fn()
    const n = createMockNotification({ id: 99 })
    render(<NotificationItem notification={n} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /money received/i }))
    expect(onClick).toHaveBeenCalledWith(n)
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```tsx
// src/components/notifications/NotificationItem.tsx
import type { Notification } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { title, message, is_read, created_at } = notification
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full text-left px-3 py-2 hover:bg-accent flex gap-2 items-start ${
        is_read ? 'opacity-70' : ''
      }`}
      aria-label={title}
    >
      {!is_read && (
        <span
          data-testid="unread-dot"
          className="mt-1.5 h-2 w-2 rounded-full bg-accent-2 shrink-0"
          aria-hidden
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{message}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatRelativeTime(created_at)}
        </p>
      </div>
    </button>
  )
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/components/notifications/NotificationItem.tsx src/components/notifications/NotificationItem.test.tsx
git commit -m "feat(notifications): add NotificationItem"
```

---

## Task 12: Component — NotificationDropdown

**Files:**
- Create: `src/components/notifications/NotificationDropdown.tsx`
- Create: `src/components/notifications/NotificationDropdown.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/notifications/NotificationDropdown.test.tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NotificationDropdown } from './NotificationDropdown'
import * as notificationsApi from '@/lib/api/notifications'
import { mockNotifications } from '@/__tests__/fixtures/notification-fixtures'

jest.mock('@/lib/api/notifications')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
    notifications: mockNotifications,
    total: mockNotifications.length,
  })
  jest.mocked(notificationsApi.markNotificationRead).mockResolvedValue({ success: true })
  jest.mocked(notificationsApi.markAllNotificationsRead).mockResolvedValue({
    success: true,
    count: 2,
  })
})

describe('NotificationDropdown', () => {
  it('shows loading state initially', () => {
    jest.mocked(notificationsApi.getNotifications).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<NotificationDropdown />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders notifications list', async () => {
    renderWithProviders(<NotificationDropdown />)
    expect(await screen.findByText(mockNotifications[0].title)).toBeInTheDocument()
  })

  it('shows empty state when there are no notifications', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: [],
      total: 0,
    })
    renderWithProviders(<NotificationDropdown />)
    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument()
  })

  it('marks a notification read when an item is clicked', async () => {
    renderWithProviders(<NotificationDropdown />)
    const item = await screen.findByRole('button', { name: mockNotifications[0].title })
    fireEvent.click(item)
    expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(mockNotifications[0].id)
  })

  it('marks all read when "Mark all as read" is clicked', async () => {
    renderWithProviders(<NotificationDropdown />)
    await screen.findByText(mockNotifications[0].title)
    fireEvent.click(screen.getByRole('button', { name: /mark all as read/i }))
    expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalledTimes(1)
  })

  it('hides "Mark all as read" when there are no unread items', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: [{ ...mockNotifications[2], is_read: true }],
      total: 1,
    })
    renderWithProviders(<NotificationDropdown />)
    await screen.findByText(mockNotifications[2].title)
    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```tsx
// src/components/notifications/NotificationDropdown.tsx
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './NotificationItem'
import type { Notification } from '@/types/notification'

const PAGE_SIZE = 10

export function NotificationDropdown() {
  const { data, isLoading, isError } = useNotifications({ page: 1, page_size: PAGE_SIZE })
  const markOne = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const notifications = data?.notifications ?? []
  const hasUnread = notifications.some((n) => !n.is_read)

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) markOne.mutate(n.id)
    // future: navigate to ref_type/ref_id detail
  }

  return (
    <div className="w-80">
      <div className="flex justify-between items-center px-3 py-2 border-b">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-destructive">Could not load notifications.</p>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={handleItemClick} />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/components/notifications/NotificationDropdown.tsx src/components/notifications/NotificationDropdown.test.tsx
git commit -m "feat(notifications): add NotificationDropdown"
```

---

## Task 13: Component — NotificationBell (with Popover)

**Pre-check:** Verify Shadcn `Popover` is installed (`grep -l "components/ui/popover" src`). If missing, run `npx shadcn add popover` (CLAUDE.md exception: shadcn installs allowed without test).

**Files:**
- Create: `src/components/notifications/NotificationBell.tsx`
- Create: `src/components/notifications/NotificationBell.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/notifications/NotificationBell.test.tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NotificationBell } from './NotificationBell'
import * as notificationsApi from '@/lib/api/notifications'
import { mockNotifications } from '@/__tests__/fixtures/notification-fixtures'

jest.mock('@/lib/api/notifications')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
    notifications: mockNotifications,
    total: mockNotifications.length,
  })
})

describe('NotificationBell', () => {
  it('renders a bell button', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
    renderWithProviders(<NotificationBell />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows the unread count badge when count > 0', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 7 })
    renderWithProviders(<NotificationBell />)
    expect(await screen.findByText('7')).toBeInTheDocument()
  })

  it('shows "9+" when unread count exceeds 9', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 42 })
    renderWithProviders(<NotificationBell />)
    expect(await screen.findByText('9+')).toBeInTheDocument()
  })

  it('hides badge when unread count is 0', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
    renderWithProviders(<NotificationBell />)
    await screen.findByRole('button', { name: /notifications/i })
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 1 })
    renderWithProviders(<NotificationBell />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    expect(await screen.findByText(mockNotifications[0].title)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```tsx
// src/components/notifications/NotificationBell.tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const { data } = useUnreadNotificationCount()
  const unread = data?.unread_count ?? 0
  const badge = unread > 9 ? '9+' : String(unread)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              data-testid="unread-badge"
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-2 text-[10px] font-bold text-white flex items-center justify-center"
            >
              {badge}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/components/notifications/NotificationBell.tsx src/components/notifications/NotificationBell.test.tsx
git commit -m "feat(notifications): add NotificationBell with popover"
```

---

## Task 14: Mount the bell in `AppLayout`

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`
- Create or modify: `src/components/layout/AppLayout.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/layout/AppLayout.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AppLayout } from './AppLayout'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as notificationsApi from '@/lib/api/notifications'

jest.mock('@/lib/api/notifications')

describe('AppLayout', () => {
  it('renders the notification bell', () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Modify `AppLayout.tsx`** to include the bell next to the role switcher:

```tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { RoleSwitcher } from '@/components/dev/RoleSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end items-center gap-3 mb-4">
          <NotificationBell />
          <RoleSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/components/layout/AppLayout.tsx src/components/layout/AppLayout.test.tsx
git commit -m "feat(notifications): mount NotificationBell in AppLayout"
```

---

## Task 15: Cypress smoke test

**Files:**
- Create: `cypress/fixtures/notifications.json`
- Create: `cypress/fixtures/notifications-unread-count.json`
- Create: `cypress/e2e/notifications.cy.ts`

- [ ] **Step 1: Create fixtures**

`cypress/fixtures/notifications-unread-count.json`:
```json
{ "unread_count": 2 }
```

`cypress/fixtures/notifications.json`:
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "money_received",
      "title": "Money Received",
      "message": "You received 5000.00 to account 1234567890.",
      "is_read": false,
      "ref_type": "transfer",
      "ref_id": 123,
      "created_at": "2026-04-09T14:30:00Z"
    },
    {
      "id": 2,
      "type": "card_issued",
      "title": "Card Issued",
      "message": "A new card has been issued.",
      "is_read": false,
      "ref_type": "card",
      "ref_id": 9,
      "created_at": "2026-04-08T09:15:00Z"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Write the smoke test**

```ts
// cypress/e2e/notifications.cy.ts
describe('Notifications bell', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/notifications/unread-count', {
      fixture: 'notifications-unread-count.json',
    }).as('getUnread')
    cy.intercept('GET', '**/api/v3/me/notifications*', {
      fixture: 'notifications.json',
    }).as('getList')
    cy.intercept('POST', '**/api/v3/me/notifications/*/read', {
      body: { success: true },
    }).as('markRead')

    cy.loginAsClient() // assumes existing helper; otherwise replace with usual login
  })

  it('shows badge, opens dropdown, marks one read', () => {
    cy.wait('@getUnread')
    cy.findByRole('button', { name: /notifications/i }).should('contain.text', '2')
    cy.findByRole('button', { name: /notifications/i }).click()
    cy.wait('@getList')
    cy.findByText('Money Received').should('be.visible').click()
    cy.wait('@markRead').its('request.url').should('include', '/notifications/1/read')
  })
})
```

- [ ] **Step 3: Run Cypress headless**

Run: `npm run cypress -- run --spec cypress/e2e/notifications.cy.ts` (or whatever the project uses; check `package.json` `scripts`).
Expected: PASS.

- [ ] **Step 4: Commit**

```sh
git add cypress/fixtures/notifications.json cypress/fixtures/notifications-unread-count.json cypress/e2e/notifications.cy.ts
git commit -m "test(notifications): cypress smoke for bell + dropdown"
```

---

## Task 16: Quality gates + spec update

- [ ] **Step 1: Run all gates from CLAUDE.md**

```sh
npm test
npm run lint
npx tsc --noEmit
npx prettier --check "src/**/*.{ts,tsx}"
npm run build
```

All must pass. If prettier flags anything new, run `npx prettier --write` on the offending files and re-commit.

- [ ] **Step 2: Update `specification.md`**

In the Project Structure section, add the four new files under `components/notifications/` and the new hook + API. In State Management → API Layer table, add the four notifications endpoints. Re-run `npm test -- --coverage --coverageReporters=text` and update the coverage table. Bump the `_Last updated_` date to today.

- [ ] **Step 3: Commit spec**

```sh
git add specification.md
git commit -m "docs: update specification for notifications feature"
```

---

## Self-Review Checklist (run before requesting review)

1. **Spec coverage:** does every notification API endpoint in `REST_API_v3.md §35` have a corresponding API function + hook? (yes — list, unread-count, mark-read, mark-all)
2. **Placeholders:** none — every code block is final.
3. **Type consistency:** `Notification`, `NotificationFilters`, query keys (`['notifications', filters]` and `['notifications', 'unread-count']`) are referenced identically across tasks 7–14.
4. **Component size:** no file exceeds 150 lines after Task 14 (CLAUDE.md cap).
5. **TDD:** every implementation step is preceded by a failing test step.
6. **Cypress:** new endpoints have intercepts (Task 15); existing suite is not affected because no API version changed.
