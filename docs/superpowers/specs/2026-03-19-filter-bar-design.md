# FilterBar — Reusable Filter Component Design

_Date: 2026-03-19_

## Overview

Replace all existing page-specific filter components with a single reusable `FilterBar` component. The component displays all filters in a horizontal row, where each filter field renders an appropriate input based on its type. Enum fields use a multi-select checkbox dropdown with a "Select All" button.

---

## Goals

- Consistent filter UI across all pages
- Single reusable component, no code duplication
- Support for text, multi-select (enum), date, and number filter types
- Multi-select fields allow selecting multiple values simultaneously, with a "Select All" shortcut
- All existing page-specific filter components deleted

---

## Prerequisites

Install Shadcn Popover before implementation:

```bash
npx shadcn@latest add popover
```

The `MultiselectDropdown` sub-component uses `Popover` + `PopoverTrigger` + `PopoverContent` from Shadcn.

---

## Types

**File:** `src/types/filters.ts`

```typescript
export interface FilterOption {
  label: string
  value: string
}

// Discriminated union — options required for multiselect, disallowed for others
export type FilterFieldDef =
  | { key: string; label: string; type: 'text' | 'date' | 'number' }
  | { key: string; label: string; type: 'multiselect'; options: FilterOption[] }

export type FilterValues = Record<string, string | string[]>
// text / date / number fields → string value (empty string = no filter)
// multiselect fields → string[] value (empty array = no filter)
```

---

## Component Structure

To stay within the 150-line limit, `FilterBar` is split into two components:

### MultiselectDropdown (sub-component)

**File:** `src/components/ui/MultiselectDropdown.tsx`

Renders a Shadcn Popover trigger button + dropdown with checkboxes. Manages its own open/close state (local UI state only — does not affect filter values).

```typescript
interface MultiselectDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}
```

Behavior:
- Trigger button label: `"Label"` when 0 selected, `"Label (N)"` when N selected
- Dropdown header: "Select All" checkbox — checked when all options selected, unchecked otherwise
- One checkbox per option
- Selecting all individually checks "Select All"; deselecting any unchecks it
- Closing popover triggers no additional callbacks — values emit on each checkbox change

### FilterBar (main component)

**File:** `src/components/ui/FilterBar.tsx`

```typescript
interface FilterBarProps {
  fields: FilterFieldDef[]
  values: FilterValues
  onChange: (values: FilterValues) => void
}
```

Renders a horizontal row of filter fields. Fully controlled — no filter value state inside `FilterBar`. For each field, renders the appropriate input:

| Type | UI Element | Value type |
|------|-----------|------------|
| `text` | Shadcn `Input` | `string` |
| `multiselect` | `MultiselectDropdown` | `string[]` |
| `date` | Shadcn `Input type="date"` | `string` (ISO date) |
| `number` | Shadcn `Input type="number"` | `string` |

**Clear behavior:** Clearing a field (empty string / empty array) is the equivalent of "no filter applied". No separate "clear all" button is required — emptying inputs is sufficient.

---

## API Mapping Strategy

`FilterValues` uses `string | string[]` for all values. Pages are responsible for mapping to their API-specific filter types.

**Multiselect → single API string:** When the API accepts a single string (e.g., `loan_type?: LoanType`), the page takes the first selected value or `undefined` if the array is empty:

```typescript
const apiFilters = {
  loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
}
```

**Number fields:** Pages coerce string to number before passing to API:

```typescript
const apiFilters = {
  amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
  amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
}
```

**Text fields:** Pass string directly, converting empty string to `undefined`:

```typescript
const apiFilters = {
  name: (filterValues.name as string) || undefined,
}
```

---

## Per-Page Field Definitions

### EmployeeListPage

`position` is a free-text field in the API (`position?: string`), not an enum — it remains a `text` input.

```typescript
const fields: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
]
```

API mapping: all text fields, empty string → `undefined`.

---

### AdminAccountsPage

`owner_name` is filtered **client-side** via `filterAccountsByOwner()`. The API does expose a `name_filter` param, but the current page intentionally uses client-side filtering (existing behavior preserved). `account_number` goes to the API as `account_number_filter`.

```typescript
const fields: FilterFieldDef[] = [
  { key: 'owner_name', label: 'Owner Name', type: 'text' },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]

// In page component:
const apiFilters = {
  account_number_filter: (filterValues.account_number as string) || undefined,
}
// owner_name applied locally via filterAccountsByOwner(accounts, clientsById, ownerName)
```

---

### AdminClientsPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]
```

Both fields go to API directly.

---

### AdminLoansPage

Labels use Serbian strings from `LOAN_TYPES` constants (`src/lib/constants/banking.ts`).

```typescript
const fields: FilterFieldDef[] = [
  {
    key: 'loan_type', label: 'Tip kredita', type: 'multiselect',
    options: [
      { label: 'Gotovinski', value: 'CASH' },
      { label: 'Stambeni', value: 'MORTGAGE' },
      { label: 'Auto', value: 'AUTO' },
      { label: 'Refinansiranje', value: 'REFINANCING' },
      { label: 'Studentski', value: 'STUDENT' },
    ],
  },
  {
    key: 'status', label: 'Status', type: 'multiselect',
    options: [
      { label: 'Aktivan', value: 'ACTIVE' },
      { label: 'Isplaćen', value: 'PAID_OFF' },
      { label: 'Neizmiren', value: 'DELINQUENT' },
    ],
  },
  { key: 'account_number', label: 'Broj računa', type: 'text' },
]
```

API mapping: multiselect → first value or undefined.

---

### AdminLoanRequestsPage

Loan type options same as AdminLoansPage. **Status options differ** (`LoanRequestStatus`, not `LoanStatus`):

```typescript
const fields: FilterFieldDef[] = [
  {
    key: 'loan_type', label: 'Tip kredita', type: 'multiselect',
    options: [
      { label: 'Gotovinski', value: 'CASH' },
      { label: 'Stambeni', value: 'MORTGAGE' },
      { label: 'Auto', value: 'AUTO' },
      { label: 'Refinansiranje', value: 'REFINANCING' },
      { label: 'Studentski', value: 'STUDENT' },
    ],
  },
  {
    key: 'status', label: 'Status', type: 'multiselect',
    options: [
      { label: 'Na čekanju', value: 'PENDING' },
      { label: 'Odobren', value: 'APPROVED' },
      { label: 'Odbijen', value: 'REJECTED' },
    ],
  },
  { key: 'account_number', label: 'Broj računa', type: 'text' },
]
```

Removes existing inline filter JSX from AdminLoanRequestsPage.

---

### PaymentHistoryPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'date_from', label: 'Od datuma', type: 'date' },
  { key: 'date_to', label: 'Do datuma', type: 'date' },
  {
    key: 'status_filter', label: 'Status', type: 'multiselect',
    options: [
      { label: 'Na čekanju', value: 'PENDING' },
      { label: 'Realizovano', value: 'COMPLETED' },
      { label: 'Odbijeno', value: 'FAILED' },
    ],
  },
  { key: 'amount_min', label: 'Min iznos', type: 'number' },
  { key: 'amount_max', label: 'Max iznos', type: 'number' },
]

// API mapping in page:
const apiFilters: PaymentFilters = {
  date_from: (filterValues.date_from as string) || undefined,
  date_to: (filterValues.date_to as string) || undefined,
  status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
  amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
  amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
}
```

---

## Migration Plan

| Old Component | Action |
|--------------|--------|
| `src/components/employees/EmployeeFilters.tsx` | Delete |
| `src/components/admin/AccountFilters.tsx` | Delete |
| `src/components/admin/ClientFilters.tsx` | Delete |
| `src/components/loans/LoanFilters.tsx` | Delete |
| `src/components/payments/PaymentFilters.tsx` | Delete |
| Inline filters in `AdminLoanRequestsPage` | Remove from JSX |

Each page component:
1. Replaces old filter state with `FilterValues` state: `useState<FilterValues>({})`
2. Replaces old filter component/JSX with `<FilterBar fields={...} values={...} onChange={...} />`
3. Maps `FilterValues` → API-specific filter type before passing to query hook (see API mapping section)

Also remove `FilterCategory` type from `src/types/employee.ts` (keep `Employee`, `EmployeeFilters`).

---

## Testing

**TDD: tests written before implementation.**

Test file locations follow the co-located pattern used by existing filter tests:
- `src/components/ui/FilterBar.test.tsx`
- `src/components/ui/MultiselectDropdown.test.tsx`

Existing filter component tests in:
- `src/components/loans/LoanFilters.test.tsx`
- `src/components/payments/PaymentFilters.test.tsx`

...are deleted alongside their components. Page-level tests for filter integration are **out of scope** for this task.

**FilterBar tests must cover:**
- Renders correct input type for each field type
- Text input: onChange called with updated FilterValues on keystroke
- Date input: onChange called with ISO date string
- Number input: onChange called with string representation of number
- Multiselect: delegates to MultiselectDropdown with correct props

**MultiselectDropdown tests must cover:**
- Renders trigger button with label when nothing selected
- Renders trigger button with count badge when items selected
- Opens popover on click, closes on second click
- "Select All" selects all options, calls onChange with all values
- "Select All" deselects all when all are currently selected
- Selecting individual items updates selected list
- Selecting all items individually checks "Select All"
- Deselecting one item when all selected unchecks "Select All"

---

## Files Created / Modified / Deleted

**Created:**
- `src/types/filters.ts`
- `src/components/ui/FilterBar.tsx`
- `src/components/ui/MultiselectDropdown.tsx`
- `src/components/ui/FilterBar.test.tsx`
- `src/components/ui/MultiselectDropdown.test.tsx`

**Modified:**
- `src/pages/EmployeeListPage.tsx`
- `src/pages/AdminAccountsPage.tsx`
- `src/pages/AdminClientsPage.tsx`
- `src/pages/AdminLoansPage.tsx`
- `src/pages/AdminLoanRequestsPage.tsx`
- `src/pages/PaymentHistoryPage.tsx`
- `src/types/employee.ts` (remove `FilterCategory` type)

**Deleted:**
- `src/components/employees/EmployeeFilters.tsx`
- `src/components/admin/AccountFilters.tsx`
- `src/components/admin/ClientFilters.tsx`
- `src/components/loans/LoanFilters.tsx`
- `src/components/payments/PaymentFilters.tsx`
