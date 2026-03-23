# Unified Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dual-login system (separate `/api/auth/login` + `/api/auth/client-login`) with a single unified `/api/auth/login` endpoint that auto-detects principal type via `system_type` in the JWT payload.

**Architecture:** The backend now issues a single JWT with `system_type: "employee"` or `system_type: "client"`. The frontend reads this field from the decoded token to determine `userType` and redirect accordingly. The `ClientLoginPage` and its route are removed; `LoginPage` becomes the single entry point for all users.

**Tech Stack:** React 19 + TypeScript, Redux Toolkit (`createAsyncThunk`), React Router v6, `jwt-decode`, Jest + RTL

---

## Summary of Changes vs Old API

| Area | Old | New |
|---|---|---|
| Login endpoints | `POST /api/auth/login` (employees) + `POST /api/auth/client-login` (clients) | `POST /api/auth/login` (unified) |
| JWT field for type | determined by which endpoint was called | `system_type: "employee"` \| `"client"` |
| Routes | `/login` + `/client-login` | `/login` only |
| Thunks | `loginThunk` + `clientLoginThunk` | `loginThunk` only |
| New API sections | — | Roles & Permissions, Interest Rate Tiers, Bank Margins |

---

## Files Changed / Created

| File | Action | Responsibility |
|---|---|---|
| `docs/REST_API.md` | ✅ Already updated | Source of truth for API |
| `src/lib/utils/jwt.ts` | Modify | Add `system_type` to `JwtPayload`, expose it from `decodeAuthToken` |
| `src/types/auth.ts` | Modify | Add `system_type` to `AuthUser` |
| `src/lib/api/auth.ts` | Modify | Remove `clientLogin()` |
| `src/store/slices/authSlice.ts` | Modify | Remove `clientLoginThunk`, update `loginThunk` to read `system_type` |
| `src/pages/LoginPage.tsx` | Modify | Handle both roles, redirect based on `userType` |
| `src/pages/ClientLoginPage.tsx` | Delete | No longer needed |
| `src/App.tsx` | Modify | Remove `/client-login` route |
| `src/lib/api/auth.test.ts` | Modify | Remove `clientLogin` tests |
| `src/store/slices/authSlice.test.ts` | Modify | Remove `clientLoginThunk` tests, update `loginThunk` tests |
| `src/pages/LoginPage.test.tsx` | Modify | Test redirect for both roles |
| `src/pages/ClientLoginPage.test.tsx` | Delete | No longer needed |
| `src/__tests__/fixtures/auth-fixtures.ts` | Modify | Add `system_type` to mock data |

**New files (new API sections — types + API functions only, no UI):**

| File | Action | Responsibility |
|---|---|---|
| `src/types/roles.ts` | Create | `Role`, `Permission` interfaces |
| `src/lib/api/roles.ts` | Create | `getRoles`, `getRole`, `createRole`, `updateRolePermissions`, `getPermissions`, `setEmployeeRoles`, `setEmployeePermissions` |
| `src/types/interestRateTiers.ts` | Create | `InterestRateTier` interface |
| `src/lib/api/interestRateTiers.ts` | Create | `getInterestRateTiers`, `createTier`, `updateTier`, `deleteTier`, `applyTier` |
| `src/types/bankMargins.ts` | Create | `BankMargin` interface |
| `src/lib/api/bankMargins.ts` | Create | `getBankMargins`, `updateBankMargin` |

---

## Task 1: Update JWT Utility to Expose `system_type`

**Files:**
- Modify: `src/lib/utils/jwt.ts`
- Modify: `src/types/auth.ts`

The new JWT payload from `/api/auth/login` includes `system_type: "employee" | "client"`. The frontend must read this to set `userType` in Redux instead of relying on which thunk was dispatched.

- [ ] **Step 1: Write the failing tests**

In `src/lib/utils/jwt.test.ts` (create if needed), add:

```typescript
import { decodeAuthToken } from '@/lib/utils/jwt'

// Helper: create a mock JWT with a given payload
function makeMockJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mock-sig`
}

it('decodes system_type "employee" from JWT payload', () => {
  const token = makeMockJwt({
    user_id: 1,
    email: 'admin@test.com',
    role: 'EmployeeAdmin',
    system_type: 'employee',
    permissions: ['employees.read'],
  })
  const result = decodeAuthToken(token)
  expect(result?.system_type).toBe('employee')
})

it('decodes system_type "client" from JWT payload', () => {
  const token = makeMockJwt({
    user_id: 2,
    email: 'client@test.com',
    role: 'client',
    system_type: 'client',
    permissions: [],
  })
  const result = decodeAuthToken(token)
  expect(result?.system_type).toBe('client')
})

it('defaults system_type to null when missing from JWT', () => {
  const token = makeMockJwt({
    user_id: 1,
    email: 'admin@test.com',
    role: 'EmployeeAdmin',
    permissions: [],
  })
  const result = decodeAuthToken(token)
  expect(result?.system_type).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="jwt" --no-coverage
```
Expected: FAIL — `system_type` does not exist on `AuthUser`

- [ ] **Step 3: Update `src/types/auth.ts` — add `system_type`**

```typescript
export interface AuthUser {
  id: number
  email: string
  role: string
  permissions: string[]
  system_type: 'employee' | 'client' | null
}
```

- [ ] **Step 4: Update `src/lib/utils/jwt.ts` — parse `system_type`**

```typescript
import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types/auth'

interface JwtPayload {
  user_id: number
  email: string
  role: string
  permissions: string[]
  system_type?: 'employee' | 'client'
}

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const rawRole = typeof decoded.role === 'string' ? decoded.role : ''
    return {
      id: decoded.user_id,
      email: decoded.email,
      role: rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1) : rawRole,
      permissions: decoded.permissions ?? [],
      system_type: decoded.system_type ?? null,
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Update auth fixture to include `system_type`**

In `src/__tests__/fixtures/auth-fixtures.ts`:
```typescript
export function createMockAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: 'admin@test.com',
    role: 'EmployeeAdmin',
    permissions: ['employees.read', 'employees.create', 'employees.update'],
    system_type: 'employee',
    ...overrides,
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="jwt" --no-coverage
```
Expected: PASS

- [ ] **Step 7: Run all existing tests to confirm no regressions**

```bash
npm test -- --no-coverage
```
Expected: all tests that used `AuthUser` may fail until slice/selectors are updated — that is expected, continue to next task.

- [ ] **Step 8: Commit**

```bash
git add src/types/auth.ts src/lib/utils/jwt.ts src/__tests__/fixtures/auth-fixtures.ts
git commit -m "feat: add system_type to AuthUser and JWT decode utility"
```

---

## Task 2: Update Auth API Layer — Remove `clientLogin`

**Files:**
- Modify: `src/lib/api/auth.ts`
- Modify: `src/lib/api/auth.test.ts`

- [ ] **Step 1: Remove the failing `clientLogin` test**

In `src/lib/api/auth.test.ts`, delete the test block for `clientLogin()`. It calls `/api/auth/client-login` which no longer exists.

- [ ] **Step 2: Run tests to verify the test file is clean**

```bash
npm test -- --testPathPattern="lib/api/auth" --no-coverage
```
Expected: PASS (remaining tests for `login`, `logout`, `requestPasswordReset`, etc. all pass)

- [ ] **Step 3: Remove `clientLogin` from `src/lib/api/auth.ts`**

Delete the `clientLogin` function entirely. The file should only export: `login`, `logout`, `requestPasswordReset`, `resetPassword`, `activateAccount`.

- [ ] **Step 4: Run tests again**

```bash
npm test -- --testPathPattern="lib/api/auth" --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/auth.ts src/lib/api/auth.test.ts
git commit -m "feat: remove clientLogin API function — unified /api/auth/login endpoint"
```

---

## Task 3: Update Auth Slice — Unified `loginThunk`

**Files:**
- Modify: `src/store/slices/authSlice.ts`
- Modify: `src/store/slices/authSlice.test.ts`

The `clientLoginThunk` is removed. The single `loginThunk` now derives `userType` from `user.system_type` instead of hardcoding `'employee'`.

- [ ] **Step 1: Update failing tests first**

In `src/store/slices/authSlice.test.ts`:

a) Delete all test blocks for `clientLoginThunk`.

b) Update the `loginThunk` success test to assert that `userType` is set from `system_type`:

```typescript
it('sets userType to "employee" when JWT has system_type employee', async () => {
  // Mock decodeAuthToken to return system_type: 'employee'
  const mockUser: AuthUser = createMockAuthUser({ system_type: 'employee' })
  vi.mocked(decodeAuthToken).mockReturnValue(mockUser)
  vi.mocked(authApi.login).mockResolvedValue({ access_token: 'tok', refresh_token: 'ref' })

  await store.dispatch(loginThunk({ email: 'a@b.com', password: 'pass' }))

  const state = store.getState().auth
  expect(state.userType).toBe('employee')
  expect(state.status).toBe('authenticated')
})

it('sets userType to "client" when JWT has system_type client', async () => {
  const mockUser: AuthUser = createMockAuthUser({ system_type: 'client', role: 'client' })
  vi.mocked(decodeAuthToken).mockReturnValue(mockUser)
  vi.mocked(authApi.login).mockResolvedValue({ access_token: 'tok', refresh_token: 'ref' })

  await store.dispatch(loginThunk({ email: 'client@b.com', password: 'pass' }))

  const state = store.getState().auth
  expect(state.userType).toBe('client')
  expect(state.status).toBe('authenticated')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="authSlice" --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Update `src/store/slices/authSlice.ts`**

a) Remove the `clientLoginThunk` entirely.

b) Update `loginThunk` — derive `userType` from `user.system_type`:

```typescript
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.login(credentials)
      const user = decodeAuthToken(tokens.access_token)
      if (!user) return rejectWithValue('Failed to decode token')
      return { tokens, user }
    } catch (err) {
      return rejectWithValue('Invalid credentials')
    }
  }
)
```

c) In the `extraReducers` fulfilled handler for `loginThunk`, set `userType` from the decoded user:

```typescript
.addCase(loginThunk.fulfilled, (state, action) => {
  const { tokens, user } = action.payload
  state.user = user
  state.userType = user.system_type  // 'employee' | 'client' | null
  state.accessToken = tokens.access_token
  state.refreshToken = tokens.refresh_token
  state.status = 'authenticated'
  state.error = null
  sessionStorage.setItem('access_token', tokens.access_token)
  sessionStorage.setItem('refresh_token', tokens.refresh_token)
})
```

d) Remove all references to `clientLoginThunk` from exports and reducers.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="authSlice" --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/store/slices/authSlice.ts src/store/slices/authSlice.test.ts
git commit -m "feat: unify loginThunk — derive userType from JWT system_type field"
```

---

## Task 4: Update LoginPage — Handle Both Roles

**Files:**
- Modify: `src/pages/LoginPage.tsx`
- Modify: `src/pages/LoginPage.test.tsx`
- Delete: `src/pages/ClientLoginPage.tsx`
- Delete: `src/pages/ClientLoginPage.test.tsx`

`LoginPage` already dispatches `loginThunk` and redirects based on `userType`. The only change needed is removing the hard-coded "employee only" assumption and ensuring it handles `userType === 'client'` → `/home` and `userType === 'employee'` → `/admin/accounts`.

- [ ] **Step 1: Read `src/pages/LoginPage.tsx` and `src/pages/LoginPage.test.tsx`**

Read both files first. Note:
- Does the redirect logic currently handle `userType === 'client'`? (If it only redirects employees, it needs updating.)
- Do redirect tests for `client` already exist? If so, update them; if not, add them.

- [ ] **Step 2: Add/update redirect tests in `src/pages/LoginPage.test.tsx` (RED)**

First run existing tests to confirm current baseline:
```bash
npm test -- --testPathPattern="LoginPage" --no-coverage
```

Then add or update tests for both redirect paths. Check `src/__tests__/utils/` for the correct `renderWithProviders` signature. If tests for client redirect don't exist, add:

```typescript
it('redirects to /home when userType is client', async () => {
  renderWithProviders(<LoginPage />, {
    preloadedState: {
      auth: createMockAuthState({
        userType: 'client',
        status: 'authenticated',
        user: createMockAuthUser({ role: 'client', system_type: 'client' }),
      }),
    },
  })
  expect(screen.queryByRole('form')).not.toBeInTheDocument()
})

it('redirects to /admin/accounts when userType is employee', async () => {
  renderWithProviders(<LoginPage />, {
    preloadedState: {
      auth: createMockAuthState({ userType: 'employee', status: 'authenticated' }),
    },
  })
  expect(screen.queryByRole('form')).not.toBeInTheDocument()
})
```

Run the new tests to confirm they fail first:
```bash
npm test -- --testPathPattern="LoginPage" --no-coverage
```
Expected: client redirect test FAILS if `LoginPage` currently only redirects employees.

- [ ] **Step 3: Update `src/pages/LoginPage.tsx` redirect logic (GREEN)**

Ensure the redirect after login handles both cases:
```typescript
// In the useEffect or wherever authentication state is observed:
if (status === 'authenticated') {
  if (userType === 'client') {
    navigate('/home')
  } else if (userType === 'employee') {
    navigate('/admin/accounts')
  }
}
```

Also remove any import of `clientLoginThunk` if present.

- [ ] **Step 4: Run LoginPage tests to confirm they pass**

```bash
npm test -- --testPathPattern="LoginPage" --no-coverage
```
Expected: PASS

- [ ] **Step 5: Delete `ClientLoginPage.tsx` and its test**

```bash
git rm src/pages/ClientLoginPage.tsx src/pages/ClientLoginPage.test.tsx
```

- [ ] **Step 6: Remove `/client-login` route from `src/App.tsx`**

Delete the line:
```tsx
<Route path="/client-login" element={<ClientLoginPage />} />
```
And remove the `ClientLoginPage` import at the top of the file.

- [ ] **Step 7: Run full test suite to confirm nothing is broken**

```bash
npm test -- --no-coverage
```
Expected: All tests PASS (no references to `ClientLoginPage` or `clientLoginThunk` remain)

- [ ] **Step 8: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/LoginPage.test.tsx src/App.tsx
git commit -m "feat: remove ClientLoginPage — unified login route handles all user types"
```

---

## Task 5: Add Roles & Permissions API Layer

**Files:**
- Create: `src/types/roles.ts`
- Create: `src/lib/api/roles.ts`
- Create: `src/lib/api/roles.test.ts`

New section 3 in the API. No UI yet — just types and API functions for future use.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/api/roles.test.ts`:

```typescript
import {
  getRoles,
  getRole,
  getPermissions,
  createRole,
  updateRolePermissions,
  setEmployeeRoles,
  setEmployeePermissions,
} from '@/lib/api/roles'
import apiClient from '@/lib/api/axios'
import { vi } from 'vitest'

vi.mock('@/lib/api/axios')

describe('roles API', () => {
  it('GET /api/roles returns roles list', async () => {
    const mockData = { roles: [{ id: 1, name: 'EmployeeBasic', description: '', permissions: [] }] }
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })
    const result = await getRoles()
    expect(apiClient.get).toHaveBeenCalledWith('/api/roles')
    expect(result).toEqual(mockData)
  })

  it('GET /api/roles/:id returns single role', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', description: '', permissions: [] }
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockRole })
    const result = await getRole(1)
    expect(apiClient.get).toHaveBeenCalledWith('/api/roles/1')
    expect(result).toEqual(mockRole)
  })

  it('GET /api/permissions returns permissions list', async () => {
    const mockData = { permissions: [{ id: 1, code: 'clients.read', description: 'View clients', category: 'clients' }] }
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })
    const result = await getPermissions()
    expect(apiClient.get).toHaveBeenCalledWith('/api/permissions')
    expect(result).toEqual(mockData)
  })

  it('POST /api/roles creates a role', async () => {
    const payload = { name: 'TestRole', permission_codes: ['clients.read'] }
    const mockRole = { id: 5, name: 'TestRole', description: '', permissions: ['clients.read'] }
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockRole })
    const result = await createRole(payload)
    expect(apiClient.post).toHaveBeenCalledWith('/api/roles', payload)
    expect(result).toEqual(mockRole)
  })

  it('PUT /api/roles/:id/permissions updates role permissions', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', permissions: ['clients.read'] }
    vi.mocked(apiClient.put).mockResolvedValue({ data: mockRole })
    const result = await updateRolePermissions(1, ['clients.read'])
    expect(apiClient.put).toHaveBeenCalledWith('/api/roles/1/permissions', { permission_codes: ['clients.read'] })
    expect(result).toEqual(mockRole)
  })

  it('PUT /api/employees/:id/roles sets employee roles', async () => {
    const mockEmployee = { id: 3, role: 'EmployeeBasic' }
    vi.mocked(apiClient.put).mockResolvedValue({ data: mockEmployee })
    const result = await setEmployeeRoles(3, ['EmployeeBasic'])
    expect(apiClient.put).toHaveBeenCalledWith('/api/employees/3/roles', { role_names: ['EmployeeBasic'] })
    expect(result).toEqual(mockEmployee)
  })

  it('PUT /api/employees/:id/permissions sets employee permissions', async () => {
    const mockEmployee = { id: 3, permissions: ['clients.read'] }
    vi.mocked(apiClient.put).mockResolvedValue({ data: mockEmployee })
    const result = await setEmployeePermissions(3, ['clients.read'])
    expect(apiClient.put).toHaveBeenCalledWith('/api/employees/3/permissions', { permission_codes: ['clients.read'] })
    expect(result).toEqual(mockEmployee)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="lib/api/roles" --no-coverage
```
Expected: FAIL — module not found

- [ ] **Step 3: Create `src/types/roles.ts`**

```typescript
export interface Permission {
  id: number
  code: string
  description: string
  category: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
}

export interface CreateRolePayload {
  name: string
  description?: string
  permission_codes?: string[]
}
```

- [ ] **Step 4: Create `src/lib/api/roles.ts`**

```typescript
import apiClient from '@/lib/api/axios'
import type { Role, Permission, CreateRolePayload } from '@/types/roles'

export async function getRoles(): Promise<{ roles: Role[] }> {
  const { data } = await apiClient.get<{ roles: Role[] }>('/api/roles')
  return data
}

export async function getRole(id: number): Promise<Role> {
  const { data } = await apiClient.get<Role>(`/api/roles/${id}`)
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/api/roles', payload)
  return data
}

export async function updateRolePermissions(id: number, permissionCodes: string[]): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/api/roles/${id}/permissions`, { permission_codes: permissionCodes })
  return data
}

export async function getPermissions(): Promise<{ permissions: Permission[] }> {
  const { data } = await apiClient.get<{ permissions: Permission[] }>('/api/permissions')
  return data
}

export async function setEmployeeRoles(employeeId: number, roleNames: string[]): Promise<unknown> {
  const { data } = await apiClient.put(`/api/employees/${employeeId}/roles`, { role_names: roleNames })
  return data
}

export async function setEmployeePermissions(employeeId: number, permissionCodes: string[]): Promise<unknown> {
  const { data } = await apiClient.put(`/api/employees/${employeeId}/permissions`, { permission_codes: permissionCodes })
  return data
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="lib/api/roles" --no-coverage
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/roles.ts src/lib/api/roles.ts src/lib/api/roles.test.ts
git commit -m "feat: add Roles & Permissions API layer (new section 3 in REST API)"
```

---

## Task 6: Add Interest Rate Tiers & Bank Margins API Layer

**Files:**
- Create: `src/types/interestRateTiers.ts`
- Create: `src/lib/api/interestRateTiers.ts`
- Create: `src/lib/api/interestRateTiers.test.ts`
- Create: `src/types/bankMargins.ts`
- Create: `src/lib/api/bankMargins.ts`
- Create: `src/lib/api/bankMargins.test.ts`

- [ ] **Step 1: Write failing tests for interest rate tiers**

Create `src/lib/api/interestRateTiers.test.ts`:

```typescript
import { getInterestRateTiers, createTier, updateTier, deleteTier } from '@/lib/api/interestRateTiers'
import apiClient from '@/lib/api/axios'
import { vi } from 'vitest'

vi.mock('@/lib/api/axios')

it('GET /api/interest-rate-tiers returns tiers', async () => {
  const mockData = { tiers: [{ id: 1, amount_from: 0, amount_to: 50000, fixed_rate: 5.5, variable_base: 3.0 }] }
  vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })
  const result = await getInterestRateTiers()
  expect(apiClient.get).toHaveBeenCalledWith('/api/interest-rate-tiers')
  expect(result).toEqual(mockData)
})

it('POST /api/interest-rate-tiers creates a tier', async () => {
  const payload = { amount_from: 0, amount_to: 50000, fixed_rate: 5.5, variable_base: 3.0 }
  vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1, ...payload } })
  await createTier(payload)
  expect(apiClient.post).toHaveBeenCalledWith('/api/interest-rate-tiers', payload)
})

it('PUT /api/interest-rate-tiers/:id updates a tier', async () => {
  const updated = { id: 1, amount_from: 0, amount_to: 50000, fixed_rate: 6.0, variable_base: 3.0 }
  vi.mocked(apiClient.put).mockResolvedValue({ data: updated })
  const result = await updateTier(1, { fixed_rate: 6.0 })
  expect(apiClient.put).toHaveBeenCalledWith('/api/interest-rate-tiers/1', { fixed_rate: 6.0 })
  expect(result).toEqual(updated)
})

it('DELETE /api/interest-rate-tiers/:id deletes a tier', async () => {
  vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined })
  await deleteTier(1)
  expect(apiClient.delete).toHaveBeenCalledWith('/api/interest-rate-tiers/1')
})

it('POST /api/interest-rate-tiers/:id/apply applies variable rate update', async () => {
  vi.mocked(apiClient.post).mockResolvedValue({ data: { updated: 3 } })
  await applyTier(1)
  expect(apiClient.post).toHaveBeenCalledWith('/api/interest-rate-tiers/1/apply')
})
```

Write failing tests for bank margins in `src/lib/api/bankMargins.test.ts`:

```typescript
import { getBankMargins, updateBankMargin } from '@/lib/api/bankMargins'
import apiClient from '@/lib/api/axios'
import { vi } from 'vitest'

vi.mock('@/lib/api/axios')

it('GET /api/bank-margins returns margins', async () => {
  const mockData = { margins: [{ id: 1, loan_type: 'PERSONAL', margin: 2.5, active: true }] }
  vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })
  const result = await getBankMargins()
  expect(apiClient.get).toHaveBeenCalledWith('/api/bank-margins')
  expect(result).toEqual(mockData)
})

it('PUT /api/bank-margins/:id updates margin', async () => {
  vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 1, margin: 3.0 } })
  await updateBankMargin(1, 3.0)
  expect(apiClient.put).toHaveBeenCalledWith('/api/bank-margins/1', { margin: 3.0 })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="interestRateTiers|bankMargins" --no-coverage
```
Expected: FAIL — modules not found

> Also update the import line in `interestRateTiers.test.ts` to include the new functions once you know they exist:
> `import { getInterestRateTiers, createTier, updateTier, deleteTier, applyTier } from '@/lib/api/interestRateTiers'`

- [ ] **Step 3: Create `src/types/interestRateTiers.ts`**

```typescript
export interface InterestRateTier {
  id: number
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
}

export interface CreateTierPayload {
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
}
```

- [ ] **Step 4: Create `src/lib/api/interestRateTiers.ts`**

```typescript
import apiClient from '@/lib/api/axios'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'

export async function getInterestRateTiers(): Promise<{ tiers: InterestRateTier[] }> {
  const { data } = await apiClient.get<{ tiers: InterestRateTier[] }>('/api/interest-rate-tiers')
  return data
}

export async function createTier(payload: CreateTierPayload): Promise<InterestRateTier> {
  const { data } = await apiClient.post<InterestRateTier>('/api/interest-rate-tiers', payload)
  return data
}

export async function updateTier(id: number, payload: Partial<CreateTierPayload>): Promise<InterestRateTier> {
  const { data } = await apiClient.put<InterestRateTier>(`/api/interest-rate-tiers/${id}`, payload)
  return data
}

export async function deleteTier(id: number): Promise<void> {
  await apiClient.delete(`/api/interest-rate-tiers/${id}`)
}

export async function applyTier(id: number): Promise<unknown> {
  const { data } = await apiClient.post(`/api/interest-rate-tiers/${id}/apply`)
  return data
}
```

- [ ] **Step 5: Create `src/types/bankMargins.ts`**

```typescript
export interface BankMargin {
  id: number
  loan_type: string
  margin: number
  active: boolean
  created_at: string
  updated_at: string
}
```

- [ ] **Step 6: Create `src/lib/api/bankMargins.ts`**

```typescript
import apiClient from '@/lib/api/axios'
import type { BankMargin } from '@/types/bankMargins'

export async function getBankMargins(): Promise<{ margins: BankMargin[] }> {
  const { data } = await apiClient.get<{ margins: BankMargin[] }>('/api/bank-margins')
  return data
}

export async function updateBankMargin(id: number, margin: number): Promise<BankMargin> {
  const { data } = await apiClient.put<BankMargin>(`/api/bank-margins/${id}`, { margin })
  return data
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="interestRateTiers|bankMargins" --no-coverage
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/types/interestRateTiers.ts src/lib/api/interestRateTiers.ts src/lib/api/interestRateTiers.test.ts
git add src/types/bankMargins.ts src/lib/api/bankMargins.ts src/lib/api/bankMargins.test.ts
git commit -m "feat: add Interest Rate Tiers and Bank Margins API layer (sections 16-17)"
```

---

## Task 7: Run Full Quality Gates

- [ ] **Step 1: Run all tests with coverage**

```bash
npm test -- --coverage
```
Expected: All PASS, new code paths covered

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: 0 errors, 0 warnings

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Format check**

```bash
npx prettier --check "src/**/*.{ts,tsx}"
```
If any issues:
```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

- [ ] **Step 5: Build**

```bash
npm run build
```
Expected: Success

- [ ] **Step 6: Update specification.md**

Update the following sections:
- **_Last updated_ date**: Change to `2026-03-21`
- **Project Overview**: Clarify that all users (employees and clients) authenticate via a single `/login` route; the JWT `system_type` field determines the portal they are redirected to
- **Routes**: Remove `/client-login`
- **Pages**: Remove `ClientLoginPage`, update `LoginPage` description (handles both roles via unified login)
- **State Management**: Remove `clientLoginThunk` from thunks list; update `loginThunk` description to note it now derives `userType` from JWT `system_type`
- **API Layer**: Remove `clientLogin()`, add `roles.ts`, `interestRateTiers.ts`, `bankMargins.ts` API modules
- **Types**: Add `system_type` to `AuthUser`, add `Role`, `Permission`, `InterestRateTier`, `BankMargin` interfaces
- **Test Coverage**: Re-run `npm test -- --coverage --coverageReporters=text` and update the coverage table

- [ ] **Step 7: Final commit**

```bash
git add specification.md
git commit -m "docs: update specification after unified login and new API sections"
```

---

## Notes for Implementer

- **`userType` in auth state**: The `AuthState.userType` field stays as `'client' | 'employee' | null` — only the source of truth changes (JWT `system_type` instead of which thunk was called).
- **`selectUserType` selector**: No changes needed — it still returns `state.auth.userType`.
- **`ProtectedRoute`**: No changes needed — it already checks `userType` and `permissions`.
- **`axios.ts` interceptor**: On token refresh failure it redirects to `/login` — this already points to the right route.
- **Account enum values** (lowercase vs uppercase): The `account_kind`, `account_type`, `account_category`, and `status` values changed format in the new API (`"CHECKING"` → `"current"`, `"ACTIVE"` → `"active"`, etc.). These are display/form concerns — update any TypeScript string literal types in `src/types/accounts.ts` and any hardcoded strings in components when working on those features.
