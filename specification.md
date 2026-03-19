# EXBanka Frontend — Project Specification

_Last updated: 2026-03-17_

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Routes](#4-routes)
5. [Pages](#5-pages)
6. [Components](#6-components)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Custom Hooks](#9-custom-hooks)
10. [Types & Interfaces](#10-types--interfaces)
11. [Validation Schemas](#11-validation-schemas)
12. [Test Coverage](#12-test-coverage)

---

## 1. Project Overview

**EXBanka** is a banking platform employee management frontend. It provides role-based access for two roles:

- **Admin (`EmployeeAdmin`)** — full management: list, create, edit employees
- **User (`EmployeeBasic`)** — view own profile only

The app communicates with a backend API at `http://localhost:8080` via REST.

---

## 2. Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build | Vite | ^7.3 |
| UI | Shadcn UI + Tailwind CSS | ^4 |
| Server state | TanStack Query (React Query) | v5 |
| Global state | Redux Toolkit | ^2.11 |
| Routing | React Router | v7 |
| HTTP client | Axios | ^1.13 |
| Form handling | React Hook Form + Zod | ^7 / ^4 |
| Testing | Jest + React Testing Library | ^30 / ^16 |
| Linting | ESLint + Prettier | ^9 / ^3 |
| Git hooks | Husky + lint-staged | ^9 / ^16 |

---

## 3. Project Structure

```
src/
├── __tests__/
│   ├── fixtures/
│   │   ├── auth-fixtures.ts          # Mock auth data factories
│   │   └── employee-fixtures.ts      # Mock employee data factories
│   ├── mocks/
│   │   └── select-mock.tsx           # Shadcn Select mock for tests
│   └── utils/
│       ├── test-utils.tsx            # renderWithProviders(), createQueryWrapper()
│       ├── setupTests.ts             # Jest global setup
│       └── fileMock.ts               # Asset import stub
│
├── components/
│   ├── ui/                           # Shadcn UI primitives (do not modify)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   ├── auth/
│   │   ├── AuthFormCard.tsx          # Shared card wrapper for all auth forms
│   │   ├── AuthFormCard.test.tsx
│   │   ├── LoginForm.tsx             # Email/password login form
│   │   ├── LoginForm.test.tsx
│   │   ├── PasswordResetRequestForm.tsx  # Email input to request reset
│   │   ├── PasswordResetRequestForm.test.tsx
│   │   ├── PasswordResetForm.tsx     # Token + new password form
│   │   ├── PasswordResetForm.test.tsx
│   │   ├── ActivationForm.tsx        # Token + initial password form
│   │   └── ActivationForm.test.tsx
│   ├── employees/
│   │   ├── EmployeeForm.tsx          # Thin wrapper: delegates to Create or Edit form
│   │   ├── EmployeeForm.test.tsx
│   │   ├── EmployeeCreateForm.tsx    # Create employee form (~131 lines)
│   │   ├── EmployeeEditForm.tsx      # Edit/view employee form (~143 lines)
│   │   ├── PhoneInput.tsx            # Country code + phone number input
│   │   ├── PhoneInput.test.tsx
│   │   ├── EmployeeProfileTab.tsx    # "Me" tab: current user's read-only profile
│   │   ├── EmployeeProfileTab.test.tsx
│   │   ├── EmployeeTable.tsx         # Employee list table
│   │   ├── EmployeeTable.test.tsx
│   │   ├── EmployeeFilters.tsx       # Category + text filter bar
│   │   ├── EmployeeFilters.test.tsx
│   │   ├── EmployeeStatusBadge.tsx   # Active/Inactive badge
│   │   ├── EmployeeStatusBadge.test.tsx
│   │   └── employeeConstants.ts     # Re-export shim (imports from lib/utils/constants)
│   ├── layout/
│   │   ├── AppLayout.tsx             # Sidebar + main content wrapper
│   │   ├── AuthLayout.tsx            # Full-screen GIF background + centered Outlet
│   │   └── Sidebar.tsx               # Nav links, user email, logout
│   │   └── Sidebar.test.tsx
│   └── shared/
│       ├── ProtectedRoute.tsx        # Auth + permission guard
│       ├── ProtectedRoute.test.tsx
│       ├── FormField.tsx             # Reusable label + input + error wrapper
│       ├── PaginationControls.tsx    # Previous/Next + "Page X of Y" controls
│       ├── ErrorMessage.tsx          # Styled error paragraph
│       └── LoadingSpinner.tsx        # Animated spinner (data-testid="loading-spinner")
│
├── pages/
│   ├── LoginPage.tsx + .test.tsx
│   ├── PasswordResetRequestPage.tsx + .test.tsx
│   ├── PasswordResetPage.tsx + .test.tsx
│   ├── ActivationPage.tsx + .test.tsx
│   ├── EmployeeListPage.tsx + .test.tsx
│   ├── CreateEmployeePage.tsx + .test.tsx
│   └── EditEmployeePage.tsx + .test.tsx
│
├── store/
│   ├── index.ts                      # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts              # Auth domain: login, logout, token refresh
│   │   └── authSlice.test.ts
│   └── selectors/
│       ├── authSelectors.ts          # Memoized reselect selectors
│       └── authSelectors.test.ts
│
├── hooks/
│   ├── useAppDispatch.ts             # Typed Redux dispatch
│   ├── useAppSelector.ts             # Typed Redux selector
│   ├── useEmployees.ts + .test.ts    # React Query: fetch employees with server-side filters
│   ├── useEmployee.ts + .test.ts     # React Query: fetch single employee
│   ├── useMutationWithRedirect.ts + .test.ts  # Mutation + invalidate + navigate
│   └── usePagination.ts + .test.ts   # Client-side pagination over an array
│
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors (token refresh)
│   │   ├── auth.ts + .test.ts        # Auth API calls
│   │   └── employees.ts + .test.ts   # Employee CRUD API calls
│   └── utils/
│       ├── constants.ts              # EMPLOYEE_ROLES, GENDERS, COUNTRY_CODES, formatRoleLabel
│       ├── dateFormatter.ts + .test.ts  # todayISO, formatDateDisplay, formatDateLocale
│       ├── jwt.ts + .test.ts         # JWT decode utility
│       └── validation.ts + .test.ts  # Zod schemas
│
├── types/
│   ├── auth.ts                       # Auth-related TypeScript interfaces
│   └── employee.ts                   # Employee-related TypeScript interfaces
│
├── contexts/                         # Reserved for theme/locale (currently empty)
├── assets/
│   └── people-walking.gif            # Auth page background
├── assets.d.ts                       # GIF/image type declaration
├── App.tsx                           # Route definitions
└── main.tsx                          # React DOM entry + providers
```

---

## 4. Routes

### Public Routes (AuthLayout)

| Route | Page | Notes |
|---|---|---|
| `/login` | LoginPage | Redirects to `/employees` if already authenticated |
| `/password-reset-request` | PasswordResetRequestPage | Sends reset email |
| `/password-reset?token=...` | PasswordResetPage | Completes reset with URL token |
| `/activate?token=...` | ActivationPage | Sets initial password for new accounts |

### Protected Routes (AppLayout + ProtectedRoute)

| Route | Page | Required Permission |
|---|---|---|
| `/employees` | EmployeeListPage | `employees.read` |
| `/employees/new` | CreateEmployeePage | `employees.create` |
| `/employees/:id` | EditEmployeePage | `employees.update` |

**Catch-all:** `*` redirects to `/login`.

---

## 5. Pages

### LoginPage
- Renders `LoginForm`. Background GIF is provided by `AuthLayout`.
- Redirects to `/employees` if user is already authenticated.

### PasswordResetRequestPage
- Renders `PasswordResetRequestForm`.
- On success, shows a confirmation message.

### PasswordResetPage
- Reads `?token` from URL query params and passes it to `PasswordResetForm`.
- On success, shows a confirmation message.

### ActivationPage
- Reads `?token` from URL query params and passes it to `ActivationForm`.
- On success, shows a confirmation message.

### EmployeeListPage
- Two tabs: **Employees** and **Me**.
- **Employees tab:**
  - Fetches employees via `useEmployees(apiFilters)` with **server-side filtering and pagination**.
  - Filter state (`category` + `value`) and `page` are kept in local React state.
  - `apiFilters` is built from state: `{ page, page_size: 20, [category]: value }`.
  - Changing filter resets page to 1.
  - `totalPages` derived from `data.total_count / PAGE_SIZE`.
  - Renders `EmployeeFilters` + `EmployeeTable` + `PaginationControls`.
- **Me tab:**
  - Rendered by `EmployeeProfileTab` — fetches and displays the current user's read-only profile.

### CreateEmployeePage
- Admin-only (requires `employees.create`).
- Renders `EmployeeForm` in create mode.
- On success, invalidates `['employees']` query and navigates to `/employees`.

### EditEmployeePage
- Fetches employee by `:id` via `useEmployee(id)`.
- Renders `EmployeeForm` in edit mode.
- If the employee is an admin (`EmployeeAdmin` role), form is read-only.
- On success, invalidates `['employees']` query and navigates to `/employees`.

---

## 6. Components

### Auth Components

**AuthFormCard** (`components/auth/AuthFormCard.tsx`)
- Shared card wrapper used by all four auth forms.
- Renders a `Card` with `border-t-4 border-t-primary`.
- Props: `title`, `children`, `error?`, `isSuccess?`, `successContent?`
- When `isSuccess=true`: renders `successContent` instead of the form.

**LoginForm** (`components/auth/LoginForm.tsx`, ~82 lines)
- Fields: email, password
- Validation: `loginSchema` (Zod)
- Dispatches `loginThunk`; shows error message on failure
- Link to `/password-reset-request`

**PasswordResetRequestForm** (~76 lines)
- Field: email
- On submit: calls `requestPasswordReset(email)` API
- On success: replaces form with confirmation message + back-to-login link

**PasswordResetForm** (~87 lines)
- Fields: new_password, confirm_password
- Validation: `passwordResetSchema` (8+ chars, 2+ digits, 1+ uppercase, 1+ lowercase, must match)
- On submit: calls `resetPassword({token, new_password, confirm_password})`
- On success: confirmation message

**ActivationForm** (~82 lines)
- Fields: password, confirm_password
- Validation: `activationSchema`
- On submit: calls `activateAccount({token, password, confirm_password})`
- On success: confirmation message

---

### Employee Components

**EmployeeForm** (~24 lines) — thin wrapper
- Delegates to `EmployeeCreateForm` (when no `employee` prop) or `EmployeeEditForm` (when `employee` prop present).

**EmployeeCreateForm** (~131 lines)
- All fields, date of birth required, converts DOB string to Unix timestamp on submit.
- Imports constants from `lib/utils/constants`, date helpers from `lib/utils/dateFormatter`.

**EmployeeEditForm** (~143 lines)
- Read-only fields: first_name, email, username, date_of_birth.
- Editable: last_name, gender, phone (via `PhoneInput`), address, position, department, role, active, jmbg.
- Shows admin warning banner when `readOnly=true`.

**PhoneInput** (`components/employees/PhoneInput.tsx`)
- Country code dropdown (30+ countries from `lib/utils/constants`) + phone number text input.

**EmployeeProfileTab** (`components/employees/EmployeeProfileTab.tsx`)
- "Me" tab content: fetches current user's employee record via `useEmployee(currentUser.id)`.
- Displays a read-only `EmployeeForm` with loading/error states.

**EmployeeTable** (~47 lines)
- Renders a Shadcn `Table` with columns: Name, Email, Position, Phone, Status.
- Each row is clickable → calls `onRowClick(id)`.
- Status column uses `EmployeeStatusBadge`.

**EmployeeFilters** (~85 lines)
- Category dropdown: **Name**, Email, Position (aligned with API `EmployeeFilters` fields).
- Text search input with clear (X) button.
- Calls `onFilterChange({category, value})` or `onFilterChange(null)` to clear.

**EmployeeStatusBadge** (~13 lines)
- `active: true` → green "Active" badge
- `active: false` → gray "Inactive" badge

---

### Layout Components

**AppLayout** (~14 lines) — `Sidebar` on the left, `<Outlet />` on the right

**AuthLayout** (~14 lines) — full-screen background GIF wrapper with centered `<Outlet />`; all auth pages render inside this layout without duplicating the background.

**Sidebar** (~41 lines)
- Logo: "EXBanka"
- Nav link: Employees → `/employees`
- Displays current user's email
- Logout button → dispatches `logoutThunk` → redirects to `/login`

---

### Shared Components

**ProtectedRoute** (~28 lines)
- Reads `isAuthenticated` from Redux
- Optionally checks a `permission` prop via `selectHasPermission`
- Unauthenticated → redirect to `/login`
- Missing permission → redirect to `/`

**FormField** (`components/shared/FormField.tsx`)
- Reusable wrapper: `Label` + children + optional error message (`text-destructive`).
- Props: `label`, `id`, `error?`, `children`.

**PaginationControls** (`components/shared/PaginationControls.tsx`)
- Renders Previous / Next buttons and "Page X of Y" text.
- Renders nothing when `totalPages <= 1`.

**ErrorMessage** (~7 lines) — styled `<p>` with destructive text color

**LoadingSpinner** (~8 lines) — animated border-spinning div; has `data-testid="loading-spinner"`

---

## 7. State Management

### Redux Store (`store/index.ts`)

Single reducer: `auth` from `authSlice`.

### authSlice (`store/slices/authSlice.ts`)

**State shape:**
```typescript
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}
```

**Async thunks:**

| Thunk | Action | Side Effects |
|---|---|---|
| `loginThunk(LoginRequest)` | Calls `authApi.login()`, decodes JWT, sets user + tokens | Saves tokens to `sessionStorage` |
| `logoutThunk()` | Calls `authApi.logout(refreshToken)` | Clears `sessionStorage`, resets state |

**Sync reducers:**

| Reducer | Purpose |
|---|---|
| `setTokens(AuthTokens)` | Hydrates state from stored tokens (used on app init) |
| `clearAuth()` | Resets state to initial |

**Auth Selectors (`store/selectors/authSelectors.ts`) — memoized with reselect:**

| Selector | Returns |
|---|---|
| `selectIsAuthenticated` | `status === 'authenticated'` |
| `selectIsAdmin` | `user.role === 'EmployeeAdmin'` |
| `selectCurrentUser` | `AuthUser \| null` |
| `selectHasPermission(state, perm)` | `boolean` — checks `user.permissions[]` |

---

## 8. API Layer

### Axios Client (`lib/api/axios.ts`)

- Base URL: `http://localhost:8080`
- **Request interceptor:** attaches `Authorization: Bearer <access_token>` from `sessionStorage`
- **Response interceptor:** on 401, attempts token refresh via `/api/auth/refresh`, retries original request. If refresh fails, clears session and redirects to `/login`.

### Auth API (`lib/api/auth.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `login(credentials)` | POST | `/api/auth/login` |
| `logout(refreshToken)` | POST | `/api/auth/logout` |
| `requestPasswordReset(email)` | POST | `/api/auth/password/reset-request` |
| `resetPassword(payload)` | POST | `/api/auth/password/reset` |
| `activateAccount(payload)` | POST | `/api/auth/activate` |

### Employee API (`lib/api/employees.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getEmployees(filters?)` | GET | `/api/employees` — supports `name`, `email`, `position`, `page`, `page_size` query params |
| `getEmployee(id)` | GET | `/api/employees/{id}` |
| `createEmployee(payload)` | POST | `/api/employees` |
| `updateEmployee(id, payload)` | PUT | `/api/employees/{id}` |

---

## 9. Custom Hooks

| Hook | Type | Purpose |
|---|---|---|
| `useAppDispatch` | Redux | Typed `AppDispatch` hook |
| `useAppSelector` | Redux | Typed `RootState` selector hook |
| `useEmployees(filters?)` | React Query | Fetch employees with server-side filters; query key: `['employees', filters]` |
| `useEmployee(id)` | React Query | Fetch single employee; query key: `['employee', id]`; disabled when `id <= 0` |
| `useMutationWithRedirect(options)` | React Query | `useMutation` + query invalidation + `navigate` on success |
| `usePagination(items, pageSize)` | Local state | Slice an array into pages; returns `{ page, setPage, totalPages, paginatedItems }` |

---

## 10. Types & Interfaces

### Auth Types (`types/auth.ts`)

```typescript
LoginRequest         { email: string; password: string }
AuthTokens           { access_token: string; refresh_token: string }
PasswordResetPayload { token: string; new_password: string; confirm_password: string }
AccountActivationPayload { token: string; password: string; confirm_password: string }
AuthUser             { id: number; email: string; role: string; permissions: string[] }
```

### Employee Types (`types/employee.ts`)

```typescript
Employee {
  id: number; first_name: string; last_name: string
  date_of_birth: number          // Unix timestamp
  gender: string; email: string; phone: string; address: string
  username: string; position: string; department: string
  active: boolean; role: string; permissions: string[]; jmbg?: string
}

CreateEmployeeRequest { first_name, last_name, date_of_birth (required), gender?, email,
                        phone?, address?, username, position?, department?, role, active?, jmbg? }

UpdateEmployeeRequest { last_name?, gender?, phone?, address?, position?,
                        department?, role?, active?, jmbg? }

EmployeeListResponse  { employees: Employee[]; total_count: number }
EmployeeFilters       { email?, name?, position?, page?, page_size? }
FilterCategory        = 'name' | 'email' | 'position'
```

### Shared Constants (`lib/utils/constants.ts`)

```typescript
EMPLOYEE_ROLES   // array of { value, label } — roles selectable in forms
GENDERS          // array of { value, label }
COUNTRY_CODES    // array of { code, label } — 30+ countries for PhoneInput
formatRoleLabel(role: string): string
```

### Date Utilities (`lib/utils/dateFormatter.ts`)

```typescript
todayISO(): string                     // "YYYY-MM-DD" of today
formatDateDisplay(ts: number): string  // Unix timestamp → "dd/mm/yyyy"
formatDateLocale(ts: number): string   // Unix timestamp → locale string, "—" if falsy
```

---

## 11. Validation Schemas

All defined in `lib/utils/validation.ts` using Zod.

| Schema | Used In | Key Rules |
|---|---|---|
| `passwordSchema` | Shared | 8–32 chars, 2+ digits, 1+ uppercase, 1+ lowercase |
| `emailSchema` | Shared | Valid email format |
| `loginSchema` | LoginForm | `{email, password}` |
| `passwordResetSchema` | PasswordResetForm | `{token, new_password, confirm_password}` — passwords must match |
| `activationSchema` | ActivationForm | `{token, password, confirm_password}` — passwords must match |
| `createEmployeeSchema` | EmployeeCreateForm | All required fields + JMBG 13-digit regex |
| `updateEmployeeSchema` | EmployeeEditForm | All optional; JMBG `/^\d{13}$/` if provided |

---

## 12. Test Coverage

_Measured: 2026-03-17 — 36 test suites, 173 tests, all passing._

### Overall Coverage

| Metric | Coverage |
|---|---|
| **Statements** | **93.28%** |
| **Branches** | **75.74%** |
| **Functions** | **85.56%** |
| **Lines** | **93.52%** |

> Testing covers approximately **~87% of the project** (average across all four metrics).

### Coverage by Module

| Module | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `components/auth` | 100% | 75% | 100% | 100% |
| `components/employees` | 93% | 76.82% | 78.94% | 94.07% |
| `components/layout` | 94.73% | 100% | 66.66% | 94.73% |
| `components/shared` | 100% | 100% | 100% | 100% |
| `components/ui` | 88.78% | 63.15% | 69.23% | 88.11% |
| `hooks` | 100% | 100% | 100% | 100% |
| `lib/api` | 60% | 0% | 75% | 60% |
| `lib/utils` | 95.34% | 100% | 80% | 94.28% |
| `pages` | 99.04% | 82.35% | 95.23% | 100% |
| `store` | 100% | 100% | 100% | 100% |
| `store/selectors` | 100% | 50% | 100% | 100% |
| `store/slices` | 97.67% | 50% | 100% | 97.67% |

### Notable Coverage Gaps

| File | Gap |
|---|---|
| `lib/api/axios.ts` | 20% statements — axios interceptors (token refresh flow) untested |
| `components/employees/EmployeeEditForm.tsx` | Admin read-only branches, some field paths |
| `store/slices/authSlice.ts` | Branch 50% — error path in `logoutThunk` uncovered |
| `store/selectors/authSelectors.ts` | Branch 50% — null-user path in one selector |

### Test Infrastructure

- **`renderWithProviders(ui, options?)`** — wraps component with Redux store, QueryClient, MemoryRouter
- **`createQueryWrapper()`** — QueryClient provider factory for hook tests
- **`createMockAuthUser(overrides?)`** — generates mock `AuthUser` objects
- **`createMockAuthState(overrides?)`** — generates mock `AuthState` objects
- **`createMockEmployee(overrides?)`** — generates mock `Employee` objects
