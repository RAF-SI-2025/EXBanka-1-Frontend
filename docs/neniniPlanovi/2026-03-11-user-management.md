# User Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete User Management frontend — authentication flows (login, logout, password reset, account activation) and the admin Employee Management portal (list, create, edit employees).

**Architecture:** Single-page app with React Router. Public routes for auth flows, protected routes for employee management. Auth state in Redux (JWT tokens, user info). Employee data via TanStack Query. Shadcn UI + Tailwind CSS for all UI. Axios with interceptor for token refresh.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, Shadcn UI, Redux Toolkit, TanStack Query v5, React Router v6, Axios, React Hook Form + Zod, Jest + React Testing Library

---

## Assumptions

1. **Permissions are role-derived.** The API PUT `/api/employees/:id` accepts `role` but not `permissions`. The `permissions` array in GET responses is computed from the role on the backend. The UI manages roles, not individual permissions.
2. **Token storage: sessionStorage.** Spec requires re-login on browser close. `sessionStorage` is cleared when the browser closes, `localStorage` is not.
3. **JWT contains user info.** The API gateway injects `user_id`, `email`, `role`, `permissions` into request context from the JWT. The frontend decodes the JWT to extract this info after login.
4. **Role strings match the spec:** `EmployeeBasic`, `EmployeeAgent`, `EmployeeSupervisor`, `EmployeeAdmin`. The API example showing `"role": "Employee"` is a simplification.
5. **`erasableSyntaxOnly: true`** in tsconfig means no TypeScript `enum` — use `as const` objects instead.
6. **`verbatimModuleSyntax: true`** means all type-only imports must use `import type { X }`.

---

## File Structure

```
src/
  components/
    ui/                          # Shadcn components (auto-generated, do not modify)
    auth/
      LoginForm.tsx              # Email + password form
      LoginForm.test.tsx
      PasswordResetRequestForm.tsx
      PasswordResetRequestForm.test.tsx
      PasswordResetForm.tsx
      PasswordResetForm.test.tsx
      ActivationForm.tsx
      ActivationForm.test.tsx
    employees/
      EmployeeTable.tsx          # Table with employee rows
      EmployeeTable.test.tsx
      EmployeeFilters.tsx        # Search/filter bar
      EmployeeFilters.test.tsx
      EmployeeForm.tsx           # Create/edit form (shared)
      EmployeeForm.test.tsx
      EmployeeStatusBadge.tsx    # Active/inactive badge
      EmployeeStatusBadge.test.tsx
    layout/
      AuthLayout.tsx             # Public pages layout (centered card)
      AppLayout.tsx              # Authenticated pages layout (sidebar + content)
      Sidebar.tsx
      Sidebar.test.tsx
    shared/
      ProtectedRoute.tsx         # Role-based route guard
      ProtectedRoute.test.tsx
      LoadingSpinner.tsx
      ErrorMessage.tsx           # Reusable error display
  pages/
    LoginPage.tsx
    LoginPage.test.tsx
    PasswordResetRequestPage.tsx
    PasswordResetRequestPage.test.tsx
    PasswordResetPage.tsx
    PasswordResetPage.test.tsx
    ActivationPage.tsx
    ActivationPage.test.tsx
    EmployeeListPage.tsx
    EmployeeListPage.test.tsx
    CreateEmployeePage.tsx
    CreateEmployeePage.test.tsx
    EditEmployeePage.tsx
    EditEmployeePage.test.tsx
  store/
    index.ts                     # configureStore + rootReducer + types
    slices/
      authSlice.ts               # Auth state: user, tokens, status
      authSlice.test.ts
    selectors/
      authSelectors.ts           # isAuthenticated, isAdmin, selectPermissions
      authSelectors.test.ts
  hooks/
    useAppDispatch.ts            # Typed dispatch
    useAppSelector.ts            # Typed selector
    useEmployees.ts              # TanStack Query hook for employee list
    useEmployees.test.ts
    useEmployee.ts               # TanStack Query hook for single employee
    useEmployee.test.ts
  lib/
    api/
      axios.ts                   # Axios instance with baseURL + interceptors
      auth.ts                    # Auth API functions
      auth.test.ts
      employees.ts               # Employee API functions
      employees.test.ts
    utils/
      jwt.ts                     # JWT decode helper
      jwt.test.ts
      validation.ts              # Zod schemas for password, email, etc.
      validation.test.ts
  types/
    auth.ts                      # LoginRequest, AuthTokens, etc.
    employee.ts                  # Employee, CreateEmployeeRequest, etc.
  __tests__/
    utils/
      test-utils.tsx             # renderWithProviders, createWrapper
    fixtures/
      employee-fixtures.ts       # createMockEmployee factory
      auth-fixtures.ts           # createMockAuthState factory
  App.tsx                        # Router setup
  main.tsx                       # Providers (Redux, QueryClient, Router)
  index.css                      # Tailwind CSS import
```

---

## Chunk 1: Project Setup & Tooling

This chunk installs all dependencies, configures build tools, testing, linting, and creates the project scaffold. **No TDD here — these are configuration-only tasks (TDD exception per CLAUDE.md).**

### Task 1.1: Install Runtime Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core libraries**

```bash
npm install @reduxjs/toolkit react-redux @tanstack/react-query react-router-dom axios
```

- [ ] **Step 2: Install form + validation libraries**

```bash
npm install react-hook-form @hookform/resolvers zod
```

- [ ] **Step 3: Install JWT decode**

```bash
npm install jwt-decode
```

- [ ] **Step 4: Verify installation**

```bash
npm ls @reduxjs/toolkit react-redux @tanstack/react-query react-router-dom axios react-hook-form zod jwt-decode
```

Expected: all packages listed without errors.

---

### Task 1.2: Install & Configure Tailwind CSS v4

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind CSS + Vite plugin**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add Tailwind plugin to Vite config**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: Replace src/index.css with Tailwind import**

```css
/* src/index.css */
@import "tailwindcss";
```

- [ ] **Step 4: Verify Tailwind works**

```bash
npm run dev
```

Open browser, add a Tailwind class to App.tsx temporarily (e.g., `<div className="text-red-500">Test</div>`), confirm it renders red.

---

### Task 1.3: Configure Path Aliases

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Add path alias to Vite config**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Add path alias to tsconfig.app.json**

Add inside `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 3: Verify alias works**

In `src/App.tsx`, change a relative import to use `@/` prefix (if any exist). Run `npx tsc --noEmit` — should pass.

---

### Task 1.4: Initialize Shadcn UI

**Files:**
- Create: `components.json`
- Modify: `src/index.css` (Shadcn adds CSS variables)
- Create: `src/lib/utils.ts` (Shadcn cn utility)

- [ ] **Step 1: Run Shadcn init**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `components.json`, updates `src/index.css` with CSS variables, and creates `src/lib/utils.ts`.

- [ ] **Step 2: Install required Shadcn components**

```bash
npx shadcn@latest add button input label card table select badge form toast skeleton dialog separator dropdown-menu pagination
```

- [ ] **Step 3: Verify Shadcn works**

In `src/App.tsx`, temporarily import and render a Button:

```typescript
import { Button } from '@/components/ui/button'
// In JSX: <Button>Test</Button>
```

Run `npm run dev` — button should render with Shadcn styling.

- [ ] **Step 4: Commit setup**

```bash
git add -A
git commit -m "chore: install runtime deps, configure Tailwind v4 + Shadcn UI + path aliases"
```

---

### Task 1.5: Configure Jest + React Testing Library

**Files:**
- Create: `jest.config.ts`
- Modify: `package.json` (add test scripts)
- Modify: `tsconfig.json` (add test config reference)
- Create: `tsconfig.test.json`

- [ ] **Step 1: Install testing dependencies**

```bash
npm install -D jest ts-jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event identity-obj-proxy
```

- [ ] **Step 2: Create jest.config.ts**

```typescript
// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg)$': '<rootDir>/src/__tests__/utils/fileMock.ts',
  },
  setupFilesAfterSetup: ['<rootDir>/src/__tests__/utils/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

export default config
```

- [ ] **Step 3: Create tsconfig.test.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["jest", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create setup file and file mock**

```typescript
// src/__tests__/utils/setupTests.ts
import '@testing-library/jest-dom'
```

```typescript
// src/__tests__/utils/fileMock.ts
export default 'test-file-stub'
```

- [ ] **Step 5: Add test scripts to package.json**

Add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"check-types": "tsc --noEmit"
```

- [ ] **Step 6: Verify Jest works**

Create a trivial test:

```typescript
// src/__tests__/utils/sanity.test.ts
describe('sanity', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

```bash
npm test
```

Expected: 1 test passing.

Delete `sanity.test.ts` after verification.

---

### Task 1.6: Configure Prettier + ESLint Integration

**Files:**
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `eslint.config.js`

- [ ] **Step 1: Install Prettier + ESLint config**

```bash
npm install -D prettier eslint-config-prettier
```

- [ ] **Step 2: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 3: Create .prettierignore**

```
dist
node_modules
coverage
src/components/ui
```

- [ ] **Step 4: Add prettier to ESLint config**

In `eslint.config.js`, import and add prettier config to disable conflicting rules:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  prettier,
])
```

- [ ] **Step 5: Add format scripts to package.json**

```json
"format": "prettier --write \"src/**/*.{ts,tsx}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx}\""
```

---

### Task 1.7: Configure Husky + lint-staged

**Files:**
- Create: `.husky/pre-commit`
- Create: `.lintstagedrc.json`

- [ ] **Step 1: Install Husky + lint-staged**

```bash
npm install -D husky lint-staged
```

- [ ] **Step 2: Initialize Husky**

```bash
npx husky init
```

- [ ] **Step 3: Configure pre-commit hook**

Write `.husky/pre-commit`:

```bash
npx lint-staged
npm run check-types
npm test -- --bail
```

- [ ] **Step 4: Create .lintstagedrc.json**

```json
{
  "src/**/*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ]
}
```

- [ ] **Step 5: Commit all tooling**

```bash
git add -A
git commit -m "chore: configure Jest, Prettier, ESLint, Husky + lint-staged"
```

---

### Task 1.8: Create Directory Scaffold

**Files:**
- Create all directories from File Structure above

- [ ] **Step 1: Create all directories**

```bash
mkdir -p src/components/auth src/components/employees src/components/layout src/components/shared
mkdir -p src/pages src/store/slices src/store/selectors
mkdir -p src/hooks src/lib/api src/lib/utils src/types src/contexts
mkdir -p src/__tests__/utils src/__tests__/fixtures
```

- [ ] **Step 2: Create placeholder .gitkeep files** (so empty directories are tracked)

```bash
touch src/components/auth/.gitkeep src/components/employees/.gitkeep
touch src/components/layout/.gitkeep src/components/shared/.gitkeep
touch src/pages/.gitkeep src/store/slices/.gitkeep src/store/selectors/.gitkeep
touch src/hooks/.gitkeep src/lib/api/.gitkeep src/lib/utils/.gitkeep
touch src/types/.gitkeep src/contexts/.gitkeep
touch src/__tests__/utils/.gitkeep src/__tests__/fixtures/.gitkeep
```

- [ ] **Step 3: Commit scaffold**

```bash
git add -A
git commit -m "chore: create project directory scaffold"
```

---

## Chunk 2: Core Infrastructure

Types, API client, Redux store, test utilities, routing shell. This chunk builds everything that other chunks depend on. **TDD applies to all logic files.**

### Task 2.1: Define TypeScript Types

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/types/employee.ts`

Reference: `docs/api-gateway-routes.md` for exact field names and types.

- [ ] **Step 1: Create auth types**

```typescript
// src/types/auth.ts

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface PasswordResetRequestPayload {
  email: string
}

export interface PasswordResetPayload {
  token: string
  new_password: string
  confirm_password: string
}

export interface AccountActivationPayload {
  token: string
  password: string
  confirm_password: string
}

export interface AuthUser {
  id: number
  email: string
  role: string
  permissions: string[]
}
```

- [ ] **Step 2: Create employee types**

```typescript
// src/types/employee.ts

export interface Employee {
  id: number
  first_name: string
  last_name: string
  date_of_birth: number
  gender: string
  email: string
  phone: string
  address: string
  username: string
  position: string
  department: string
  active: boolean
  role: string
  permissions: string[]
}

export interface EmployeeListResponse {
  employees: Employee[]
  total_count: number
}

export interface EmployeeFilters {
  email?: string
  name?: string
  position?: string
  page?: number
  page_size?: number
}

export interface CreateEmployeeRequest {
  first_name: string
  last_name: string
  date_of_birth: number
  gender?: string
  email: string
  phone?: string
  address?: string
  username: string
  position?: string
  department?: string
  role: string
  active?: boolean
}

export interface UpdateEmployeeRequest {
  last_name?: string
  gender?: string
  phone?: string
  address?: string
  position?: string
  department?: string
  role?: string
  active?: boolean
}
```

- [ ] **Step 3: Commit types**

```bash
git add src/types/auth.ts src/types/employee.ts
git commit -m "feat: add TypeScript types for auth and employee domain"
```

---

### Task 2.2: Create Test Utilities & Fixtures

**Files:**
- Create: `src/__tests__/utils/test-utils.tsx`
- Create: `src/__tests__/fixtures/auth-fixtures.ts`
- Create: `src/__tests__/fixtures/employee-fixtures.ts`

Reference: `docs/testing/strategy.md` for renderWithProviders pattern.

- [ ] **Step 1: Create auth fixtures**

```typescript
// src/__tests__/fixtures/auth-fixtures.ts
import type { AuthUser } from '@/types/auth'

export function createMockAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: 'admin@test.com',
    role: 'EmployeeAdmin',
    permissions: ['employees.read', 'employees.create', 'employees.update'],
    ...overrides,
  }
}

export function createMockAuthState(
  overrides: Partial<{
    user: AuthUser | null
    accessToken: string | null
    refreshToken: string | null
    status: 'idle' | 'loading' | 'authenticated' | 'error'
    error: string | null
  }> = {}
) {
  return {
    user: createMockAuthUser(),
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    status: 'authenticated' as const,
    error: null,
    ...overrides,
  }
}
```

- [ ] **Step 2: Create employee fixtures**

```typescript
// src/__tests__/fixtures/employee-fixtures.ts
import type { Employee } from '@/types/employee'

export function createMockEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    date_of_birth: 946684800,
    gender: 'Female',
    email: 'jane.doe@example.com',
    phone: '+38161000000',
    address: '123 Main St',
    username: 'jane.doe',
    position: 'Teller',
    department: 'Retail',
    active: true,
    role: 'EmployeeBasic',
    permissions: ['accounts.read', 'transactions.create'],
    ...overrides,
  }
}
```

- [ ] **Step 3: Create renderWithProviders** (will be completed after Redux store is created in Task 2.4)

```typescript
// src/__tests__/utils/test-utils.tsx
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { rootReducer } from '@/store'
import type { RootState } from '@/store'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  route?: string
  routePath?: string // e.g. '/employees/:id' — enables useParams extraction
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, route = '/', routePath, ...renderOptions }: ExtendedRenderOptions = {}
) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
  })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            {routePath ? (
              <Routes>
                <Route path={routePath} element={children} />
              </Routes>
            ) : (
              children
            )}
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

**Note:** This file depends on the Redux store from Task 2.4. Create the file but it won't compile until the store exists. This is expected — proceed with Task 2.3 and 2.4 first.

---

### Task 2.3: Create JWT Decode Utility (TDD)

**Files:**
- Create: `src/lib/utils/jwt.ts`
- Create: `src/lib/utils/jwt.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/utils/jwt.test.ts
import { decodeAuthToken } from '@/lib/utils/jwt'

// A real JWT has 3 base64 parts. We'll create a minimal one for testing.
function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

describe('decodeAuthToken', () => {
  it('extracts user info from JWT payload', () => {
    const token = createFakeJwt({
      user_id: 42,
      email: 'admin@bank.com',
      role: 'EmployeeAdmin',
      permissions: ['employees.read', 'employees.create'],
    })

    const user = decodeAuthToken(token)

    expect(user).toEqual({
      id: 42,
      email: 'admin@bank.com',
      role: 'EmployeeAdmin',
      permissions: ['employees.read', 'employees.create'],
    })
  })

  it('returns null for invalid token', () => {
    expect(decodeAuthToken('not-a-jwt')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- jwt.test
```

Expected: FAIL — `decodeAuthToken` not found.

- [ ] **Step 3: Implement decodeAuthToken**

```typescript
// src/lib/utils/jwt.ts
import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types/auth'

interface JwtPayload {
  user_id: number
  email: string
  role: string
  permissions: string[]
}

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- jwt.test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/jwt.ts src/lib/utils/jwt.test.ts
git commit -m "feat: add JWT decode utility with tests"
```

---

### Task 2.4: Create Validation Schemas (TDD)

**Files:**
- Create: `src/lib/utils/validation.ts`
- Create: `src/lib/utils/validation.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/utils/validation.test.ts
import { passwordSchema, emailSchema, loginSchema } from '@/lib/utils/validation'

describe('passwordSchema', () => {
  it('rejects password shorter than 8 chars', () => {
    const result = passwordSchema.safeParse('Ab1')
    expect(result.success).toBe(false)
  })

  it('rejects password longer than 32 chars', () => {
    const result = passwordSchema.safeParse('Aa11' + 'x'.repeat(30))
    expect(result.success).toBe(false)
  })

  it('rejects password without 2 numbers', () => {
    const result = passwordSchema.safeParse('Abcdefgh1')
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    const result = passwordSchema.safeParse('abcdefg12')
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase', () => {
    const result = passwordSchema.safeParse('ABCDEFG12')
    expect(result.success).toBe(false)
  })

  it('accepts valid password', () => {
    const result = passwordSchema.safeParse('ValidPass12')
    expect(result.success).toBe(true)
  })
})

describe('emailSchema', () => {
  it('rejects invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })

  it('accepts valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('requires email and password', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Pass1234' })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- validation.test
```

- [ ] **Step 3: Implement schemas**

```typescript
// src/lib/utils/validation.ts
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(32, 'Password must be at most 32 characters')
  .refine((val) => (val.match(/\d/g) || []).length >= 2, {
    message: 'Password must contain at least 2 numbers',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least 1 uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least 1 lowercase letter',
  })

export const emailSchema = z.string().email('Invalid email address')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const passwordResetSchema = z
  .object({
    token: z.string().min(1),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const activationSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

const EMPLOYEE_ROLES = ['EmployeeBasic', 'EmployeeAgent', 'EmployeeSupervisor', 'EmployeeAdmin'] as const

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.number({ required_error: 'Date of birth is required' }),
  gender: z.string().optional(),
  email: emailSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(EMPLOYEE_ROLES, { required_error: 'Role is required' }),
  active: z.boolean().optional().default(true),
})

export const updateEmployeeSchema = z.object({
  last_name: z.string().min(1, 'Last name is required').optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(EMPLOYEE_ROLES).optional(),
  active: z.boolean().optional(),
})
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- validation.test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/validation.ts src/lib/utils/validation.test.ts
git commit -m "feat: add Zod validation schemas for password, email, login"
```

---

### Task 2.5: Create Axios Instance

**Files:**
- Create: `src/lib/api/axios.ts`

No TDD — this is infrastructure config that's tested through integration.

- [ ] **Step 1: Create Axios instance with interceptors**

```typescript
// src/lib/api/axios.ts
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          sessionStorage.setItem('access_token', data.access_token)
          sessionStorage.setItem('refresh_token', data.refresh_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return apiClient(originalRequest)
        } catch {
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/api/axios.ts
git commit -m "feat: create Axios instance with auth interceptors"
```

---

### Task 2.6: Create Auth API Functions (TDD)

**Files:**
- Create: `src/lib/api/auth.ts`
- Create: `src/lib/api/auth.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/api/auth.test.ts
import { apiClient } from '@/lib/api/axios'
import { login, logout, requestPasswordReset, resetPassword, activateAccount } from '@/lib/api/auth'
import type { LoginRequest, PasswordResetPayload, AccountActivationPayload } from '@/types/auth'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { post: jest.fn() },
}))

const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('login', () => {
  it('posts credentials and returns tokens', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    mockPost.mockResolvedValue({ data: tokens })

    const result = await login({ email: 'a@b.com', password: 'pass' })

    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: 'pass' })
    expect(result).toEqual(tokens)
  })
})

describe('logout', () => {
  it('posts refresh token', async () => {
    mockPost.mockResolvedValue({ data: { message: 'logged out successfully' } })

    await logout('rt')

    expect(mockPost).toHaveBeenCalledWith('/api/auth/logout', { refresh_token: 'rt' })
  })
})

describe('requestPasswordReset', () => {
  it('posts email', async () => {
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await requestPasswordReset('a@b.com')

    expect(mockPost).toHaveBeenCalledWith('/api/auth/password/reset-request', { email: 'a@b.com' })
  })
})

describe('resetPassword', () => {
  it('posts reset payload', async () => {
    const payload: PasswordResetPayload = {
      token: 'tok',
      new_password: 'New12345',
      confirm_password: 'New12345',
    }
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await resetPassword(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/auth/password/reset', payload)
  })
})

describe('activateAccount', () => {
  it('posts activation payload', async () => {
    const payload: AccountActivationPayload = {
      token: 'tok',
      password: 'New12345',
      confirm_password: 'New12345',
    }
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await activateAccount(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/auth/activate', payload)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- auth.test
```

- [ ] **Step 3: Implement auth API functions**

```typescript
// src/lib/api/auth.ts
import { apiClient } from '@/lib/api/axios'
import type {
  LoginRequest,
  AuthTokens,
  PasswordResetRequestPayload,
  PasswordResetPayload,
  AccountActivationPayload,
} from '@/types/auth'

export async function login(credentials: LoginRequest): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/api/auth/login', credentials)
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/auth/logout', { refresh_token: refreshToken })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/api/auth/password/reset-request', { email })
}

export async function resetPassword(payload: PasswordResetPayload): Promise<void> {
  await apiClient.post('/api/auth/password/reset', payload)
}

export async function activateAccount(payload: AccountActivationPayload): Promise<void> {
  await apiClient.post('/api/auth/activate', payload)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- auth.test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/auth.ts src/lib/api/auth.test.ts
git commit -m "feat: add auth API functions with tests"
```

---

### Task 2.7: Create Employee API Functions (TDD)

**Files:**
- Create: `src/lib/api/employees.ts`
- Create: `src/lib/api/employees.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/api/employees.test.ts
import { apiClient } from '@/lib/api/axios'
import { getEmployees, getEmployee, createEmployee, updateEmployee } from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('getEmployees', () => {
  it('fetches employees with filters', async () => {
    const response = { employees: [createMockEmployee()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getEmployees({ email: 'jane', page: 1, page_size: 20 })

    expect(mockGet).toHaveBeenCalledWith('/api/employees', {
      params: { email: 'jane', page: 1, page_size: 20 },
    })
    expect(result).toEqual(response)
  })
})

describe('getEmployee', () => {
  it('fetches single employee by ID', async () => {
    const employee = createMockEmployee({ id: 5 })
    mockGet.mockResolvedValue({ data: employee })

    const result = await getEmployee(5)

    expect(mockGet).toHaveBeenCalledWith('/api/employees/5')
    expect(result).toEqual(employee)
  })
})

describe('createEmployee', () => {
  it('posts new employee data', async () => {
    const employee = createMockEmployee()
    const payload: CreateEmployeeRequest = {
      first_name: 'Jane',
      last_name: 'Doe',
      date_of_birth: 946684800,
      email: 'jane@test.com',
      username: 'jane.doe',
      role: 'EmployeeBasic',
    }
    mockPost.mockResolvedValue({ data: employee })

    const result = await createEmployee(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/employees', payload)
    expect(result).toEqual(employee)
  })
})

describe('updateEmployee', () => {
  it('puts updated employee data', async () => {
    const employee = createMockEmployee({ last_name: 'Smith' })
    const payload: UpdateEmployeeRequest = { last_name: 'Smith' }
    mockPut.mockResolvedValue({ data: employee })

    const result = await updateEmployee(1, payload)

    expect(mockPut).toHaveBeenCalledWith('/api/employees/1', payload)
    expect(result).toEqual(employee)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- employees.test
```

- [ ] **Step 3: Implement employee API functions**

```typescript
// src/lib/api/employees.ts
import { apiClient } from '@/lib/api/axios'
import type {
  Employee,
  EmployeeListResponse,
  EmployeeFilters,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@/types/employee'

export async function getEmployees(filters: EmployeeFilters = {}): Promise<EmployeeListResponse> {
  const { data } = await apiClient.get<EmployeeListResponse>('/api/employees', {
    params: filters,
  })
  return data
}

export async function getEmployee(id: number): Promise<Employee> {
  const { data } = await apiClient.get<Employee>(`/api/employees/${id}`)
  return data
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  const { data } = await apiClient.post<Employee>('/api/employees', payload)
  return data
}

export async function updateEmployee(id: number, payload: UpdateEmployeeRequest): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/employees/${id}`, payload)
  return data
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- employees.test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/employees.ts src/lib/api/employees.test.ts
git commit -m "feat: add employee API functions with tests"
```

---

### Task 2.8: Create Auth Redux Slice (TDD)

**Files:**
- Create: `src/store/slices/authSlice.ts`
- Create: `src/store/slices/authSlice.test.ts`

Reference: `docs/state-management/redux-toolkit-patterns.md` for slice pattern.

- [ ] **Step 1: Write failing tests**

```typescript
// src/store/slices/authSlice.test.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { loginThunk, logoutThunk, setTokens, clearAuth } from '@/store/slices/authSlice'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

const createStore = () => configureStore({ reducer: { auth: authReducer } })

beforeEach(() => jest.clearAllMocks())

describe('authSlice', () => {
  describe('clearAuth', () => {
    it('resets state to initial', () => {
      const store = createStore()
      store.dispatch(clearAuth())
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.status).toBe('idle')
    })
  })

  describe('loginThunk', () => {
    it('sets authenticated state on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      const user = { id: 1, email: 'a@b.com', role: 'EmployeeAdmin', permissions: ['employees.read'] }
      jest.mocked(authApi.login).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'pass' }))

      const state = store.getState().auth
      expect(state.status).toBe('authenticated')
      expect(state.user).toEqual(user)
      expect(state.accessToken).toBe('at')
      expect(state.refreshToken).toBe('rt')
    })

    it('sets error state on failure', async () => {
      jest.mocked(authApi.login).mockRejectedValue(new Error('fail'))

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'bad' }))

      const state = store.getState().auth
      expect(state.status).toBe('error')
      expect(state.error).toBe('Invalid credentials')
    })
  })

  describe('logoutThunk', () => {
    it('clears auth state', async () => {
      jest.mocked(authApi.logout).mockResolvedValue(undefined)

      const store = createStore()
      // First set some state
      store.dispatch(setTokens({ access_token: 'at', refresh_token: 'rt' }))
      await store.dispatch(logoutThunk())

      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.status).toBe('idle')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- authSlice.test
```

- [ ] **Step 3: Implement auth slice**

```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as authApi from '@/lib/api/auth'
import { decodeAuthToken } from '@/lib/utils/jwt'
import type { AuthUser, LoginRequest, AuthTokens } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.login(credentials)
      const user = decodeAuthToken(tokens.access_token)
      if (!user) {
        return rejectWithValue('Failed to decode token')
      }
      sessionStorage.setItem('access_token', tokens.access_token)
      sessionStorage.setItem('refresh_token', tokens.refresh_token)
      return { tokens, user }
    } catch {
      return rejectWithValue('Invalid credentials')
    }
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState }
    const refreshToken = state.auth.refreshToken
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Logout API failure shouldn't block client-side cleanup
      }
    }
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<AuthTokens>) {
      state.accessToken = action.payload.access_token
      state.refreshToken = action.payload.refresh_token
      const user = decodeAuthToken(action.payload.access_token)
      if (user) {
        state.user = user
        state.status = 'authenticated'
      }
    },
    clearAuth() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.access_token
        state.refreshToken = action.payload.tokens.refresh_token
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
      .addCase(logoutThunk.fulfilled, () => {
        return initialState
      })
  },
})

export const { setTokens, clearAuth } = authSlice.actions
export default authSlice.reducer
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- authSlice.test
```

- [ ] **Step 5: Commit**

```bash
git add src/store/slices/authSlice.ts src/store/slices/authSlice.test.ts
git commit -m "feat: add auth Redux slice with login/logout thunks"
```

---

### Task 2.9: Create Auth Selectors (TDD)

**Files:**
- Create: `src/store/selectors/authSelectors.ts`
- Create: `src/store/selectors/authSelectors.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/store/selectors/authSelectors.test.ts
import { selectIsAuthenticated, selectIsAdmin, selectHasPermission } from '@/store/selectors/authSelectors'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'
import type { RootState } from '@/store'

function mockRootState(authOverrides = {}): RootState {
  return { auth: createMockAuthState(authOverrides) } as RootState
}

describe('authSelectors', () => {
  it('selectIsAuthenticated returns true when authenticated', () => {
    expect(selectIsAuthenticated(mockRootState())).toBe(true)
  })

  it('selectIsAuthenticated returns false when idle', () => {
    expect(selectIsAuthenticated(mockRootState({ status: 'idle' }))).toBe(false)
  })

  it('selectIsAdmin returns true for EmployeeAdmin role', () => {
    expect(selectIsAdmin(mockRootState())).toBe(true)
  })

  it('selectIsAdmin returns false for other roles', () => {
    const state = mockRootState({
      user: { id: 1, email: 'a@b.com', role: 'EmployeeBasic', permissions: [] },
    })
    expect(selectIsAdmin(state)).toBe(false)
  })

  it('selectHasPermission checks for a specific permission', () => {
    const state = mockRootState()
    expect(selectHasPermission(state, 'employees.read')).toBe(true)
    expect(selectHasPermission(state, 'nonexistent')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- authSelectors.test
```

- [ ] **Step 3: Implement selectors**

```typescript
// src/store/selectors/authSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export const selectAuthState = (state: RootState) => state.auth

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.status === 'authenticated'
)

export const selectIsAdmin = createSelector(
  selectAuthState,
  (auth) => auth.user?.role === 'EmployeeAdmin'
)

export const selectHasPermission = (state: RootState, permission: string): boolean => {
  const permissions = state.auth.user?.permissions ?? []
  return permissions.includes(permission)
}

export const selectCurrentUser = createSelector(selectAuthState, (auth) => auth.user)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- authSelectors.test
```

- [ ] **Step 5: Commit**

```bash
git add src/store/selectors/authSelectors.ts src/store/selectors/authSelectors.test.ts
git commit -m "feat: add auth selectors with tests"
```

---

### Task 2.10: Create Redux Store Configuration

**Files:**
- Create: `src/store/index.ts`
- Create: `src/hooks/useAppDispatch.ts`
- Create: `src/hooks/useAppSelector.ts`

- [ ] **Step 1: Create store**

```typescript
// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
```

- [ ] **Step 2: Create typed hooks**

```typescript
// src/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
export const useAppDispatch = () => useDispatch<AppDispatch>()
```

```typescript
// src/hooks/useAppSelector.ts
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

- [ ] **Step 3: Verify all existing tests still pass**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/store/index.ts src/hooks/useAppDispatch.ts src/hooks/useAppSelector.ts src/__tests__/utils/test-utils.tsx src/__tests__/fixtures/
git commit -m "feat: configure Redux store, typed hooks, test utilities and fixtures"
```

---

### Task 2.11: Create ProtectedRoute Component (TDD)

**Files:**
- Create: `src/components/shared/ProtectedRoute.tsx`
- Create: `src/components/shared/ProtectedRoute.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/shared/ProtectedRoute.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState({ status: 'idle', user: null, accessToken: null }) } }
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects when user lacks required permission', () => {
    renderWithProviders(
      <ProtectedRoute requiredPermission="nonexistent.permission">
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('renders when user has required permission', () => {
    renderWithProviders(
      <ProtectedRoute requiredPermission="employees.read">
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProtectedRoute.test
```

- [ ] **Step 3: Implement ProtectedRoute**

```typescript
// src/components/shared/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectIsAuthenticated, selectHasPermission } from '@/store/selectors/authSelectors'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const hasPermission = useAppSelector((state) =>
    requiredPermission ? selectHasPermission(state, requiredPermission) : true
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProtectedRoute.test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/ProtectedRoute.tsx src/components/shared/ProtectedRoute.test.tsx
git commit -m "feat: add ProtectedRoute component with permission checks"
```

---

### Task 2.12: Create App Shell with Routing

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/layout/AuthLayout.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/shared/LoadingSpinner.tsx`

No TDD — layout components are configuration. Covered by page-level tests.

- [ ] **Step 1: Create LoadingSpinner**

```typescript
// src/components/shared/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}
```

- [ ] **Step 2: Create AuthLayout (for public pages)**

```typescript
// src/components/layout/AuthLayout.tsx
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-4">
        <Outlet />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create AppLayout (for protected pages)**

```typescript
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

Note: Sidebar will be added in Chunk 4 when employee management is built.

- [ ] **Step 4: Set up App.tsx with routes**

```typescript
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { PasswordResetRequestPage } from '@/pages/PasswordResetRequestPage'
import { PasswordResetPage } from '@/pages/PasswordResetPage'
import { ActivationPage } from '@/pages/ActivationPage'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import { CreateEmployeePage } from '@/pages/CreateEmployeePage'
import { EditEmployeePage } from '@/pages/EditEmployeePage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/activate" element={<ActivationPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredPermission="employees.read">
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute requiredPermission="employees.create">
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requiredPermission="employees.update">
              <EditEmployeePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Set up main.tsx with providers**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import App from '@/App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
```

**Note:** The page components imported in App.tsx don't exist yet. Create placeholder stubs so the app compiles:

```typescript
// For each page (LoginPage, PasswordResetRequestPage, etc.), create a stub:
export function LoginPage() {
  return <div>Login Page (TODO)</div>
}
```

Create these stubs in their respective files under `src/pages/`.

- [ ] **Step 6: Verify app compiles and runs**

```bash
npm run build
npm run dev
```

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/layout/ src/components/shared/LoadingSpinner.tsx src/pages/
git commit -m "feat: set up routing, layouts, providers, and page stubs"
```

---

## Chunk 3: Auth Pages

Login, password reset, and account activation pages. Each follows TDD. All use Shadcn UI components and React Hook Form + Zod.

### Task 3.1: LoginForm Component (TDD)

**Files:**
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/LoginForm.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/auth/LoginForm.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid credentials', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password12',
      })
    })
  })

  it('disables submit button when loading', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />)
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  it('displays error message when provided', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid credentials" />)
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('has a link to password reset', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/password-reset-request'
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- LoginForm.test
```

- [ ] **Step 3: Implement LoginForm**

```typescript
// src/components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { loginSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LoginRequest } from '@/types/auth'

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void
  isLoading: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Log In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive text-center">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
          <div className="text-center text-sm">
            <Link to="/password-reset-request" className="text-primary underline">
              Forgot password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- LoginForm.test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/LoginForm.tsx src/components/auth/LoginForm.test.tsx
git commit -m "feat: add LoginForm component with validation"
```

---

### Task 3.2: LoginPage (TDD)

**Files:**
- Modify: `src/pages/LoginPage.tsx` (replace stub)
- Create: `src/pages/LoginPage.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/pages/LoginPage.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoginPage } from '@/pages/LoginPage'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

beforeEach(() => jest.clearAllMocks())

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('dispatches login on form submit', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    const user = { id: 1, email: 'a@b.com', role: 'EmployeeAdmin', permissions: [] }
    jest.mocked(authApi.login).mockResolvedValue(tokens)
    jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

    renderWithProviders(<LoginPage />, { route: '/login' })

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Password12' })
    })
  })

  it('redirects to /employees if already authenticated', () => {
    renderWithProviders(<LoginPage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/login',
    })
    // LoginPage should redirect — form should NOT be rendered
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- LoginPage.test
```

- [ ] **Step 3: Implement LoginPage**

```typescript
// src/pages/LoginPage.tsx
import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginThunk } from '@/store/slices/authSlice'
import { selectIsAuthenticated } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { status, error } = useAppSelector((state) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/employees" replace />
  }

  const handleSubmit = (data: LoginRequest) => {
    dispatch(loginThunk(data))
  }

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={status === 'loading'}
      error={error}
    />
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- LoginPage.test
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/LoginPage.test.tsx
git commit -m "feat: implement LoginPage with auth dispatch and redirect"
```

---

### Task 3.3: PasswordResetRequestPage (TDD)

**Files:**
- Create: `src/components/auth/PasswordResetRequestForm.tsx`
- Create: `src/components/auth/PasswordResetRequestForm.test.tsx`
- Modify: `src/pages/PasswordResetRequestPage.tsx`
- Create: `src/pages/PasswordResetRequestPage.test.tsx`

- [ ] **Step 1: Write failing tests for the form**

```typescript
// src/components/auth/PasswordResetRequestForm.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetRequestForm', () => {
  it('renders email field and submit button', () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('validates email', async () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'not-email')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with valid email', async () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('user@test.com')
    })
  })

  it('shows success message', () => {
    renderWithProviders(
      <PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} isSuccess={true} />
    )
    expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails, then implement the form**

Follow the same TDD pattern as LoginForm. The form component should:
- Have a single email input with Zod validation
- Show a success message when `isSuccess` is true
- Have a "Back to login" link

- [ ] **Step 3: Write failing tests for the page**

```typescript
// src/pages/PasswordResetRequestPage.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetRequestPage } from '@/pages/PasswordResetRequestPage'
import * as authApi from '@/lib/api/auth'

jest.mock('@/lib/api/auth')

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetRequestPage', () => {
  it('calls requestPasswordReset API on submit', async () => {
    jest.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetRequestPage />, { route: '/password-reset-request' })

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(authApi.requestPasswordReset).toHaveBeenCalledWith('user@test.com')
    })
  })

  it('shows success message after submit', async () => {
    jest.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetRequestPage />, { route: '/password-reset-request' })

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await screen.findByText(/reset link has been sent/i)
  })
})
```

- [ ] **Step 4: Implement the page** (uses `useMutation` for consistency with other mutation pages)

```typescript
// src/pages/PasswordResetRequestPage.tsx
import { useMutation } from '@tanstack/react-query'
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm'
import { requestPasswordReset } from '@/lib/api/auth'

export function PasswordResetRequestPage() {
  const mutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })

  return (
    <PasswordResetRequestForm
      onSubmit={(email) => mutation.mutate(email)}
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      error={mutation.isError ? 'Something went wrong. Please try again.' : undefined}
    />
  )
}
```

- [ ] **Step 5: Run all tests, then commit**

```bash
npm test
git add src/components/auth/PasswordResetRequestForm.tsx src/components/auth/PasswordResetRequestForm.test.tsx src/pages/PasswordResetRequestPage.tsx src/pages/PasswordResetRequestPage.test.tsx
git commit -m "feat: add password reset request page with form and tests"
```

---

### Task 3.4: PasswordResetPage (TDD)

**Files:**
- Create: `src/components/auth/PasswordResetForm.tsx`
- Create: `src/components/auth/PasswordResetForm.test.tsx`
- Modify: `src/pages/PasswordResetPage.tsx`
- Create: `src/pages/PasswordResetPage.test.tsx`

Follow the same TDD pattern as Tasks 3.1-3.3. Key differences:
- Reads `token` from URL search params (`useSearchParams`)
- Has `new_password` and `confirm_password` fields
- Validates password with `passwordSchema` (8-32 chars, 2 numbers, 1 upper, 1 lower)
- Shows success message with link to login after successful reset

- [ ] **Step 1: Write failing tests for form** — test password validation, confirm match, submit callback
- [ ] **Step 2: Implement PasswordResetForm**
- [ ] **Step 3: Write failing tests for page** — test API call with token from URL, success state
- [ ] **Step 4: Implement PasswordResetPage**
- [ ] **Step 5: Run all tests, commit**

```bash
git add src/components/auth/PasswordResetForm.tsx src/components/auth/PasswordResetForm.test.tsx src/pages/PasswordResetPage.tsx src/pages/PasswordResetPage.test.tsx
git commit -m "feat: add password reset page with token validation"
```

---

### Task 3.5: ActivationPage (TDD)

**Files:**
- Create: `src/components/auth/ActivationForm.tsx`
- Create: `src/components/auth/ActivationForm.test.tsx`
- Modify: `src/pages/ActivationPage.tsx`
- Create: `src/pages/ActivationPage.test.tsx`

Same pattern as PasswordResetPage. Key differences:
- Fields: `password` and `confirm_password` (no `new_password`)
- Calls `activateAccount` API with `token` from URL params
- Shows success message: "Account activated successfully" with link to login

- [ ] **Step 1: Write failing tests for form**
- [ ] **Step 2: Implement ActivationForm**
- [ ] **Step 3: Write failing tests for page**
- [ ] **Step 4: Implement ActivationPage**
- [ ] **Step 5: Run all tests, commit**

```bash
git add src/components/auth/ActivationForm.tsx src/components/auth/ActivationForm.test.tsx src/pages/ActivationPage.tsx src/pages/ActivationPage.test.tsx
git commit -m "feat: add account activation page with form and tests"
```

---

### Task 3.6: Run Chunk 3 Quality Gates

- [ ] **Step 1: All tests pass**

```bash
npm test
```

- [ ] **Step 2: Lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Type check passes**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Prettier check passes**

```bash
npx prettier --check "src/**/*.{ts,tsx}"
```

Fix any issues, then commit fixes.

- [ ] **Step 5: Build passes**

```bash
npm run build
```

---

## Chunk 4: Employee Management

Admin portal for listing, creating, and editing employees. Uses TanStack Query for server data.

### Task 4.1: Employee TanStack Query Hooks (TDD)

**Files:**
- Create: `src/hooks/useEmployees.ts`
- Create: `src/hooks/useEmployees.test.ts`
- Create: `src/hooks/useEmployee.ts`
- Create: `src/hooks/useEmployee.test.ts`

- [ ] **Step 1: Write failing tests for useEmployees**

```typescript
// src/hooks/useEmployees.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useEmployees } from '@/hooks/useEmployees'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('useEmployees', () => {
  it('fetches employees with filters', async () => {
    const response = { employees: [createMockEmployee()], total_count: 1 }
    jest.mocked(employeesApi.getEmployees).mockResolvedValue(response)

    const { result } = renderHook(() => useEmployees({ page: 1, page_size: 20 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({ page: 1, page_size: 20 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useEmployees.test
```

- [ ] **Step 3: Implement useEmployees**

```typescript
// src/hooks/useEmployees.ts
import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '@/lib/api/employees'
import type { EmployeeFilters } from '@/types/employee'

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => getEmployees(filters),
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useEmployees.test
```

- [ ] **Step 5: Repeat TDD for useEmployee hook**

```typescript
// src/hooks/useEmployee.ts
import { useQuery } from '@tanstack/react-query'
import { getEmployee } from '@/lib/api/employees'

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id),
    enabled: id > 0,
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useEmployees.ts src/hooks/useEmployees.test.ts src/hooks/useEmployee.ts src/hooks/useEmployee.test.ts
git commit -m "feat: add TanStack Query hooks for employees"
```

---

### Task 4.2: EmployeeStatusBadge Component (TDD)

**Files:**
- Create: `src/components/employees/EmployeeStatusBadge.tsx`
- Create: `src/components/employees/EmployeeStatusBadge.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/employees/EmployeeStatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { EmployeeStatusBadge } from '@/components/employees/EmployeeStatusBadge'

describe('EmployeeStatusBadge', () => {
  it('shows "Active" with green styling for active employee', () => {
    render(<EmployeeStatusBadge active={true} />)
    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
  })

  it('shows "Inactive" for inactive employee', () => {
    render(<EmployeeStatusBadge active={false} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement**

```typescript
// src/components/employees/EmployeeStatusBadge.tsx
import { Badge } from '@/components/ui/badge'

interface EmployeeStatusBadgeProps {
  active: boolean
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  return (
    <Badge variant={active ? 'default' : 'secondary'}>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeStatusBadge.test
git add src/components/employees/EmployeeStatusBadge.tsx src/components/employees/EmployeeStatusBadge.test.tsx
git commit -m "feat: add EmployeeStatusBadge component"
```

---

### Task 4.3: EmployeeFilters Component (TDD)

**Files:**
- Create: `src/components/employees/EmployeeFilters.tsx`
- Create: `src/components/employees/EmployeeFilters.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/employees/EmployeeFilters.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import type { EmployeeFilters as Filters } from '@/types/employee'

const mockOnFilter = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeFilters', () => {
  it('renders search inputs for email, name, position', () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/position/i)).toBeInTheDocument()
  })

  it('calls onFilter when search button is clicked', async () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'jane')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane' })
      )
    })
  })
})
```

- [ ] **Step 2: Implement EmployeeFilters**

```typescript
// src/components/employees/EmployeeFilters.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { EmployeeFilters as Filters } from '@/types/employee'

interface EmployeeFiltersProps {
  onFilter: (filters: Filters) => void
}

export function EmployeeFilters({ onFilter }: EmployeeFiltersProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')

  const handleSearch = () => {
    onFilter({
      ...(email && { email }),
      ...(name && { name }),
      ...(position && { position }),
    })
  }

  return (
    <div className="flex gap-2 mb-4">
      <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeFilters.test
git add src/components/employees/EmployeeFilters.tsx src/components/employees/EmployeeFilters.test.tsx
git commit -m "feat: add EmployeeFilters component with search inputs"
```

---

### Task 4.4: EmployeeTable Component (TDD)

**Files:**
- Create: `src/components/employees/EmployeeTable.tsx`
- Create: `src/components/employees/EmployeeTable.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/employees/EmployeeTable.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

describe('EmployeeTable', () => {
  const employees = [
    createMockEmployee({ id: 1, first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', active: true }),
    createMockEmployee({ id: 2, first_name: 'John', last_name: 'Smith', email: 'john@test.com', active: false }),
  ]

  it('renders table headers', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders employee rows', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = jest.fn()
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={onRowClick} />)
    await userEvent.click(screen.getByText('Jane Doe'))
    expect(onRowClick).toHaveBeenCalledWith(1)
  })

  it('shows active/inactive badges', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement EmployeeTable**

```typescript
// src/components/employees/EmployeeTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmployeeStatusBadge } from '@/components/employees/EmployeeStatusBadge'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
  employees: Employee[]
  onRowClick: (id: number) => void
}

export function EmployeeTable({ employees, onRowClick }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id} className="cursor-pointer" onClick={() => onRowClick(emp.id)}>
            <TableCell>{emp.first_name} {emp.last_name}</TableCell>
            <TableCell>{emp.email}</TableCell>
            <TableCell>{emp.position}</TableCell>
            <TableCell>{emp.phone}</TableCell>
            <TableCell><EmployeeStatusBadge active={emp.active} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeTable.test
git add src/components/employees/EmployeeTable.tsx src/components/employees/EmployeeTable.test.tsx
git commit -m "feat: add EmployeeTable component"
```

---

### Task 4.5: EmployeeListPage (TDD)

**Files:**
- Modify: `src/pages/EmployeeListPage.tsx`
- Create: `src/pages/EmployeeListPage.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/pages/EmployeeListPage.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('EmployeeListPage', () => {
  it('displays employees on load', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })],
      total_count: 1,
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await screen.findByText('Jane Doe')
  })

  it('shows loading state', () => {
    jest.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    // Skeleton or loading indicator should be present
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('has a create employee button linking to /employees/new', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [],
      total_count: 0,
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    const link = await screen.findByRole('link', { name: /create employee/i })
    expect(link).toHaveAttribute('href', '/employees/new')
  })
})
```

- [ ] **Step 2: Implement EmployeeListPage**

```typescript
// src/pages/EmployeeListPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeFilters as Filters } from '@/types/employee'

export function EmployeeListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ page: 1, page_size: 20 })
  const { data, isLoading } = useEmployees(filters)

  const handleFilter = (newFilters: Filters) => {
    setFilters({ ...newFilters, page: 1, page_size: 20 })
  }

  const handleRowClick = (id: number) => {
    navigate(`/employees/${id}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button asChild>
          <Link to="/employees/new">Create Employee</Link>
        </Button>
      </div>

      <EmployeeFilters onFilter={handleFilter} />

      {isLoading ? (
        <p>Loading...</p>
      ) : data?.employees.length ? (
        <>
          <EmployeeTable employees={data.employees} onRowClick={handleRowClick} />
          <p className="text-sm text-muted-foreground mt-2">
            Total: {data.total_count}
          </p>
        </>
      ) : (
        <p>No employees found.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeListPage.test
git add src/pages/EmployeeListPage.tsx src/pages/EmployeeListPage.test.tsx
git commit -m "feat: implement EmployeeListPage with filters and table"
```

---

### Task 4.6: EmployeeForm Component (TDD)

**Files:**
- Create: `src/components/employees/EmployeeForm.tsx`
- Create: `src/components/employees/EmployeeForm.test.tsx`

Shared form for both create and edit. Uses React Hook Form + Zod.

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/employees/EmployeeForm.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeForm', () => {
  it('renders all required fields for create mode', () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
  })

  it('pre-fills fields in edit mode', () => {
    const employee = createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />)
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
  })

  it('disables non-editable fields in edit mode', () => {
    const employee = createMockEmployee()
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />)
    expect(screen.getByLabelText(/first name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/username/i)).toBeDisabled()
  })

  it('validates required fields', async () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('calls onSubmit with form data', async () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane')
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe')
    await userEvent.type(screen.getByLabelText(/date of birth/i), '2000-01-15')
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com')
    await userEvent.type(screen.getByLabelText(/username/i), 'jane.doe')
    // Select role (implementation depends on Shadcn Select — pick EmployeeBasic)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Implement EmployeeForm**

The form should include fields:
- `first_name` (required, disabled in edit mode)
- `last_name` (required)
- `date_of_birth` (required, date input)
- `gender` (optional)
- `email` (required, disabled in edit mode)
- `phone` (optional)
- `address` (optional)
- `username` (required, disabled in edit mode)
- `position` (optional)
- `department` (optional)
- `role` (required, Select with options: EmployeeBasic, EmployeeAgent, EmployeeSupervisor, EmployeeAdmin)
- `active` (checkbox, default true)

Props:
```typescript
interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => void
  isLoading: boolean
  employee?: Employee  // present in edit mode
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeForm.test
git add src/components/employees/EmployeeForm.tsx src/components/employees/EmployeeForm.test.tsx
git commit -m "feat: add EmployeeForm component for create/edit"
```

---

### Task 4.7: CreateEmployeePage (TDD)

**Files:**
- Modify: `src/pages/CreateEmployeePage.tsx`
- Create: `src/pages/CreateEmployeePage.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/pages/CreateEmployeePage.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateEmployeePage } from '@/pages/CreateEmployeePage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('CreateEmployeePage', () => {
  it('renders employee form', () => {
    renderWithProviders(<CreateEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('calls createEmployee API on submit', async () => {
    jest.mocked(employeesApi.createEmployee).mockResolvedValue(createMockEmployee())

    renderWithProviders(<CreateEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane')
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com')
    await userEvent.type(screen.getByLabelText(/username/i), 'jane.doe')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(employeesApi.createEmployee).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Implement CreateEmployeePage** using `useMutation` from TanStack Query

```typescript
// src/pages/CreateEmployeePage.tsx
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { createEmployee } from '@/lib/api/employees'
import type { CreateEmployeeRequest } from '@/types/employee'

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      navigate('/employees')
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Employee</h1>
      <EmployeeForm
        onSubmit={(data) => mutation.mutate(data as CreateEmployeeRequest)}
        isLoading={mutation.isPending}
      />
      {mutation.isError && (
        <p className="text-destructive mt-2">Failed to create employee.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- CreateEmployeePage.test
git add src/pages/CreateEmployeePage.tsx src/pages/CreateEmployeePage.test.tsx
git commit -m "feat: implement CreateEmployeePage with mutation"
```

---

### Task 4.8: EditEmployeePage (TDD)

**Files:**
- Modify: `src/pages/EditEmployeePage.tsx`
- Create: `src/pages/EditEmployeePage.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/pages/EditEmployeePage.test.tsx
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditEmployeePage } from '@/pages/EditEmployeePage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('EditEmployeePage', () => {
  it('loads and displays employee data', async () => {
    const employee = createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('shows loading while fetching', () => {
    jest.mocked(employeesApi.getEmployee).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows read-only view for admin-role employees', async () => {
    const adminEmployee = createMockEmployee({ role: 'EmployeeAdmin', first_name: 'Boss' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(adminEmployee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByText(/cannot edit administrators/i)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement EditEmployeePage**

```typescript
// src/pages/EditEmployeePage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { useEmployee } from '@/hooks/useEmployee'
import { updateEmployee } from '@/lib/api/employees'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UpdateEmployeeRequest } from '@/types/employee'

export function EditEmployeePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const employeeId = Number(id)
  const { data: employee, isLoading } = useEmployee(employeeId)

  const mutation = useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
      navigate('/employees')
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!employee) return <p>Employee not found.</p>

  // Spec + API: Cannot edit employees with EmployeeAdmin role
  if (employee.role === 'EmployeeAdmin') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Employee Details</h1>
        <p className="text-muted-foreground">Cannot edit administrators.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      <EmployeeForm
        employee={employee}
        onSubmit={(data) => mutation.mutate(data as UpdateEmployeeRequest)}
        isLoading={mutation.isPending}
      />
      {mutation.isError && (
        <p className="text-destructive mt-2">Failed to update employee.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EditEmployeePage.test
git add src/pages/EditEmployeePage.tsx src/pages/EditEmployeePage.test.tsx
git commit -m "feat: implement EditEmployeePage with data loading and mutation"
```

---

### Task 4.9: Add Sidebar Navigation (TDD)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Sidebar.test.tsx`
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/layout/Sidebar.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

describe('Sidebar', () => {
  it('shows employee management link', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('shows logout button', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('displays user email', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement Sidebar**

```typescript
// src/components/layout/Sidebar.tsx
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
    <aside className="w-64 border-r bg-muted/20 flex flex-col p-4">
      <div className="text-lg font-semibold mb-6">EXBanka</div>
      <nav className="flex-1 space-y-1">
        <Link
          to="/employees"
          className="block px-3 py-2 rounded-md hover:bg-muted text-sm"
        >
          Employees
        </Link>
      </nav>
      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Update AppLayout to include Sidebar**

```typescript
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run tests, commit**

```bash
npm test -- Sidebar.test
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx src/components/layout/AppLayout.tsx
git commit -m "feat: add Sidebar navigation with logout"
```

---

### Task 4.10: Add ErrorMessage Component

**Files:**
- Create: `src/components/shared/ErrorMessage.tsx`

No TDD — simple presentational component with no logic.

- [ ] **Step 1: Create ErrorMessage**

```typescript
// src/components/shared/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/ErrorMessage.tsx
git commit -m "feat: add ErrorMessage shared component"
```

---

### Task 4.11: Add Pagination to EmployeeListPage

**Files:**
- Modify: `src/pages/EmployeeListPage.tsx`

- [ ] **Step 1: Add pagination controls**

Update the `EmployeeListPage` to include prev/next buttons that update the `page` filter:

```typescript
// Add to EmployeeListPage, after the EmployeeTable:
const totalPages = Math.ceil((data?.total_count ?? 0) / (filters.page_size ?? 20))
const currentPage = filters.page ?? 1

// In JSX:
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-2 mt-4">
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage <= 1}
      onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
    >
      Previous
    </Button>
    <span className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage >= totalPages}
      onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
    >
      Next
    </Button>
  </div>
)}
```

- [ ] **Step 2: Add pagination test to EmployeeListPage.test.tsx**

```typescript
it('shows pagination when there are multiple pages', async () => {
  jest.mocked(employeesApi.getEmployees).mockResolvedValue({
    employees: [createMockEmployee()],
    total_count: 50, // With page_size 20, this is 3 pages
  })

  renderWithProviders(<EmployeeListPage />, {
    preloadedState: { auth: createMockAuthState() },
  })

  await screen.findByText('Page 1 of 3')
  expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
})
```

- [ ] **Step 3: Run tests, commit**

```bash
npm test -- EmployeeListPage.test
git add src/pages/EmployeeListPage.tsx src/pages/EmployeeListPage.test.tsx
git commit -m "feat: add pagination to EmployeeListPage"
```

---

### Task 4.12: Run Final Quality Gates

- [ ] **Step 1: All tests pass**

```bash
npm test
```

- [ ] **Step 2: Lint passes**

```bash
npm run lint
```

- [ ] **Step 3: Type check passes**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Prettier check passes**

```bash
npx prettier --check "src/**/*.{ts,tsx}"
```

- [ ] **Step 5: Build passes**

```bash
npm run build
```

- [ ] **Step 6: Final commit with any fixes**

```bash
git add -A
git commit -m "chore: fix lint/type/format issues from quality gates"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|------------------|
| 1 | 1.1–1.8 | All dependencies, Tailwind, Shadcn, Jest, Husky, Prettier, directory scaffold |
| 2 | 2.1–2.12 | Types, API layer, Redux auth, selectors, ProtectedRoute, routing, providers |
| 3 | 3.1–3.6 | Login page, password reset request/reset pages, activation page |
| 4 | 4.1–4.12 | Employee list (filtered, paginated), create employee, edit employee, sidebar, ErrorMessage, pagination |

**Total estimated tasks:** 36 tasks across 4 chunks.

After completing all chunks, the app supports:
- User authentication (login, logout, token refresh)
- Password reset flow (request + reset)
- Account activation for new employees
- Admin portal: list employees with filters, create new employees, edit existing employees
- Role-based access control on all protected routes
