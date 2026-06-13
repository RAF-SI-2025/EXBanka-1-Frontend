# View Modules — Migration Guide

This frontend's submenu routes live in **view modules** under `src/views/<viewName>/`. Each module bundles the entry component, sub-components, hooks, API calls, types, helpers, fixtures, and tests in one directory. The rest of the app imports the module through its single `index.ts` public surface.

## Status (as of 2026-05-16)

**17 view modules** under `src/views/`:

- `shared` — toolkit (`ViewShell`, `LoadingState`, `ErrorState`, `EmptyState`, animation tokens)
- `notificationTemplates`, `otcOptions` — original reference modules
- `adminFees`, `peerBanks`, `exchangeRates`, `paymentRecipients`, `stockExchanges`, `tax`, `funds`, `securities`, `otcPortal`, `otcContracts`, `orders`, `transfers`, `payments`, `settings`

**Settings hub at `/admin/settings`** — single sidebar entry with internal tabs for Notifications, Transfer Fees, Peer Banks, Roles, Interest Rates, Employee Limits, Client Limits. All legacy `/admin/<area>` URLs redirect to the new paths.

**Trading umbrella `src/views/securities/`** hosts the listing hub plus drill-downs for stock / futures / forex / option detail pages. Sibling `src/views/orders/` covers the MyOrders / AdminOrders / CreateOrder triplet using the shared `OrderTable`, `OrderStatusBadge`, `CreateOrderForm`.

**Money movement** is split between `src/views/transfers/` (own-account ↔ own-account) and `src/views/payments/` (external recipient flows + payment history).

**Component folders removed entirely**: `src/components/securities/`, `src/components/orders/`, `src/components/otc/`, `src/components/transfers/`, `src/components/payments/`, most of `src/components/funds/`, `src/components/stockExchanges/`, `src/components/tax/`. Each was drained as its consumer view migrated.

## Folder shape

```
src/views/<viewName>/
  <Name>View.tsx          # Entry component. Imported only via index.ts.
  index.ts                # Public surface — exports the View(s).
  types.ts                # Module-private types.
  api/<viewName>Api.ts    # Pure axios calls, one object literal.
  hooks/use<Feature>.ts   # React Query hooks; tests mock these.
  components/*.tsx        # Sub-components used only by this module.
  lib/*.ts                # Pure helpers.
  __tests__/
    fixtures.ts           # Factory helpers used by this view's tests.
    <Name>View.test.tsx   # Behavioural test.
    *.test.{ts,tsx}       # Per-component / per-hook / per-api tests.
```

Anything **only** consumed by this view goes inside the directory. Anything shared with other views stays in `@/components/ui/*`, `@/hooks/useAuth`, `@/lib/api/axios`, etc.

## Shared toolkit (`src/views/shared/`)

Every entry view composes from one toolkit so the platform looks and animates consistently:

| Export | Purpose |
| --- | --- |
| `ViewShell` | Animated page wrapper with optional title / subtitle / actions header |
| `LoadingState` | Pulsing `Loading…` placeholder (`data-testid="view-loading"`) |
| `ErrorState` | Destructive-text error message (`data-testid="view-error"`) |
| `EmptyState` | Centered empty placeholder with optional hint and action |
| `viewEnter`, `cardEnter`, `panelEnter`, `rowEnter`, `dialogEnter`, `tabContentEnter` | `tw-animate-css` class strings |
| `hoverLift` | Hover affordance for clickable rows |

Animations use `tw-animate-css`; no extra runtime dependency. Every view fades + slides in on mount, rows fade in for a subtle stagger, and tab content fades when switched.

## What's left

The 35 pages still living in `src/pages/` are all wrapped in `ViewShell` and use the shared loading/empty states — visual consistency is complete. The two follow-up patterns:

1. **Heavyweight pages with shared components**: `Account*`, `AdminAccount*`, `Client*`, `Employee*`, `Loan*` — each has feature components in `src/components/<feature>/` that could be co-located into a new `src/views/<area>/` module. The visual layer is done; only file organisation remains.
2. **Auth pages** (`Login`, `PasswordReset*`, `Activation`): live under `AuthLayout` and don't need `ViewShell`. They can be moved to `src/views/auth/` for symmetry but the UX is already complete.

Use any of the existing modules as a template; the cleanest exemplar of a multi-view module is `src/views/securities/` (5 entry views + sub-components + co-located tests).

## How to migrate a page (recap)

1. Create `src/views/<viewName>/` mirroring the shape above.
2. Move types, API, hooks that are exclusive to the view. Keep shared ones (`useAccounts`, `useAuth`, …) where they are.
3. Move view-only components from `src/components/<feature>/`. Update `hoverLift`/`rowEnter` on table rows.
4. Build `<Name>View.tsx` wrapping the body in `<ViewShell title=… subtitle=… actions={…}>` and replace ad-hoc placeholders with `LoadingState` / `ErrorState` / `EmptyState`.
5. Add `index.ts` exporting the view.
6. Move tests into `__tests__/`. Mock the new `<viewName>Api` object instead of per-function API. Update `getByTestId('loading-spinner')` → `getByTestId('view-loading')`.
7. Wire the route in `src/App.tsx`.
8. Delete the old files in `src/pages/`, `src/hooks/`, `src/lib/api/`, `src/types/`, `src/components/<feature>/`, and any orphan fixtures.

Run `npx tsc --noEmit && npx jest && npm run build` after each migration; each module should leave the suite green.
