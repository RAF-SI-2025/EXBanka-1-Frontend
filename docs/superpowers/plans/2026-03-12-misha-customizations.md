# Misha Customizations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customize the banking frontend — gender dropdown in employee forms, local client-side filtering with category selector, dollar sign favicon, and a professional deep blue / jade green / fuchsia color scheme with dark mode.

**Architecture:** Modify existing components (EmployeeForm, EmployeeFilters, EmployeeListPage) to use dropdown-based gender input and client-side filtering with category selection. Replace the Shadcn default neutral theme with a custom banking-themed color palette using CSS custom properties in `index.css`. Move all filtering and pagination from server-side to client-side.

**Tech Stack:** React 19, TypeScript 5.9, Shadcn UI (Select, Input, Button, Badge), Tailwind CSS v4, TanStack Query v5, Jest + React Testing Library

**Spec:** `docs/misha-plan.md`

---

## Assumptions

1. **All employees fit in memory.** Client-side filtering requires fetching all employees upfront. The API returns all employees when called without pagination params.
2. **Gender is a free-form string on the API.** The dropdown options (Male, Female, Other, Misha) are a UI-only constraint — the API accepts any string for `gender`.
3. **Local filtering uses case-insensitive substring match.** Typing "jan" with category "First Name" matches "Jane", "Janet", etc.
4. **The API `getEmployees({})` returns all employees.** If the backend defaults to paginated results, a follow-up API change may be needed.

---

## File Structure

**Modified files:**

```
src/
  types/employee.ts                          # Add FilterCategory type
  components/employees/
    EmployeeForm.tsx                         # Gender: text input → dropdown (both CreateForm and EditForm)
    EmployeeForm.test.tsx                    # Test gender dropdown renders and works
    EmployeeFilters.tsx                      # Complete rewrite: category dropdown + text input + X clear
    EmployeeFilters.test.tsx                 # Rewrite tests for new filter behavior
    EmployeeStatusBadge.tsx                  # Restyle: jade green for Active badge
  pages/
    EmployeeListPage.tsx                     # Local filtering + client-side pagination
    EmployeeListPage.test.tsx                # Test local filtering and pagination
  hooks/
    useEmployees.ts                          # Remove filter params — fetch all
    useEmployees.test.ts                     # Update test for no-params call
  components/layout/
    Sidebar.tsx                              # Restyle: deep blue bg, fuchsia branding
    AuthLayout.tsx                           # Restyle: blue-tinted background
  components/auth/
    LoginForm.tsx                            # Restyle: accent card border
    PasswordResetRequestForm.tsx             # Restyle: accent card border
    PasswordResetForm.tsx                    # Restyle: accent card border
    ActivationForm.tsx                       # Restyle: accent card border
  index.css                                  # Complete theme variable overhaul (light + dark)
index.html                                   # Change favicon link
```

**New files:**

```
public/dollar.svg                            # Dollar sign favicon SVG
```

---

## Chunk 1: Gender Dropdown in EmployeeForm

This chunk changes the gender field from a text `<Input>` to a `<Select>` dropdown with options: Male, Female, Other, Misha. Applies to both CreateForm (new employees) and EditForm (editing employees). **TDD applies.**

### Task 1.1: Add Gender Dropdown Tests

**Files:**
- Modify: `src/components/employees/EmployeeForm.test.tsx`

- [ ] **Step 1: Add failing tests for gender dropdown**

Add to `src/components/employees/EmployeeForm.test.tsx` — after the existing `describe` block's closing brace, or as new `it` blocks inside the existing `describe('EmployeeForm', ...)`:

```tsx
it('renders gender as a dropdown, not a text input, in create mode', () => {
  renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
  expect(screen.queryByRole('textbox', { name: /gender/i })).not.toBeInTheDocument()
  expect(screen.getByText('Select gender')).toBeInTheDocument()
})

it('pre-fills gender dropdown in edit mode', () => {
  const employee = createMockEmployee({ gender: 'Female' })
  renderWithProviders(
    <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />
  )
  expect(screen.getByText('Female')).toBeInTheDocument()
})

it('disables gender dropdown when readOnly', () => {
  const employee = createMockEmployee({ gender: 'Male' })
  renderWithProviders(
    <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} readOnly />
  )
  const genderTrigger = screen.getByRole('combobox', { name: /gender/i })
  expect(genderTrigger).toBeDisabled()
})
```

**Note:** The `getByRole('combobox', { name: /gender/i })` query requires the SelectTrigger to have an accessible name. Since `<label for>` does not label `<button>` elements in HTML5, you **must** add `aria-label="Gender"` to every `<SelectTrigger id="gender">` in the implementation (Task 1.2). Without it, this test will fail even after implementation.

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- EmployeeForm.test
```

Expected: FAIL — gender is still a text input, no "Select gender" placeholder.

---

### Task 1.2: Implement Gender Dropdown

**Files:**
- Modify: `src/components/employees/EmployeeForm.tsx`

**Note:** `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, and `SelectValue` are already imported at lines 8–14. No new imports are needed.

- [ ] **Step 1: Add GENDERS constant**

After the `ROLES` constant (line 18), add:

```typescript
const GENDERS = ['Male', 'Female', 'Other', 'Misha'] as const
```

- [ ] **Step 2: Replace gender text input in CreateForm**

In the `CreateForm` function, replace the gender `<Input>` block (lines 402–406):

```tsx
{/* OLD — remove this: */}
<div className="space-y-2">
  <Label htmlFor="gender">Gender</Label>
  <Input id="gender" {...register('gender')} />
</div>
```

With:

```tsx
<div className="space-y-2">
  <Label htmlFor="gender">Gender</Label>
  <Select value={gender ?? ''} onValueChange={(val) => setValue('gender', val)}>
    <SelectTrigger id="gender" aria-label="Gender">
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      {GENDERS.map((g) => (
        <SelectItem key={g} value={g}>
          {g}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 3: Add gender watch to CreateForm**

After `const phone = watch('phone') ?? ''` (line 365), add:

```typescript
const gender = watch('gender')
```

- [ ] **Step 4: Add gender dropdown to EditForm**

In the `EditForm` function, insert a gender dropdown **after** the date_of_birth field (after line 249, before the email field):

```tsx
<div className="space-y-2">
  <Label htmlFor="gender">Gender</Label>
  <Select
    value={gender ?? ''}
    onValueChange={(val) => setValue('gender', val)}
    disabled={readOnly}
  >
    <SelectTrigger id="gender" aria-label="Gender">
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      {GENDERS.map((g) => (
        <SelectItem key={g} value={g}>
          {g}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 5: Add gender watch to EditForm**

After `const phone = watch('phone') ?? ''` (line 218), add:

```typescript
const gender = watch('gender')
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- EmployeeForm.test
```

Expected: All tests PASS.

- [ ] **Step 7: Run all tests to ensure no regressions**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/employees/EmployeeForm.tsx src/components/employees/EmployeeForm.test.tsx
git commit -m "feat: change gender field from text input to dropdown (Male, Female, Other, Misha)"
```

---

## Chunk 2: Local Filtering & Client-Side Pagination

This chunk replaces server-side filtering with client-side filtering. The `EmployeeFilters` component gets a category dropdown (First Name, Last Name, Email, Position) + text input + X clear button. `EmployeeListPage` fetches all employees, filters locally, and paginates on the client. **TDD applies.**

**Prerequisite:** Verify that `GET /api/employees` without pagination params returns all employees. If the backend defaults to a limited page size, either pass `{ page_size: 10000 }` in `useEmployees` or adjust the backend first.

### Task 2.1: Add FilterCategory Type

**Files:**
- Modify: `src/types/employee.ts`

- [ ] **Step 1: Add FilterCategory type**

Append to end of `src/types/employee.ts`:

```typescript
export type FilterCategory = 'first_name' | 'last_name' | 'email' | 'position'
```

- [ ] **Step 2: Commit**

```bash
git add src/types/employee.ts
git commit -m "feat: add FilterCategory type for local employee filtering"
```

---

### Task 2.2: Simplify useEmployees Hook (TDD)

**Files:**
- Modify: `src/hooks/useEmployees.ts`
- Modify: `src/hooks/useEmployees.test.ts`

- [ ] **Step 1: Write updated test**

Replace `src/hooks/useEmployees.test.ts` with:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useEmployees } from '@/hooks/useEmployees'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('useEmployees', () => {
  it('fetches all employees without filter params', async () => {
    const response = { employees: [createMockEmployee()], total_count: 1 }
    jest.mocked(employeesApi.getEmployees).mockResolvedValue(response)

    const { result } = renderHook(() => useEmployees(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useEmployees.test
```

Expected: FAIL — `useEmployees` still expects filter params.

- [ ] **Step 3: Simplify useEmployees hook**

Replace `src/hooks/useEmployees.ts` with:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '@/lib/api/employees'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees({}),
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useEmployees.test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEmployees.ts src/hooks/useEmployees.test.ts
git commit -m "feat: simplify useEmployees to fetch all employees without server-side filters"
```

---

### Task 2.3: Rewrite EmployeeFilters Component (TDD)

**Files:**
- Modify: `src/components/employees/EmployeeFilters.tsx`
- Modify: `src/components/employees/EmployeeFilters.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/components/employees/EmployeeFilters.test.tsx` with:

```tsx
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'

const mockOnFilterChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeFilters', () => {
  it('renders category dropdown and text input', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type to filter/i)).toBeInTheDocument()
  })

  it('calls onFilterChange with default category and typed value', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'first_name',
      value: 'Jane',
    })
  })

  it('does not show clear button when input is empty', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    expect(
      screen.queryByRole('button', { name: /clear filter/i })
    ).not.toBeInTheDocument()
  })

  it('shows clear button when text is entered', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(screen.getByRole('button', { name: /clear filter/i })).toBeInTheDocument()
  })

  it('clears input and calls onFilterChange(null) when clear is clicked', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    mockOnFilterChange.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))

    expect(input).toHaveValue('')
    expect(mockOnFilterChange).toHaveBeenCalledWith(null)
  })

  it('calls onFilterChange(null) when input is cleared by typing', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    mockOnFilterChange.mockClear()

    fireEvent.change(input, { target: { value: '' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(null)
  })

  it('updates category and re-emits filter when category changes with non-empty input', async () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'jane@test.com' } })
    mockOnFilterChange.mockClear()

    // Open the category dropdown and select "Email"
    const categoryTrigger = screen.getAllByRole('combobox')[0]
    await userEvent.click(categoryTrigger)
    await userEvent.click(screen.getByRole('option', { name: /email/i }))

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'email',
      value: 'jane@test.com',
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- EmployeeFilters.test
```

Expected: FAIL — component has old interface (`onFilter` instead of `onFilterChange`).

- [ ] **Step 3: Implement new EmployeeFilters**

Replace `src/components/employees/EmployeeFilters.tsx` with:

```tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FilterCategory } from '@/types/employee'

const FILTER_CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'position', label: 'Position' },
]

interface EmployeeFiltersProps {
  onFilterChange: (
    filter: { category: FilterCategory; value: string } | null
  ) => void
}

export function EmployeeFilters({ onFilterChange }: EmployeeFiltersProps) {
  const [category, setCategory] = useState<FilterCategory>('first_name')
  const [value, setValue] = useState('')

  const handleCategoryChange = (newCategory: string) => {
    const cat = newCategory as FilterCategory
    setCategory(cat)
    if (value.trim()) {
      onFilterChange({ category: cat, value })
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    if (newValue.trim()) {
      onFilterChange({ category, value: newValue })
    } else {
      onFilterChange(null)
    }
  }

  const handleClear = () => {
    setValue('')
    onFilterChange(null)
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[160px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative max-w-sm flex-1">
        <Input
          placeholder="Type to filter..."
          value={value}
          onChange={handleValueChange}
          className="pr-8"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear filter"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- EmployeeFilters.test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/employees/EmployeeFilters.tsx src/components/employees/EmployeeFilters.test.tsx
git commit -m "feat: rewrite EmployeeFilters with category dropdown, text input, and clear button"
```

---

### Task 2.4: Update EmployeeListPage for Local Filtering + Client-Side Pagination (TDD)

**Files:**
- Modify: `src/pages/EmployeeListPage.tsx`
- Modify: `src/pages/EmployeeListPage.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/pages/EmployeeListPage.test.tsx` with:

```tsx
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

const allEmployees = [
  createMockEmployee({
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@test.com',
    position: 'Teller',
  }),
  createMockEmployee({
    id: 2,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@test.com',
    position: 'Manager',
  }),
  createMockEmployee({
    id: 3,
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice@test.com',
    position: 'Teller',
  }),
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(employeesApi.getEmployees).mockResolvedValue({
    employees: allEmployees,
    total_count: 3,
  })
})

describe('EmployeeListPage', () => {
  it('displays all employees on load', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('filters employees locally by first name', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
  })

  it('shows all employees when filter is cleared', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('has a create employee button linking to /employees/new', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    const link = await screen.findByRole('link', { name: /create employee/i })
    expect(link).toHaveAttribute('href', '/employees/new')
  })

  it('shows loading state', () => {
    jest.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('fetches employees without filter or pagination params', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({})
  })

  it('shows "No employees found" when filter matches nothing', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'ZZZZZ' } })

    expect(screen.getByText('No employees found.')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('filters employees by position when category is changed', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    // Switch category to Position
    const categoryTrigger = screen.getAllByRole('combobox')[0]
    await userEvent.click(categoryTrigger)
    await userEvent.click(screen.getByRole('option', { name: /position/i }))

    // Filter by "Manager"
    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Manager' } })

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- EmployeeListPage.test
```

Expected: FAIL — `useEmployees` signature mismatch, EmployeeFilters interface mismatch.

- [ ] **Step 3: Implement updated EmployeeListPage**

Replace `src/pages/EmployeeListPage.tsx` with:

```tsx
import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import { useEmployees } from '@/hooks/useEmployees'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type { FilterCategory } from '@/types/employee'

const PAGE_SIZE = 20

function MeTab() {
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: employee, isLoading } = useEmployee(currentUser?.id ?? 0)

  if (!currentUser) return <p className="text-muted-foreground">Not logged in.</p>
  if (isLoading) return <p>Loading...</p>
  if (!employee) return <p className="text-muted-foreground">Could not load your profile.</p>

  const formatDate = (ts: number) => {
    if (!ts) return '\u2014'
    return new Date(ts * 1000).toLocaleDateString()
  }

  const rows: { label: string; value: string | boolean | undefined }[] = [
    { label: 'First Name', value: employee.first_name },
    { label: 'Last Name', value: employee.last_name },
    { label: 'Email', value: employee.email },
    { label: 'Username', value: employee.username },
    { label: 'Date of Birth', value: formatDate(employee.date_of_birth) },
    { label: 'Gender', value: employee.gender },
    { label: 'Phone', value: employee.phone },
    { label: 'Address', value: employee.address },
    { label: 'Position', value: employee.position },
    { label: 'Department', value: employee.department },
    { label: 'Role', value: employee.role },
    { label: 'Status', value: employee.active ? 'Active' : 'Inactive' },
    { label: 'JMBG', value: employee.jmbg },
  ]

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold mb-4">My Profile</h2>
      <dl className="divide-y divide-border rounded-lg border overflow-hidden">
        {rows.map(({ label, value }) =>
          value !== undefined && value !== '' && value !== null ? (
            <div key={label} className="flex px-4 py-2.5 gap-4">
              <dt className="w-36 shrink-0 text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{String(value)}</dd>
            </div>
          ) : null
        )}
      </dl>
    </div>
  )
}

export function EmployeeListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useEmployees()
  const [filter, setFilter] = useState<{
    category: FilterCategory
    value: string
  } | null>(null)
  const [page, setPage] = useState(1)

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return []
    if (!filter || !filter.value.trim()) return data.employees
    const val = filter.value.toLowerCase().trim()
    return data.employees.filter((emp) => {
      const field = emp[filter.category]
      return field.toLowerCase().includes(val)
    })
  }, [data?.employees, filter])

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE)
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const handleFilterChange = (
    newFilter: { category: FilterCategory; value: string } | null
  ) => {
    setFilter(newFilter)
    setPage(1)
  }

  const handleRowClick = (id: number) => {
    navigate(`/employees/${id}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Employee
        </Link>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="me">Me</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <p>Loading...</p>
          ) : paginatedEmployees.length ? (
            <>
              <EmployeeTable
                employees={paginatedEmployees}
                onRowClick={handleRowClick}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {filteredEmployees.length} of {data?.employees.length ?? 0}{' '}
                employees
              </p>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>No employees found.</p>
          )}
        </TabsContent>

        <TabsContent value="me">
          <MeTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- EmployeeListPage.test
```

Expected: PASS.

- [ ] **Step 5: Run all tests to verify no regressions**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/employee.ts src/hooks/useEmployees.ts src/hooks/useEmployees.test.ts src/components/employees/EmployeeFilters.tsx src/components/employees/EmployeeFilters.test.tsx src/pages/EmployeeListPage.tsx src/pages/EmployeeListPage.test.tsx
git commit -m "feat: implement local filtering with category selector and client-side pagination"
```

---

## Chunk 3: Favicon + CSS Theme Overhaul

This chunk replaces the Vite favicon with a dollar sign and overhauls the entire color scheme. **No TDD — these are configuration and visual design tasks (TDD exception per CLAUDE.md).** Existing tests must still pass after changes.

### Task 3.1: Create Dollar Sign Favicon

**Files:**
- Create: `public/dollar.svg`
- Modify: `index.html`

- [ ] **Step 1: Create dollar sign SVG**

Create `public/dollar.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#1a3a6b"/>
  <text x="16" y="17" text-anchor="middle" dominant-baseline="central" font-size="20" font-family="Arial,sans-serif" font-weight="bold" fill="white">$</text>
</svg>
```

Deep blue circle with white dollar sign — matches the theme.

- [ ] **Step 2: Update index.html favicon link**

In `index.html`, replace:

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

With:

```html
<link rel="icon" type="image/svg+xml" href="/dollar.svg" />
```

- [ ] **Step 3: Optionally delete `public/vite.svg`**

```bash
rm public/vite.svg
```

- [ ] **Step 4: Verify**

Run `npm run dev` and check the browser tab icon shows a dollar sign on a blue circle.

- [ ] **Step 5: Commit**

```bash
git add public/dollar.svg index.html
git rm public/vite.svg
git commit -m "feat: replace Vite favicon with dollar sign"
```

---

### Task 3.2: Overhaul CSS Theme Variables

**Files:**
- Modify: `src/index.css`

Color scheme reference:
- **Deep blue** (main): `oklch(0.35 0.14 255)` — primary buttons, sidebar, headings
- **White** (background): `oklch(1 0 0)` — page backgrounds, cards
- **Jade green** (accent 1): `oklch(0.60 0.16 165)` — success badges, accent highlights
- **Fuchsia** (accent 2): `oklch(0.60 0.25 330)` — focus rings, branding accents, standout elements

- [ ] **Step 1: Replace `:root` variables in `src/index.css`**

Replace the entire `:root { ... }` block (lines 8–41) with:

```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.20 0.06 255);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.20 0.06 255);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.20 0.06 255);
    --primary: oklch(0.35 0.14 255);
    --primary-foreground: oklch(0.98 0 0);
    --secondary: oklch(0.95 0.02 255);
    --secondary-foreground: oklch(0.25 0.08 255);
    --muted: oklch(0.96 0.01 255);
    --muted-foreground: oklch(0.50 0.04 255);
    --accent: oklch(0.60 0.16 165);
    --accent-foreground: oklch(0.98 0 0);
    --destructive: oklch(0.55 0.22 27);
    --border: oklch(0.90 0.02 255);
    --input: oklch(0.90 0.02 255);
    --ring: oklch(0.60 0.25 330);
    --chart-1: oklch(0.45 0.14 255);
    --chart-2: oklch(0.60 0.16 165);
    --chart-3: oklch(0.60 0.25 330);
    --chart-4: oklch(0.55 0.12 255);
    --chart-5: oklch(0.50 0.14 165);
    --radius: 0.625rem;
    --sidebar: oklch(0.25 0.10 255);
    --sidebar-foreground: oklch(0.95 0.01 255);
    --sidebar-primary: oklch(0.60 0.16 165);
    --sidebar-primary-foreground: oklch(0.98 0 0);
    --sidebar-accent: oklch(0.30 0.08 255);
    --sidebar-accent-foreground: oklch(0.95 0.01 255);
    --sidebar-border: oklch(0.32 0.06 255);
    --sidebar-ring: oklch(0.60 0.25 330);
    --accent-2: oklch(0.60 0.25 330);
    --accent-2-foreground: oklch(0.98 0 0);
}
```

- [ ] **Step 2: Replace `.dark` variables**

Replace the entire `.dark { ... }` block (lines 43–75) with:

```css
.dark {
    --background: oklch(0.17 0.04 255);
    --foreground: oklch(0.95 0.01 255);
    --card: oklch(0.22 0.05 255);
    --card-foreground: oklch(0.95 0.01 255);
    --popover: oklch(0.22 0.05 255);
    --popover-foreground: oklch(0.95 0.01 255);
    --primary: oklch(0.60 0.14 255);
    --primary-foreground: oklch(0.15 0.04 255);
    --secondary: oklch(0.25 0.05 255);
    --secondary-foreground: oklch(0.90 0.01 255);
    --muted: oklch(0.25 0.04 255);
    --muted-foreground: oklch(0.65 0.03 255);
    --accent: oklch(0.60 0.16 165);
    --accent-foreground: oklch(0.15 0 0);
    --destructive: oklch(0.65 0.20 27);
    --border: oklch(0.30 0.04 255);
    --input: oklch(0.30 0.05 255);
    --ring: oklch(0.65 0.25 330);
    --chart-1: oklch(0.55 0.14 255);
    --chart-2: oklch(0.60 0.16 165);
    --chart-3: oklch(0.65 0.25 330);
    --chart-4: oklch(0.50 0.12 255);
    --chart-5: oklch(0.55 0.14 165);
    --sidebar: oklch(0.15 0.04 255);
    --sidebar-foreground: oklch(0.95 0.01 255);
    --sidebar-primary: oklch(0.60 0.16 165);
    --sidebar-primary-foreground: oklch(0.98 0 0);
    --sidebar-accent: oklch(0.20 0.05 255);
    --sidebar-accent-foreground: oklch(0.95 0.01 255);
    --sidebar-border: oklch(0.25 0.04 255);
    --sidebar-ring: oklch(0.65 0.25 330);
    --accent-2: oklch(0.65 0.25 330);
    --accent-2-foreground: oklch(0.98 0 0);
}
```

- [ ] **Step 3: Add custom color tokens to `@theme inline` block**

Inside the `@theme inline { ... }` block (after line 79, before the closing `}`), add:

```css
    --color-accent-2: var(--accent-2);
    --color-accent-2-foreground: var(--accent-2-foreground);
```

This enables Tailwind utility classes: `bg-accent-2`, `text-accent-2`, `text-accent-2-foreground`, `hover:bg-accent-2/90`, etc.

- [ ] **Step 4: Run build to verify CSS is valid**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Run all tests to verify nothing broke**

```bash
npm test
```

Expected: All pass (CSS variable changes don't affect JSDOM tests).

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "feat: overhaul CSS theme — deep blue primary, jade green accent, fuchsia ring + accent-2"
```

---

### Task 3.3: Restyle Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Update Sidebar with theme classes**

Replace `src/components/layout/Sidebar.tsx` with:

```tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1">
        <Link
          to="/employees"
          className="block px-3 py-2 rounded-md hover:bg-sidebar-accent text-sm text-sidebar-foreground"
        >
          Employees
        </Link>
      </nav>
      <div className="border-t border-sidebar-border pt-4 mt-4">
        <p className="text-sm text-sidebar-foreground/70 mb-2">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </aside>
  )
}
```

Key changes:
- `bg-muted/20` → `bg-sidebar` (deep blue)
- `border-r` → removed (sidebar bg provides visual separation)
- "EXBanka" → `text-accent-2` (fuchsia)
- Nav link → `hover:bg-sidebar-accent text-sidebar-foreground`
- Logout button → themed border and hover colors

- [ ] **Step 2: Run Sidebar tests**

```bash
npm test -- Sidebar.test
```

Expected: All pass (tests check text content and roles, not CSS classes).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: restyle Sidebar with deep blue background and fuchsia branding"
```

---

### Task 3.4: Restyle Auth Layout and Card Accents

**Files:**
- Modify: `src/components/layout/AuthLayout.tsx`
- Modify: `src/components/auth/LoginForm.tsx`
- Modify: `src/components/auth/PasswordResetRequestForm.tsx`
- Modify: `src/components/auth/PasswordResetForm.tsx`
- Modify: `src/components/auth/ActivationForm.tsx`

- [ ] **Step 1: Update AuthLayout background**

In `src/components/layout/AuthLayout.tsx`, change `bg-muted/40` to `bg-secondary`:

```tsx
<div className="min-h-screen flex items-center justify-center bg-secondary">
```

- [ ] **Step 2: Add accent border to LoginForm card**

In `src/components/auth/LoginForm.tsx`, change the `<Card>` element (line 27) to:

```tsx
<Card className="border-t-4 border-t-primary">
```

- [ ] **Step 3: Add accent border to PasswordResetRequestForm cards**

In `src/components/auth/PasswordResetRequestForm.tsx`, change both `<Card>` elements (lines 37 and 50) to:

```tsx
<Card className="border-t-4 border-t-primary">
```

- [ ] **Step 4: Add accent border to PasswordResetForm cards**

In `src/components/auth/PasswordResetForm.tsx`, change both `<Card>` elements (lines 46 and 58) to:

```tsx
<Card className="border-t-4 border-t-primary">
```

- [ ] **Step 5: Add accent border to ActivationForm cards**

In `src/components/auth/ActivationForm.tsx`, change both `<Card>` elements (lines 40 and 53) to:

```tsx
<Card className="border-t-4 border-t-primary">
```

- [ ] **Step 6: Run all auth tests**

```bash
npm test -- --testPathPattern="(LoginForm|PasswordReset|Activation)"
```

Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/AuthLayout.tsx src/components/auth/LoginForm.tsx src/components/auth/PasswordResetRequestForm.tsx src/components/auth/PasswordResetForm.tsx src/components/auth/ActivationForm.tsx
git commit -m "feat: restyle auth layout with blue-tinted background and accent card borders"
```

---

### Task 3.5: Restyle EmployeeStatusBadge and Create Button

**Files:**
- Modify: `src/components/employees/EmployeeStatusBadge.tsx`
- Modify: `src/pages/EmployeeListPage.tsx`

- [ ] **Step 1: Update EmployeeStatusBadge for jade green Active**

Replace `src/components/employees/EmployeeStatusBadge.tsx` with:

```tsx
import { Badge } from '@/components/ui/badge'

interface EmployeeStatusBadgeProps {
  active: boolean
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  if (active) {
    return (
      <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
        Active
      </Badge>
    )
  }
  return <Badge variant="secondary">Inactive</Badge>
}
```

- [ ] **Step 2: Update "Create Employee" button to use fuchsia accent**

In `src/pages/EmployeeListPage.tsx`, change the Create Employee `<Link>` classes to:

```tsx
<Link
  to="/employees/new"
  className="inline-flex items-center justify-center rounded-lg bg-accent-2 px-2.5 py-1.5 text-sm font-medium text-accent-2-foreground transition-colors hover:bg-accent-2/90"
>
  Create Employee
</Link>
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/employees/EmployeeStatusBadge.tsx src/pages/EmployeeListPage.tsx
git commit -m "feat: jade green Active badge, fuchsia Create Employee button"
```

---

### Task 3.6: Final Quality Gates

- [ ] **Step 1: Run all tests**

```bash
npm test
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Run format check and fix**

```bash
npx prettier --check "src/**/*.{ts,tsx}"
npx prettier --write "src/**/*.{ts,tsx}"
```

- [ ] **Step 5: Run build**

```bash
npm run build
```

All gates must pass. Fix any issues before proceeding.

- [ ] **Step 6: Visual verification**

Run `npm run dev` and verify:

1. **Login page**: White card with deep blue top border stripe, on a light blue-tinted background
2. **Sidebar**: Deep blue background, "EXBanka" in fuchsia, white navigation text, blue hover states
3. **Employee list**: Fuchsia "Create Employee" button, jade green "Active" badges, gray "Inactive" badges
4. **Employee form**: Gender is a dropdown with options: Male, Female, Other, Misha
5. **Filters**: Category dropdown (First Name, Last Name, Email, Position) + text input + X clear button, filtering works instantly on local data
6. **Browser tab**: Dollar sign icon on deep blue circle
7. **Focus rings**: Fuchsia-colored on inputs, buttons, and selects
8. **Dark mode** (if togglable): Dark navy background, brighter blue primary, same jade/fuchsia accents
