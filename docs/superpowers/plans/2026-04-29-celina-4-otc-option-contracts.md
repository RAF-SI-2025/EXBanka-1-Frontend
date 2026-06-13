# Celina 4 — OTC Option Contracts (Negotiation Flow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the §29 OTC option-contract negotiation portal — *Aktivne ponude* and *Sklopljeni ugovori* per `Celina 4(Nova).md §Portal: OTC Ponude i Ugovori`. Two parties exchange revisions on a stock-option contract until one accepts or rejects. On accept, a premium-payment SAGA creates an `OptionContract` that the buyer can later exercise.

**Architecture:**
- All routes call the §29 endpoints in `REST_API_v3.md`.
- Identity model: backend uses `OwnerIsBankIfEmployee` middleware — when an employee calls `POST /otc/offers`, the offer's `owner` is the bank; clients act for themselves. The frontend does NOT need to send any owner field.
- Permissions for any *write* (create / counter / accept / reject / exercise): both `securities.trade` AND `otc.trade`. Read endpoints accept any auth.
- Server data via TanStack Query. No Redux — multi-step UX (counter → accept → exercise) is sequential mutations, not a saga that needs cross-component state.
- Optimistic-feel: after counter / accept / reject, invalidate `['otc', 'offers']`, `['otc', 'offers', id]`, `['otc', 'me-offers']`, `['otc', 'me-contracts']` so both parties see fresh state on the next render.

**Tech Stack:** React 19, TanStack Query v5, Shadcn UI, Tailwind, react-router v6, react-hook-form + zod, Jest + RTL.

**Backend reference:** `REST_API_v3.md` §29 (OTC Option Contracts).

---

## Locked API contract (from §29)

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/v3/otc/offers` | `securities.trade` + `otc.trade` | Create new offer (open negotiation) |
| `POST /api/v3/otc/offers/:id/counter` | same | Send counter-offer |
| `POST /api/v3/otc/offers/:id/accept` | same | Accept current revision; creates `OptionContract` |
| `POST /api/v3/otc/offers/:id/reject` | same | Reject; status → `REJECTED` |
| `GET /api/v3/otc/offers/:id` | any JWT | Offer + revision history |
| `GET /api/v3/me/otc/offers` | any JWT (`OwnerIsBankIfEmployee`) | Caller's offers; filters `role` (`initiator`/`counterparty`/`either`) |
| `POST /api/v3/otc/contracts/:id/exercise` | `securities.trade` + `otc.trade` | 5-phase exercise SAGA |
| `GET /api/v3/otc/contracts/:id` | any JWT | One contract |
| `GET /api/v3/me/otc/contracts` | any JWT (`OwnerIsBankIfEmployee`) | Caller's contracts; filters `role` (`buyer`/`seller`/`either`) |

```ts
// src/types/otcOption.ts — locked

export type OtcOfferDirection = 'sell_initiated' | 'buy_initiated'
export type OtcOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
export type OptionContractStatus = 'ACTIVE' | 'EXERCISED' | 'EXPIRED'

export interface OtcParty {
  owner_type: 'client' | 'bank'
  owner_id: number | null  // null for bank
}

export interface OtcOffer {
  id: number
  direction: OtcOfferDirection
  status: OtcOfferStatus
  stock_id: number
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string  // YYYY-MM-DD
  initiator: OtcParty
  counterparty: OtcParty
  last_modified_at: string
  unread?: boolean  // present on /me/otc/offers
}

export interface OtcOfferRevision {
  revision_number: number
  modified_by: { principal_type: 'client' | 'employee'; principal_id: number }
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  created_at: string
}

export interface OptionContract {
  id: number
  status: OptionContractStatus
  stock_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
  buyer: OtcParty
  seller: OtcParty
}

export interface CreateOtcOfferPayload {
  direction: OtcOfferDirection
  stock_id: number
  quantity: string
  strike_price: string
  premium?: string
  settlement_date: string
  counterparty_user_id?: number
  counterparty_system_type?: 'client' | 'employee'
}

export interface CounterOtcOfferPayload {
  quantity?: string
  strike_price?: string
  premium?: string
  settlement_date?: string
}

export interface AcceptOtcOfferPayload {
  buyer_account_id: number
  seller_account_id: number
}

export interface ExerciseContractPayload {
  buyer_account_id: number
  seller_account_id: number
}

export interface MyOffersFilters {
  role?: 'initiator' | 'counterparty' | 'either'
  page?: number
  page_size?: number
}

export interface MyContractsFilters {
  role?: 'buyer' | 'seller' | 'either'
  page?: number
  page_size?: number
}
```

**Notable contract details to design around:**
- The `OtcOffer` and `OptionContract` are **distinct entities** — the offer is the negotiation thread; the contract is the artifact that exists only after `/accept`. The detail page must handle both.
- The "unread" indicator the spec asks for (`Celina 4(Nova).md §Aktivne ponude — Obaveštenja - opciono`) is exposed by the backend on `GET /me/otc/offers` as an `unread` boolean. No client-side timestamp tracking needed.
- Revisions only come back from `GET /otc/offers/:id` — the list views use the latest snapshot stored on the offer itself.
- The §29 `POST /otc/offers` endpoint shares its URL with the §28 `GET /otc/offers` — they're disambiguated only by HTTP verb. The existing `getOtcOffers` API function (which targets §28) keeps working for the discovery page; the new one creates option offers.
- Backend uses **decimal-as-string** for `quantity`, `strike_price`, `premium`. Never coerce to `Number` for arithmetic; rely on backend computation when display arithmetic is required (e.g., total = quantity × strike_price → ask backend or compute via decimal.js / Bigint where necessary). For purely-cosmetic display, formatted strings are fine.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/otcOption.ts` | Create | All types from "Locked API contract" |
| `src/__tests__/fixtures/otcOption-fixtures.ts` | Create | `createMockOtcOffer`, `createMockOtcOfferRevision`, `createMockOptionContract`, datasets |
| `src/lib/api/otcOption.ts` | Create | All nine endpoints |
| `src/lib/api/otcOption.test.ts` | Create | Unit tests with `apiClient` mocked |
| `src/hooks/useOtcOptions.ts` | Create | `useOtcOffer`, `useMyOtcOffers`, `useCreateOtcOffer`, `useCounterOtcOffer`, `useAcceptOtcOffer`, `useRejectOtcOffer`, `useOtcContract`, `useMyOtcContracts`, `useExerciseOtcContract` |
| `src/hooks/useOtcOptions.test.ts` | Create | Hook tests |
| `src/components/otc/CreateOptionOfferDialog.tsx` | Create | Form to open a new offer (direction, stock, quantity, strike, premium, settlement, optional counterparty) |
| `src/components/otc/CreateOptionOfferDialog.test.tsx` | Create | RTL |
| `src/components/otc/OfferCard.tsx` | Create | One row in active-offers list with unread dot + color-coded deviation chip per spec |
| `src/components/otc/OfferCard.test.tsx` | Create | RTL |
| `src/components/otc/OfferDetailPanel.tsx` | Create | Header with status, parties, current terms, accept/reject/counter actions |
| `src/components/otc/OfferDetailPanel.test.tsx` | Create | RTL |
| `src/components/otc/OfferRevisionsTable.tsx` | Create | Chronological revisions list (rev#, by, terms, timestamp) |
| `src/components/otc/OfferRevisionsTable.test.tsx` | Create | RTL |
| `src/components/otc/CounterOfferDialog.tsx` | Create | Diff-style form pre-filled with current terms |
| `src/components/otc/CounterOfferDialog.test.tsx` | Create | RTL |
| `src/components/otc/AcceptOfferDialog.tsx` | Create | Pick buyer + seller accounts; warn on cross-currency |
| `src/components/otc/AcceptOfferDialog.test.tsx` | Create | RTL |
| `src/components/otc/ContractCard.tsx` | Create | One row in contracts list |
| `src/components/otc/ContractCard.test.tsx` | Create | RTL |
| `src/components/otc/ExerciseContractDialog.tsx` | Create | Pick buyer + seller accounts; final confirmation |
| `src/components/otc/ExerciseContractDialog.test.tsx` | Create | RTL |
| `src/pages/OtcOffersPage.tsx` | Create | List view with role tabs (Initiator / Counterparty / Both) |
| `src/pages/OtcOffersPage.test.tsx` | Create | Page-level RTL |
| `src/pages/OtcOfferDetailPage.tsx` | Create | Detail view with revisions + actions |
| `src/pages/OtcOfferDetailPage.test.tsx` | Create | Page-level RTL |
| `src/pages/OtcContractsPage.tsx` | Create | Tabs: Active / Expired |
| `src/pages/OtcContractsPage.test.tsx` | Create | Page-level RTL |
| `src/pages/OtcContractDetailPage.tsx` | Create | Detail with Exercise CTA |
| `src/pages/OtcContractDetailPage.test.tsx` | Create | Page-level RTL |
| `src/App.tsx` | Modify | Routes for `/otc/offers`, `/otc/offers/:id`, `/otc/offers/new`, `/otc/contracts`, `/otc/contracts/:id` |
| `src/components/layout/Sidebar.tsx` | Modify | "OTC Offers" + "OTC Contracts" links in Trading group |
| `cypress/fixtures/otc-option-offers.json`, `otc-offer-detail.json`, `otc-contracts.json` | Create | Match §29 shapes |
| `cypress/e2e/otc-options.cy.ts` | Create | Smoke: create → counter → accept → exercise |
| `specification.md` | Modify | Routes, Pages, Components, API, Hooks, Types, Coverage |

**Why so many components:** the negotiation UX has six distinct interaction surfaces (create, list, detail+revisions, counter, accept, exercise). Splitting them keeps each file ≤150 lines and lets them be tested in isolation. The pages are thin wrappers.

---

## Sidebar / route additions

| Route | Page | Visibility |
|---|---|---|
| `/otc/offers` | `OtcOffersPage` | `securities.trade` (or any auth — page itself shows action buttons gated) |
| `/otc/offers/new` | (modal triggered from list, not a separate route) | n/a |
| `/otc/offers/:id` | `OtcOfferDetailPage` | any auth |
| `/otc/contracts` | `OtcContractsPage` | any auth |
| `/otc/contracts/:id` | `OtcContractDetailPage` | any auth |

(Note: the existing `/otc` route from phase 1 is the §28 stock-public OTC discovery page. We add the new `/otc/offers` and `/otc/contracts` alongside it. Sidebar groups them.)

---

## Task 1: Types + fixtures

- [ ] Step 1: Write `src/types/otcOption.ts` from the locked contract.
- [ ] Step 2: Write `src/__tests__/fixtures/otcOption-fixtures.ts` with factories for `OtcOffer`, `OtcOfferRevision`, `OptionContract`.
- [ ] Step 3: `npx tsc --noEmit` — PASS.
- [ ] Step 4: COMMIT `feat(otc-option): types + fixtures`.

---

## Task 2: API layer

- [ ] Implement nine functions in `src/lib/api/otcOption.ts`:

```ts
export async function createOtcOffer(payload: CreateOtcOfferPayload): Promise<{ offer: OtcOffer }>
export async function counterOtcOffer(id: number, payload: CounterOtcOfferPayload): Promise<{ offer: OtcOffer }>
export async function acceptOtcOffer(id: number, payload: AcceptOtcOfferPayload): Promise<{ offer: OtcOffer; contract: OptionContract }>
export async function rejectOtcOffer(id: number): Promise<{ offer: OtcOffer }>
export async function getOtcOffer(id: number): Promise<{ offer: OtcOffer; revisions: OtcOfferRevision[] }>
export async function getMyOtcOffers(filters: MyOffersFilters = {}): Promise<{ offers: OtcOffer[]; total: number }>
export async function getOtcContract(id: number): Promise<{ contract: OptionContract }>
export async function getMyOtcContracts(filters: MyContractsFilters = {}): Promise<{ contracts: OptionContract[]; total: number }>
export async function exerciseOtcContract(id: number, payload: ExerciseContractPayload): Promise<{ contract: OptionContract; holding: { id: number; stock_id: number; quantity: string; owner: OtcParty } }>
```

- [ ] RED → impl → GREEN per function.
- [ ] COMMIT `feat(otc-option): API layer`.

---

## Task 3: Hooks

Mirror existing `useOtc.ts` structure:

| Hook | Type | Query key / invalidation |
|---|---|---|
| `useOtcOffer(id)` | useQuery | `['otc-option', 'offer', id]` |
| `useMyOtcOffers(filters)` | useQuery | `['otc-option', 'me-offers', filters]` |
| `useCreateOtcOffer()` | useMutation | invalidates `['otc-option', 'me-offers']` |
| `useCounterOtcOffer(id)` | useMutation | invalidates `['otc-option', 'offer', id]` + `['otc-option', 'me-offers']` |
| `useAcceptOtcOffer(id)` | useMutation | invalidates `['otc-option', 'offer', id]`, `['otc-option', 'me-offers']`, `['otc-option', 'me-contracts']`, `['accounts']` |
| `useRejectOtcOffer(id)` | useMutation | invalidates `['otc-option', 'offer', id]` + `['otc-option', 'me-offers']` |
| `useOtcContract(id)` | useQuery | `['otc-option', 'contract', id]` |
| `useMyOtcContracts(filters)` | useQuery | `['otc-option', 'me-contracts', filters]` |
| `useExerciseOtcContract(id)` | useMutation | invalidates `['otc-option', 'contract', id]`, `['otc-option', 'me-contracts']`, `['portfolio']`, `['accounts']` |

- [ ] RED → impl → GREEN per hook.
- [ ] COMMIT `feat(otc-option): hooks`.

---

## Task 4: `OfferCard` + color-coded deviation

The spec asks: green ≤ ±5%, yellow ±5-20%, red > ±20% deviation. Define `getDeviationLevel(strikePrice, marketPrice): 'green' | 'yellow' | 'red'` in `src/lib/otcDeviation.ts` (pure, testable). Market price comes from `useStock(stock_id)`.

- [ ] Tests for the helper (3 cases).
- [ ] RED → impl `OfferCard` (chip color, unread dot, "Open" CTA).
- [ ] COMMIT.

---

## Task 5: Detail panel + revisions table + offer detail page

`OfferDetailPanel` shows status pill, parties (resolve names via `useEmployee`/`useClient` for non-bank parties), current terms.
`OfferRevisionsTable` lists revisions in chronological order (oldest first or newest first — spec doesn't say, default to newest first).
`OtcOfferDetailPage` composes both + action buttons that open `CounterOfferDialog`, `AcceptOfferDialog`, or `RejectOfferDialog`.

Action buttons are gated by:
- Status must be `PENDING`
- Caller must be the `last_modified_by`'s counterpart (i.e. it's "your turn"). Compute from current user vs `last_modified_by` of the latest revision.
- Must have `securities.trade` AND `otc.trade`.

- [ ] RED → impl per component.
- [ ] COMMIT.

---

## Task 6: Counter / Accept / Reject dialogs

- `CounterOfferDialog` — form with current terms pre-filled; submit calls `useCounterOtcOffer(id).mutate(payload)`. Only changed fields are sent (zod transform).
- `AcceptOfferDialog` — pick `buyer_account_id` + `seller_account_id`. Validation: buyer has the account; seller has the account; cross-currency warning if currencies differ. On 409 with `code='insufficient_buyer_funds'` show inline error.
- Reject — simple confirmation, fires `useRejectOtcOffer(id).mutate()`.

- [ ] RED → impl per dialog.
- [ ] COMMIT.

---

## Task 7: List page

`OtcOffersPage`:
- Tabs for `role`: "Initiator" / "Counterparty" / "Both" → query `useMyOtcOffers({ role })`.
- Per-row `OfferCard`. Click → `/otc/offers/:id`.
- "New Offer" button → `CreateOptionOfferDialog`.

Skeleton loading state per the motion polish convention.

- [ ] RED → impl.
- [ ] COMMIT.

---

## Task 8: Contracts page + detail + Exercise

`OtcContractsPage` — tabs Active / Expired (filter contracts by `status`).
`OtcContractDetailPage` — header with stock, quantity, strike, premium, settlement_date, parties, status. Exercise button enabled only if `status === 'ACTIVE'` and caller is the buyer.
`ExerciseContractDialog` — pick accounts, confirm strike × quantity total, submit. On success, navigate to `/portfolio?tab=holdings` (where the new shares now appear).

- [ ] RED → impl per component.
- [ ] COMMIT.

---

## Task 9: Routes + sidebar

```tsx
<Route path="/otc/offers" element={<OtcOffersPage />} />
<Route path="/otc/offers/:id" element={<OtcOfferDetailPage />} />
<Route path="/otc/contracts" element={<OtcContractsPage />} />
<Route path="/otc/contracts/:id" element={<OtcContractDetailPage />} />
```

Sidebar: add "OTC Offers" + "OTC Contracts" to Trading group in both `ClientNav` and `EmployeeNav`.

- [ ] RED test on Sidebar.
- [ ] COMMIT.

---

## Task 10: Cypress smoke

Author `cypress/e2e/otc-options.cy.ts` covering: client logs in → `/otc/offers/new` → create offer → counter → accept → see contract in `/otc/contracts` → exercise → see holding in portfolio.

Mock all nine endpoints with `cy.intercept`. Use the host-agnostic `**/api/v3/...` glob.

- [ ] Author + run — PASS.
- [ ] COMMIT.

---

## Task 11: Quality gates + spec update

- [ ] Run all gates (`npm test`, lint, types, prettier, build) — PASS.
- [ ] Update `specification.md`:
  - Routes table → `/otc/offers`, `/otc/offers/:id`, `/otc/contracts`, `/otc/contracts/:id`
  - Pages section → 4 new pages
  - Components → ~10 new components
  - State Management → API + Hooks rows
  - Types → new `otcOption.ts`
  - Coverage table + last-updated date
- [ ] `grep -rE "/api/v[0-9]" cypress/` clean.
- [ ] COMMIT.

---

## Self-Review Checklist

1. **Spec coverage:** every §Portal: OTC Ponude i Ugovori sub-section is mapped:
   - "Aktivne ponude" → Task 4 + Task 7 ✅
   - "Sklopljeni ugovori" → Task 8 ✅
   - "Vizualizacija" (color deviation) → Task 4 helper ✅
   - "Obaveštenja" (unread indicator) → backend `unread` flag → Task 4 ✅
   - "Iskoristi" (exercise) → Task 8 ✅
2. **Permissions:** every action button is gated on `securities.trade && otc.trade`.
3. **Component size:** each ≤150 lines after the split.
4. **Locked API contract:** centralized in `src/lib/api/otcOption.ts`; field names and paths match §29 verbatim.
5. **Error handling:** every mutation toasts via the global fallback (CLAUDE.md mandate). Inline errors for the actionable cases (insufficient funds, insufficient shares, cross-currency conversion).
6. **Decimal handling:** strings throughout; backend computes totals.
7. **TDD:** every implementation step preceded by a failing test.

---

## Open questions to confirm before starting

1. Should the action buttons (Counter / Accept / Reject) be hidden when the latest revision was made by the current user (i.e., they're waiting on the other side), or just disabled? **Recommendation:** disable with a tooltip "Waiting for counterparty" — better discoverability than hiding.
2. The `unread` flag from `GET /me/otc/offers` — does the backend reset it on `GET /otc/offers/:id`? If not, we need a separate "mark read" endpoint or a frontend cache update. Confirm before Task 4.
3. Cross-currency strike: when buyer's account currency differs from `strike_price` currency, exchange-service converts. Spec says nothing about whether the user picks the conversion rate or accepts the prevailing one. Confirm UX with backend.
