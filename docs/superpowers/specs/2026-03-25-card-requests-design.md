# Admin Card Requests Page — Design

_Date: 2026-03-25_

## Summary

Add a new employee/admin portal page for reviewing pending card requests. Employees can approve requests immediately or deny them via a dialog with an optional reason field. Follows the AdminLoanRequestsPage pattern throughout.

---

## Scope

### New files

| File | Purpose |
|---|---|
| `src/types/cardRequest.ts` | `CardRequest`, `CardRequestListResponse`, `CardRequestFilters` types |
| `src/components/cards/CardRequestDenyDialog.tsx` | Shadcn Dialog with optional reason textarea |
| `src/pages/AdminCardRequestsPage.tsx` | Page component |
| `src/pages/AdminCardRequestsPage.test.tsx` | Tests |

### Modified files

| File | Change |
|---|---|
| `src/lib/api/cards.ts` | Add `getCardRequests`, `approveCardRequest`, `rejectCardRequest` |
| `src/hooks/useCards.ts` | Add `useCardRequests`, `useApproveCardRequest`, `useRejectCardRequest` |
| `src/App.tsx` | Add route `/admin/cards/requests` |
| `src/components/layout/Sidebar.tsx` | Add "Card Requests" nav link under admin section |

---

## Data Flow

1. `GET /api/cards/requests?status=PENDING&page=N&page_size=10` — fetched via `useCardRequests`
2. `useAllClients()` — builds a `clientsById` lookup map for displaying first/last names (same pattern as AdminLoanRequestsPage)
3. Approve: `PUT /api/cards/requests/:id/approve` — `useApproveCardRequest` mutation, invalidates `cardRequests` query on success
4. Reject: `PUT /api/cards/requests/:id/reject` with optional `{ reason: string }` — `useRejectCardRequest` mutation, invalidates query on success

---

## Components

### `CardRequestDenyDialog`

Props: `open: boolean`, `onClose: () => void`, `onConfirm: (reason?: string) => void`

- Shadcn `Dialog` with title "Deny Card Request"
- `Textarea` with placeholder "Reason (optional)"
- Footer: Cancel (`ghost` variant) + "Confirm Deny" (`destructive` variant)
- Resets textarea content on close

### `AdminCardRequestsPage`

Table columns: Client First Name | Client Last Name | Account Number | Card Type | Actions

Actions column per row:
- Approve button (`default` variant) — fires `approveCardRequest` mutation immediately, disabled while any mutation is pending
- Deny button (`destructive` variant) — sets `selectedRequestId` state to open the deny dialog

Deny dialog rendered once outside the table, controlled by `selectedRequestId`.

Pagination: `PAGE_SIZE = 10`, same pattern as all other admin pages.

---

## Pagination

Follows the established pattern:

```tsx
const PAGE_SIZE = 10
const [page, setPage] = useState(1)
const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
<PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
```

---

## Tests

### `CardRequestDenyDialog`
- Renders when open
- Calls `onConfirm` with reason text when textarea is filled and confirmed
- Calls `onConfirm` with undefined/empty when textarea is blank and confirmed
- Calls `onClose` on cancel

### `AdminCardRequestsPage`
- Renders page title
- Renders table rows from mocked hook data
- Calls approve mutation on Approve click
- Opens deny dialog on Deny click
- Calls reject mutation with reason on dialog confirm
- Calls `useCardRequests` with `page: 1, page_size: 10` on initial load
- Advances to page 2 on next arrow click

---

## Constraints

- Only PENDING requests are fetched — no status filter UI
- Client names resolved via `useAllClients()` lookup map, not embedded in card request response
- Deny reason is optional — empty string is acceptable
- Component size limit: 150 lines per file
- No new abstractions beyond `CardRequestDenyDialog`
