# Recurring Orders Tab — Design

_Date: 2026-05-30_
_Branch: `feature/schedule-recurring-buy-order`_

## Goal

Add a new **Recurring Orders** tab to the Portfolio page that lists the
signed-in user's recurring securities-order templates and lets them
**Pause**, **Resume**, and **Cancel** each one.

## Scope note on frequencies

The backend (`docs/REST_API_v3.md` §45 — Recurring Securities Orders) accepts
**only `weekly` and `monthly`** for the `interval` field:

> `interval` ∈ `weekly` / `monthly`. `day_of_week` (0..6) is required for
> weekly; `day_of_month` (1..28) is required for monthly.

The existing scheduling UI (`src/views/orders/components/ScheduleOrderFields.tsx`)
already offers exactly Weekly and Monthly, so **no new frequencies are added** —
the scheduling form already covers every frequency the backend accepts. This is
verified in code, not changed.

## API endpoints used

| Action | Method + Path |
|--------|---------------|
| List   | `GET  /api/v3/me/recurring-orders` → `{ recurring_orders: [...] }` |
| Pause  | `POST /api/v3/me/recurring-orders/:id/pause`  → `{ recurring_order }` |
| Resume | `POST /api/v3/me/recurring-orders/:id/resume` → `{ recurring_order }` |
| Cancel | `POST /api/v3/me/recurring-orders/:id/cancel` → `{ recurring_order }` (terminal) |

`createRecurringOrder` (`POST /me/recurring-orders`) already exists and is
unchanged.

## Components / layers

### 1. API layer — `src/lib/api/recurringOrders.ts` (extend)

Add four pure functions next to the existing `createRecurringOrder`:

- `getMyRecurringOrders(): Promise<RecurringOrder[]>` — `GET /me/recurring-orders`,
  returns `data.recurring_orders ?? []`.
- `pauseRecurringOrder(id: number): Promise<RecurringOrder>` — `POST .../:id/pause`,
  returns `data.recurring_order`.
- `resumeRecurringOrder(id: number): Promise<RecurringOrder>` — `POST .../:id/resume`.
- `cancelRecurringOrder(id: number): Promise<RecurringOrder>` — `POST .../:id/cancel`.

### 2. Types — `src/types/recurringOrder.ts` (extend)

Add:

```ts
export interface RecurringOrderListResponse {
  recurring_orders: RecurringOrder[]
}
```

The existing `RecurringOrder` interface already carries every display field
(`id`, `listing_id`, `side`, `quantity`, `interval`, `day_of_week?`,
`day_of_month?`, `status`, dates).

### 3. Hooks — `src/hooks/useRecurringOrders.ts` (extend)

- `useRecurringOrders()` → `useQuery({ queryKey: ['recurring-orders'], queryFn: getMyRecurringOrders })`.
  The key matches what `useCreateRecurringOrder` already invalidates.
- `usePauseRecurringOrder()`, `useResumeRecurringOrder()`, `useCancelRecurringOrder()`
  → `useMutation` taking `id: number`, each invalidating `['recurring-orders']`
  on success.

**Error handling:** queries lean on the global `queryCache.onError` toast;
mutations lean on the global `mutationCache.onError` toast (no custom `onError`,
which the error-handling guide names as the correct default). No empty catches,
no `console.error`-only paths.

### 4. Component — `src/views/portfolio/components/RecurringOrdersTable.tsx`

Modeled on `FavoritesTable`. Props:

```ts
interface RecurringOrdersTableProps {
  orders: RecurringOrder[]
  onPause: (id: number) => void
  onResume: (id: number) => void
  onCancel: (id: number) => void
  busyId?: number
}
```

Columns: **Security** (ticker resolved via `useListingMap`, fallback
`#${listing_id}`), **Side** (buy/sell), **Quantity**, **Frequency**
(`Weekly · <weekday>` / `Monthly · day <n>`), **Status** (Badge:
active=green, paused=amber, cancelled=grey), **Actions**.

Per-row actions by status:
- `active`  → Pause + Cancel
- `paused`  → Resume + Cancel
- `cancelled` → none

Each row's buttons are disabled when `busyId === order.id`. Cancelled orders
are shown (audit trail retained on backend) with a status badge and no actions.

Cancel opens a confirmation dialog (see below) and only fires `onCancel` on
confirm.

Empty state: "You have no recurring orders. Schedule one from a security's
order page."

### 5. Component — `src/views/portfolio/components/CancelRecurringOrderDialog.tsx`

Small confirmation dialog built on the existing Shadcn `dialog.tsx` (no new
Shadcn install). Copy: "Cancel this recurring order? This cannot be undone."
Confirm button triggers the cancel; Keep button closes. Extracted as a sibling
so `RecurringOrdersTable` stays under 150 lines.

### 6. Wire into `src/views/portfolio/PortfolioView.tsx`

- Extend the `PortfolioTab` union with `'recurring-orders'` and handle it in
  `parseTab`.
- Add a `<TabsTrigger value="recurring-orders">Recurring Orders</TabsTrigger>`
  and a matching `<TabsContent>` rendering `<RecurringOrdersTable />`, fed by the
  new hooks — same wiring shape as the Favorites tab (`busyId` derived from the
  active mutation's `variables` while pending).

## Testing (TDD — tests written first)

- `src/lib/api/recurringOrders.test.ts` — each new function hits the right
  URL/method and unwraps the response.
- `src/hooks/useRecurringOrders.test.ts` (extend) — list query returns orders;
  each mutation calls the right api fn and invalidates `['recurring-orders']`.
- `src/views/portfolio/__tests__/RecurringOrdersTable.test.tsx` — empty state;
  renders rows; active shows Pause+Cancel; paused shows Resume+Cancel; cancelled
  shows no actions; Cancel opens the dialog and confirm fires `onCancel`; busy
  state disables buttons.
- `src/views/portfolio/__tests__/PortfolioView.test.tsx` (extend) — the new tab
  renders and lists recurring orders.

## Cypress (mandatory per CLAUDE.md)

- `cypress/fixtures/recurring-orders.json` — list fixture matching
  `{ recurring_orders: [...] }`.
- New e2e spec exercising the tab: `cy.intercept('**/api/v3/me/recurring-orders', ...)`
  plus host-agnostic pause/resume/cancel intercepts.

## Docs

- Update `specification.md`: new tab/route param, component, hook, API functions,
  type, and the coverage table.

## Out of scope

- Editing a recurring order (no edit UI in this change).
- Recurring **fund** investments (§46) — separate feature.
- Changing the scheduling form's frequency options (already complete).
