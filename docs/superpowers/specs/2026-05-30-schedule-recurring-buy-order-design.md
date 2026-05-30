# Schedule a Recurring Buy from the Create-Order Form

_Date: 2026-05-30_

## Goal

Let a client schedule a recurring (weekly/monthly) market **buy** directly from the
existing create-order form, optionally combined with an immediate buy, by calling
`POST /api/v3/me/recurring-orders`.

## Context

- The buy/create-order form is `CreateOrderForm`
  (`src/views/orders/components/CreateOrderForm.tsx`), rendered by `CreateOrderView`
  (`src/views/orders/CreateOrderView.tsx`) at route `/securities/order/new`
  (e.g. `?listingId=7&direction=buy&ticker=AAPL`). Reached via **Buy** on a security
  detail page.
- The recurring endpoint is a **Market-order template, scoped to `/me`** (the logged-in
  caller). It has no concept of limit/stop prices, options, forex base accounts, or
  employee on-behalf charging.
- `POST /api/v3/me/recurring-orders` request body:
  `{ listing_id, side, quantity, account_id, interval, day_of_week|day_of_month, start_date_unix, end_date_unix }`.
  Validation: `side ∈ buy/sell`; `interval ∈ weekly/monthly`; weekly requires
  `day_of_week` (0..6), monthly requires `day_of_month` (1..28); `end_date_unix=0` means
  "no end". Response `201 { "recurring_order": { ... } }`.

## Decisions

| Topic | Decision |
|---|---|
| Target form | `CreateOrderForm` at `/securities/order/new` |
| Recurrence input | Frequency only (Weekly / Monthly); the day is derived automatically |
| Funding account | Reuse the account already selected in the form (`account_id`) |
| Partial failure | All-or-nothing **intent**: place the buy first; only schedule if it succeeds |
| When checkbox shows | Market order **and** regular client self-buy (not option/forex/employee-on-behalf) |
| Direction | Buy only |

## UX

- A **"Schedule order"** checkbox appears only when:
  `schedulingEnabled` (passed by the view) **and** `orderType === 'market'`.
  `schedulingEnabled = direction === 'buy' && !isOption && !isForex && !isEmployee`.
  Switching Order Type away from Market hides the checkbox and clears its checked state.
- **Unchecked** — unchanged: one **"Place Order"** button → immediate buy only.
- **Checked**:
  - A **Frequency** `<select>` appears: `Weekly` / `Monthly` (default `Monthly`).
  - The button row becomes two buttons:
    - **"Place order and schedule"** — immediate buy **and** create the recurring order.
    - **"Schedule"** — create the recurring order only, no immediate buy.

## Day derivation (frequency-only)

Computed in the view when building the recurring payload:

- Weekly → `day_of_week = new Date().getDay()` (0..6).
- Monthly → `day_of_month = Math.min(new Date().getDate(), 28)`.
- `start_date_unix = Math.floor(Date.now() / 1000)`.
- `end_date_unix = 0` (no end).

## All-or-nothing sequencing ("Place order and schedule")

True cross-endpoint atomicity is impossible, so:

1. Place the order (existing `createOrder` flow).
2. **Only on success**, create the recurring order.
3. If the buy fails → error toast (global handler); nothing is scheduled.
4. If the buy succeeds but scheduling fails → `notifyError` with a combined message that
   the buy went through but the recurring schedule was not created (no rollback possible).
5. On full success → existing behavior: piggy `'break'` animation + navigate to `/orders`.

The **"Schedule"** button is a single recurring call; success navigates to `/orders`.

## New / changed code

### New

- `src/types/recurringOrder.ts`
  - `type RecurringOrderInterval = 'weekly' | 'monthly'`
  - `interface CreateRecurringOrderPayload { listing_id: number; side: 'buy' | 'sell'; quantity: number; account_id: number; interval: RecurringOrderInterval; day_of_week?: number; day_of_month?: number; start_date_unix: number; end_date_unix: number }`
  - `interface RecurringOrder` — best-effort response shape (id, status, echoed fields,
    timestamps); the create flow does not depend on its contents.
  - `interface CreateRecurringOrderResponse { recurring_order: RecurringOrder }`
- `src/lib/api/recurringOrders.ts`
  - `createRecurringOrder(payload: CreateRecurringOrderPayload): Promise<RecurringOrder>`
    → `POST /me/recurring-orders`, returns `data.recurring_order`. Pure, no side effects.
- `src/hooks/useRecurringOrders.ts`
  - `useCreateRecurringOrder()` — `useMutation` over `createRecurringOrder`, invalidates
    `['recurring-orders']`. No custom `onError` (global mutation toast applies); the
    combined-failure message in the view uses `notifyError`.

### Changed

- `CreateOrderForm.tsx` (already 170 lines, over the 150 limit) — extract state/payload
  logic into a `useCreateOrderForm` hook so the component stays under 150 lines, then add:
  - `schedulingEnabled?: boolean` prop.
  - internal `schedule` (checkbox) + `frequency` state.
  - `onScheduleOnly?: (payload, frequency) => void` and an extended
    `onSubmit(payload, frequency?)` (frequency present ⇒ "place and schedule").
  - the checkbox, the Frequency select, and the two-button row.
- `CreateOrderView.tsx` — compute `schedulingEnabled`, call `useCreateRecurringOrder`,
  build the recurring payload (day derivation), and implement the all-or-nothing
  sequencing + the schedule-only path.

## Error handling (per project rule)

- New mutation has no custom `onError`; the global `mutationCache.onError` toasts on
  failure.
- The only bespoke surface is the combined "bought but not scheduled" message, raised via
  `notifyError` from `@/lib/errors`.
- No empty catches, no `console.error`-only paths.

## Testing (TDD — tests first)

1. `src/lib/api/recurringOrders.test.ts` — posts to `/me/recurring-orders` with the right
   body; returns `recurring_order`.
2. `useRecurringOrders` — mutation calls the API and invalidates `['recurring-orders']`.
3. `CreateOrderForm` —
   - checkbox hidden when `schedulingEnabled=false` or order type ≠ market;
   - checking it reveals the Frequency select and swaps to the two-button row;
   - "Place order and schedule" calls `onSubmit` with the frequency;
   - "Schedule" calls `onScheduleOnly`.
4. `CreateOrderView` — "place and schedule" places then schedules; buy-failure skips the
   schedule; schedule-failure-after-buy surfaces the combined error; "Schedule" only
   schedules.

## Out of scope

- Recurring **sell** orders, limit/stop scheduling, options/forex scheduling, employee
  on-behalf scheduling.
- A management UI to list / pause / resume / cancel recurring orders (separate feature).
- Recurring **fund** investments (`§46`, different endpoint).
