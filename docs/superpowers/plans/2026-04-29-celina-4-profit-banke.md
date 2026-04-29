# Celina 4 — Profit Banke Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the supervisor-only "Bank Profit" portal per `Celina 4(Nova).md §Portal: Profit Banke`. Two read-mostly pages: **Actuary Performances** (per-employee realised profit) and **Bank Fund Positions** (the bank's stake in each investment fund). The fund positions page also exposes Invest / Redeem actions that act on behalf of the bank.

**Architecture:**
- Pure React Query consumption against §31 `/actuaries/performance` and §30 `/investment-funds/positions` (and the existing invest/redeem endpoints).
- Two routes under `/admin/profit/...` gated by per-page permissions:
  - `/admin/profit/actuaries` requires `actuaries.read.all`
  - `/admin/profit/funds` requires `funds.bank-position-read`
- Reuse the `InvestInFundDialog` and `RedeemFromFundDialog` components from the Investment Funds plan (they already accept `on_behalf_of_type='bank'` for employees).
- No new types — reuse `Fund`, `ClientFundPosition` from `src/types/fund.ts` (when phase 3 lands), plus a new `ActuaryPerformance` type.

**Tech Stack:** React 19, TanStack Query v5, Shadcn UI, Tailwind, react-router v6, Jest + RTL.

**Backend reference:** `REST_API_v3.md` §30 `GET /investment-funds/positions`, §31 `GET /actuaries/performance`, plus invest/redeem from §30.

**Dependencies:** Phase 3 (Investment Funds) must land first — this plan reuses its dialogs and routes to fund detail.

---

## Locked API contract

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/v3/actuaries/performance` | `actuaries.read.all` | Realised-profit feed per acting employee |
| `GET /api/v3/investment-funds/positions` | `funds.bank-position-read` | Bank's positions in each fund |
| `POST /api/v3/investment-funds/:id/invest` | any (`OwnerIsBankIfEmployee`) | Bank invest (employee passes `on_behalf_of_type: 'bank'`) |
| `POST /api/v3/investment-funds/:id/redeem` | any (`OwnerIsBankIfEmployee`) | Bank redeem (`on_behalf_of_type: 'bank'`) — fee is 0 for bank redemptions |

```ts
// src/types/profit.ts — new
export interface ActuaryPerformance {
  employee_id: number
  first_name: string
  last_name: string
  position: string
  realised_profit_rsd: string
  trade_count: number
}

export interface BankFundPosition {
  fund_id: number
  fund_name: string
  manager_employee_id: number
  total_contributed_rsd: string
  current_value_rsd: string
  percentage_fund: string
  profit_rsd: string
}
```

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/profit.ts` | Create | `ActuaryPerformance`, `BankFundPosition` |
| `src/__tests__/fixtures/profit-fixtures.ts` | Create | factories + datasets |
| `src/lib/api/profit.ts` | Create | `getActuaryPerformance()`, `getBankFundPositions()` |
| `src/lib/api/profit.test.ts` | Create | Tests with `apiClient` mocked |
| `src/hooks/useProfit.ts` | Create | `useActuaryPerformance()`, `useBankFundPositions()` |
| `src/hooks/useProfit.test.ts` | Create | Hook tests |
| `src/components/profit/ActuaryPerformanceTable.tsx` | Create | Sortable table by `realised_profit_rsd` |
| `src/components/profit/ActuaryPerformanceTable.test.tsx` | Create | RTL |
| `src/components/profit/BankFundPositionsTable.tsx` | Create | Table with Invest / Redeem actions per row |
| `src/components/profit/BankFundPositionsTable.test.tsx` | Create | RTL |
| `src/pages/ActuaryPerformancePage.tsx` | Create | Wraps `ActuaryPerformanceTable` |
| `src/pages/ActuaryPerformancePage.test.tsx` | Create | Page-level RTL |
| `src/pages/BankFundPositionsPage.tsx` | Create | Wraps `BankFundPositionsTable` + Invest/Redeem dialogs |
| `src/pages/BankFundPositionsPage.test.tsx` | Create | Page-level RTL |
| `src/App.tsx` | Modify | Add `/admin/profit/actuaries` + `/admin/profit/funds` routes |
| `src/components/layout/Sidebar.tsx` | Modify | New "Bank Profit" group with two links |
| `cypress/fixtures/actuary-performance.json`, `bank-fund-positions.json` | Create | Match §31 / §30 |
| `cypress/e2e/profit-banke.cy.ts` | Create | Smoke: supervisor logs in → both pages render → bank-side invest works |
| `specification.md` | Modify | Routes, Pages, Components, API, Hooks, Types, Coverage |

---

## Sidebar / route additions

| Route | Page | Visibility |
|---|---|---|
| `/admin/profit/actuaries` | `ActuaryPerformancePage` | `actuaries.read.all` |
| `/admin/profit/funds` | `BankFundPositionsPage` | `funds.bank-position-read` |

Sidebar (`EmployeeNav` only — clients never see this group):

```tsx
{(hasActuariesReadAll || hasFundsBankPositionRead) && (
  <div className="mt-2">
    <p className="...uppercase tracking-wider">Bank Profit</p>
    {hasActuariesReadAll && (
      <NavLink to="/admin/profit/actuaries" className={navLinkClass}>Actuary Profit</NavLink>
    )}
    {hasFundsBankPositionRead && (
      <NavLink to="/admin/profit/funds" className={navLinkClass}>Fund Positions</NavLink>
    )}
  </div>
)}
```

---

## Task 1: Types + fixtures + API + hooks

Bundle these four for one commit since they're trivially small.

- [ ] Step 1: Write `src/types/profit.ts`.
- [ ] Step 2: Write fixtures.
- [ ] Step 3: RED → impl two API functions:

```ts
export async function getActuaryPerformance(): Promise<{ actuaries: ActuaryPerformance[] }>
export async function getBankFundPositions(): Promise<{ positions: BankFundPosition[] }>
```

- [ ] Step 4: RED → impl two hooks:

```ts
export function useActuaryPerformance() {
  return useQuery({
    queryKey: ['profit', 'actuaries'],
    queryFn: getActuaryPerformance,
  })
}

export function useBankFundPositions() {
  return useQuery({
    queryKey: ['profit', 'bank-fund-positions'],
    queryFn: getBankFundPositions,
  })
}
```

- [ ] Step 5: All GREEN, single commit `feat(profit): types, API, hooks`.

---

## Task 2: `ActuaryPerformanceTable`

Columns: Name (first + last), Position, Trades, Realised Profit (RSD).

Sorted by `realised_profit_rsd` descending by default. Empty state: "No actuary trades recorded yet." Skeleton loading state per motion polish convention.

- [ ] RED → GREEN → COMMIT.

---

## Task 3: `ActuaryPerformancePage`

Thin wrapper that:
- Fetches via `useActuaryPerformance()`
- Renders the table
- Title: "Actuary Performance"
- No filters in v1 (data set is small per spec)

- [ ] RED → GREEN → COMMIT.

---

## Task 4: `BankFundPositionsTable`

Columns: Fund Name (link to `/funds/:fund_id`), Manager (resolve via `useEmployee(manager_employee_id)`), % Fund, Contributed (RSD), Current Value (RSD), Profit (RSD), Actions.

Actions per row: "Invest" + "Redeem" — open the existing `InvestInFundDialog` / `RedeemFromFundDialog` from phase 3 with `on_behalf_of_type='bank'` pre-selected. Bank redeems incur no fee (backend sets `fee_rsd=0` automatically; just note it in the dialog copy: "Bank redemptions are fee-free.").

- [ ] RED → GREEN → COMMIT.

---

## Task 5: `BankFundPositionsPage`

Thin wrapper that:
- Fetches via `useBankFundPositions()`
- Renders the table
- Hosts Invest/Redeem dialogs (controlled state lifted to the page so a row click triggers them)
- Title: "Bank Fund Positions"

- [ ] RED → GREEN → COMMIT.

---

## Task 6: Routes + sidebar

```tsx
<Route
  path="/admin/profit/actuaries"
  element={
    <ProtectedRoute requiredPermission="actuaries.read.all">
      <ActuaryPerformancePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/profit/funds"
  element={
    <ProtectedRoute requiredPermission="funds.bank-position-read">
      <BankFundPositionsPage />
    </ProtectedRoute>
  }
/>
```

Sidebar additions per the snippet above.

- [ ] RED test on Sidebar (both links visible to a supervisor with both permissions; neither visible to an agent).
- [ ] COMMIT.

---

## Task 7: Cypress smoke

`cypress/e2e/profit-banke.cy.ts`:
- Mock `/actuaries/performance` and `/investment-funds/positions` with fixtures.
- Mock invest with success.
- Login as supervisor → visit `/admin/profit/actuaries`, see at least one row → visit `/admin/profit/funds`, click first Invest button, submit, expect POST `/investment-funds/:id/invest` with `on_behalf_of_type: 'bank'`.

- [ ] Author + run — PASS.
- [ ] COMMIT.

---

## Task 8: Quality gates + spec update

- [ ] All gates green.
- [ ] Update `specification.md`: routes, pages, components, API, hooks, types, coverage table, last-updated date.
- [ ] `grep -rE "/api/v[0-9]" cypress/` clean.
- [ ] COMMIT.

---

## Self-Review Checklist

1. **Spec coverage:**
   - "Stranica: Profit aktuara" → Task 2 + 3 ✅
   - "Stranica: Pozicije u fondovima" → Task 4 + 5 ✅
   - "Uplata u fond" / "Povlačenje novca iz fonda" actions → reuse phase 3 dialogs with `on_behalf_of_type='bank'` ✅
2. **Permissions:** both routes gated by `ProtectedRoute requiredPermission`; sidebar links also gated by `selectHasPermission`.
3. **No frontend re-implementation of fund logic** — Profit Banke is a *consumer* of the Investment Funds plumbing.
4. **Component size:** all ≤150 lines.
5. **Error handling:** mutations rely on the global toast fallback (CLAUDE.md mandate).
6. **TDD:** every step preceded by a failing test.

---

## Open questions

1. Should "Trades" in the ActuaryPerformanceTable be clickable and link to a filtered orders page (filter `acting_employee_id=:id`)? Spec doesn't require it, but it's a low-cost addition. **Recommendation:** add the link only if the orders list page already supports the filter; otherwise defer.
2. The "Profit aktuara" spec mentions "po želji, može se prikazati pozicija unutar sistema" (optional position-in-hierarchy display). The backend already returns `position`. Show as a column. ✅ already in Task 2.
