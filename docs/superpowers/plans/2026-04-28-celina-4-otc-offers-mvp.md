# Celina 4 — OTC Offers MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing OTC portal reachable, finish the buy-on-behalf flow for employees, and add the polish (loading spinner, sidebar entry, Cypress smoke) so the MVP slice from `Celina 4(Nova).md §OTC trgovina` is shippable.

**Architecture:** All code already exists for client-side discovery + buy: `OtcPortalPage`, `OtcOffersTable`, `BuyOtcDialog`, `useOtcOffers`, `useBuyOtcOffer`, `getOtcOffers`/`buyOtcOffer`. The gaps are wiring (route + sidebar), the employee buy-on-behalf path (`POST /otc/offers/:id/buy-on-behalf`), and tests for the new wiring. Negotiation / counter-offer / options-contract UI is **out of scope** for this plan — see roadmap phase 6.

**Tech Stack:** React 19, TanStack Query, Shadcn UI, react-router v6, existing fixtures.

**Backend reference:** `REST_API_v3.md` §29 (OTC Offers). Out of scope: any "negotiation" endpoint (does not yet exist).

---

## Pre-flight verification

Before starting, the implementer should confirm the assumed starting state by running these commands:

```sh
test -f src/pages/OtcPortalPage.tsx && echo "OtcPortalPage exists"
test -f src/components/otc/OtcOffersTable.tsx && echo "OtcOffersTable exists"
grep -n "OtcPortalPage" src/App.tsx || echo "OtcPortalPage NOT routed (expected)"
grep -n "/otc" src/components/layout/Sidebar.tsx || echo "Sidebar has no OTC link (expected)"
grep -n "buyOnBehalf\|buy-on-behalf" src/lib/api/otc.ts || echo "buy-on-behalf NOT implemented (expected)"
```

Each "expected" line confirms work to do; if any check produces an unexpected result, stop and reconcile before proceeding.

---

## File Structure (deltas from current code)

| File | Action | Responsibility |
|---|---|---|
| `src/lib/api/otc.ts` | Modify | Add `buyOtcOfferOnBehalf` |
| `src/lib/api/otc.test.ts` | Modify | Cover the new function |
| `src/types/otc.ts` | Modify | Add `OtcBuyOnBehalfRequest` |
| `src/hooks/useOtc.ts` | Modify | Add `useBuyOtcOfferOnBehalf` |
| `src/hooks/useOtc.test.ts` | Modify | Cover the new hook |
| `src/components/otc/BuyOnBehalfOtcDialog.tsx` | Create | Employee variant: pick client + account |
| `src/components/otc/BuyOnBehalfOtcDialog.test.tsx` | Create | Tests for the dialog |
| `src/pages/OtcPortalPage.tsx` | Modify | Replace `<p>Loading...</p>` with `LoadingSpinner`, branch by user type, plug employee dialog when `userType === 'employee'` |
| `src/pages/OtcPortalPage.test.tsx` | Create | Smoke + role split tests |
| `src/App.tsx` | Modify | Route `/otc` → `<OtcPortalPage />` (any authenticated user with `otc.trade` permission) |
| `src/components/layout/Sidebar.tsx` | Modify | Add "OTC Market" link to both `ClientNav` and `EmployeeNav` |
| `src/components/layout/Sidebar.test.tsx` | Modify | Assert link presence for both roles |
| `cypress/e2e/otc.cy.ts` | Create | Smoke E2E |
| `cypress/fixtures/otc-offers.json` | Create | List fixture |
| `specification.md` | Modify | Add `/otc` route and updated components |

---

## Task 1: Add `buy-on-behalf` API + types

**Files:**
- Modify: `src/types/otc.ts`
- Modify: `src/lib/api/otc.ts`
- Modify: `src/lib/api/otc.test.ts`

- [ ] **Step 1: Add the request type**

Append to `src/types/otc.ts`:

```ts
export interface OtcBuyOnBehalfRequest {
  client_id: number
  account_id: number
  quantity: number
}
```

- [ ] **Step 2: Run `npx tsc --noEmit`** — expect PASS.

- [ ] **Step 3: Write failing test**

Append to `src/lib/api/otc.test.ts`:

```ts
import { buyOtcOfferOnBehalf } from './otc'

describe('buyOtcOfferOnBehalf', () => {
  it('POSTs /otc/offers/:id/buy-on-behalf with the payload', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ data: { id: 1 } })
    await buyOtcOfferOnBehalf(7, { client_id: 5, account_id: 12, quantity: 3 })
    expect(apiClient.post).toHaveBeenCalledWith('/otc/offers/7/buy-on-behalf', {
      client_id: 5,
      account_id: 12,
      quantity: 3,
    })
  })
})
```

- [ ] **Step 4: Run — FAIL.**
- [ ] **Step 5: Implement** — append to `src/lib/api/otc.ts`:

```ts
import type { OtcBuyOnBehalfRequest } from '@/types/otc'

export async function buyOtcOfferOnBehalf(
  id: number,
  payload: OtcBuyOnBehalfRequest
): Promise<void> {
  await apiClient.post(`/otc/offers/${id}/buy-on-behalf`, payload)
}
```

- [ ] **Step 6: Run — PASS.**
- [ ] **Step 7: Commit**

```sh
git add src/types/otc.ts src/lib/api/otc.ts src/lib/api/otc.test.ts
git commit -m "feat(otc): add buyOtcOfferOnBehalf API"
```

---

## Task 2: Add `useBuyOtcOfferOnBehalf` hook

**Files:**
- Modify: `src/hooks/useOtc.ts`
- Modify: `src/hooks/useOtc.test.ts`

- [ ] **Step 1: Write failing test**

Append:

```ts
import { useBuyOtcOfferOnBehalf } from './useOtc'

describe('useBuyOtcOfferOnBehalf', () => {
  it('calls API and invalidates the offers cache on success', async () => {
    jest.mocked(otcApi.buyOtcOfferOnBehalf).mockResolvedValue(undefined)
    const { result } = renderHook(() => useBuyOtcOfferOnBehalf(), { wrapper })
    await act(() =>
      result.current.mutateAsync({ id: 7, client_id: 5, account_id: 12, quantity: 3 })
    )
    expect(otcApi.buyOtcOfferOnBehalf).toHaveBeenCalledWith(7, {
      client_id: 5,
      account_id: 12,
      quantity: 3,
    })
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

Append to `src/hooks/useOtc.ts`:

```ts
import { buyOtcOfferOnBehalf } from '@/lib/api/otc'
import type { OtcBuyOnBehalfRequest } from '@/types/otc'

export function useBuyOtcOfferOnBehalf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: OtcBuyOnBehalfRequest & { id: number }) =>
      buyOtcOfferOnBehalf(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['otc', 'offers'] }),
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/hooks/useOtc.ts src/hooks/useOtc.test.ts
git commit -m "feat(otc): add useBuyOtcOfferOnBehalf"
```

---

## Task 3: Build `BuyOnBehalfOtcDialog`

**Files:**
- Create: `src/components/otc/BuyOnBehalfOtcDialog.tsx`
- Create: `src/components/otc/BuyOnBehalfOtcDialog.test.tsx`

The dialog mirrors `BuyOtcDialog` but adds a client picker and pulls accounts dynamically based on the selected client (`useClientAccountsByClientId` if it exists; otherwise compose `useClients` + a fetch on selection).

- [ ] **Step 1: Find the existing client list hook**

```sh
grep -rn "useClients\|getClients" src/hooks/ src/lib/api/ | head
```

If `useClients` returns `{ clients }`, use it. If accounts-by-client requires its own fetch, locate the relevant API function (`grep -rn "GET /clients/:id/accounts" docs/REST_API_v3.md` confirms one exists).

- [ ] **Step 2: Write failing test** (RTL):

```tsx
// src/components/otc/BuyOnBehalfOtcDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BuyOnBehalfOtcDialog } from '@/components/otc/BuyOnBehalfOtcDialog'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'

describe('BuyOnBehalfOtcDialog', () => {
  const offer = createMockOtcOffer({ id: 7, quantity: 10 })
  const clients = [{ id: 5, full_name: 'Marko Marković' }]
  const onSubmit = jest.fn()
  const baseProps = {
    open: true,
    onOpenChange: () => {},
    offer,
    clients,
    onSubmit,
    onClientSelect: jest.fn(),
    accountsForClient: [{ id: 12, account_number: '12345' }],
    loading: false,
  }

  it('renders client and account selectors', () => {
    render(<BuyOnBehalfOtcDialog {...baseProps} />)
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/account/i)).toBeInTheDocument()
  })

  it('submits client_id, account_id, quantity', () => {
    render(<BuyOnBehalfOtcDialog {...baseProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } })
    // assume both selects auto-select the only option in this test
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onSubmit).toHaveBeenCalledWith({ client_id: 5, account_id: 12, quantity: 3 })
  })
})
```

- [ ] **Step 3: Run — FAIL.**
- [ ] **Step 4: Implement** the dialog (≤ 150 lines, model after `BuyOtcDialog.tsx`):

```tsx
// src/components/otc/BuyOnBehalfOtcDialog.tsx
// Full implementation: Dialog with three required fields:
//   1. Client select (from `clients` prop) — fires onClientSelect(id) so parent loads that client's accounts
//   2. Account select (from `accountsForClient` prop)
//   3. Quantity number input (1..offer.quantity)
// Submit button is disabled while `loading` is true or any field is unset.
// Calls onSubmit({ client_id, account_id, quantity }).
```

(Concrete props interface, JSX structure, validation, and "confirm/cancel" buttons follow `BuyOtcDialog.tsx` 1:1 — keep the file under 150 lines per CLAUDE.md.)

- [ ] **Step 5: Run — PASS.**
- [ ] **Step 6: Commit**

```sh
git add src/components/otc/BuyOnBehalfOtcDialog.tsx src/components/otc/BuyOnBehalfOtcDialog.test.tsx
git commit -m "feat(otc): add BuyOnBehalfOtcDialog for employees"
```

---

## Task 4: Wire `OtcPortalPage` to branch by user type

**Files:**
- Modify: `src/pages/OtcPortalPage.tsx`
- Create: `src/pages/OtcPortalPage.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/pages/OtcPortalPage.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcPortalPage } from './OtcPortalPage'
import * as otcApi from '@/lib/api/otc'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { mockOtcOffers } from '@/__tests__/fixtures/otc-fixtures'

jest.mock('@/lib/api/otc')
jest.mock('@/lib/api/accounts')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(otcApi.getOtcOffers).mockResolvedValue({
    offers: mockOtcOffers,
    total_count: mockOtcOffers.length,
  })
})

describe('OtcPortalPage', () => {
  it('renders LoadingSpinner while fetching', () => {
    jest.mocked(otcApi.getOtcOffers).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<OtcPortalPage />, {
      preloadedState: { auth: createMockAuthState({ userType: 'client' }) },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders the offer table for clients and opens BuyOtcDialog on Buy', async () => {
    renderWithProviders(<OtcPortalPage />, {
      preloadedState: {
        auth: createMockAuthState({
          userType: 'client',
          user: createMockAuthUser({
            role: 'Client',
            permissions: ['otc.trade'],
          }),
        }),
      },
    })
    await screen.findByText(mockOtcOffers[0].ticker)
    fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens BuyOnBehalfOtcDialog when an employee clicks Buy', async () => {
    renderWithProviders(<OtcPortalPage />, {
      preloadedState: {
        auth: createMockAuthState({
          userType: 'employee',
          user: createMockAuthUser({
            role: 'EmployeeAgent',
            permissions: ['otc.trade.accept', 'orders.place-on-behalf'],
          }),
        }),
      },
    })
    await screen.findByText(mockOtcOffers[0].ticker)
    fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0])
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Modify the page** to:
  1. Replace `<p>Loading...</p>` with `<LoadingSpinner />`.
  2. Read `userType` via `useAppSelector(selectUserType)`.
  3. Render `<BuyOtcDialog>` for `client`, `<BuyOnBehalfOtcDialog>` for `employee`.
  4. Use `useBuyOtcOffer` for the client mutation, `useBuyOtcOfferOnBehalf` for the employee mutation.
  5. Pull clients via `useClients()` for the employee path.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/pages/OtcPortalPage.tsx src/pages/OtcPortalPage.test.tsx
git commit -m "feat(otc): role-aware OtcPortalPage with employee buy-on-behalf"
```

---

## Task 5: Route + sidebar wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Sidebar.test.tsx`

- [ ] **Step 1: Add route**

In `src/App.tsx`, in the protected routes block, add:

```tsx
<Route path="/otc" element={<OtcPortalPage />} />
```

(No `requiredRole` because both clients with `otc.trade` permission and employees should see it. The page itself enforces role-based UI.)

- [ ] **Step 2: Add sidebar links** — modify `Sidebar.tsx`:

Inside `ClientNav` Trading group (after "Securities"):

```tsx
<Link to="/otc" className={navLinkClass}>OTC Market</Link>
```

Inside `EmployeeNav` (after "Securities"):

```tsx
<Link to="/otc" className={navLinkClass}>OTC Market</Link>
```

- [ ] **Step 3: Update sidebar test**

```tsx
it('shows OTC Market link for clients', () => {
  // existing client render helper
  expect(screen.getByRole('link', { name: /otc market/i })).toBeInTheDocument()
})
it('shows OTC Market link for employees', () => {
  // existing employee render helper
  expect(screen.getByRole('link', { name: /otc market/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run** `npm test -- src/components/layout/Sidebar.test.tsx` — expect PASS.
- [ ] **Step 5: Commit**

```sh
git add src/App.tsx src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "feat(otc): route /otc and sidebar entries"
```

---

## Task 6: Cypress smoke

**Files:**
- Create: `cypress/fixtures/otc-offers.json`
- Create: `cypress/e2e/otc.cy.ts`

- [ ] **Step 1: Fixture**

```json
{
  "offers": [
    {
      "id": 1,
      "ticker": "AAPL",
      "name": "Apple",
      "security_type": "stock",
      "quantity": 10,
      "price": "150.00",
      "seller_id": 99
    }
  ],
  "total_count": 1
}
```

- [ ] **Step 2: Smoke test**

```ts
// cypress/e2e/otc.cy.ts
describe('OTC portal', () => {
  it('client can list and buy an offer', () => {
    cy.intercept('GET', '**/api/v3/otc/offers*', { fixture: 'otc-offers.json' }).as('list')
    cy.intercept('POST', '**/api/v3/otc/offers/1/buy', { body: { id: 1 } }).as('buy')
    cy.loginAsClient()
    cy.visit('/otc')
    cy.wait('@list')
    cy.findByText('AAPL')
    cy.findAllByRole('button', { name: /buy/i }).first().click()
    cy.findByLabelText(/quantity/i).clear().type('1')
    cy.findByRole('button', { name: /confirm/i }).click()
    cy.wait('@buy')
  })
})
```

- [ ] **Step 3: Run** — `npm run cypress -- run --spec cypress/e2e/otc.cy.ts`. PASS.
- [ ] **Step 4: Commit**

```sh
git add cypress/fixtures/otc-offers.json cypress/e2e/otc.cy.ts
git commit -m "test(otc): cypress smoke for client-side buy"
```

---

## Task 7: Quality gates + spec

- [ ] Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npx prettier --check "src/**/*.{ts,tsx}"`, `npm run build` — all PASS.
- [ ] Update `specification.md` (Routes table → add `/otc`; Components → add `BuyOnBehalfOtcDialog`; API → add `buyOtcOfferOnBehalf`; Hooks → add `useBuyOtcOfferOnBehalf`; coverage table & date).
- [ ] Confirm `grep -rE "/api/v[0-9]" cypress/` is clean of stale versions.
- [ ] Commit.

```sh
git add specification.md
git commit -m "docs: update specification for OTC MVP"
```

---

## Self-Review Checklist

1. **Spec coverage:** the §29 endpoint set (list, buy, buy-on-behalf) is covered. Make-public + exercise are already shipped per `HoldingsTable.tsx`. ✅
2. **Role split:** `OtcPortalPage` branches client vs employee; tests for both paths. ✅
3. **Permissions:** `otc.trade` is referenced for clients (selected role permission, applied by `selectHasPermission`); employees fall under existing `otc.trade.accept`. ✅
4. **Component size:** `OtcPortalPage` should remain under 150 lines after the role split — if it doesn't, extract `EmployeeOtcPanel` and `ClientOtcPanel` sub-components. Set this expectation in Task 4.
5. **Out of scope (verify NOT touched):** counter-offer flow, options-contract entity, `/otc/contracts` page — those belong to roadmap phase 6.
