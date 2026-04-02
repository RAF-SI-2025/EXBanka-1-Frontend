# Pagination Design — All Table Views

_Date: 2026-03-25_

## Summary

Add backend-driven pagination (10 items per page) to all table views that currently lack it. Update the existing `PaginationControls` component to use arrow icons and match the app's design system. Place controls at the centred bottom of each view.

---

## Scope

### Component update

**`src/components/shared/PaginationControls.tsx`**

- Replace `variant="outline"` text buttons with `variant="ghost" size="icon"` buttons containing `ChevronLeft` / `ChevronRight` from lucide-react
- Remove `if (totalPages <= 1) return null` — always render so the page indicator is visible
- Keep `Pagination` wrapper for centering (`mx-auto justify-center`)
- Keep "Page X of Y" label in `text-sm text-muted-foreground`

### Pages — all use `PAGE_SIZE = 10`

| Page | File | Change |
|---|---|---|
| `EmployeeListPage` | `src/pages/EmployeeListPage.tsx` | Change `PAGE_SIZE` 20 → 10 (already wired to backend) |
| `AdminClientsPage` | `src/pages/AdminClientsPage.tsx` | Add `page` state, pass `page`/`page_size` to `useAllClients`, `totalPages` from `data?.total`, `PaginationControls` |
| `AdminAccountsPage` | `src/pages/AdminAccountsPage.tsx` | Add `page` state, pass to `useAllAccounts`, `totalPages` from `data?.total`, `PaginationControls`. Note: `owner_name` filter stays client-side — searches within current page only. |
| `AdminLoansPage` | `src/pages/AdminLoansPage.tsx` | Add `page` state, pass to `useAllLoans`, `totalPages` from `data?.total`, `PaginationControls` |
| `AdminLoanRequestsPage` | `src/pages/AdminLoanRequestsPage.tsx` | Replace `page: 1, page_size: 100` with dynamic state, `totalPages` from `data?.total`, `PaginationControls`. Note: `name` filter stays client-side. |
| `PaymentHistoryPage` | `src/pages/PaymentHistoryPage.tsx` | Add `page` state, pass to `usePayments`, reset page on account or filter change, `totalPages` from `data?.total`, `PaginationControls` |
| `TransferHistoryPage` | `src/pages/TransferHistoryPage.tsx` | Add `page` state, pass to `useTransfers`, `totalPages` from `data?.total`, `PaginationControls` |

---

## Implementation Pattern

Each page follows the pattern already used in `EmployeeListPage`:

```tsx
const PAGE_SIZE = 10
const [page, setPage] = useState(1)

const handleFilterChange = (newFilters: FilterValues) => {
  setFilterValues(newFilters)
  setPage(1) // reset on filter change
}

// total field is `data?.total` for all except employees (`data?.total_count`)
const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

// bottom of JSX, after the table:
<PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
```

---

## Constraints

- No new abstractions (no shared hook, no generic table wrapper)
- `PaginationControls` is the single reusable component — all pages import it from `src/components/shared/`
- All filter changes must reset `page` to 1
- `PaymentHistoryPage` must also reset `page` when `selectedAccountNumber` changes

---

## Tests

Each changed file needs:
- Unit test for `PaginationControls`: renders arrows, shows "Page X of Y", disables prev on page 1, disables next on last page, always renders
- Integration-style tests for each page: pagination state passed to hook, filter change resets page
