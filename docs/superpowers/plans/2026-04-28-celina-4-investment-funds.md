# Celina 4 — Investment Funds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

> _Updated 2026-04-29 — backend §30 has landed. The "API contract — proposed" section that this plan originally carried has been replaced by the **locked contract** below, sourced verbatim from `REST_API_v3.md` §30._

**Goal:** Build the full Investment Funds frontend (Discovery, Detail, Create, My Funds tab, Invest/Redeem) per `Celina 4(Nova).md §Investicioni fondovi`, against the live backend.

**Architecture:**
- Server data via TanStack Query against `/api/v3/investment-funds*` and `/api/v3/me/investment-funds`. All endpoints exist as of 2026-04-29.
- Two top-level routes (`/funds`, `/funds/new`, `/funds/:id`) plus a tabbed addition to the existing portfolio page.
- Permissions: `funds.manage` (supervisor create + edit), `funds.bank-position-read` (Profit Banke; covered by phase 4). Invest/Redeem use `OwnerIsBankIfEmployee` so an employee invest call automatically becomes a bank-on-behalf-of-bank action.
- Computed fields (`fund_value_rsd`, `liquid_cash_rsd`, `profit_rsd`, `current_value_rsd`, `percentage_fund`) all come from the backend.
- No Redux; pure server state. Forms use react-hook-form + zod.

**Tech Stack:** React 19, TanStack Query v5, Shadcn UI, Tailwind, react-router v6, react-hook-form + zod, Recharts (for the performance line), Jest + RTL.

**Backend reference:** `REST_API_v3.md` §30 (Investment Funds) and §27 (Portfolio, used by the existing My Holdings tab).

---

## Locked API contract (from `REST_API_v3.md` §30)

| Endpoint | Auth | Method | Purpose |
|---|---|---|---|
| `POST /api/v3/investment-funds` | Employee + `funds.manage` | Create | Provisions a bank-owned RSD account for the fund |
| `GET /api/v3/investment-funds` | Any JWT | List | Discovery; filters: `page`, `page_size`, `search`, `active_only` |
| `GET /api/v3/investment-funds/:id` | Any JWT | Detail | Returns `{ fund, holdings, performance }` |
| `PUT /api/v3/investment-funds/:id` | Employee + `funds.manage` | Update | Mutable: `name`, `description`, `minimum_contribution_rsd`, `active` |
| `POST /api/v3/investment-funds/:id/invest` | Any (`OwnerIsBankIfEmployee`) | Action | Body: `source_account_id`, `amount`, `currency`, `on_behalf_of_type?` |
| `POST /api/v3/investment-funds/:id/redeem` | Any (`OwnerIsBankIfEmployee`) | Action | Body: `amount_rsd`, `target_account_id`, `on_behalf_of_type?` |
| `GET /api/v3/me/investment-funds` | Any JWT | My positions | Returns the caller's positions; for employees this is the bank's positions |

```ts
// src/types/fund.ts — locked
export interface Fund {
  id: number
  name: string
  description: string
  minimum_contribution_rsd: string
  manager_employee_id: number
  rsd_account_id: number
  fund_value_rsd: string
  liquid_cash_rsd: string
  profit_rsd: string
  active: boolean
  created_at: string
}

export interface FundHolding {
  stock_id: number
  quantity: string
  acquired_at: string
}

export interface FundPerformancePoint {
  as_of: string  // YYYY-MM-DD
  fund_value_rsd: string
}

export interface ClientFundPosition {
  fund_id: number
  fund_name: string
  total_contributed_rsd: string
  current_value_rsd: string
  percentage_fund: string
  profit_rsd: string
  last_change_at: string
}

export interface FundContribution {
  id: number
  fund_id: number
  amount_rsd: string
  is_inflow: boolean
  status: 'completed' | 'pending' | 'failed'
  fee_rsd?: string
  created_at: string
}

export interface FundFilters {
  page?: number
  page_size?: number
  search?: string
  active_only?: boolean
}

export interface CreateFundPayload {
  name: string
  description?: string
  minimum_contribution_rsd?: string
}

export interface UpdateFundPayload {
  name?: string
  description?: string
  minimum_contribution_rsd?: string
  active?: boolean
}

export interface InvestPayload {
  source_account_id: number
  amount: string
  currency: string
  on_behalf_of_type?: 'self' | 'bank'
}

export interface RedeemPayload {
  amount_rsd: string
  target_account_id: number
  on_behalf_of_type?: 'self' | 'bank'
}
```

**Notable contract details to design around:**
- Spec talks about a "manager" name; backend exposes only `manager_employee_id`. The detail page must resolve the manager's name via the existing employees API (`GET /api/v3/employees/:id`) — add an extra `useEmployee(manager_employee_id)` query in `FundDetailsPanel`.
- `holdings[]` in the detail response only includes `stock_id`, `quantity`, `acquired_at` — no ticker, price, or change. Resolve through the existing `useStock(id)` per-row OR add a backend endpoint follow-up; for v1, fetch each stock individually via existing `getStock(id)` and accept the n+1 (≤ ~20 holdings per fund typical).
- `performance[]` has only `as_of` and `fund_value_rsd` — no profit per period. Compute deltas client-side or accept just the value line.
- `POST /:id/invest` returns `contribution`, NOT the updated position. After mutation, invalidate `['funds', id]` and `['me-funds']` to refetch.
- Redemption may fail with `409 insufficient_fund_cash` — show a specific error toast keyed off the backend `code` field.
- The "manager" addendum (spec §Dodatak za Upravljanje zaposlenima — supervisor permission removal triggers fund ownership transfer) is backend-only; no frontend route. Confirmation dialog text update only.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/fund.ts` | Create | Types from "Locked API contract" |
| `src/__tests__/fixtures/fund-fixtures.ts` | Create | `createMockFund`, `createMockFundHolding`, `createMockClientFundPosition`, canned datasets |
| `src/lib/api/funds.ts` | Create | All seven endpoints |
| `src/lib/api/funds.test.ts` | Create | Tests with `apiClient` mocked |
| `src/hooks/useFunds.ts` | Create | `useFunds`, `useFund`, `useCreateFund`, `useUpdateFund`, `useInvestFund`, `useRedeemFund`, `useMyFundPositions` |
| `src/hooks/useFunds.test.ts` | Create | Hook tests |
| `src/components/funds/FundsTable.tsx` | Create | Discovery table with sort/filter |
| `src/components/funds/FundsTable.test.tsx` | Create | RTL |
| `src/components/funds/FundDetailsPanel.tsx` | Create | Header + key metrics; resolves manager name via `useEmployee` |
| `src/components/funds/FundDetailsPanel.test.tsx` | Create | RTL |
| `src/components/funds/FundHoldingsTable.tsx` | Create | Holdings; resolves ticker via `useStock(stock_id)` per row |
| `src/components/funds/FundHoldingsTable.test.tsx` | Create | RTL |
| `src/components/funds/FundPerformanceChart.tsx` | Create | Recharts `LineChart` over `performance[]` |
| `src/components/funds/FundPerformanceChart.test.tsx` | Create | RTL (renders chart container with data) |
| `src/components/funds/CreateFundForm.tsx` | Create | RHF + zod, three fields (name, description, minimum_contribution_rsd) |
| `src/components/funds/CreateFundForm.test.tsx` | Create | RTL |
| `src/components/funds/InvestInFundDialog.tsx` | Create | Account picker + amount + currency; enforces `amount >= minimum_contribution_rsd` for clients |
| `src/components/funds/InvestInFundDialog.test.tsx` | Create | RTL |
| `src/components/funds/RedeemFromFundDialog.tsx` | Create | Amount or "withdraw full position" + destination account |
| `src/components/funds/RedeemFromFundDialog.test.tsx` | Create | RTL |
| `src/components/funds/MyFundsList.tsx` | Create | Per-position card list; client variant shows Invest/Redeem; supervisor variant routes to fund detail |
| `src/components/funds/MyFundsList.test.tsx` | Create | RTL |
| `src/pages/FundsDiscoveryPage.tsx` | Create | Wraps `FundsTable` + filters + invest button |
| `src/pages/FundsDiscoveryPage.test.tsx` | Create | Page-level RTL |
| `src/pages/FundDetailsPage.tsx` | Create | Composes Panel + Holdings + Performance with Invest/Redeem CTAs |
| `src/pages/FundDetailsPage.test.tsx` | Create | Page-level RTL |
| `src/pages/CreateFundPage.tsx` | Create | Hosts `CreateFundForm`; redirects to `/funds/:id` on success |
| `src/pages/CreateFundPage.test.tsx` | Create | Page-level RTL |
| `src/pages/PortfolioPage.tsx` | Modify | Add tabs "My Holdings" / "My Funds"; second tab renders `MyFundsList` |
| `src/pages/PortfolioPage.test.tsx` | Modify | Tab-switch test |
| `src/App.tsx` | Modify | Add `/funds`, `/funds/new`, `/funds/:id` routes |
| `src/components/layout/Sidebar.tsx` | Modify | Add "Funds" + "Create Fund" links |
| `src/components/layout/Sidebar.test.tsx` | Modify | Coverage |
| `cypress/fixtures/funds-list.json`, `fund-detail.json`, `me-funds.json`, `fund-contribution.json` | Create | Match the contract exactly |
| `cypress/e2e/funds.cy.ts` | Create | Smoke: list → detail → invest → see in "My Funds" |
| `specification.md` | Modify | Project Structure / Routes / Pages / Components / API / Hooks / Types / Coverage |

---

## Sidebar / route additions (final)

| Route | Page | Visibility |
|---|---|---|
| `/funds` | `FundsDiscoveryPage` | any authenticated |
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

- [ ] **Step 1:** Write `src/types/fund.ts` with the contract from "Locked API contract".
- [ ] **Step 2:** Write `src/__tests__/fixtures/fund-fixtures.ts`:

```ts
import type {
  Fund,
  FundHolding,
  ClientFundPosition,
  FundPerformancePoint,
  FundContribution,
} from '@/types/fund'

export function createMockFund(overrides: Partial<Fund> = {}): Fund {
  return {
    id: 101,
    name: 'Alpha Growth Fund',
    description: 'IT-sector focus',
    minimum_contribution_rsd: '1000.00',
    manager_employee_id: 25,
    rsd_account_id: 9001,
    fund_value_rsd: '2600000.00',
    liquid_cash_rsd: '1500000.00',
    profit_rsd: '5000.00',
    active: true,
    created_at: '2020-05-15T00:00:00Z',
    ...overrides,
  }
}

export function createMockFundHolding(overrides: Partial<FundHolding> = {}): FundHolding {
  return { stock_id: 42, quantity: '100', acquired_at: '2026-01-12T00:00:00Z', ...overrides }
}

export function createMockPerformancePoint(
  overrides: Partial<FundPerformancePoint> = {}
): FundPerformancePoint {
  return { as_of: '2026-04-01', fund_value_rsd: '2600000.00', ...overrides }
}

export function createMockClientFundPosition(
  overrides: Partial<ClientFundPosition> = {}
): ClientFundPosition {
  return {
    fund_id: 101,
    fund_name: 'Alpha Growth Fund',
    total_contributed_rsd: '25000.00',
    current_value_rsd: '27000.00',
    percentage_fund: '0.005',
    profit_rsd: '2000.00',
    last_change_at: '2026-04-15T10:00:00Z',
    ...overrides,
  }
}

export function createMockFundContribution(
  overrides: Partial<FundContribution> = {}
): FundContribution {
  return {
    id: 7001,
    fund_id: 101,
    amount_rsd: '10000.00',
    is_inflow: true,
    status: 'completed',
    created_at: '2026-04-28T15:30:00Z',
    ...overrides,
  }
}

export const mockFunds: Fund[] = [
  createMockFund(),
  createMockFund({ id: 102, name: 'Beta Income Fund', minimum_contribution_rsd: '500.00' }),
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

For each function, follow RED → impl → GREEN → COMMIT.

```ts
// src/lib/api/funds.ts — concrete signatures
export async function getFunds(filters: FundFilters = {}): Promise<{ funds: Fund[]; total: number }>
export async function getFund(id: number): Promise<{
  fund: Fund
  holdings: FundHolding[]
  performance: FundPerformancePoint[]
}>
export async function createFund(payload: CreateFundPayload): Promise<{ fund: Fund }>
export async function updateFund(id: number, payload: UpdateFundPayload): Promise<{ fund: Fund }>
export async function investInFund(id: number, payload: InvestPayload): Promise<{ contribution: FundContribution }>
export async function redeemFromFund(id: number, payload: RedeemPayload): Promise<{ contribution: FundContribution }>
export async function getMyFundPositions(): Promise<{ positions: ClientFundPosition[] }>
```

**URL paths (verbatim from §30):** `/investment-funds`, `/investment-funds/:id`, `/investment-funds/:id/invest`, `/investment-funds/:id/redeem`, `/me/investment-funds`. Note: spec calls them "funds" but the URL segment is `investment-funds`.

After all seven functions are GREEN:

```sh
git add src/types/fund.ts src/lib/api/funds.ts src/lib/api/funds.test.ts
git commit -m "feat(funds): API layer (list/detail/create/update/invest/redeem/me)"
```

---

## Task 3: Hooks

**Files:**
- Create: `src/hooks/useFunds.ts`
- Create: `src/hooks/useFunds.test.ts`

Mirror `useStockExchanges.ts` and `useOtc.ts`:

| Hook | Type | Query key / invalidation |
|---|---|---|
| `useFunds(filters)` | useQuery | `['funds', filters]` |
| `useFund(id)` | useQuery | `['funds', id]`, `enabled: id != null` |
| `useMyFundPositions()` | useQuery | `['funds', 'me']` |
| `useCreateFund()` | useMutation | invalidates `['funds']` on success |
| `useUpdateFund(id)` | useMutation | invalidates `['funds']` and `['funds', id]` |
| `useInvestFund(id)` | useMutation | invalidates `['funds', id]`, `['funds', 'me']`, `['accounts']` |
| `useRedeemFund(id)` | useMutation | same invalidations |

For each hook: RED test using `renderHook` + `createQueryWrapper()` (existing helper), implement, GREEN, then commit when all are green.

```sh
git add src/hooks/useFunds.ts src/hooks/useFunds.test.ts
git commit -m "feat(funds): React Query hooks"
```

---

## Task 4: `FundsTable` (discovery)

**Files:**
- Create: `src/components/funds/FundsTable.tsx`
- Create: `src/components/funds/FundsTable.test.tsx`

Columns per spec: *naziv, opis, fund_value_rsd, profit_rsd, minimum_contribution_rsd*. Each row has an "Invest" button (disabled when `!fund.active`); for supervisors, also a "Manage" link if `current_user.id === fund.manager_employee_id`.

Use the new `Skeleton` pattern from `motion` polish for the loading state — five skeleton rows.

- [ ] RED → GREEN → COMMIT.

---

## Task 5: `CreateFundForm` + `CreateFundPage`

**Files:**
- Create: `src/components/funds/CreateFundForm.tsx`, `.test.tsx`
- Create: `src/pages/CreateFundPage.tsx`, `.test.tsx`

Spec fields locked to the §30 body: `name` (required), `description` (optional), `minimum_contribution_rsd` (optional decimal string). Use react-hook-form + zod with required-on-name and decimal regex on `minimum_contribution_rsd`. On submit, call `useCreateFund().mutate(payload)`, on success redirect to `/funds/:id` (id from response).

- [ ] RED → GREEN → COMMIT.

---

## Task 6: `FundDetailsPanel` + `FundHoldingsTable` + `FundPerformanceChart` + `FundDetailsPage`

Split into three sub-components so each stays small.

- **`FundDetailsPanel`** — header card: name, manager (resolve via `useEmployee(fund.manager_employee_id)`), `fund_value_rsd`, `liquid_cash_rsd`, `profit_rsd`, `minimum_contribution_rsd`, `rsd_account_id` (formatted). The `active` flag is shown as a badge.
- **`FundHoldingsTable`** — for each holding, render Ticker (resolved via `useStock(stock_id)`), Quantity, Acquired Date. Adds a "Sell" button per row when `current_user.id === fund.manager_employee_id`. Sell flows through the existing securities order API; route is out of scope for this plan (note in code: TODO link to phase 5 `on_behalf_of_type='fund'`).
- **`FundPerformanceChart`** — Recharts `LineChart` over `performance[]` mapping `as_of` → x-axis, `fund_value_rsd` → y-axis. Empty state: "No performance data yet."
- **`FundDetailsPage`** — `useFund(id)`, composes the three sub-components with a top-right "Invest" button (`InvestInFundDialog`). For the supervisor manager, additional "Edit" + "Toggle active" actions.

Each sub-component gets its own RED/GREEN/COMMIT.

---

## Task 7: `InvestInFundDialog` + `RedeemFromFundDialog`

Each is a Shadcn `Dialog` with: amount input, currency select (Invest only — Redeem is RSD-only by spec), account select (filtered to the current owner's accounts via `useClientAccounts()` for clients or `useBankAccounts()` for employees), and a Submit.

Invest:
- Validation: `amount` decimal > 0; if currency is RSD, also enforce `>= fund.minimum_contribution_rsd`.
- Body: `{ source_account_id, amount, currency }` — `on_behalf_of_type` is omitted for clients (defaults to `'self'`); employees pass `'bank'`.

Redeem:
- "Withdraw full position" toggle that fills `amount_rsd` from `position.current_value_rsd`.
- Body: `{ amount_rsd, target_account_id }` plus `on_behalf_of_type` for employees.
- On 409 with `code='insufficient_fund_cash'`, show inline error: "The fund does not have enough liquid cash. Please try a smaller amount or contact the fund manager."

- [ ] RED → GREEN → COMMIT.

---

## Task 8: `MyFundsList` + Portfolio page tab integration

**Files:**
- Create: `src/components/funds/MyFundsList.tsx`, `.test.tsx`
- Modify: `src/pages/PortfolioPage.tsx`, `.test.tsx`

`MyFundsList` renders one card per `ClientFundPosition` from `useMyFundPositions()`. Card shows name, `current_value_rsd`, `percentage_fund`, `profit_rsd`. Client variant: "Invest" + "Redeem" buttons. Supervisor variant: "Open" button → `/funds/:id`. Card click navigates to `/funds/:id`.

Modify `PortfolioPage.tsx` to use Shadcn Tabs:

```tsx
<Tabs defaultValue={searchParams.get('tab') ?? 'holdings'}>
  <TabsList>
    <TabsTrigger value="holdings">My Holdings</TabsTrigger>
    <TabsTrigger value="funds">My Funds</TabsTrigger>
  </TabsList>
  <TabsContent value="holdings"><HoldingsTable .../></TabsContent>
  <TabsContent value="funds"><MyFundsList /></TabsContent>
</Tabs>
```

- [ ] RED → GREEN → COMMIT.

---

## Task 9: `FundsDiscoveryPage` + routes + sidebar

**Files:**
- Create: `src/pages/FundsDiscoveryPage.tsx`, `.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`, `.test.tsx`

`FundsDiscoveryPage` composes filters (`search`, `active_only` toggle) + `FundsTable` + pagination, opens `InvestInFundDialog` from row clicks.

Routes:

```tsx
<Route path="/funds" element={<FundsDiscoveryPage />} />
<Route
  path="/funds/new"
  element={
    <ProtectedRoute requiredPermission="funds.manage">
      <CreateFundPage />
    </ProtectedRoute>
  }
/>
<Route path="/funds/:id" element={<FundDetailsPage />} />
```

Sidebar additions: "Funds" link in `ClientNav` Trading group + same in `EmployeeNav`. "Create Fund" link gated on `selectHasPermission('funds.manage')`.

- [ ] RED → GREEN → COMMIT.

---

## Task 10: Cypress smoke

**Files:**
- Create: `cypress/fixtures/funds-list.json`, `fund-detail.json`, `me-funds.json`, `fund-contribution.json`
- Create: `cypress/e2e/funds.cy.ts`

Fixtures must match the `REST_API_v3.md` §30 response shapes verbatim. Smoke flow: client logs in → `/funds` → sees list → opens detail → opens Invest dialog → submits → returns to `/portfolio?tab=funds` and sees the new position.

- [ ] Author + run — PASS.
- [ ] COMMIT.

---

## Task 11: Quality gates + spec update

- [ ] All gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npx prettier --check "src/**/*.{ts,tsx}"`, `npm run build`.
- [ ] Update `specification.md`: project tree, routes, pages, components (8 new), state mgmt API + hooks, types, coverage table, last-updated date.
- [ ] `grep -rE "/api/v[0-9]" cypress/` clean.
- [ ] COMMIT.

---

## Self-Review Checklist

1. **Spec coverage:** every §Investicioni fondovi sub-section is mapped:
   - "Discovery page" → Task 4 + Task 9 ✅
   - "Detaljan prikaz fonda" → Task 6 ✅
   - "Create investment fund page" → Task 5 ✅
   - "Dodatak za 'Moj portfolio' → Moji fondovi" → Task 8 ✅
   - "Dodatak za 'Hartije od vrednosti' (buy on behalf of fund)" → **NOT in this plan** — see roadmap phase 5 (depends on backend confirmation of `on_behalf_of_type` on `POST /me/orders`)
   - "Dodatak za 'Upravljanje zaposlenima'" — backend logic; frontend is just a confirmation-dialog text update done with the auth selector cleanup. ✅ excluded.
2. **Permissions everywhere:** create page + create-fund link + sell-on-behalf actions all gated. ✅
3. **Component size:** all 8 components ≤ 150 lines after splitting Detail into Panel / HoldingsTable / Performance / Dialogs.
4. **Locked API contract:** every backend dependency is centralized in `src/lib/api/funds.ts`. Field names, paths, and response shapes match §30 exactly.
5. **Error handling:** every mutation will toast on failure via the global fallback (CLAUDE.md mandate). Inline errors only for the Redeem `insufficient_fund_cash` case where the user can act on the message.
6. **Decimal handling:** all currency values use `string` (project convention).
7. **TDD:** every implementation step is preceded by a failing test.

---

## Backend handoff notes

When the funds backend changes, the implementer should:

1. Diff the actual response shapes against `src/types/fund.ts`. Update types or push back on backend.
2. Re-record Cypress fixtures from a real localhost run (decode JWTs to confirm v3 shape — see `docs/environments-and-testing.md`).
3. Re-run Task 11 gates. By design, only `types/fund.ts` and Cypress fixtures should need touching.
