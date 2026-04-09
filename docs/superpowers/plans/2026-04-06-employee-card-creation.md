# Employee Card Creation for Company Accounts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Create Card" button to `AdminAccountCardsPage` that lets an employee search for a company account, pick a client as the card owner, select a card brand, and issue the card (creating an authorized person + card in two API calls).

**Architecture:** New `AccountSelector` component mirrors the existing `ClientSelector` pattern (search-as-you-type, dropdown list). A `CreateCardDialog` composes both selectors plus a card brand dropdown. On submit it calls `POST /api/cards/authorized-person` then `POST /api/cards` sequentially. Wired into `AdminAccountCardsPage` via a "Create Card" button.

**Tech Stack:** React 19, TypeScript, TanStack Query v5 (`useMutation`), Shadcn UI (`Dialog`, `Select`, `Button`, `Input`, `Label`), `@testing-library/react`, `jest`.

---

## File Map

| Status | File | Change |
|--------|------|--------|
| Modify | `src/types/authorized-person.ts` | Add `CreateAuthorizedPersonPayload` interface |
| Modify | `src/types/card.ts` | Add `CreateCardPayload` interface |
| Modify | `src/lib/api/cards.ts` | Add `createAuthorizedPerson` and `createCard` functions |
| Modify | `src/hooks/useAccounts.ts` | Add `useSearchAccounts` hook |
| Modify | `src/hooks/useCards.ts` | Add `useCreateCard` mutation hook |
| Create | `src/components/accounts/AccountSelector.tsx` | Search-as-you-type account picker |
| Create | `src/components/accounts/AccountSelector.test.tsx` | Unit tests |
| Create | `src/components/admin/CreateCardDialog.tsx` | Dialog with two selectors + brand dropdown |
| Create | `src/components/admin/CreateCardDialog.test.tsx` | Unit tests |
| Modify | `src/pages/AdminAccountCardsPage.tsx` | Add "Create Card" button + dialog |
| Modify | `src/pages/AdminAccountCardsPage.test.tsx` | Add button/dialog test |

---

## Task 1: Add types

**Files:**
- Modify: `src/types/authorized-person.ts`
- Modify: `src/types/card.ts`

- [ ] **Step 1: Add `CreateAuthorizedPersonPayload` to `src/types/authorized-person.ts`**

Append after the existing `CreateAuthorizedPersonRequest` interface:

```typescript
export interface CreateAuthorizedPersonPayload {
  first_name: string
  last_name: string
  date_of_birth?: number
  gender?: string
  email?: string
  phone?: string
  address?: string
  account_id: number
}
```

- [ ] **Step 2: Add `CreateCardPayload` to `src/types/card.ts`**

Append after the existing `Card` interface:

```typescript
export interface CreateCardPayload {
  account_number: string
  owner_id: number
  owner_type: 'AUTHORIZED_PERSON'
  card_brand: string
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/authorized-person.ts src/types/card.ts
git commit -m "feat: add CreateAuthorizedPersonPayload and CreateCardPayload types"
```

---

## Task 2: Add API functions

**Files:**
- Modify: `src/lib/api/cards.ts`

- [ ] **Step 1: Add imports and two new functions**

Add these imports at the top of `src/lib/api/cards.ts` (they extend the existing import line):

```typescript
import type { CreateAuthorizedPersonPayload, AuthorizedPerson } from '@/types/authorized-person'
import type { CreateCardPayload } from '@/types/card'
```

Then append these two functions at the bottom of the file:

```typescript
export async function createAuthorizedPerson(
  payload: CreateAuthorizedPersonPayload
): Promise<AuthorizedPerson & { id: number }> {
  const response = await apiClient.post<AuthorizedPerson & { id: number }>(
    '/api/cards/authorized-person',
    payload
  )
  return response.data
}

export async function createCard(payload: CreateCardPayload): Promise<Card> {
  const response = await apiClient.post<Card>('/api/cards', payload)
  return response.data
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/cards.ts
git commit -m "feat: add createAuthorizedPerson and createCard API functions"
```

---

## Task 3: Add hooks

**Files:**
- Modify: `src/hooks/useAccounts.ts`
- Modify: `src/hooks/useCards.ts`

- [ ] **Step 1: Add `useSearchAccounts` to `src/hooks/useAccounts.ts`**

Add this import at the top of `src/hooks/useAccounts.ts` (merge into the existing `getAllAccounts` import):

```typescript
import { getAllAccounts } from '@/lib/api/accounts'  // already imported
```

Append the new hook after `useAllAccounts`:

```typescript
export function useSearchAccounts(query: string) {
  return useQuery({
    queryKey: ['accounts', 'search', query],
    queryFn: () => getAllAccounts({ account_number_filter: query, page_size: 10 }),
    enabled: query.length > 0,
  })
}
```

- [ ] **Step 2: Add `useCreateCard` to `src/hooks/useCards.ts`**

Add these imports at the top of `src/hooks/useCards.ts` (extend existing import from `@/lib/api/cards`):

```typescript
import { createAuthorizedPerson, createCard } from '@/lib/api/cards'  // add to existing import
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'
```

Append the new hook at the bottom of `src/hooks/useCards.ts`:

```typescript
export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      account,
      client,
      cardBrand,
    }: {
      account: Account
      client: Client
      cardBrand: string
    }) => {
      const ap = await createAuthorizedPerson({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        account_id: account.id,
      })
      return createCard({
        account_number: account.account_number,
        owner_id: ap.id,
        owner_type: 'AUTHORIZED_PERSON',
        card_brand: cardBrand,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cards', 'account', variables.account.account_number],
      })
    },
  })
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAccounts.ts src/hooks/useCards.ts
git commit -m "feat: add useSearchAccounts and useCreateCard hooks"
```

---

## Task 4: AccountSelector component (TDD)

**Files:**
- Create: `src/components/accounts/AccountSelector.test.tsx`
- Create: `src/components/accounts/AccountSelector.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/accounts/AccountSelector.test.tsx`:

```typescript
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountSelector } from '@/components/accounts/AccountSelector'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

const mockBusiness = createMockAccount({
  id: 10,
  account_number: '265-0000000010-00',
  account_name: 'Firma DOO',
  currency_code: 'RSD',
  account_category: 'business',
})

const mockPersonal = createMockAccount({
  id: 11,
  account_number: '111-0000000011-00',
  account_name: 'Personal RSD',
  currency_code: 'RSD',
  account_category: 'personal',
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccountsHook.useSearchAccounts).mockReturnValue({
    data: { accounts: [mockBusiness, mockPersonal], total: 2 },
    isLoading: false,
  } as any)
})

describe('AccountSelector', () => {
  it('renders search input', () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} />
    )
    expect(screen.getByPlaceholderText(/search account/i)).toBeInTheDocument()
  })

  it('shows matching accounts in dropdown after typing', async () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} />
    )
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
  })

  it('calls onAccountSelected with the account when a row is clicked', async () => {
    const onSelect = jest.fn()
    renderWithProviders(
      <AccountSelector onAccountSelected={onSelect} selectedAccount={null} />
    )
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
    await userEvent.click(screen.getByText(/265-0000000010-00/))
    expect(onSelect).toHaveBeenCalledWith(mockBusiness)
  })

  it('shows selected account summary with Change button when an account is selected', () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={mockBusiness} />
    )
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
  })

  it('calls onAccountSelected(null) when Change is clicked', async () => {
    const onSelect = jest.fn()
    renderWithProviders(
      <AccountSelector onAccountSelected={onSelect} selectedAccount={mockBusiness} />
    )
    await userEvent.click(screen.getByRole('button', { name: /change/i }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('filters to business accounts only when businessOnly prop is true', async () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} businessOnly />
    )
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '111')
    expect(screen.queryByText(/111-0000000011-00/)).not.toBeInTheDocument()
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPatterns="AccountSelector"
```

Expected: all tests fail with "Cannot find module".

- [ ] **Step 3: Implement `AccountSelector`**

Create `src/components/accounts/AccountSelector.tsx`:

```typescript
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchAccounts } from '@/hooks/useAccounts'
import type { Account } from '@/types/account'

interface AccountSelectorProps {
  onAccountSelected: (account: Account | null) => void
  selectedAccount: Account | null
  businessOnly?: boolean
}

export function AccountSelector({
  onAccountSelected,
  selectedAccount,
  businessOnly,
}: AccountSelectorProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSearchAccounts(search)

  const accounts = data?.accounts ?? []
  const visible = businessOnly
    ? accounts.filter((a) => a.account_category === 'business')
    : accounts

  if (selectedAccount) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md">
        <span className="text-sm">
          {selectedAccount.account_number} — {selectedAccount.account_name} (
          {selectedAccount.currency_code})
        </span>
        <Button variant="ghost" size="sm" onClick={() => onAccountSelected(null)}>
          Change
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search account by number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {visible.length > 0 && (
        <ul className="border rounded-md divide-y max-h-48 overflow-auto">
          {visible.map((account) => (
            <li
              key={account.id}
              className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
              onClick={() => {
                onAccountSelected(account)
                setSearch('')
              }}
            >
              {account.account_number} — {account.account_name} ({account.currency_code})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPatterns="AccountSelector"
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/accounts/AccountSelector.tsx src/components/accounts/AccountSelector.test.tsx
git commit -m "feat: add AccountSelector component with business-only filter"
```

---

## Task 5: CreateCardDialog component (TDD)

**Files:**
- Create: `src/components/admin/CreateCardDialog.test.tsx`
- Create: `src/components/admin/CreateCardDialog.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/admin/CreateCardDialog.test.tsx`:

```typescript
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateCardDialog } from '@/components/admin/CreateCardDialog'
import * as useCardsHook from '@/hooks/useCards'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useClientsHook from '@/hooks/useClients'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

jest.mock('@/hooks/useCards')
jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useClients')

const mockAccount = createMockAccount({
  id: 10,
  account_number: '265-0000000010-00',
  account_name: 'Firma DOO',
  account_category: 'business',
})

const mockClient = createMockClient({
  id: 5,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
})

const mockMutate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useCardsHook.useCreateCard).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as any)
  jest.mocked(useAccountsHook.useSearchAccounts).mockReturnValue({
    data: { accounts: [mockAccount], total: 1 },
    isLoading: false,
  } as any)
  jest.mocked(useClientsHook.useSearchClients).mockReturnValue({
    data: { clients: [mockClient], total: 1 },
    isLoading: false,
  } as any)
})

async function fillForm() {
  // Select account
  await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
  await userEvent.click(screen.getByText(/265-0000000010-00/))
  // Select client
  await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Ana')
  await userEvent.click(screen.getByText(/Ana Anić/))
  // Select card brand
  await userEvent.click(screen.getByRole('combobox', { name: /card brand/i }))
  await userEvent.click(screen.getByRole('option', { name: 'Visa' }))
}

describe('CreateCardDialog', () => {
  it('renders dialog with all three fields when open', () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    expect(screen.getByPlaceholderText(/search account/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search client/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /card brand/i })).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    expect(screen.getByRole('button', { name: /create card/i })).toBeDisabled()
  })

  it('submit button is enabled only after all three fields are filled', async () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    expect(screen.getByRole('button', { name: /create card/i })).toBeEnabled()
  })

  it('calls mutation with correct args on submit', async () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    expect(mockMutate).toHaveBeenCalledWith(
      { account: mockAccount, client: mockClient, cardBrand: 'VISA' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
  })

  it('calls onClose when mutation succeeds', async () => {
    const onClose = jest.fn()
    mockMutate.mockImplementation((_args: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess()
    })
    renderWithProviders(<CreateCardDialog open onClose={onClose} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error message when mutation fails', async () => {
    mockMutate.mockImplementation((_args: unknown, { onError }: { onError: (e: Error) => void }) => {
      onError(new Error('Server error'))
    })
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('does not render content when closed', () => {
    renderWithProviders(<CreateCardDialog open={false} onClose={jest.fn()} />)
    expect(screen.queryByPlaceholderText(/search account/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPatterns="CreateCardDialog"
```

Expected: all tests fail with "Cannot find module".

- [ ] **Step 3: Implement `CreateCardDialog`**

Create `src/components/admin/CreateCardDialog.tsx`:

```typescript
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AccountSelector } from '@/components/accounts/AccountSelector'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { useCreateCard } from '@/hooks/useCards'
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'

interface CreateCardDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateCardDialog({ open, onClose }: CreateCardDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [cardBrand, setCardBrand] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createCard = useCreateCard()

  const canSubmit = selectedAccount !== null && selectedClient !== null && cardBrand !== ''

  const handleClose = () => {
    setSelectedAccount(null)
    setSelectedClient(null)
    setCardBrand('')
    setError(null)
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedAccount || !selectedClient) return
    setError(null)
    createCard.mutate(
      { account: selectedAccount, client: selectedClient, cardBrand },
      {
        onSuccess: () => handleClose(),
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to create card. Please try again.'
          setError(message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Card</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label>Company Account</Label>
            <AccountSelector
              onAccountSelected={setSelectedAccount}
              selectedAccount={selectedAccount}
              businessOnly
            />
          </div>

          <div>
            <Label>Card Owner (Client)</Label>
            <ClientSelector
              onClientSelected={(c) => setSelectedClient(c)}
              selectedClient={selectedClient}
            />
          </div>

          <div>
            <Label htmlFor="card-brand-select">Card Brand</Label>
            <Select value={cardBrand} onValueChange={setCardBrand}>
              <SelectTrigger id="card-brand-select" aria-label="Card Brand">
                <SelectValue placeholder="Select card brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">MasterCard</SelectItem>
                <SelectItem value="DINA">DinaCard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || createCard.isPending}>
            {createCard.isPending ? 'Creating...' : 'Create Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPatterns="CreateCardDialog"
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/CreateCardDialog.tsx src/components/admin/CreateCardDialog.test.tsx
git commit -m "feat: add CreateCardDialog for employee card issuance"
```

---

## Task 6: Wire up AdminAccountCardsPage

**Files:**
- Modify: `src/pages/AdminAccountCardsPage.tsx`
- Modify: `src/pages/AdminAccountCardsPage.test.tsx`

- [ ] **Step 1: Write the failing test**

Add this test to `src/pages/AdminAccountCardsPage.test.tsx` inside the `describe` block:

```typescript
it('opens Create Card dialog when Create Card button is clicked', async () => {
  renderWithProviders(<AdminAccountCardsPage />, { route: '/admin/accounts/1/cards' })
  await userEvent.click(screen.getByRole('button', { name: /create card/i }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

Also add these mocks to the `beforeEach` block in the existing test file (add after the existing mocks):

```typescript
jest.mocked(useCardsHook.useCreateCard).mockReturnValue({
  mutate: jest.fn(),
  isPending: false,
} as any)
```

And add to the jest.mock calls at the top:
```typescript
jest.mock('@/hooks/useAccounts')  // already present — ensure useSearchAccounts is also mocked
jest.mock('@/hooks/useClients')
```

Also add to `beforeEach`:
```typescript
jest.mocked(useAccountsHook.useSearchAccounts).mockReturnValue({
  data: { accounts: [], total: 0 },
  isLoading: false,
} as any)
jest.mocked(useClientsHook.useSearchClients).mockReturnValue({
  data: { clients: [], total: 0 },
  isLoading: false,
} as any)
```

And add at the top of the file:
```typescript
import * as useClientsHook from '@/hooks/useClients'
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPatterns="AdminAccountCardsPage"
```

Expected: new test fails, existing tests pass.

- [ ] **Step 3: Add "Create Card" button and dialog to `AdminAccountCardsPage`**

In `src/pages/AdminAccountCardsPage.tsx`, add the import:

```typescript
import { CreateCardDialog } from '@/components/admin/CreateCardDialog'
```

Add state inside the component function (after the existing `useState` for `pending`):

```typescript
const [createCardOpen, setCreateCardOpen] = useState(false)
```

Replace the existing page header `<div className="flex items-center gap-4">` block with:

```typescript
<div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
      ← Back
    </Button>
    <h1 className="text-2xl font-bold">Cards — {account?.account_name ?? 'Account'}</h1>
  </div>
  <Button onClick={() => setCreateCardOpen(true)}>Create Card</Button>
</div>
```

Add the dialog just before the closing `</div>` of the component return:

```typescript
<CreateCardDialog open={createCardOpen} onClose={() => setCreateCardOpen(false)} />
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
npm test -- --testPathPatterns="AdminAccountCardsPage"
```

Expected: all 4 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminAccountCardsPage.tsx src/pages/AdminAccountCardsPage.test.tsx
git commit -m "feat: add Create Card button to AdminAccountCardsPage for employee card issuance"
```
