# OTC Options — slim create form + owner amount edit

_Date: 2026-06-11_

## Background

The backend OTC options contract changed:

- `POST /me/otc/options` no longer accepts `strike_price`, `premium`, or
  `settlement_date`. A listing is posted with just its direction, ticker,
  quantity, and a settlement account. Bidders name the terms (strike / premium /
  settlement date) when they bid — those routes are unchanged.
- A new `PUT /me/otc/options/:id` lets the listing's **owner** change the
  listing's amount of stock. Request body: `{ quantity }`.

The frontend must follow: drop the three term fields from the create dialog, add
the update endpoint + mutation, and give the owner a way to change the amount
from the offer-activity panel.

## Scope

In scope (OTC Options view module only):

- `src/views/otcOptions/types.ts`
- `src/views/otcOptions/components/CreateOtcOptionDialog.tsx`
- `src/views/otcOptions/api/otcOptionsApi.ts`
- `src/views/otcOptions/hooks/useOtcOptionMutations.ts`
- `src/views/otcOptions/components/OfferActivityPanel.tsx`
- Their tests
- `specification.md` and the Cypress suite

Out of scope: bid / counter / accept / reject flows (their payloads are
unchanged), the OTC portal module, and the unrelated working-tree changes
already present in other view modules.

## Contract

### POST /me/otc/options (changed)

Request body now:

```json
{ "direction": "sell_initiated", "ticker": "AAPL", "quantity": "10", "account_id": 42 }
```

`strike_price`, `premium`, `settlement_date` are removed.

### PUT /me/otc/options/:id (new)

Owner-only. Changes the listing's amount.

```json
{ "quantity": "25" }
```

Response: the updated listing (consumed loosely by the FE — we only re-fetch
the lists on success, so the response body is not relied upon for rendering).

## Design

### 1. Types (`types.ts`)

```ts
export interface CreateOtcOptionPayload {
  direction: OtcOptionDirection
  ticker: string
  quantity: string
  account_id: number
}

export interface UpdateOtcOptionPayload {
  quantity: string
}
```

`strike_price`, `premium`, `settlement_date` are removed from
`CreateOtcOptionPayload`. `PlaceBidPayload`, `CounterNegotiationPayload`, and the
revision/negotiation types keep their term fields untouched.

### 2. Create dialog (`CreateOtcOptionDialog.tsx`)

Remove the strike-price, premium, and settlement-date `<Input>`s and their
state (`strike`, `premium`, `settlement`). Keep direction, ticker, quantity, and
settlement account. The quantity field moves out of the now-removed 2-column
grid into a standalone row.

- `isValid = ticker !== '' && quantity !== '' && accountId != null`
- `onSubmit({ direction, ticker, quantity, account_id: accountId })`

### 3. API (`otcOptionsApi.ts`)

```ts
async function updateListing(
  offerId: number,
  payload: UpdateOtcOptionPayload
): Promise<void> {
  await apiClient.put(`/me/otc/options/${offerId}`, payload)
}
```

Exported on the `otcOptionsApi` object. `createListing` is unchanged in shape —
it just receives the slimmer payload from the type.

### 4. Mutation (`useOtcOptionMutations.ts`)

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

No custom `onError` — the global mutation-cache toast covers failures, per the
error-handling policy.

### 5. Activity panel amount editor (`OfferActivityPanel.tsx`) — option A

The header line currently renders:

```
{amount} @ {strike} {strike_currency} · premium {premium} … · settles …
```

Add an inline amount editor co-located with `offer.amount`:

- Default state: render the amount as today, with a small "Edit" ghost button.
- Editing state: replace the amount text with a compact `<Input>` (seeded from
  `offer.amount`) plus "Save" and "Cancel" buttons.
- "Save" calls `useUpdateOtcOption().mutate({ offerId, payload: { quantity } })`;
  on success the editor collapses and the lists invalidate so the header
  re-renders with the new amount.
- Disabled while the mutation is pending ("Saving…").

This is extracted into a small `AmountEditor` sub-component within the file to
keep the main component readable (the file already hosts several local
sub-components: `ChainRevisionsView`, `AcceptRow`, `CounterRow`).

## Error handling

- `useUpdateOtcOption` has no `onError` → global `mutationCache.onError` toasts
  on failure (acceptable UX for this action). Success shows `notifySuccess`.
- No new query paths; no empty catches.

## Testing (TDD — tests written first)

1. **`otcOptionsApi.test.ts`** — `updateListing` PUTs to `/me/otc/options/:id`
   with `{ quantity }`.
2. **`useOtcOptionMutations` / view test** — `useUpdateOtcOption` calls the API
   and invalidates on success (covered via the panel test if a dedicated hook
   test is not already the module's pattern).
3. **`CreateOtcOptionDialog.test.tsx`** — the strike/premium/settlement inputs
   are **absent**; submitting with direction + ticker + quantity + account
   produces `{ direction, ticker, quantity, account_id }` with no term fields.
4. **`OfferActivityPanel` test** — owner clicks Edit, changes the amount, Save
   fires `PUT /me/otc/options/:id` with the new quantity; the editor collapses.

## Specification & Cypress (mandatory)

- **`specification.md`** — update the OTC Options section: create-payload shape,
  new `updateListing` API function + `useUpdateOtcOption` hook, new
  `UpdateOtcOptionPayload` type, activity-panel amount edit. Re-run coverage and
  update the table + `_Last updated_` date.
- **Cypress** — add a `cy.intercept('PUT', '**/api/v3/me/otc/options/*')` for the
  amount-edit path and adjust the create-listing intercept/body assertions so
  they no longer expect the dropped term fields. Verify no stale assertions on
  `strike_price`/`premium`/`settlement_date` remain in the create path of the
  changed specs. Use the host-agnostic `**/api/v3/...` glob.

## Risks / notes

- The working tree already contains unrelated modifications across other view
  modules (payments, transfers, cards, loans, a shared `format.ts`). This work
  must not touch or depend on those.
- `OfferActivityPanel.tsx` is already large; the amount editor is added as a
  contained sub-component to avoid growing the main component's complexity.
