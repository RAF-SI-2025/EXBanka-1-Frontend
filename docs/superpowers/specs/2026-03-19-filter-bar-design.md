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

## Types

**File:** `src/types/filters.ts`

```typescript
export type FilterFieldType = 'text' | 'multiselect' | 'date' | 'number'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterFieldDef {
  key: string
  label: string
  type: FilterFieldType
  options?: FilterOption[]  // required when type === 'multiselect'
}

export type FilterValues = Record<string, string | string[]>
// text / date / number fields → string value
// multiselect fields → string[] value
```

---

## FilterBar Component

**File:** `src/components/ui/FilterBar.tsx`

### Props

```typescript
interface FilterBarProps {
  fields: FilterFieldDef[]
  values: FilterValues
  onChange: (values: FilterValues) => void
}
```

### Rendering rules per field type

| Type | UI Element | Notes |
|------|-----------|-------|
| `text` | Shadcn `Input` | Controlled, fires `onChange` on every keystroke |
| `multiselect` | Custom checkbox dropdown | Trigger button shows label + selected count badge (e.g. "Status (2)"). Dropdown contains "Select All" checkbox + one checkbox per option. |
| `date` | Shadcn `Input type="date"` | Value as ISO date string |
| `number` | Shadcn `Input type="number"` | Value as string (empty string = no filter) |

### Multi-select dropdown behavior

- Clicking the trigger button opens a popover with checkboxes
- First item is always "Select All": checking it selects all options, unchecking deselects all
- Selecting all options individually also marks "Select All" as checked
- Selected values emitted as `string[]`; empty array = no filter applied
- Trigger button badge: hidden when 0 selected, shows count when 1+

### State ownership

State lives in the page component. `FilterBar` is fully controlled (receives `values`, emits `onChange`). No internal state.

---

## Per-Page Field Definitions

### EmployeeListPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  {
    key: 'position', label: 'Position', type: 'multiselect',
    options: [/* dynamic from data or known enum values */]
  },
]
```

API mapping: `FilterValues` → `EmployeeFilters`. For multiselect with single API param, take first value from array or join with comma depending on API capability.

### AdminAccountsPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'owner_name', label: 'Owner Name', type: 'text' },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]
```

### AdminClientsPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]
```

### AdminLoansPage

```typescript
const fields: FilterFieldDef[] = [
  {
    key: 'loan_type', label: 'Loan Type', type: 'multiselect',
    options: [
      { label: 'Cash', value: 'CASH' },
      { label: 'Mortgage', value: 'MORTGAGE' },
      { label: 'Auto', value: 'AUTO' },
      { label: 'Refinancing', value: 'REFINANCING' },
      { label: 'Student', value: 'STUDENT' },
    ],
  },
  {
    key: 'status', label: 'Status', type: 'multiselect',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Paid Off', value: 'PAID_OFF' },
      { label: 'Delinquent', value: 'DELINQUENT' },
    ],
  },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]
```

### AdminLoanRequestsPage

Same fields as AdminLoansPage. Removes inline filter JSX, uses `FilterBar`.

### PaymentHistoryPage

```typescript
const fields: FilterFieldDef[] = [
  { key: 'date_from', label: 'From', type: 'date' },
  { key: 'date_to', label: 'To', type: 'date' },
  {
    key: 'status_filter', label: 'Status', type: 'multiselect',
    options: [
      { label: 'Pending', value: 'PENDING' },
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Failed', value: 'FAILED' },
    ],
  },
  { key: 'amount_min', label: 'Min Amount', type: 'number' },
  { key: 'amount_max', label: 'Max Amount', type: 'number' },
]
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
1. Replaces old filter state with `FilterValues` state
2. Replaces old filter component with `<FilterBar fields={...} values={...} onChange={...} />`
3. Maps `FilterValues` → API-specific filter type before passing to query hook

---

## Testing

- Unit tests for `FilterBar` covering: text input, multiselect open/close/select/deselect/selectAll, date input, number input, onChange callback correctness
- Each page: existing filter-related tests updated to work with new `FilterBar` interface
- TDD: tests written before implementation

---

## Files Created / Modified / Deleted

**Created:**
- `src/types/filters.ts`
- `src/components/ui/FilterBar.tsx`
- `src/__tests__/components/ui/FilterBar.test.tsx`

**Modified:**
- `src/pages/EmployeeListPage.tsx`
- `src/pages/AdminAccountsPage.tsx`
- `src/pages/AdminClientsPage.tsx`
- `src/pages/AdminLoansPage.tsx`
- `src/pages/AdminLoanRequestsPage.tsx`
- `src/pages/PaymentHistoryPage.tsx`

**Deleted:**
- `src/components/employees/EmployeeFilters.tsx`
- `src/components/admin/AccountFilters.tsx`
- `src/components/admin/ClientFilters.tsx`
- `src/components/loans/LoanFilters.tsx`
- `src/components/payments/PaymentFilters.tsx`
- `src/types/employee.ts` → remove `FilterCategory` type (keep `Employee`, `EmployeeFilters`)
