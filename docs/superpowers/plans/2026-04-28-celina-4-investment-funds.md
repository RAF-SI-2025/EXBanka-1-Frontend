# Celina 4 — Investment Funds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Investment Funds frontend (Discovery, Detail, Create, My Funds tab) per `Celina 4(Nova).md §Investicioni fondovi`, ahead of backend availability. Every API call goes through a thin, fully-typed layer that matches the proposed contract; when the backend lands, only fixture JSONs and a smoke test in `lib/api/funds.ts` need updating.

**Architecture:**
- Server data via TanStack Query against `/api/v3/funds*` and `/api/v3/me/funds*`. The endpoints don't exist yet (`REST_API_v3.md` audit, 2026-04-28); see "API contract — proposed" below.
- Two top-level routes (`/funds`, `/funds/new`, `/funds/:id`) plus a tabbed addition to the existing portfolio page.
- Permissions: `funds.invest` (client invest/redeem), `funds.manage` (supervisor create + ops).
- Computed fields (`fund_value`, `profit`, `share_percent`, `current_value`) come from the backend per spec note "Predlažemo da ... budu izvedeni podaci".
- No Redux; all server state. The "create fund" form uses `react-hook-form` + zod (see `useLoanApplicationForm.ts` for the pattern).

**Tech Stack:** React 19, TanStack Query v5, Shadcn UI, Tailwind, react-router v6, react-hook-form + zod, Recharts (already used by `PriceChart.tsx`) for the performance graph, Jest + RTL.

**Backend reference:** None today. This plan defines the contract the backend must honor; flag any backend-side disagreement before merging the API task.

---

## API contract — proposed (lock before Task 2)

This section is the negotiation surface with the backend. The implementer should confirm with backend before writing fixtures.

| Endpoint | Auth | Returns |
|---|---|---|
| `GET /api/v3/funds` | AnyAuth (read) | `{ funds: Fund[], total_count }` with filters `page`, `page_size`, `search`, `min_contribution_lt`, `sort` |
| `GET /api/v3/funds/:id` | AnyAuth | `Fund` (with derived totals) plus `holdings: FundHolding[]` and `performance: FundPerformancePoint[]` |
| `POST /api/v3/funds` | EmployeeJWT + `funds.manage` | `Fund` (newly created) |
| `POST /api/v3/funds/:id/invest` | AnyAuth + `funds.invest` (client) or `funds.bank-invest` (supervisor for bank) | `ClientFundPosition` |
| `POST /api/v3/funds/:id/redeem` | AnyAuth + `funds.invest` / `funds.bank-invest` | `ClientFundPosition` (or `null` if fully redeemed) |
| `GET /api/v3/me/funds` | AnyAuth | `{ positions: ClientFundPosition[] }` for the caller |

```ts
// proposed shapes, locked in src/types/fund.ts in Task 1
export interface Fund {
  id: number
  name: string
  description: string
  manager_id: number
  manager_name: string
  minimum_contribution: string  // RSD, decimal-as-string per project convention
  liquid_assets: string
  fund_value: string  // derived
  profit: string  // derived
  account_number: string
  created_at: string
}

export interface FundHolding {
  id: number
  ticker: string
  price: string
  change: string  // signed percent string e.g. "+2.31"
  volume: number
  initial_margin_cost: string
  acquisition_date: string
}

export interface FundPerformancePoint {
  period: string  // ISO month, quarter, or year per `granularity`
  fund_value: string
  profit: string
}

export interface ClientFundPosition {
  id: number
  fund_id: number
  fund_name: string
  total_invested: string
  share_percent: string  // derived
  current_value: string  // derived
  is_bank: boolean  // true when this position represents bank-on-behalf
}
```

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/fund.ts` | Create | Types above |
| `src/__tests__/fixtures/fund-fixtures.ts` | Create | `createMockFund`, `createMockFundHolding`, `createMockClientFundPosition`, canned datasets |
| `src/lib/api/funds.ts` | Create | All six endpoints |
| `src/lib/api/funds.test.ts` | Create | Tests with `apiClient` mocked |
| `src/hooks/useFunds.ts` | Create | `useFunds`, `useFund`, `useCreateFund`, `useInvestFund`, `useRedeemFund`, `useMyFundPositions` |
| `src/hooks/useFunds.test.ts` | Create | Hook tests |
| `src/components/funds/FundsTable.tsx` | Create | Discovery table with sort/filter |
| `src/components/funds/FundsTable.test.tsx` | Create | RTL |
| `src/components/funds/FundDetailsPanel.tsx` | Create | Header + key metrics on detail page |
| `src/components/funds/FundDetailsPanel.test.tsx` | Create | RTL |
| `src/components/funds/FundHoldingsTable.tsx` | Create | Listed securities with sell button (supervisor only) |
| `src/components/funds/FundHoldingsTable.test.tsx` | Create | RTL |
| `src/components/funds/FundPerformanceChart.tsx` | Create | Recharts line — `granularity` selector (month/quarter/year) |
| `src/components/funds/FundPerformanceChart.test.tsx` | Create | RTL (renders chart container w/ data) |
| `src/components/funds/CreateFundForm.tsx` | Create | RHF + zod, four fields per spec |
| `src/components/funds/CreateFundForm.test.tsx` | Create | RTL — validation + submit payload |
| `src/components/funds/InvestInFundDialog.tsx` | Create | Account picker + amount; client picks own RSD acct, supervisor picks bank RSD acct |
| `src/components/funds/InvestInFundDialog.test.tsx` | Create | RTL |
| `src/components/funds/RedeemFromFundDialog.tsx` | Create | Amount or "withdraw full position" + destination account |
| `src/components/funds/RedeemFromFundDialog.test.tsx` | Create | RTL |
| `src/components/funds/MyFundsList.tsx` | Create | Per-position card list (used inside the portfolio "My Funds" tab) |
| `src/components/funds/MyFundsList.test.tsx` | Create | RTL |
| `src/pages/FundsDiscoveryPage.tsx` | Create | Wraps `FundsTable` + filters + invest button |
| `src/pages/FundsDiscoveryPage.test.tsx` | Create | Page-level RTL |
| `src/pages/FundDetailsPage.tsx` | Create | Header + holdings + performance chart |
| `src/pages/FundDetailsPage.test.tsx` | Create | Page-level RTL |
| `src/pages/CreateFundPage.tsx` | Create | Hosts `CreateFundForm` + redirect on success |
| `src/pages/CreateFundPage.test.tsx` | Create | Page-level RTL |
| `src/pages/PortfolioPage.tsx` | Modify | Add tabs "Moje hartije" / "Moji fondovi"; second tab renders `MyFundsList` |
| `src/pages/PortfolioPage.test.tsx` | Modify | Tab-switch test |
| `src/App.tsx` | Modify | Add `/funds`, `/funds/new`, `/funds/:id` |
| `src/components/layout/Sidebar.tsx` | Modify | Add "Funds" link in Trading group (both navs); "Create Fund" link guarded by `funds.manage` |
| `src/components/layout/Sidebar.test.tsx` | Modify | Coverage |
| `cypress/fixtures/funds-list.json`, `cypress/fixtures/fund-detail.json`, `cypress/fixtures/me-funds.json` | Create | Match the contract above |
| `cypress/e2e/funds.cy.ts` | Create | Smoke: list → detail → invest → see in "My Funds" |
| `specification.md` | Modify | Project Structure / Routes / Pages / Components / API / Hooks / Types / Coverage |

**Component-size enforcement:** every component is sized to fit ≤150 lines (CLAUDE.md). The pages are intentionally thin — heavy logic goes into hooks and the dedicated panel components.

---

## Sidebar / route additions (final)

| Route | Page | Visibility |
|---|---|---|
| `/funds` | `FundsDiscoveryPage` | any authenticated (read) |
| `/funds/new` | `CreateFundPage` | `funds.manage` only |
| `/funds/:id` | `FundDetailsPage` | any authenticated |
| `/portfolio?tab=funds` | `PortfolioPage` (existing, +tabs) | client + employee |

Sidebar (Trading group, both navs):
```
Securities
OTC Market
Funds                ← new
Create Fund          ← new (only when funds.manage)
```

---

## Task 1: Types + fixtures

**Files:**
- Create: `src/types/fund.ts`
- Create: `src/__tests__/fixtures/fund-fixtures.ts`

- [ ] **Step 1:** Write `src/types/fund.ts` with the contract from "API contract — proposed" above.
- [ ] **Step 2:** Write `src/__tests__/fixtures/fund-fixtures.ts`:

```ts
import type { Fund, FundHolding, ClientFundPosition, FundPerformancePoint } from '@/types/fund'

export function createMockFund(overrides: Partial<Fund> = {}): Fund {
  return {
    id: 101,
    name: 'Alpha Growth Fund',
    description: 'Fond fokusiran na IT sektor.',
    manager_id: 25,
    manager_name: 'Marko Marković',
    minimum_contribution: '1000.00',
    liquid_assets: '1500000.00',
    fund_value: '2600000.00',
    profit: '500000.00',
    account_number: '123-45678-90',
    created_at: '2020-05-15T00:00:00Z',
    ...overrides,
  }
}

export function createMockFundHolding(overrides: Partial<FundHolding> = {}): FundHolding {
  return {
    id: 1,
    ticker: 'AAPL',
    price: '150.00',
    change: '+1.20',
    volume: 200,
    initial_margin_cost: '0',
    acquisition_date: '2026-01-12T00:00:00Z',
    ...overrides,
  }
}

export function createMockClientFundPosition(
  overrides: Partial<ClientFundPosition> = {}
): ClientFundPosition {
  return {
    id: 1,
    fund_id: 101,
    fund_name: 'Alpha Growth Fund',
    total_invested: '25000.00',
    share_percent: '0.005',
    current_value: '27000.00',
    is_bank: false,
    ...overrides,
  }
}

export const mockFunds: Fund[] = [
  createMockFund(),
  createMockFund({ id: 102, name: 'Beta Income Fund', minimum_contribution: '500.00' }),
]
```

- [ ] **Step 3:** `npx tsc --noEmit` — PASS.
- [ ] **Step 4:** Commit

```sh
git add src/types/fund.ts src/__tests__/fixtures/fund-fixtures.ts
git commit -m "feat(funds): add Fund types and fixtures"
```

---

## Task 2: API layer

**Files:**
- Create: `src/lib/api/funds.ts`
- Create: `src/lib/api/funds.test.ts`

For each of `getFunds`, `getFund(id)`, `createFund(payload)`, `investInFund(id, payload)`, `redeemFromFund(id, payload)`, `getMyFundPositions()`, follow the same RED → impl → GREEN cadence as the OTC plan Task 1. Each test asserts the URL, the params/body, and the return shape (use the fixtures from Task 1).

Concrete signatures:

```ts
export async function getFunds(filters: FundFilters = {}): Promise<{ funds: Fund[]; total_count: number }>
export async function getFund(id: number): Promise<{ fund: Fund; holdings: FundHolding[]; performance: FundPerformancePoint[] }>
export async function createFund(payload: CreateFundPayload): Promise<Fund>
export async function investInFund(id: number, payload: InvestPayload): Promise<ClientFundPosition>
export async function redeemFromFund(id: number, payload: RedeemPayload): Promise<ClientFundPosition | null>
export async function getMyFundPositions(): Promise<{ positions: ClientFundPosition[] }>
```

Where `CreateFundPayload`, `InvestPayload`, `RedeemPayload`, `FundFilters` live in `types/fund.ts`. Define them in this task and add a quick types-only `tsc` check.

- [ ] Repeat the RED/GREEN/COMMIT cadence for each of the six functions.
- [ ] After all six are green, single commit.

```sh
git add src/types/fund.ts src/lib/api/funds.ts src/lib/api/funds.test.ts
git commit -m "feat(funds): API layer (list/detail/create/invest/redeem/me)"
```

---

## Task 3: Hooks

**Files:**
- Create: `src/hooks/useFunds.ts`
- Create: `src/hooks/useFunds.test.ts`

Mirror `useStockExchanges.ts` and `useOtc.ts`:
- `useFunds(filters)` — `queryKey: ['funds', filters]`
- `useFund(id)` — `queryKey: ['funds', id]`, `enabled: id != null`
- `useMyFundPositions()` — `queryKey: ['funds', 'me']`
- `useCreateFund()` — invalidates `['funds']` on success, redirects via `useMutationWithRedirect` (existing helper) to `/funds/:id`
- `useInvestFund()` — invalidates `['funds', id]` and `['funds', 'me']`
- `useRedeemFund()` — same invalidations

For each hook: RED test using `renderHook` + `QueryClient` wrapper (copy the pattern from `useNotifications.test.ts` or `useOtc.test.ts`), implement, GREEN, then commit when all six are green.

```sh
git add src/hooks/useFunds.ts src/hooks/useFunds.test.ts
git commit -m "feat(funds): React Query hooks"
```

---

## Task 4: `FundsTable` (discovery)

**Files:**
- Create: `src/components/funds/FundsTable.tsx`
- Create: `src/components/funds/FundsTable.test.tsx`

Columns per spec: *naziv, opis, ukupna vrednost, profit, minimalni ulog*. Each row has an "Invest" button (only enabled when balance ≥ `minimum_contribution`; for supervisors, also show "Manage" if `current_user.id === fund.manager_id`).

- [ ] RED: tests for column rendering, "Invest" disabled state, click handlers.
- [ ] GREEN: implementation (≤120 lines, lift the bigger formatting helpers into `lib/utils/formatRsd.ts` if needed).
- [ ] COMMIT.

---

## Task 5: `CreateFundForm` + `CreateFundPage`

**Files:**
- Create: `src/components/funds/CreateFundForm.tsx`, `.test.tsx`
- Create: `src/pages/CreateFundPage.tsx`, `.test.tsx`

Spec fields: name, description, minimum_contribution (RSD decimal), manager (defaults to current supervisor; admin can choose another supervisor — extension noted in Celina 4). Use react-hook-form + zod with required-field validation, decimal regex on `minimum_contribution`, length caps on text. On submit, call `useCreateFund().mutate(payload)`, redirect to `/funds/:id`.

- [ ] RED tests: validation errors render, submit fires the API once with normalized payload.
- [ ] GREEN.
- [ ] COMMIT.

---

## Task 6: `FundDetailsPanel` + `FundHoldingsTable` + `FundPerformanceChart` + `FundDetailsPage`

Split into three sub-components so each stays small.

- **`FundDetailsPanel`** — header card: name, manager, fund value, minimum_contribution, profit, account number, liquid_assets.
- **`FundHoldingsTable`** — columns Ticker, Price, Change, Volume, initialMarginCost, acquisitionDate. Adds a "Sell" button per row when `current_user.id === fund.manager_id`.
- **`FundPerformanceChart`** — Recharts `LineChart`, granularity radio (month/quarter/year), reads from `performance` payload. Empty state when `performance.length === 0`.
- **`FundDetailsPage`** — `useFund(id)`, composes the three sub-components with a top-right "Invest" button (`InvestInFundDialog`) or, for the manager, a "Manage" menu.

Each sub-component gets its own RED/GREEN/COMMIT.

---

## Task 7: `InvestInFundDialog` + `RedeemFromFundDialog`

Each is a Shadcn `Dialog` with: amount input, account select (filtered to RSD accounts; for supervisor, the bank's RSD accounts via `useBankAccounts` — already exists at `src/lib/api/bankAccounts.ts`-compatible if present, or via `useClientAccounts` for clients). Redeem dialog has a "withdraw full position" toggle that fills the amount with `position.current_value`.

- [ ] RED: validation (amount ≥ minimum_contribution for invest; amount ≤ position.current_value for redeem), payload shape on submit.
- [ ] GREEN.
- [ ] COMMIT.

---

## Task 8: `MyFundsList` + Portfolio page tab integration

**Files:**
- Create: `src/components/funds/MyFundsList.tsx`, `.test.tsx`
- Modify: `src/pages/PortfolioPage.tsx`, `.test.tsx`

`MyFundsList` renders one card per `ClientFundPosition` with: name, description, fund_value, share_percent + RSD value, profit, "Invest" + "Redeem" buttons. Card click navigates to `/funds/:id`. Behavior differs slightly for supervisor (per spec): card shows liquid_assets instead of profit; no Invest/Redeem on bank-position cards (handled separately in Profit Banke portal — phase 5).

Modify `PortfolioPage.tsx` to use Shadcn Tabs:

```tsx
<Tabs defaultValue={searchParams.get('tab') ?? 'holdings'}>
  <TabsList>
    <TabsTrigger value="holdings">Moje hartije</TabsTrigger>
    <TabsTrigger value="funds">Moji fondovi</TabsTrigger>
  </TabsList>
  <TabsContent value="holdings"><HoldingsTable .../></TabsContent>
  <TabsContent value="funds"><MyFundsList /></TabsContent>
</Tabs>
```

- [ ] RED: tab switch test, MyFundsList rendering tests.
- [ ] GREEN.
- [ ] COMMIT.

---

## Task 9: `FundsDiscoveryPage` + routes + sidebar

**Files:**
- Create: `src/pages/FundsDiscoveryPage.tsx`, `.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`, `.test.tsx`

`FundsDiscoveryPage` composes filters + `FundsTable` + pagination, opens `InvestInFundDialog` from row clicks.

Routes:

```tsx
<Route path="/funds" element={<FundsDiscoveryPage />} />
<Route
  path="/funds/new"
  element={
    <ProtectedRoute requireSupervisorOrAdmin>
      <CreateFundPage />
    </ProtectedRoute>
  }
/>
<Route path="/funds/:id" element={<FundDetailsPage />} />
```

Sidebar additions: "Funds" link in `ClientNav` Trading group, same in `EmployeeNav`. "Create Fund" link gated on `funds.manage` (use `selectHasPermission`).

- [ ] RED: page tests + sidebar tests.
- [ ] GREEN.
- [ ] COMMIT.

---

## Task 10: Cypress smoke

**Files:**
- Create: `cypress/fixtures/funds-list.json`, `fund-detail.json`, `me-funds.json`
- Create: `cypress/e2e/funds.cy.ts`

Mock all six endpoints with `cy.intercept`. Smoke flow: client logs in → `/funds` → sees list → opens detail → opens Invest dialog → submits → returns to `/portfolio?tab=funds` and sees the new position.

- [ ] Author + run — PASS.
- [ ] COMMIT.

---

## Task 11: Quality gates + spec update

- [ ] All gates: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npx prettier --check "src/**/*.{ts,tsx}"`, `npm run build` — PASS.
- [ ] Update `specification.md`: project tree, routes, pages, components (8 new), state mgmt API + hooks, types, coverage table, last-updated date.
- [ ] `grep -rE "/api/v[0-9]" cypress/` clean.
- [ ] COMMIT.

---

## Self-Review Checklist

1. **Spec coverage:** every spec section is mapped to a task —
   - "Discovery page" → Task 4 + Task 9 ✅
   - "Detaljan prikaz fonda" → Task 6 ✅
   - "Create investment fund page" → Task 5 ✅
   - "Dodatak za 'Moj portfolio' → Moji fondovi" → Task 8 ✅
   - "Dodatak za 'Hartije od vrednosti' (buy on behalf of fund)" → **NOT in this plan** — see roadmap phase 4. (separate plan once this lands)
   - "Dodatak za 'Upravljanje zaposlenima'" — backend permission removal logic, no frontend route. ✅ excluded.
2. **Permissions everywhere:** create page + create-fund link + sell-on-behalf actions all gated. ✅
3. **Component size:** all 8 components ≤ 150 lines after the split into Header / HoldingsTable / Performance / Dialogs.
4. **API contract risk:** every backend dependency is centralized in `src/lib/api/funds.ts`. When real endpoints land, only this file (+ Cypress fixtures) needs review.
5. **YAGNI:** no Redux slice, no global cache, no realtime — purely server state via React Query. ✅
6. **Decimal handling:** all currency values use `string` (project convention) — never coerce to `number` for arithmetic; rely on backend-derived `fund_value`/`profit` per spec note.

---

## Backend handoff notes

When the funds backend lands, the implementer should:

1. Diff the actual response shapes against `src/types/fund.ts`. Update types or push back on backend if the contract drifted.
2. Re-record Cypress fixtures from a real localhost run (decode JWTs to ensure they match the v3 shape — see `docs/environments-and-testing.md`).
3. Re-run Task 11 gates. No source changes should be needed beyond `types/fund.ts` and fixtures, by design.
