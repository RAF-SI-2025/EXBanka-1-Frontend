# OTC Options — slim create form + owner amount edit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the strike/premium/settlement fields from the OTC option create flow and let a listing's owner change its amount via a new `PUT /me/otc/options/:id`.

**Architecture:** The OTC Options view module (`src/views/otcOptions/`) is self-contained — its own API surface (`api/otcOptionsApi.ts`), React Query hooks, and components. We add one API function + one mutation hook, slim one payload type and the create dialog, and add an inline amount editor to the owner activity panel. Bid/counter/accept/reject flows are untouched.

**Tech Stack:** React 19 + TypeScript, TanStack Query v5, Jest + React Testing Library, Axios (shared `apiClient`), Cypress for e2e.

**Spec:** `docs/superpowers/specs/2026-06-11-otc-options-create-and-amount-edit-design.md`

---

## File Structure

- `src/views/otcOptions/types.ts` — slim `CreateOtcOptionPayload`; add `UpdateOtcOptionPayload`.
- `src/views/otcOptions/api/otcOptionsApi.ts` — add `updateListing(offerId, payload)` → `PUT /me/otc/options/:id`.
- `src/views/otcOptions/hooks/useOtcOptionMutations.ts` — add `useUpdateOtcOption()`.
- `src/views/otcOptions/components/CreateOtcOptionDialog.tsx` — remove strike/premium/settlement inputs + state.
- `src/views/otcOptions/components/OfferActivityPanel.tsx` — add inline `AmountEditor`.
- Tests: `__tests__/otcOptionsApi.test.ts`, `__tests__/CreateOtcOptionDialog.test.tsx`, `__tests__/OtcOptionsView.test.tsx`.
- Docs/e2e: `specification.md`, `cypress/e2e/otc-celina4.cy.ts`.

---

## Task 1: API `updateListing` + `UpdateOtcOptionPayload` type

**Files:**
- Modify: `src/views/otcOptions/types.ts`
- Modify: `src/views/otcOptions/api/otcOptionsApi.ts`
- Test: `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`

This task is purely additive (no existing field removed yet), so the tree compiles after it.

- [ ] **Step 1: Add a `put` mock to the api test's axios mock**

In `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`, extend the mock factory and add a handle:

```ts
jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)
const mockDelete = jest.mocked(apiClient.delete)
```

- [ ] **Step 2: Write the failing test**

Append to `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`:

```ts
describe('otcOptionsApi.updateListing', () => {
  it('PUTs /me/otc/options/:id with the new quantity', async () => {
    mockPut.mockResolvedValue({ data: undefined })

    await otcOptionsApi.updateListing(42, { quantity: '25' })

    expect(mockPut).toHaveBeenCalledWith('/me/otc/options/42', { quantity: '25' })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- otcOptionsApi.test.ts -t "updateListing"`
Expected: FAIL — `otcOptionsApi.updateListing is not a function`.

- [ ] **Step 4: Add the type**

In `src/views/otcOptions/types.ts`, in the "Mutation payloads" section, add after `CreateOtcOptionPayload`:

```ts
// PUT /me/otc/options/:id — owner-only. Changes the listing's amount of stock.
export interface UpdateOtcOptionPayload {
  quantity: string
}
```

- [ ] **Step 5: Add the API function**

In `src/views/otcOptions/api/otcOptionsApi.ts`:

Add `UpdateOtcOptionPayload` to the type import block from `@/views/otcOptions/types`.

Add the function after `createListing`:

```ts
// PUT /me/otc/options/:id — owner-only. Re-sizes the listing's amount of stock.
// The backend returns the updated listing; the FE re-fetches the lists on
// success instead of consuming the body, so the call resolves to void.
async function updateListing(offerId: number, payload: UpdateOtcOptionPayload): Promise<void> {
  await apiClient.put(`/me/otc/options/${offerId}`, payload)
}
```

Add `updateListing` to the exported `otcOptionsApi` object (place it right after `createListing`):

```ts
export const otcOptionsApi = {
  listAll,
  listMine,
  createListing,
  updateListing,
  cancelListing,
  // …rest unchanged
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- otcOptionsApi.test.ts -t "updateListing"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/views/otcOptions/types.ts src/views/otcOptions/api/otcOptionsApi.ts src/views/otcOptions/__tests__/otcOptionsApi.test.ts
git commit -m "feat(otc-options): add updateListing API for PUT /me/otc/options/:id"
```

---

## Task 2: Slim the create payload + create dialog

**Files:**
- Modify: `src/views/otcOptions/types.ts`
- Modify: `src/views/otcOptions/components/CreateOtcOptionDialog.tsx`
- Modify: `src/views/otcOptions/__tests__/CreateOtcOptionDialog.test.tsx`
- Modify: `src/views/otcOptions/__tests__/otcOptionsApi.test.ts` (existing `createListing` test uses dropped fields)

Removing fields from `CreateOtcOptionPayload` and the dialog must happen together so the tree compiles.

- [ ] **Step 1: Write/extend the failing dialog test**

Replace the body of `src/views/otcOptions/__tests__/CreateOtcOptionDialog.test.tsx` describe block with two tests (keep the existing imports, `jest.mock` for `useTickerPickers`, and the `account` fixture):

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOtcOptionDialog } from '@/views/otcOptions/components/CreateOtcOptionDialog'
import type { Account } from '@/types/account'

jest.mock('@/views/otcOptions/hooks/useTickerPickers', () => ({
  useMyStockHoldings: () => ({
    data: { securities: { positions: [{ asset_type: 'stock', symbol: 'AAPL', quantity: 50 }] } },
    isLoading: false,
  }),
  useStockCatalog: () => ({ data: undefined, isLoading: false }),
}))

const account: Account = {
  id: 1,
  account_number: '265000000000123423',
  account_name: 'Main',
  currency_code: 'USD',
  account_kind: 'current',
  account_type: 'standard',
  account_category: 'personal',
  balance: 0,
  available_balance: 0,
  reserved_balance: 0,
  status: 'ACTIVE',
  owner_id: 1,
}

describe('CreateOtcOptionDialog', () => {
  it('shows the full account in the trigger when an account is pre-selected (not the bare id)', () => {
    renderWithProviders(
      <CreateOtcOptionDialog open onOpenChange={() => {}} accounts={[account]} submitting={false} onSubmit={() => {}} />
    )
    expect(screen.getByText('Main · 265-0000000001234-23 (USD)')).toBeInTheDocument()
  })

  it('no longer renders strike price, premium, or settlement-date inputs', () => {
    renderWithProviders(
      <CreateOtcOptionDialog open onOpenChange={() => {}} accounts={[account]} submitting={false} onSubmit={() => {}} />
    )
    expect(screen.queryByLabelText(/strike/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/premium/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/settlement date/i)).not.toBeInTheDocument()
    // Quantity is kept.
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('submits only direction, ticker, quantity, account_id', async () => {
    const onSubmit = jest.fn()
    renderWithProviders(
      <CreateOtcOptionDialog open onOpenChange={() => {}} accounts={[account]} submitting={false} onSubmit={onSubmit} />
    )

    // Direction defaults to sell_initiated; pick the held ticker.
    await userEvent.click(screen.getByLabelText(/ticker/i))
    await userEvent.click(await screen.findByRole('option', { name: /AAPL/i }))
    await userEvent.type(screen.getByLabelText(/quantity/i), '10')
    await userEvent.click(screen.getByRole('button', { name: /post listing/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      direction: 'sell_initiated',
      ticker: 'AAPL',
      quantity: '10',
      account_id: 1,
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CreateOtcOptionDialog.test.tsx`
Expected: FAIL — strike/premium/settlement inputs still present; submit payload still carries the dropped fields.

- [ ] **Step 3: Slim the payload type**

In `src/views/otcOptions/types.ts`, replace `CreateOtcOptionPayload` with:

```ts
export interface CreateOtcOptionPayload {
  direction: OtcOptionDirection
  ticker: string
  quantity: string
  account_id: number
}
```

(Leave `PlaceBidPayload`, `CounterNegotiationPayload`, and `BidOrCounterInput` unchanged — bidders still name the terms.)

- [ ] **Step 4: Fix the existing api `createListing` test**

In `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`, the `createListing` test passes `strike_price`/`premium`/`settlement_date` — now excess properties. Replace its payload + assertion:

```ts
describe('otcOptionsApi.createListing', () => {
  it('POSTs /me/otc/options with payload and returns offer', async () => {
    mockPost.mockResolvedValue({ data: { offer: { id: 99 } } })

    const payload = {
      direction: 'sell_initiated' as const,
      ticker: 'AAPL',
      quantity: '10',
      account_id: 42,
    }
    const result = await otcOptionsApi.createListing(payload)

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options', payload)
    expect(result).toEqual({ offer: { id: 99 } })
  })
})
```

- [ ] **Step 5: Slim the create dialog**

In `src/views/otcOptions/components/CreateOtcOptionDialog.tsx`:

Remove the `strike`, `premium`, `settlement` state declarations:

```tsx
// DELETE these three lines:
const [strike, setStrike] = useState('')
const [premium, setPremium] = useState('')
const [settlement, setSettlement] = useState('')
```

Replace the `isValid` expression with:

```tsx
const isValid = ticker !== '' && quantity !== '' && accountId != null
```

Replace the 2-column grid block (the `<div className="grid grid-cols-2 gap-3">…</div>` holding Quantity / Strike price / Premium / Settlement date) with a single Quantity row:

```tsx
        <div>
          <Label htmlFor="new-qty">Quantity</Label>
          <Input
            id="new-qty"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
```

Replace the `onSubmit` call in the Post-listing button handler with:

```tsx
          onClick={() => {
            if (!isValid) return
            onSubmit({
              direction,
              ticker,
              quantity,
              account_id: accountId!,
            })
          }}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- CreateOtcOptionDialog.test.tsx otcOptionsApi.test.ts`
Expected: PASS (both files).

- [ ] **Step 7: Typecheck (the payload change ripples)**

Run: `npx tsc --noEmit`
Expected: zero errors. If `OtcOptionsView.tsx` or any caller references a removed field, fix it — none are expected (the dialog builds the payload and the view passes it straight to the mutation).

- [ ] **Step 8: Commit**

```bash
git add src/views/otcOptions/types.ts src/views/otcOptions/components/CreateOtcOptionDialog.tsx src/views/otcOptions/__tests__/CreateOtcOptionDialog.test.tsx src/views/otcOptions/__tests__/otcOptionsApi.test.ts
git commit -m "feat(otc-options): slim create form to direction/ticker/quantity/account"
```

---

## Task 3: `useUpdateOtcOption` hook + inline amount editor in the activity panel

**Files:**
- Modify: `src/views/otcOptions/hooks/useOtcOptionMutations.ts`
- Modify: `src/views/otcOptions/components/OfferActivityPanel.tsx`
- Modify: `src/views/otcOptions/__tests__/OtcOptionsView.test.tsx`

The amount editor is exercised through the view (matching the module's convention of testing panels via `OtcOptionsView.test.tsx`), which drives both the hook and the editor.

- [ ] **Step 1: Add `updateListing` to the view test's api mock**

In `src/views/otcOptions/__tests__/OtcOptionsView.test.tsx`, add `updateListing: jest.fn(),` to the `otcOptionsApi` mock factory object (right after `createListing: jest.fn(),`).

- [ ] **Step 2: Write the failing test**

Append inside the `describe('OtcOptionsView', …)` block:

```tsx
  it('lets the owner change the listing amount via PUT from the activity panel', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          id: 42,
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          me_owner: true,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })
    jest.mocked(otcOptionsApi.updateListing).mockResolvedValue(undefined)

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(await screen.findByRole('button', { name: /activity/i }))
    await userEvent.click(await screen.findByRole('button', { name: /^edit$/i }))
    const input = screen.getByLabelText(/^amount$/i)
    await userEvent.clear(input)
    await userEvent.type(input, '25')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() =>
      expect(otcOptionsApi.updateListing).toHaveBeenCalledWith(42, { quantity: '25' })
    )
  })
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- OtcOptionsView.test.tsx -t "change the listing amount"`
Expected: FAIL — no "Edit" button / no "Amount" input in the panel.

- [ ] **Step 4: Add the mutation hook**

In `src/views/otcOptions/hooks/useOtcOptionMutations.ts`:

Add `UpdateOtcOptionPayload` to the type import from `@/views/otcOptions/types`.

Add after `useCreateOtcOption`:

```ts
export function useUpdateOtcOption() {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: ({ offerId, payload }: { offerId: number; payload: UpdateOtcOptionPayload }) =>
      otcOptionsApi.updateListing(offerId, payload),
    onSuccess: (_d, { offerId }) => {
      notifySuccess('Amount updated')
      invalidate(offerId)
    },
  })
}
```

(No `onError` — the global mutation-cache toast covers failures per the error-handling policy.)

- [ ] **Step 5: Add the `AmountEditor` sub-component to the activity panel**

In `src/views/otcOptions/components/OfferActivityPanel.tsx`:

Add `useUpdateOtcOption` to the import from `@/views/otcOptions/hooks/useOtcOptionMutations`:

```tsx
import {
  useAcceptNegotiation,
  useCancelOtcOption,
  useCounterNegotiation,
  useRejectNegotiation,
  useUpdateOtcOption,
} from '@/views/otcOptions/hooks/useOtcOptionMutations'
```

In the header `<div className="min-w-0">` block, drop the leading `{offer.amount} @ ` from the description `<p>` (the editor now owns the amount) and add `<AmountEditor>` below it. Replace:

```tsx
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {offer.ticker} · #{String(offerId)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {offer.direction === 'sell_initiated' ? 'Sell listing' : 'Buy listing'} ·{' '}
              {offer.amount} @ {offer.strike_price} {offer.strike_currency} · premium{' '}
              {offer.premium} {offer.premium_currency} · settles{' '}
              {offer.settlement_date?.slice(0, 10)}
            </p>
          </div>
```

with:

```tsx
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {offer.ticker} · #{String(offerId)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {offer.direction === 'sell_initiated' ? 'Sell listing' : 'Buy listing'} · strike{' '}
              {offer.strike_price} {offer.strike_currency} · premium {offer.premium}{' '}
              {offer.premium_currency} · settles {offer.settlement_date?.slice(0, 10)}
            </p>
            <AmountEditor offerId={offerId} amount={offer.amount} />
          </div>
```

Add the `AmountEditor` sub-component at the end of the file (after `CounterRow`):

```tsx
function AmountEditor({ offerId, amount }: { offerId: number; amount: number | string }) {
  const update = useUpdateOtcOption()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(amount))

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
        <span>Amount: {amount}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => {
            setValue(String(amount))
            setEditing(true)
          }}
        >
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <Label htmlFor="edit-amount" className="text-xs">
        Amount
      </Label>
      <Input
        id="edit-amount"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-28"
      />
      <Button
        size="sm"
        className="h-7"
        disabled={value === '' || update.isPending}
        onClick={() =>
          update.mutate(
            { offerId, payload: { quantity: value } },
            { onSuccess: () => setEditing(false) }
          )
        }
      >
        {update.isPending ? 'Saving…' : 'Save'}
      </Button>
      <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  )
}
```

(`useState`, `Button`, `Input`, `Label` are already imported in this file.)

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- OtcOptionsView.test.tsx -t "change the listing amount"`
Expected: PASS.

- [ ] **Step 7: Run the full view + mutations specs to catch regressions**

Run: `npm test -- OtcOptionsView.test.tsx`
Expected: all PASS (the description-line wording changed but no existing test asserts the dropped `{amount} @` text).

- [ ] **Step 8: Commit**

```bash
git add src/views/otcOptions/hooks/useOtcOptionMutations.ts src/views/otcOptions/components/OfferActivityPanel.tsx src/views/otcOptions/__tests__/OtcOptionsView.test.tsx
git commit -m "feat(otc-options): owner can edit listing amount via PUT in activity panel"
```

---

## Task 4: Update `specification.md`

**Files:**
- Modify: `specification.md`

Documentation-only — no test step.

- [ ] **Step 1: Locate the OTC Options section**

Run: `grep -n "otc/options\|CreateOtcOptionPayload\|OTC Options\|otcOptionsApi" specification.md`

- [ ] **Step 2: Apply the edits**

In the OTC Options coverage of `specification.md`:
- API Layer: add `updateListing(offerId, payload) → PUT /me/otc/options/:id`.
- Custom Hooks: add `useUpdateOtcOption`.
- Types: change `CreateOtcOptionPayload` to `{ direction, ticker, quantity, account_id }`; add `UpdateOtcOptionPayload { quantity }`.
- Components: note `CreateOtcOptionDialog` now collects direction/ticker/quantity/account only; `OfferActivityPanel` has an inline owner amount editor.
- Update the `_Last updated_` date to `2026-06-11`.

- [ ] **Step 3: Refresh the coverage table**

Run: `npm test -- --coverage --coverageReporters=text 2>&1 | tail -40`
Update the coverage table / percentages in `specification.md` for the changed files.

- [ ] **Step 4: Commit**

```bash
git add specification.md
git commit -m "docs(spec): OTC options slim create payload + updateListing/amount edit"
```

---

## Task 5: Update the Cypress suite

**Files:**
- Modify: `cypress/e2e/otc-celina4.cy.ts`

Per the mandatory Cypress-on-API-change policy.

- [ ] **Step 1: Audit current OTC intercepts and create-body assertions**

Run: `grep -nE "me/otc/options|strike_price|premium|settlement_date|createListing|New listing|Post listing" cypress/e2e/otc-celina4.cy.ts`

- [ ] **Step 2: Add a PUT intercept for the amount edit**

Where the suite drives the owner activity panel (or alongside the other `/me/otc/options` intercepts), add:

```ts
cy.intercept('PUT', '**/api/v3/me/otc/options/*', { statusCode: 200, body: {} }).as('updateOtcOption')
```

If the scenario edits an amount, assert the request body:

```ts
cy.wait('@updateOtcOption').its('request.body').should('deep.equal', { quantity: '25' })
```

- [ ] **Step 3: Drop stale create-body term-field assertions**

If any `cy.intercept('POST', '**/api/v3/me/otc/options', …)` handler or request-body assertion references `strike_price` / `premium` / `settlement_date`, remove those fields so the mocked create matches `{ direction, ticker, quantity, account_id }`. Likewise, if the suite fills strike/premium/settlement inputs in the New-listing dialog, delete those steps (the inputs no longer exist).

- [ ] **Step 4: Verify no stale references remain in the create path**

Run: `grep -nE "strike_price|premium|settlement_date" cypress/e2e/otc-celina4.cy.ts`
Expected: any remaining hits are on bid/counter/negotiation paths only — none on the `POST /me/otc/options` create body.

- [ ] **Step 5: Commit**

```bash
git add cypress/e2e/otc-celina4.cy.ts
git commit -m "test(cypress): align OTC options create/edit with slim payload + PUT"
```

---

## Task 6: Post-implementation quality gates

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 2: Lint + types**

Run: `npm run lint` then `npx tsc --noEmit`
Expected: zero violations.

- [ ] **Step 3: Format check**

Run: `npx prettier --check "src/**/*.{ts,tsx}"`
Expected: formatted (run `npx prettier --write` on any flagged OTC files, then re-commit).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Final verification statement**

Confirm against the spec: POST body slimmed, `PUT /me/otc/options/:id` wired, create dialog shows only direction/ticker/quantity/account, owner amount editor works, spec + Cypress updated. Report results with command output.

---

## Self-Review

- **Spec coverage:** POST slim (Task 2) ✓; `UpdateOtcOptionPayload` + `updateListing` (Task 1) ✓; `useUpdateOtcOption` (Task 3) ✓; create-dialog field removal (Task 2) ✓; option-A inline amount editor (Task 3) ✓; error handling = global toast (Task 3, no `onError`) ✓; tests for api/dialog/panel (Tasks 1–3) ✓; specification.md (Task 4) ✓; Cypress (Task 5) ✓.
- **Placeholders:** none — every code/edit step shows concrete code.
- **Type consistency:** `UpdateOtcOptionPayload { quantity: string }` defined in Task 1 and consumed identically by `updateListing` (Task 1), `useUpdateOtcOption` (Task 3), and the `AmountEditor` (`{ quantity: value }`, Task 3). `updateListing(offerId, payload)` signature matches its mutation call `{ offerId, payload }`. `CreateOtcOptionPayload` slim shape (Task 2) matches the dialog's `onSubmit` and the api test (Task 2).
