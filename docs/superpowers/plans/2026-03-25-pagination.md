# Pagination — All Table Views Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend-driven pagination (10 items per page) to all table views, with arrow-icon controls centred at the bottom of each view.

**Architecture:** Update the existing `PaginationControls` component to use ghost icon buttons and always render. Wire `page`/`page_size` state into each page following the pattern already established in `EmployeeListPage`. No new abstractions.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Shadcn UI, lucide-react, Jest + RTL

---

## Chunk 1: PaginationControls — Update Component and Tests

**Files:**
- Modify: `src/components/shared/PaginationControls.test.tsx`
- Modify: `src/components/shared/PaginationControls.tsx`

### Task 1: Update PaginationControls

- [ ] **Step 1: Update the failing tests first**

Replace the entire content of `src/components/shared/PaginationControls.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationControls } from '@/components/shared/PaginationControls'

const mockOnPageChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PaginationControls', () => {
  it('always renders, even on a single page', () => {
    const { container } = render(
      <PaginationControls page={1} totalPages={1} onPageChange={mockOnPageChange} />
    )
    expect(container).not.toBeEmptyDOMElement()
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })

  it('renders previous and next arrow buttons', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows current page and total pages', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
  })

  it('disables previous arrow on the first page', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  it('disables next arrow on the last page', () => {
    render(<PaginationControls page={3} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when previous is clicked', () => {
    render(<PaginationControls page={3} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /previous page/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when next is clicked', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern="PaginationControls" --no-coverage
```

Expected: FAIL — "renders nothing" test no longer exists + aria-label queries don't find old text buttons.

- [ ] **Step 3: Implement the updated component**

Replace the entire content of `src/components/shared/PaginationControls.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'

interface PaginationControlsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="PaginationControls" --no-coverage
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/PaginationControls.tsx src/components/shared/PaginationControls.test.tsx
git commit -m "feat: update PaginationControls to arrow icons, always render"
```

---

## Chunk 2: EmployeeListPage — Change PAGE_SIZE to 10

**Files:**
- Modify: `src/pages/EmployeeListPage.test.tsx`
- Modify: `src/pages/EmployeeListPage.tsx`

The existing tests reference `page_size: 20` and the pagination test block uses 25 employees split across 2 pages of 20. These must be updated to match `PAGE_SIZE = 10`.

### Task 2: Update EmployeeListPage PAGE_SIZE

- [ ] **Step 1: Update EmployeeListPage.test.tsx**

Make these targeted changes to `src/pages/EmployeeListPage.test.tsx`:

**a)** Change `page_size: 20` → `page_size: 10` in all three filter assertion tests:
- `'calls API with name filter when typing'`
- `'calls API without filter params when filter is cleared'`
- `'fetches with page and page_size on initial load'`

**b)** Replace the entire `describe('EmployeeListPage — pagination', ...)` block with:

```tsx
describe('EmployeeListPage — pagination', () => {
  const employees15 = Array.from({ length: 15 }, (_, i) =>
    createMockEmployee({
      id: i + 1,
      first_name: 'Employee',
      last_name: i < 10 ? `PageOne${i + 1}` : `PageTwo${i - 9}`,
      email: `emp${i + 1}@test.com`,
    })
  )

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.page === 2) {
        return { employees: employees15.slice(10), total_count: 15 }
      }
      return { employees: employees15.slice(0, 10), total_count: 15 }
    })
  })

  it('shows pagination controls when total_count > PAGE_SIZE', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('shows the first 10 employees on page 1', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')
    expect(screen.getByText('Employee PageOne10')).toBeInTheDocument()
    expect(screen.queryByText('Employee PageTwo1')).not.toBeInTheDocument()
  })

  it('navigates to page 2 showing the remaining 5 employees when next is clicked', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))

    await screen.findByText('Employee PageTwo1')
    expect(screen.getByText('Employee PageTwo5')).toBeInTheDocument()
    expect(screen.queryByText('Employee PageOne1')).not.toBeInTheDocument()
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()
  })

  it('navigates back to page 1 when previous is clicked from page 2', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await screen.findByText(/page 2 of 2/i)

    fireEvent.click(screen.getByRole('button', { name: /previous page/i }))

    await screen.findByText('Employee PageOne1')
    expect(screen.queryByText('Employee PageTwo1')).not.toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern="EmployeeListPage" --no-coverage
```

Expected: FAIL — `page_size: 20` assertions fail; pagination tests show wrong page counts.

- [ ] **Step 3: Update EmployeeListPage.tsx**

In `src/pages/EmployeeListPage.tsx`, change line 13:
```tsx
const PAGE_SIZE = 20
```
to:
```tsx
const PAGE_SIZE = 10
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="EmployeeListPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/EmployeeListPage.tsx src/pages/EmployeeListPage.test.tsx
git commit -m "feat: reduce EmployeeListPage PAGE_SIZE to 10"
```

---

## Chunk 3: AdminClientsPage Pagination

**Files:**
- Modify: `src/pages/AdminClientsPage.test.tsx`
- Modify: `src/pages/AdminClientsPage.tsx`

### Task 3: Add pagination to AdminClientsPage

- [ ] **Step 1: Add pagination tests**

Replace the entire content of `src/pages/AdminClientsPage.test.tsx`:

```tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminClientsPage } from '@/pages/AdminClientsPage'
import * as useClientsHook from '@/hooks/useClients'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

jest.mock('@/hooks/useClients')

describe('AdminClientsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [createMockClient()], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders clients management page', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByText(/client management/i)).toBeInTheDocument()
    expect(screen.getByText('Petar')).toBeInTheDocument()
    expect(screen.getByText('Petrović')).toBeInTheDocument()
  })

  it('calls hook with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: Array(10).fill(createMockClient()), total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls hook with page 2 when next arrow is clicked', async () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: Array(10).fill(createMockClient()), total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: Array(10).fill(createMockClient()), total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    )

    const nameInput = screen.getByPlaceholderText(/^name$/i)
    fireEvent.change(nameInput, { target: { value: 'Ana' } })

    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, name: 'Ana' })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern="AdminClientsPage" --no-coverage
```

Expected: FAIL — `page` and `page_size` not passed to hook, no PaginationControls rendered.

- [ ] **Step 3: Update AdminClientsPage.tsx**

Replace the entire content of `src/pages/AdminClientsPage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ClientTable } from '@/components/admin/ClientTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const CLIENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const { data, isLoading } = useAllClients({
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  })
  const clients = data?.clients ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <Button onClick={() => navigate('/admin/clients/new')}>New Client</Button>
      </div>

      <FilterBar fields={CLIENT_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(clientId) => navigate(`/admin/clients/${clientId}`)}
        />
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="AdminClientsPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminClientsPage.tsx src/pages/AdminClientsPage.test.tsx
git commit -m "feat: add backend pagination to AdminClientsPage"
```

---

## Chunk 4: AdminAccountsPage Pagination

**Files:**
- Modify: `src/pages/AdminAccountsPage.test.tsx`
- Modify: `src/pages/AdminAccountsPage.tsx`

Note: `owner_name` remains a client-side filter applied to the current page's results. `useAllClients()` is called without pagination (needed as a lookup map for all clients).

### Task 4: Add pagination to AdminAccountsPage

- [ ] **Step 1: Add pagination tests**

Read `src/pages/AdminAccountsPage.test.tsx` first, then append these test cases to the existing `describe` block (after the last existing test):

```tsx
  it('calls useAllAccounts with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useAllAccounts with page 2 when next arrow is clicked', async () => {
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
```

Also add the missing imports to the test file (`fireEvent`, `waitFor` from `@testing-library/react`, and `* as useAccountsHook from '@/hooks/useAccounts'` if not already present). Check the existing imports at the top of the file first.

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
npm test -- --testPathPattern="AdminAccountsPage" --no-coverage
```

Expected: new tests FAIL, existing tests still PASS.

- [ ] **Step 3: Update AdminAccountsPage.tsx**

Replace the entire content of `src/pages/AdminAccountsPage.tsx`:

```tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllAccounts } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { AccountTable } from '@/components/admin/AccountTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { filterAccountsByOwner } from '@/lib/utils/accountFilters'
import type { Client } from '@/types/client'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const ACCOUNT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'owner_name', label: 'Owner Name', type: 'text' },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const { data, isLoading } = useAllAccounts({
    account_number_filter: (filterValues.account_number as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  })
  const { data: clientsData } = useAllClients()
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  const clientsById = useMemo(
    () =>
      (clientsData?.clients ?? []).reduce<Record<number, Client>>(
        (acc, client) => ({ ...acc, [client.id]: client }),
        {}
      ),
    [clientsData]
  )
  const accounts = useMemo(
    () =>
      filterAccountsByOwner(
        data?.accounts ?? [],
        clientsById,
        (filterValues.owner_name as string) ?? ''
      ),
    [data, clientsById, filterValues.owner_name]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account Management</h1>
        <Button onClick={() => navigate('/accounts/new')}>New Account</Button>
      </div>
      <FilterBar fields={ACCOUNT_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AccountTable
          accounts={accounts}
          onViewCards={(id) => navigate(`/admin/accounts/${id}/cards`)}
          clientsById={clientsById}
        />
      )}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="AdminAccountsPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminAccountsPage.tsx src/pages/AdminAccountsPage.test.tsx
git commit -m "feat: add backend pagination to AdminAccountsPage"
```

---

## Chunk 5: AdminLoansPage Pagination

**Files:**
- Modify: `src/pages/AdminLoansPage.test.tsx`
- Modify: `src/pages/AdminLoansPage.tsx`

### Task 5: Add pagination to AdminLoansPage

- [ ] **Step 1: Add pagination tests**

Read `src/pages/AdminLoansPage.test.tsx`, then append these to the existing `describe` block:

```tsx
  it('calls useAllLoans with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminLoansPage />)
    expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminLoansPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoansPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useAllLoans with page 2 when next arrow is clicked', async () => {
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoansPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
```

Add `fireEvent`, `waitFor` to the imports from `@testing-library/react` if not already present.

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
npm test -- --testPathPattern="AdminLoansPage" --no-coverage
```

Expected: new tests FAIL, existing test still PASS.

- [ ] **Step 3: Update AdminLoansPage.tsx**

In `src/pages/AdminLoansPage.tsx`, make these changes:

**a)** Add `useState` to the React import and import `PaginationControls`:
```tsx
import { useState } from 'react'
// ... existing imports ...
import { PaginationControls } from '@/components/shared/PaginationControls'
```

**b)** Add `PAGE_SIZE` constant at the top of the file (before `STATUS_LABELS`):
```tsx
const PAGE_SIZE = 10
```

**c)** Inside `AdminLoansPage()`, add page state after the existing `filterValues` state:
```tsx
const [page, setPage] = useState(1)
```

**d)** Replace the `setFilterValues` direct assignment inline with a `handleFilterChange` function. Add before the `apiFilters` declaration:
```tsx
const handleFilterChange = (newFilters: FilterValues) => {
  setFilterValues(newFilters)
  setPage(1)
}
```

**e)** Add `page` and `page_size` to `apiFilters`:
```tsx
const apiFilters: LoanFiltersType = {
  loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
  status: (filterValues.status as string[])?.[0] as LoanStatus | undefined,
  account_number: (filterValues.account_number as string) || undefined,
  page,
  page_size: PAGE_SIZE,
}
```

**f)** Compute totalPages after `const loans = data?.loans ?? []`:
```tsx
const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
```

**g)** Change `<FilterBar ... onChange={setFilterValues} />` to `onChange={handleFilterChange}`.

**h)** Add `<PaginationControls>` after the closing `</Table>` tag and before the closing `</div>`:
```tsx
<PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="AdminLoansPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminLoansPage.tsx src/pages/AdminLoansPage.test.tsx
git commit -m "feat: add backend pagination to AdminLoansPage"
```

---

## Chunk 6: AdminLoanRequestsPage Pagination

**Files:**
- Modify: `src/pages/AdminLoanRequestsPage.test.tsx`
- Modify: `src/pages/AdminLoanRequestsPage.tsx`

Note: the `name` (client name) filter remains client-side — it searches within the current page's results.

### Task 6: Add pagination to AdminLoanRequestsPage

- [ ] **Step 1: Add pagination tests**

Read `src/pages/AdminLoanRequestsPage.test.tsx`, then append these to the existing `describe` block:

```tsx
  it('calls useLoanRequests with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useLoanRequests with page 2 when next arrow is clicked', async () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
```

Check that `fireEvent` and `waitFor` are already imported — if not, add them.

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
npm test -- --testPathPattern="AdminLoanRequestsPage" --no-coverage
```

Expected: new pagination tests FAIL, existing tests PASS.

- [ ] **Step 3: Update AdminLoanRequestsPage.tsx**

In `src/pages/AdminLoanRequestsPage.tsx`, make these changes:

**a)** Add `PaginationControls` import:
```tsx
import { PaginationControls } from '@/components/shared/PaginationControls'
```

**b)** Add `PAGE_SIZE` constant before the filter fields definition:
```tsx
const PAGE_SIZE = 10
```

**c)** Add `page` state inside the component, after the `filterValues` state:
```tsx
const [page, setPage] = useState(1)
```

**d)** Add a `handleFilterChange` function before the `useLoanRequests` call:
```tsx
const handleFilterChange = (newFilters: FilterValues) => {
  setFilterValues(newFilters)
  setPage(1)
}
```

**e)** Replace the hardcoded `page: 1, page_size: 100` in the `useLoanRequests` call with:
```tsx
page,
page_size: PAGE_SIZE,
```

**f)** Compute `totalPages` after `const requests = data?.requests ?? []`:
```tsx
const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
```

**g)** Change `onChange={setFilterValues}` on `<FilterBar>` to `onChange={handleFilterChange}`.

**h)** Add `<PaginationControls>` after the closing `</Table>` tag and before the closing `</div>`:
```tsx
<PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="AdminLoanRequestsPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminLoanRequestsPage.tsx src/pages/AdminLoanRequestsPage.test.tsx
git commit -m "feat: add backend pagination to AdminLoanRequestsPage"
```

---

## Chunk 7: PaymentHistoryPage Pagination

**Files:**
- Modify: `src/pages/PaymentHistoryPage.test.tsx`
- Modify: `src/pages/PaymentHistoryPage.tsx`

Note: `page` must also reset when `selectedAccountNumber` changes.

### Task 7: Add pagination to PaymentHistoryPage

- [ ] **Step 1: Add pagination tests**

Read `src/pages/PaymentHistoryPage.test.tsx`, then append to the existing `describe` block:

```tsx
  it('calls usePayments with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls usePayments with page 2 when next arrow is clicked', async () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
```

Also add this mock and these imports to the test file so the Select account switcher works:

```tsx
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))
```

And add this test for the account-change page reset (paste after the previous test, still inside the `describe` block):

```tsx
  it('resets to page 1 when selected account changes', async () => {
    const mockAccount = { account_number: 'ACC-001', account_name: 'Checking' }
    const mockAccount2 = { account_number: 'ACC-002', account_name: 'Savings' }
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [mockAccount, mockAccount2], total: 2 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)

    // advance to page 2
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ page: 2 })
      )
    )

    // change account — page should reset to 1
    const accountSelect = screen.getByRole('combobox')
    fireEvent.change(accountSelect, { target: { value: 'ACC-002' } })

    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ page: 1 })
      )
    )
  })
```

Add `fireEvent`, `waitFor` to imports if missing.

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
npm test -- --testPathPattern="PaymentHistoryPage" --no-coverage
```

Expected: new tests FAIL, existing test PASS.

- [ ] **Step 3: Update PaymentHistoryPage.tsx**

Replace the entire content of `src/pages/PaymentHistoryPage.tsx`:

```tsx
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useClientAccounts } from '@/hooks/useAccounts'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Rejected', value: 'FAILED' },
      { label: 'Processing', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min Amount', type: 'number' },
  { key: 'amount_max', label: 'Max Amount', type: 'number' },
]

export function PaymentHistoryPage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleAccountChange = (value: string) => {
    setSelectedAccountNumber(value ?? '')
    setPage(1)
  }

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
    page,
    page_size: PAGE_SIZE,
  }

  const effectiveAccount = selectedAccountNumber || accounts[0]?.account_number
  const { data, isLoading } = usePayments(effectiveAccount, apiFilters)
  const payments = data?.payments ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment History</h1>
      {accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Account:</Label>
          <Select value={selectedAccountNumber} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.account_number} value={acc.account_number}>
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <FilterBar fields={PAYMENT_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />
      {isLoading ? <p>Loading...</p> : <PaymentHistoryTable payments={payments} />}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="PaymentHistoryPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/PaymentHistoryPage.tsx src/pages/PaymentHistoryPage.test.tsx
git commit -m "feat: add backend pagination to PaymentHistoryPage"
```

---

## Chunk 8: TransferHistoryPage Pagination

**Files:**
- Modify: `src/pages/TransferHistoryPage.test.tsx`
- Modify: `src/pages/TransferHistoryPage.tsx`

### Task 8: Add pagination to TransferHistoryPage

- [ ] **Step 1: Add pagination tests**

Replace the entire content of `src/pages/TransferHistoryPage.test.tsx`:

```tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferHistoryPage } from '@/pages/TransferHistoryPage'
import * as useTransfersHook from '@/hooks/useTransfers'

jest.mock('@/hooks/useTransfers')

describe('TransferHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders history page title', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByText(/transfer history/i)).toBeInTheDocument()
  })

  it('calls useTransfers with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(useTransfersHook.useTransfers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useTransfers with page 2 when next arrow is clicked', async () => {
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<TransferHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useTransfersHook.useTransfers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
npm test -- --testPathPattern="TransferHistoryPage" --no-coverage
```

Expected: new tests FAIL, existing title test PASS.

- [ ] **Step 3: Update TransferHistoryPage.tsx**

Replace the entire content of `src/pages/TransferHistoryPage.tsx`:

```tsx
import { useState } from 'react'
import { useTransfers } from '@/hooks/useTransfers'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'
import { PaginationControls } from '@/components/shared/PaginationControls'

const PAGE_SIZE = 10

export function TransferHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTransfers({ page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transfer History</h1>
      <TransferHistoryTable transfers={data?.transfers ?? []} />
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="TransferHistoryPage" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Run the full test suite**

```bash
npm test -- --no-coverage
```

Expected: all 441+ tests PASS (no regressions).

- [ ] **Step 6: Commit**

```bash
git add src/pages/TransferHistoryPage.tsx src/pages/TransferHistoryPage.test.tsx
git commit -m "feat: add backend pagination to TransferHistoryPage"
```

---

## Final Verification

- [ ] **Run lint and type check**

```bash
npm run lint && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Run build**

```bash
npm run build
```

Expected: build succeeds.
