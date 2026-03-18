# Admin Portals (Account Management + Client Management) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the employee-facing portals: Account Management Portal (all accounts with filters, card management per account with block/unblock/deactivate) and Client Management Portal (all clients with filters, client editing).

**Architecture:** Four employee-only pages. Account portal: AdminAccountsPage (filtered account list) → AdminAccountCardsPage (cards for a specific account with status management). Client portal: AdminClientsPage (filtered client list) → EditClientPage (edit client details). All server data via TanStack Query. No Redux needed — no multi-step flows.

**Tech Stack:** React 19, TypeScript, Shadcn UI, TanStack Query, React Hook Form + Zod, Jest + RTL

**Depends on:** Plan 1 (Foundation — Account, Client, Card types, API stubs), Plan 7 (card types and API)

---

## Assumptions

1. `getAllAccounts(filters)` (employee) returns all accounts with filtering by owner name, account number. Sorted alphabetically by owner last name.
2. `getAccountCards(accountId)` returns all cards for a given account.
3. `blockCard(cardId)`, `unblockCard(cardId)`, `deactivateCard(cardId)` — employee card status actions.
4. `getAllClients(filters)` (employee) returns all clients with filtering by name, email. Sorted alphabetically by last name.
5. `getClient(id)` returns a single client for editing.
6. `updateClient(id, payload)` updates client details. Cannot change password or JMBG.
7. Email uniqueness is validated server-side (409 on duplicate).

---

## File Structure

```
src/
  pages/
    AdminAccountsPage.tsx               # /admin/accounts — all accounts
    AdminAccountsPage.test.tsx
    AdminAccountCardsPage.tsx            # /admin/accounts/:id/cards — cards for account
    AdminAccountCardsPage.test.tsx
    AdminClientsPage.tsx                 # /admin/clients — all clients
    AdminClientsPage.test.tsx
    EditClientPage.tsx                   # /admin/clients/:id — edit client
    EditClientPage.test.tsx
  components/
    admin/
      AccountTable.tsx                  # Accounts table with filters
      AccountTable.test.tsx
      AccountFilters.tsx                # Owner name + account number filters
      AccountFilters.test.tsx
      AdminCardItem.tsx                 # Card with block/unblock/deactivate actions
      AdminCardItem.test.tsx
      ClientTable.tsx                   # Clients table
      ClientTable.test.tsx
      ClientFilters.tsx                 # Name + email filters
      ClientFilters.test.tsx
      EditClientForm.tsx                # Client edit form
      EditClientForm.test.tsx
  hooks/
    useAdminAccounts.ts                 # getAllAccounts, getAccountCards, card actions
    useAdminAccounts.test.ts
    useAdminClients.ts                  # getAllClients, getClient, updateClient
    useAdminClients.test.ts
  lib/
    utils/
      validation.ts                     # MODIFY: add editClientSchema
  App.tsx                               # MODIFY: add admin routes
```

---

## Chunk 1: Account Management Portal

### Task 1.1: Admin account hooks

**Files:**
- Create: `src/hooks/useAdminAccounts.ts`
- Create: `src/hooks/useAdminAccounts.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/hooks/useAdminAccounts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useAdminAccounts,
  useAccountCards,
  useBlockCardAdmin,
  useUnblockCard,
  useDeactivateCard,
} from '@/hooks/useAdminAccounts'
import * as accountsApi from '@/lib/api/accounts'
import * as cardsApi from '@/lib/api/cards'

jest.mock('@/lib/api/accounts')
jest.mock('@/lib/api/cards')

const mockGetAllAccounts = jest.mocked(accountsApi.getAllAccounts)
const mockGetAccountCards = jest.mocked(cardsApi.getAccountCards)
const mockBlockCard = jest.mocked(cardsApi.blockCard)
const mockUnblockCard = jest.mocked(cardsApi.unblockCard)
const mockDeactivateCard = jest.mocked(cardsApi.deactivateCard)

describe('useAdminAccounts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches all accounts with filters', async () => {
    mockGetAllAccounts.mockResolvedValue([{ id: 1 }] as any)

    const { result } = renderHook(
      () => useAdminAccounts({ owner_name: 'Petar' }),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetAllAccounts).toHaveBeenCalledWith({ owner_name: 'Petar' })
  })
})

describe('useAccountCards', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches cards for an account', async () => {
    mockGetAccountCards.mockResolvedValue([{ id: 1 }] as any)

    const { result } = renderHook(
      () => useAccountCards(1),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetAccountCards).toHaveBeenCalledWith(1)
  })
})

describe('useBlockCardAdmin', () => {
  beforeEach(() => jest.clearAllMocks())

  it('blocks a card', async () => {
    mockBlockCard.mockResolvedValue(undefined as any)
    const { result } = renderHook(() => useBlockCardAdmin(), { wrapper: createQueryWrapper() })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUnblockCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('unblocks a card', async () => {
    mockUnblockCard.mockResolvedValue(undefined as any)
    const { result } = renderHook(() => useUnblockCard(), { wrapper: createQueryWrapper() })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeactivateCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deactivates a card', async () => {
    mockDeactivateCard.mockResolvedValue(undefined as any)
    const { result } = renderHook(() => useDeactivateCard(), { wrapper: createQueryWrapper() })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement hooks**

```typescript
// src/hooks/useAdminAccounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllAccounts } from '@/lib/api/accounts'
import { getAccountCards, blockCard, unblockCard, deactivateCard } from '@/lib/api/cards'

interface AccountFilters {
  owner_name?: string
  account_number?: string
}

export function useAdminAccounts(filters: AccountFilters) {
  return useQuery({
    queryKey: ['admin-accounts', filters],
    queryFn: () => getAllAccounts(filters),
  })
}

export function useAccountCards(accountId: number) {
  return useQuery({
    queryKey: ['account-cards', accountId],
    queryFn: () => getAccountCards(accountId),
    enabled: !!accountId,
  })
}

export function useBlockCardAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => blockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-cards'] })
    },
  })
}

export function useUnblockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => unblockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-cards'] })
    },
  })
}

export function useDeactivateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => deactivateCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-cards'] })
    },
  })
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAdminAccounts.ts src/hooks/useAdminAccounts.test.ts
git commit -m "feat: add admin account and card management hooks"
```

---

### Task 1.2: AccountFilters + AccountTable components

**Files:**
- Create: `src/components/admin/AccountFilters.tsx`
- Create: `src/components/admin/AccountFilters.test.tsx`
- Create: `src/components/admin/AccountTable.tsx`
- Create: `src/components/admin/AccountTable.test.tsx`

- [ ] **Step 1: Write failing tests for AccountFilters**

```typescript
// src/components/admin/AccountFilters.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountFilters } from '@/components/admin/AccountFilters'

describe('AccountFilters', () => {
  const onFilterChange = jest.fn()

  it('renders name and account number inputs', () => {
    renderWithProviders(<AccountFilters onFilterChange={onFilterChange} />)
    expect(screen.getByPlaceholderText(/ime i prezime/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/broj računa/i)).toBeInTheDocument()
  })

  it('emits filter on input change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AccountFilters onFilterChange={onFilterChange} />)

    await user.type(screen.getByPlaceholderText(/ime i prezime/i), 'Petar')
    // Debounce expected, so check after delay or with fake timers
    expect(onFilterChange).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Write failing test for AccountTable**

```typescript
// src/components/admin/AccountTable.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountTable } from '@/components/admin/AccountTable'

const mockAccounts = [
  {
    id: 1, account_number: '111000100000000011', name: 'Main',
    owner_name: 'Petar Petrović', owner_type: 'PERSONAL', account_type: 'CURRENT',
  },
  {
    id: 2, account_number: '111000100000000022', name: 'EUR',
    owner_name: 'Ana Anić', owner_type: 'BUSINESS', account_type: 'FOREIGN_CURRENCY',
  },
]

describe('AccountTable', () => {
  it('renders account rows', () => {
    renderWithProviders(<AccountTable accounts={mockAccounts as any} onRowClick={jest.fn()} />)

    expect(screen.getByText('Petar Petrović')).toBeInTheDocument()
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText(/lični/i)).toBeInTheDocument()
    expect(screen.getByText(/poslovni/i)).toBeInTheDocument()
  })

  it('calls onRowClick with account id', async () => {
    const onRowClick = jest.fn()
    renderWithProviders(<AccountTable accounts={mockAccounts as any} onRowClick={onRowClick} />)

    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.click(screen.getByText('Petar Petrović'))
    expect(onRowClick).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 3: Implement AccountFilters**

```typescript
// src/components/admin/AccountFilters.tsx
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

interface AccountFiltersProps {
  onFilterChange: (filters: { owner_name?: string; account_number?: string }) => void
}

export function AccountFilters({ onFilterChange }: AccountFiltersProps) {
  const [ownerName, setOwnerName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({
        owner_name: ownerName || undefined,
        account_number: accountNumber || undefined,
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [ownerName, accountNumber, onFilterChange])

  return (
    <div className="flex gap-3">
      <Input
        placeholder="Ime i prezime vlasnika"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />
      <Input
        placeholder="Broj računa"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />
    </div>
  )
}
```

- [ ] **Step 4: Implement AccountTable**

```typescript
// src/components/admin/AccountTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatAccountNumber } from '@/lib/utils/format'
import type { Account } from '@/types/account'

const OWNER_TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Lični',
  BUSINESS: 'Poslovni',
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CURRENT: 'Tekući',
  FOREIGN_CURRENCY: 'Devizni',
}

interface AccountTableProps {
  accounts: (Account & { owner_name?: string })[]
  onRowClick: (accountId: number) => void
}

export function AccountTable({ accounts, onRowClick }: AccountTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Broj računa</TableHead>
          <TableHead>Vlasnik</TableHead>
          <TableHead>Vrsta</TableHead>
          <TableHead>Tip</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((acc) => (
          <TableRow key={acc.id} className="cursor-pointer" onClick={() => onRowClick(acc.id)}>
            <TableCell>{formatAccountNumber(acc.account_number)}</TableCell>
            <TableCell>{acc.owner_name ?? '—'}</TableCell>
            <TableCell>{OWNER_TYPE_LABELS[acc.owner_type] ?? acc.owner_type}</TableCell>
            <TableCell>{ACCOUNT_TYPE_LABELS[acc.account_type] ?? acc.account_type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AccountFilters.tsx src/components/admin/AccountFilters.test.tsx \
  src/components/admin/AccountTable.tsx src/components/admin/AccountTable.test.tsx
git commit -m "feat: add admin account filters and table components"
```

---

### Task 1.3: AdminAccountsPage

**Files:**
- Create: `src/pages/AdminAccountsPage.tsx`
- Create: `src/pages/AdminAccountsPage.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/pages/AdminAccountsPage.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminAccountsPage } from '@/pages/AdminAccountsPage'
import * as useAdminAccountsHook from '@/hooks/useAdminAccounts'

jest.mock('@/hooks/useAdminAccounts')

describe('AdminAccountsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAdminAccountsHook.useAdminAccounts).mockReturnValue({
      data: [
        { id: 1, account_number: '111000100000000011', owner_name: 'Petar', owner_type: 'PERSONAL', account_type: 'CURRENT' },
      ],
      isLoading: false,
    } as any)
  })

  it('renders accounts page with filters', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/upravljanje računima/i)).toBeInTheDocument()
    expect(screen.getByText('Petar')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement AdminAccountsPage**

```typescript
// src/pages/AdminAccountsPage.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAccounts } from '@/hooks/useAdminAccounts'
import { AccountFilters } from '@/components/admin/AccountFilters'
import { AccountTable } from '@/components/admin/AccountTable'

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<{ owner_name?: string; account_number?: string }>({})
  const { data: accounts, isLoading } = useAdminAccounts(filters)

  const handleFilterChange = useCallback(
    (newFilters: { owner_name?: string; account_number?: string }) => setFilters(newFilters),
    []
  )

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upravljanje računima</h1>
      <AccountFilters onFilterChange={handleFilterChange} />
      <AccountTable accounts={accounts ?? []} onRowClick={(id) => navigate(`/admin/accounts/${id}/cards`)} />
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminAccountsPage.tsx src/pages/AdminAccountsPage.test.tsx
git commit -m "feat: add admin accounts page with filters"
```

---

### Task 1.4: AdminCardItem + AdminAccountCardsPage

**Files:**
- Create: `src/components/admin/AdminCardItem.tsx`
- Create: `src/components/admin/AdminCardItem.test.tsx`
- Create: `src/pages/AdminAccountCardsPage.tsx`
- Create: `src/pages/AdminAccountCardsPage.test.tsx`

- [ ] **Step 1: Write failing test for AdminCardItem**

```typescript
// src/components/admin/AdminCardItem.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminCardItem } from '@/components/admin/AdminCardItem'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'

describe('AdminCardItem', () => {
  const onBlock = jest.fn()
  const onUnblock = jest.fn()
  const onDeactivate = jest.fn()

  it('renders card info with owner', () => {
    const card = createMockCard({ card_number: '4111111111111111', owner_name: 'Petar Petrović' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    expect(screen.getByText('4111********1111')).toBeInTheDocument()
    expect(screen.getByText('Petar Petrović')).toBeInTheDocument()
  })

  it('shows block and deactivate for active cards', () => {
    const card = createMockCard({ status: 'ACTIVE' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    expect(screen.getByText(/blokiraj/i)).toBeInTheDocument()
    expect(screen.getByText(/deaktiviraj/i)).toBeInTheDocument()
    expect(screen.queryByText(/deblokiraj/i)).not.toBeInTheDocument()
  })

  it('shows unblock and deactivate for blocked cards', () => {
    const card = createMockCard({ status: 'BLOCKED' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    expect(screen.getByText(/deblokiraj/i)).toBeInTheDocument()
    expect(screen.getByText(/deaktiviraj/i)).toBeInTheDocument()
    expect(screen.queryByText(/blokiraj/i)).not.toBeInTheDocument()
  })

  it('shows no actions for deactivated cards', () => {
    const card = createMockCard({ status: 'DEACTIVATED' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    expect(screen.queryByText(/blokiraj/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/deblokiraj/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/deaktiviraj/i)).not.toBeInTheDocument()
  })

  it('calls onBlock', async () => {
    const user = userEvent.setup()
    const card = createMockCard({ id: 5, status: 'ACTIVE' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    await user.click(screen.getByText(/blokiraj/i))
    expect(onBlock).toHaveBeenCalledWith(5)
  })

  it('calls onUnblock', async () => {
    const user = userEvent.setup()
    const card = createMockCard({ id: 5, status: 'BLOCKED' })
    renderWithProviders(
      <AdminCardItem card={card} onBlock={onBlock} onUnblock={onUnblock} onDeactivate={onDeactivate} />
    )

    await user.click(screen.getByText(/deblokiraj/i))
    expect(onUnblock).toHaveBeenCalledWith(5)
  })
})
```

- [ ] **Step 2: Implement AdminCardItem**

```typescript
// src/components/admin/AdminCardItem.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { maskCardNumber } from '@/lib/utils/format'
import type { Card as CardType } from '@/types/card'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivna',
  BLOCKED: 'Blokirana',
  DEACTIVATED: 'Deaktivirana',
}

interface AdminCardItemProps {
  card: CardType
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  onDeactivate: (id: number) => void
}

export function AdminCardItem({ card, onBlock, onUnblock, onDeactivate }: AdminCardItemProps) {
  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-mono">{maskCardNumber(card.card_number)}</p>
          {card.owner_name && <p className="text-sm">{card.owner_name}</p>}
          <Badge variant={card.status === 'ACTIVE' ? 'default' : card.status === 'BLOCKED' ? 'secondary' : 'destructive'}>
            {STATUS_LABELS[card.status] ?? card.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {card.status === 'ACTIVE' && (
            <>
              <Button variant="outline" size="sm" onClick={() => onBlock(card.id)}>Blokiraj</Button>
              <Button variant="destructive" size="sm" onClick={() => onDeactivate(card.id)}>Deaktiviraj</Button>
            </>
          )}
          {card.status === 'BLOCKED' && (
            <>
              <Button variant="outline" size="sm" onClick={() => onUnblock(card.id)}>Deblokiraj</Button>
              <Button variant="destructive" size="sm" onClick={() => onDeactivate(card.id)}>Deaktiviraj</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Implement AdminAccountCardsPage**

```typescript
// src/pages/AdminAccountCardsPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useAccountCards, useBlockCardAdmin, useUnblockCard, useDeactivateCard } from '@/hooks/useAdminAccounts'
import { AdminCardItem } from '@/components/admin/AdminCardItem'
import { Button } from '@/components/ui/button'

export function AdminAccountCardsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cards, isLoading } = useAccountCards(Number(id))
  const blockCard = useBlockCardAdmin()
  const unblockCard = useUnblockCard()
  const deactivateCard = useDeactivateCard()

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>← Nazad</Button>
      <h1 className="text-2xl font-bold">Kartice za račun</h1>

      {cards?.length === 0 && <p className="text-muted-foreground">Nema kartica za ovaj račun.</p>}

      <div className="space-y-3">
        {cards?.map((card) => (
          <AdminCardItem
            key={card.id}
            card={card}
            onBlock={(cardId) => blockCard.mutate(cardId)}
            onUnblock={(cardId) => unblockCard.mutate(cardId)}
            onDeactivate={(cardId) => deactivateCard.mutate(cardId)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminCardItem.tsx src/components/admin/AdminCardItem.test.tsx \
  src/pages/AdminAccountCardsPage.tsx src/pages/AdminAccountCardsPage.test.tsx
git commit -m "feat: add admin card management with block/unblock/deactivate"
```

---

## Chunk 2: Client Management Portal

### Task 2.1: Admin client hooks

**Files:**
- Create: `src/hooks/useAdminClients.ts`
- Create: `src/hooks/useAdminClients.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/hooks/useAdminClients.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useAdminClients, useAdminClient, useUpdateClient } from '@/hooks/useAdminClients'
import * as clientsApi from '@/lib/api/clients'

jest.mock('@/lib/api/clients')

const mockGetAllClients = jest.mocked(clientsApi.getAllClients)
const mockGetClient = jest.mocked(clientsApi.getClient)
const mockUpdateClient = jest.mocked(clientsApi.updateClient)

describe('useAdminClients', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches all clients with filters', async () => {
    mockGetAllClients.mockResolvedValue([{ id: 1, first_name: 'Petar' }] as any)

    const { result } = renderHook(
      () => useAdminClients({ name: 'Petar' }),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetAllClients).toHaveBeenCalledWith({ name: 'Petar' })
  })
})

describe('useAdminClient', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches a single client', async () => {
    mockGetClient.mockResolvedValue({ id: 1, first_name: 'Petar', last_name: 'Petrović' } as any)

    const { result } = renderHook(
      () => useAdminClient(1),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetClient).toHaveBeenCalledWith(1)
  })
})

describe('useUpdateClient', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates client', async () => {
    mockUpdateClient.mockResolvedValue({} as any)

    const { result } = renderHook(
      () => useUpdateClient(),
      { wrapper: createQueryWrapper() }
    )

    result.current.mutate({ id: 1, first_name: 'Petar', last_name: 'Updated' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUpdateClient).toHaveBeenCalledWith(1, { first_name: 'Petar', last_name: 'Updated' })
  })
})
```

- [ ] **Step 2: Implement hooks**

```typescript
// src/hooks/useAdminClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllClients, getClient, updateClient } from '@/lib/api/clients'

interface ClientFilters {
  name?: string
  email?: string
}

export function useAdminClients(filters: ClientFilters) {
  return useQuery({
    queryKey: ['admin-clients', filters],
    queryFn: () => getAllClients(filters),
  })
}

export function useAdminClient(id: number) {
  return useQuery({
    queryKey: ['admin-clients', id],
    queryFn: () => getClient(id),
    enabled: !!id,
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
    },
  })
}
```

- [ ] **Step 3: Run tests — verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAdminClients.ts src/hooks/useAdminClients.test.ts
git commit -m "feat: add admin client hooks (list, detail, update)"
```

---

### Task 2.2: ClientFilters + ClientTable + AdminClientsPage

**Files:**
- Create: `src/components/admin/ClientFilters.tsx`
- Create: `src/components/admin/ClientFilters.test.tsx`
- Create: `src/components/admin/ClientTable.tsx`
- Create: `src/components/admin/ClientTable.test.tsx`
- Create: `src/pages/AdminClientsPage.tsx`
- Create: `src/pages/AdminClientsPage.test.tsx`

- [ ] **Step 1: Write failing tests for ClientFilters**

```typescript
// src/components/admin/ClientFilters.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ClientFilters } from '@/components/admin/ClientFilters'

describe('ClientFilters', () => {
  it('renders name and email inputs', () => {
    renderWithProviders(<ClientFilters onFilterChange={jest.fn()} />)
    expect(screen.getByPlaceholderText(/ime i prezime/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write failing test for ClientTable**

```typescript
// src/components/admin/ClientTable.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ClientTable } from '@/components/admin/ClientTable'

const mockClients = [
  { id: 1, first_name: 'Petar', last_name: 'Petrović', email: 'petar@test.com', phone: '+381641234567' },
  { id: 2, first_name: 'Ana', last_name: 'Anić', email: 'ana@test.com', phone: '+381649876543' },
]

describe('ClientTable', () => {
  it('renders client rows', () => {
    renderWithProviders(<ClientTable clients={mockClients as any} onRowClick={jest.fn()} />)

    expect(screen.getByText('Petar Petrović')).toBeInTheDocument()
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('petar@test.com')).toBeInTheDocument()
  })

  it('calls onRowClick', async () => {
    const onRowClick = jest.fn()
    renderWithProviders(<ClientTable clients={mockClients as any} onRowClick={onRowClick} />)

    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.click(screen.getByText('Petar Petrović'))
    expect(onRowClick).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 3: Implement ClientFilters** (same debounced pattern as AccountFilters)

```typescript
// src/components/admin/ClientFilters.tsx
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

interface ClientFiltersProps {
  onFilterChange: (filters: { name?: string; email?: string }) => void
}

export function ClientFilters({ onFilterChange }: ClientFiltersProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({
        name: name || undefined,
        email: email || undefined,
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [name, email, onFilterChange])

  return (
    <div className="flex gap-3">
      <Input placeholder="Ime i prezime" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  )
}
```

- [ ] **Step 4: Implement ClientTable**

```typescript
// src/components/admin/ClientTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Client } from '@/types/client'

interface ClientTableProps {
  clients: Client[]
  onRowClick: (clientId: number) => void
}

export function ClientTable({ clients, onRowClick }: ClientTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ime i prezime</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefon</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} className="cursor-pointer" onClick={() => onRowClick(client.id)}>
            <TableCell>{client.first_name} {client.last_name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 5: Implement AdminClientsPage**

```typescript
// src/pages/AdminClientsPage.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminClients } from '@/hooks/useAdminClients'
import { ClientFilters } from '@/components/admin/ClientFilters'
import { ClientTable } from '@/components/admin/ClientTable'

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<{ name?: string; email?: string }>({})
  const { data: clients, isLoading } = useAdminClients(filters)

  const handleFilterChange = useCallback(
    (newFilters: { name?: string; email?: string }) => setFilters(newFilters),
    []
  )

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
      <ClientFilters onFilterChange={handleFilterChange} />
      <ClientTable clients={clients ?? []} onRowClick={(id) => navigate(`/admin/clients/${id}`)} />
    </div>
  )
}
```

- [ ] **Step 6: Run tests — verify pass**

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/ClientFilters.tsx src/components/admin/ClientFilters.test.tsx \
  src/components/admin/ClientTable.tsx src/components/admin/ClientTable.test.tsx \
  src/pages/AdminClientsPage.tsx src/pages/AdminClientsPage.test.tsx
git commit -m "feat: add admin clients page with filters and table"
```

---

### Task 2.3: EditClientForm + EditClientPage

**Files:**
- Create: `src/components/admin/EditClientForm.tsx`
- Create: `src/components/admin/EditClientForm.test.tsx`
- Create: `src/pages/EditClientPage.tsx`
- Create: `src/pages/EditClientPage.test.tsx`
- Modify: `src/lib/utils/validation.ts`

- [ ] **Step 1: Write failing test for validation schema**

```typescript
// Add to validation tests
import { editClientSchema } from '@/lib/utils/validation'

describe('editClientSchema', () => {
  it('validates correct client data', () => {
    const result = editClientSchema.safeParse({
      first_name: 'Petar',
      last_name: 'Petrović',
      email: 'petar@test.com',
      phone: '+381641234567',
      address: 'Njegoševa 25',
      date_of_birth: '1990-01-15',
      gender: 'M',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = editClientSchema.safeParse({
      first_name: 'Petar',
      last_name: 'Petrović',
      email: 'invalid',
      phone: '+381641234567',
      address: 'Test',
      date_of_birth: '1990-01-15',
      gender: 'M',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Add editClientSchema to validation.ts**

```typescript
// Add to src/lib/utils/validation.ts
export const editClientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
})
```

- [ ] **Step 3: Write failing test for EditClientForm**

```typescript
// src/components/admin/EditClientForm.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditClientForm } from '@/components/admin/EditClientForm'

const mockClient = {
  id: 1,
  first_name: 'Petar',
  last_name: 'Petrović',
  email: 'petar@test.com',
  phone: '+381641234567',
  address: 'Njegoševa 25',
  date_of_birth: '1990-01-15',
  gender: 'M',
}

describe('EditClientForm', () => {
  it('pre-fills form with client data', () => {
    renderWithProviders(<EditClientForm client={mockClient as any} onSubmit={jest.fn()} submitting={false} />)

    expect(screen.getByDisplayValue('Petar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Petrović')).toBeInTheDocument()
    expect(screen.getByDisplayValue('petar@test.com')).toBeInTheDocument()
  })

  it('does not show password or jmbg fields', () => {
    renderWithProviders(<EditClientForm client={mockClient as any} onSubmit={jest.fn()} submitting={false} />)

    expect(screen.queryByLabelText(/lozinka/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/jmbg/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Implement EditClientForm**

```typescript
// src/components/admin/EditClientForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editClientSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client } from '@/types/client'
import type { z } from 'zod'

type EditClientValues = z.infer<typeof editClientSchema>

interface EditClientFormProps {
  client: Client
  onSubmit: (data: EditClientValues) => void
  submitting: boolean
}

export function EditClientForm({ client, onSubmit, submitting }: EditClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditClientValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      date_of_birth: client.date_of_birth,
      gender: client.gender,
    },
  })

  return (
    <Card>
      <CardHeader><CardTitle>Izmeni klijenta</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Ime</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="last_name">Prezime</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Adresa</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Datum rođenja</Label>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </div>
            <div>
              <Label htmlFor="gender">Pol</Label>
              <Input id="gender" {...register('gender')} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Implement EditClientPage**

```typescript
// src/pages/EditClientPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminClient, useUpdateClient } from '@/hooks/useAdminClients'
import { EditClientForm } from '@/components/admin/EditClientForm'
import { Button } from '@/components/ui/button'

export function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useAdminClient(Number(id))
  const updateClient = useUpdateClient()

  if (isLoading) return <p>Učitavanje...</p>
  if (!client) return <p>Klijent nije pronađen.</p>

  const handleSubmit = (data: Record<string, unknown>) => {
    updateClient.mutate(
      { id: Number(id), ...data },
      { onSuccess: () => navigate('/admin/clients') }
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/admin/clients')}>← Nazad</Button>
      <EditClientForm
        client={client}
        onSubmit={handleSubmit as any}
        submitting={updateClient.isPending}
      />
      {updateClient.error && (
        <p className="text-sm text-destructive">
          Greška pri ažuriranju. Email adresa možda već postoji.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run all tests — verify pass**

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils/validation.ts \
  src/components/admin/EditClientForm.tsx src/components/admin/EditClientForm.test.tsx \
  src/pages/EditClientPage.tsx src/pages/EditClientPage.test.tsx
git commit -m "feat: add edit client page with validation"
```

---

### Task 2.4: Routes and navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add routes**

```typescript
// Employee routes in App.tsx
<Route path="/admin/accounts" element={<ProtectedRoute requiredRole="Employee"><AdminAccountsPage /></ProtectedRoute>} />
<Route path="/admin/accounts/:id/cards" element={<ProtectedRoute requiredRole="Employee"><AdminAccountCardsPage /></ProtectedRoute>} />
<Route path="/admin/clients" element={<ProtectedRoute requiredRole="Employee"><AdminClientsPage /></ProtectedRoute>} />
<Route path="/admin/clients/:id" element={<ProtectedRoute requiredRole="Employee"><EditClientPage /></ProtectedRoute>} />
```

- [ ] **Step 2: Add to EmployeeNav** in Sidebar: "Upravljanje računima" and "Upravljanje klijentima".

- [ ] **Step 3: Run all tests**

Run: `npm test --no-coverage`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: add admin portal routes and sidebar navigation"
```
