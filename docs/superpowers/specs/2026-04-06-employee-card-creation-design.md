# Employee Card Creation for Company Accounts

_Date: 2026-04-06_

## Overview

Employees need a UI to create a payment card linked to a company (business) account on behalf of a client. The card is issued under the client's identity as an authorized person on the account.

## User Story

As an employee, when viewing the cards for a company account, I want to create a new card by searching for a company account, choosing the client who will own the card, and selecting the card brand — so that a physical card is issued in that client's name.

---

## Feature Scope

- New `AccountSelector` component (reusable search-as-you-type, same pattern as `ClientSelector`)
- New `CreateCardDialog` component with:
  - Company account search (`AccountSelector`)
  - Card owner/client search (`ClientSelector`, existing)
  - Card brand dropdown (Visa / MasterCard / DinaCard)
- "Create Card" button added to `AdminAccountCardsPage`
- Two new API functions in `src/lib/api/cards.ts`
- One new mutation hook in `src/hooks/useCards.ts`

Out of scope: authorized person management UI, card name overrides, virtual cards.

---

## API

### Step 1 — Create Authorized Person

```
POST /api/cards/authorized-person
Auth: Employee JWT + cards.manage permission

Body:
{
  "first_name": string,
  "last_name": string,
  "date_of_birth": number | undefined,
  "gender": string | undefined,
  "email": string | undefined,
  "phone": string | undefined,
  "address": string | undefined,
  "account_id": number
}

Response 201: { id: number, first_name, last_name, ... }
```

### Step 2 — Issue Card

```
POST /api/cards
Auth: Employee JWT + cards.create permission

Body:
{
  "account_number": string,
  "owner_id": number,        // authorized person id from step 1
  "owner_type": "AUTHORIZED_PERSON",
  "card_brand": "VISA" | "MASTERCARD" | "DINA"
}

Response 201: Card object
```

Both calls happen sequentially on submit. If step 1 fails, step 2 is not attempted and an error is shown.

---

## Components

### `AccountSelector` (`src/components/accounts/AccountSelector.tsx`)

Props:
```typescript
interface AccountSelectorProps {
  onAccountSelected: (account: Account | null) => void
  selectedAccount: Account | null
  businessOnly?: boolean  // when true, filters to account_category === 'business'
}
```

Behaviour (mirrors `ClientSelector`):
- Text input triggers `useAllAccounts` with `account_number_filter` (debounced search)
- Results dropdown shows account number + account name + currency
- When selected: shows summary row with "Change" button
- `businessOnly` prop filters results client-side

### `CreateCardDialog` (`src/components/admin/CreateCardDialog.tsx`)

Props:
```typescript
interface CreateCardDialogProps {
  open: boolean
  onClose: () => void
}
```

Internal state:
- `selectedAccount: Account | null`
- `selectedClient: Client | null`
- `cardBrand: 'VISA' | 'MASTERCARD' | 'DINA' | ''`
- `error: string | null`

Submit is disabled until all three fields are filled. On submit:
1. Calls `createAuthorizedPerson({ ...client fields, account_id: account.id })`
2. On success, calls `createCard({ account_number, owner_id: ap.id, owner_type: 'AUTHORIZED_PERSON', card_brand })`
3. On success: closes dialog, invalidates `['cards', 'account', account_number]` cache
4. On any error: shows error message in dialog, does not close

### `AdminAccountCardsPage` (modified)

Adds a "Create Card" button to the page header. Clicking it opens `CreateCardDialog`.

---

## New API Functions (`src/lib/api/cards.ts`)

```typescript
export async function createAuthorizedPerson(
  payload: CreateAuthorizedPersonPayload
): Promise<{ id: number }>

export async function createCard(
  payload: CreateCardPayload
): Promise<Card>
```

Where:
```typescript
interface CreateAuthorizedPersonPayload {
  first_name: string
  last_name: string
  date_of_birth?: number
  gender?: string
  email?: string
  phone?: string
  address?: string
  account_id: number
}

interface CreateCardPayload {
  account_number: string
  owner_id: number
  owner_type: 'AUTHORIZED_PERSON'
  card_brand: string
}
```

---

## New Hook (`src/hooks/useCards.ts`)

```typescript
export function useCreateCard(): UseMutationResult
// mutationFn: async (args: { account: Account, client: Client, cardBrand: string }) => {
//   const ap = await createAuthorizedPerson({ ...client fields, account_id: account.id })
//   return createCard({ account_number: account.account_number, owner_id: ap.id, owner_type: 'AUTHORIZED_PERSON', card_brand: cardBrand })
// }
// onSuccess: invalidates ['cards', 'account', account.account_number]
```

---

## Types (`src/types/card.ts` or `src/types/authorized-person.ts`)

Add `CreateAuthorizedPersonPayload` and `CreateCardPayload` if not already present.

---

## Testing

| File | Tests |
|------|-------|
| `AccountSelector.test.tsx` | renders search input; shows matching accounts; selecting an account shows summary row; Change clears selection |
| `CreateCardDialog.test.tsx` | submit disabled until all fields filled; calls createAuthorizedPerson then createCard on submit; shows error on failure; closes on success |
| `AdminAccountCardsPage.test.tsx` | "Create Card" button opens dialog |

TDD order: tests written before implementation for each file.

---

## File Checklist

New files:
- `src/components/accounts/AccountSelector.tsx`
- `src/components/accounts/AccountSelector.test.tsx`
- `src/components/admin/CreateCardDialog.tsx`
- `src/components/admin/CreateCardDialog.test.tsx`

Modified files:
- `src/lib/api/cards.ts` — add `createAuthorizedPerson`, `createCard`
- `src/hooks/useCards.ts` — add `useCreateCard`
- `src/pages/AdminAccountCardsPage.tsx` — add "Create Card" button + dialog
- `src/pages/AdminAccountCardsPage.test.tsx` — add dialog open test
- `src/types/card.ts` or `src/types/authorized-person.ts` — add payload types
