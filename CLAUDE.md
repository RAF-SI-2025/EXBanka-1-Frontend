# CLAUDE.md - Banking Platform Frontend

This file provides guidance to Claude Code when working on the banking platform frontend (React + TypeScript).

## Documentation Index

### Architecture
- [Architecture Decisions](/docs/architecture/decisions.md) - ADRs: state management, routing, UI library
- [Common Anti-Patterns](/docs/architecture/anti-patterns.md) - Mistakes to avoid with examples

### State Management
- [Redux Toolkit Patterns](/docs/state-management/redux-toolkit-patterns.md) - Slices, thunks, selectors

### Agents
- [Frontend Architect Agent](/docs/agents/frontend-architect.md) - Component architecture, state design
- [React TypeScript Coder Agent](/docs/agents/react-typescript-coder.md) - Implementation, TDD workflow
- [Code Quality Enforcer](/docs/agents/code-quality-enforcer.md) - Code review, complexity analysis

### Testing
- [Frontend Testing Strategy](/docs/testing/strategy.md) - Jest + RTL patterns, render helpers
- [Testing Quick Reference](/docs/testing/quick-reference.md) - Common patterns and commands

### Workflows
- [Post-Implementation Quality Gates](/docs/workflows/post-implementation-quality-gates.md)
- [Pre-Deployment Checklist](/docs/workflows/pre-deployment-checklist.md)
- [Error Handling — Developer Guide](/docs/error-handling.md) - **MANDATORY** for every feature
- [Environments & Testing](/docs/environments-and-testing.md) - localhost vs. bytenity

### Skills
- [TDD Skill](/docs/skills/tdd-skill.md) - Component test patterns, render helpers, fixtures

---

## Project Overview

Banking platform frontend built with React 19 and TypeScript. Communicates with the API Gateway via REST. Role-based access: **admin** (full management) and **user** (regular customer).

**Stack:**
- Framework: React 19 + TypeScript + Vite
- UI: Shadcn UI + Tailwind CSS
- Server state: TanStack Query (React Query v5)
- Global/complex state: Redux Toolkit
- Routing: React Router v6
- HTTP client: Axios

**State Management Architecture:**

| Responsibility | Tool |
|---|---|
| Server data (accounts, transactions, balances) | TanStack Query |
| Multi-step flows (transfers, payments) | Redux Toolkit + `createAsyncThunk` |
| Global app state (auth, notifications) | Redux Toolkit |
| Simple shared UI state | React Context |

---

## Key Commands

```bash
npm run dev                                          # Start dev server
npm test                                             # Run tests
npm test -- --watch                                  # Watch mode
npm test -- --coverage                               # With coverage
npm run lint                                         # ESLint
npx tsc --noEmit                                     # TypeScript check
npx prettier --check "src/**/*.{ts,tsx}"             # Format check
npx prettier --write "src/**/*.{ts,tsx}"             # Auto-format
npm run build                                        # Production build
```

---

## Architecture Overview

```
src/
  components/           # Reusable components (< 150 lines each)
    ui/                 # Shadcn base components (do not modify)
    [feature]/          # Feature-specific components
  pages/                # Route-level components (one per route)
  store/                # Redux store
    slices/             # createSlice per domain (auth, transfer, ...)
    selectors/          # Memoized reselect selectors
    index.ts            # Store configuration
  hooks/                # Custom hooks
    use[Feature].ts     # React Query hooks (data fetching)
    useAppDispatch.ts   # Typed dispatch hook
    useAppSelector.ts   # Typed selector hook
  lib/
    api/                # Axios API functions (pure — no side effects)
    utils/              # Pure utility functions
  types/                # TypeScript interfaces and types
  contexts/             # React Context (minimal — only theme/locale)
  __tests__/
    utils/              # Render helpers and test utilities
    fixtures/           # Mock data factories
```

---

## TDD Policy (MANDATORY)

All code changes MUST follow Test-Driven Development:

```
1. RED    → Write failing test FIRST
2. GREEN  → Implement MINIMUM code to pass
3. REFACTOR → Clean up, enforce architecture rules
```

### Warning Signs (Agent MUST flag these)

| Violation | Warning Message |
|-----------|----------------|
| Code without test | "⚠️ NO TEST WRITTEN - TDD requires test FIRST" |
| Test written after code | "⚠️ TEST WRITTEN AFTER CODE - TDD violation" |

### Exceptions (require explicit user approval)
- Shadcn UI component additions (`npx shadcn add ...`)
- Configuration files
- Documentation

**NO CODE WITHOUT TESTS. NO EXCEPTIONS.**

---

## Standardized Error Handling (MANDATORY)

**Every feature must surface its errors through the project's error-handling system.** No silent failures. No bespoke `try/catch + setLocalError` plumbing. See [Error Handling — Developer Guide](/docs/error-handling.md) for the full API.

### The rule

For any failure path your code introduces — backend 4xx/5xx, network outage, render exception, raw axios call — there are exactly **two acceptable outcomes**:

1. **A toast** (the default; the app does this for you automatically).
2. **Feature-specific UX you intentionally designed** (inline form error, dialog, redirect, etc.).

A failure that produces *neither* is a bug. Pull requests that swallow errors with empty `catch`, empty `onError: () => {}`, or `console.error` without a user-visible surface MUST be rejected during review.

### What to do (in order of preference)

| Situation | What you write |
|---|---|
| New `useQuery` | Nothing. Global `queryCache.onError` toasts on failure. |
| New `useMutation` that should toast | Nothing. Global `mutationCache.onError` toasts when you don't define an `onError`. |
| Mutation with custom error UX | Define `onError`. Inside it, call `notifyError(err)` from `@/lib/errors` unless your custom UX fully replaces the toast. |
| Polling / "expected to fail" query | Add `meta: { suppressGlobalError: true }` to the `useQuery` call. |
| Non–React-Query async (Redux thunk, raw axios, file upload xhr) | Wrap in `try/catch` and call `notifyError(err)` in the catch. |
| Redux `createAsyncThunk` rejection | The reducer can `setError(action.payload)` for inline display, but ALSO call `notifyError` in the thunk's catch. |
| Render exception | Already covered by `<AppErrorBoundary>` at the router root. |

### Forbidden patterns

- `catch (e) { /* ignore */ }`
- `onError: () => {}` with no toast/UX
- Custom HTTP-status switching to build error messages — use `parseApiError` if you really need the parsed shape
- Mounting a second `<Toaster>` somewhere — exactly one in `main.tsx`
- Replacing `createQueryClient()` with a bare `new QueryClient(...)` in `main.tsx` — this disables the global onError fallback

### Verification before requesting review

For each new query, mutation, or async path you added:

- [ ] If it has no `onError`, the global toast is acceptable for this UX.
- [ ] If it has an `onError`, you EITHER call `notifyError(err)` inside it OR have a deliberate inline error display (not a placeholder).
- [ ] No empty catch blocks; no `console.error` as the only side effect.
- [ ] If the feature renders inline errors, those have RTL coverage.

---

## Post-Implementation Quality Gates (MANDATORY)

After every implementation commit, run these gates in order.

| # | Gate | Command | Target |
|---|------|---------|--------|
| 1 | Code Review | `code-quality-enforcer` agent | No logical errors, SOLID, DRY |
| 2 | All Tests | `npm test` | All pass |
| 3 | Coverage | `npm test -- --coverage` | New code paths covered |
| 4 | Lint + Types | `npm run lint` + `npx tsc --noEmit` | Zero violations |
| 5 | Format | `npx prettier --check "src/**/*.{ts,tsx}"` | Formatted |
| 6 | Build | `npm run build` | Success |

See: [Post-Implementation Quality Gates](/docs/workflows/post-implementation-quality-gates.md)

---

## Agent Routing (MANDATORY)

| Task | Required Agent |
|------|---------------|
| New feature: component/state design | `frontend-architect` |
| New feature: implementation | `react-typescript-coder` |
| Bug fix | `react-typescript-coder` |
| Refactoring | `react-typescript-coder` |
| Code quality review | `code-quality-enforcer` |

### Forbidden Actions

**⚠️ FORBIDDEN: Direct `.tsx`/`.ts` editing without coding agents**

**Exceptions (direct editing allowed):**
- Configuration files (`.json`, `vite.config.ts`, `tailwind.config.ts`)
- Type-only additions in `types/` (new interfaces, no logic)
- Documentation (`.md`)
- Shadcn installs

---

## Key Principles (ENFORCED)

### TanStack Query for all server data
```typescript
// ✅ CORRECT — server data via React Query
const { data: account, isLoading, error } = useQuery({
  queryKey: ['account', accountId],
  queryFn: () => api.getAccount(accountId),
});

// ❌ WRONG — useState + useEffect for server data
const [account, setAccount] = useState(null);
useEffect(() => { api.getAccount(id).then(setAccount); }, [id]);
```

### Redux Toolkit for multi-step flows and global state
```typescript
// ✅ CORRECT — multi-step transfer via Redux + createAsyncThunk
const submitTransfer = createAsyncThunk(
  'transfer/submit',
  async (payload: TransferPayload, { rejectWithValue }) => {
    try {
      return await api.submitTransfer(payload);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
```

### No `any` types — ever
```typescript
// ❌ WRONG
const handleResponse = (data: any) => { }

// ✅ CORRECT
const handleResponse = (data: TransferResponse) => { }
```

### Role-based access — always explicit
```typescript
// ✅ CORRECT — explicit role check
const { roles } = useAuth();
if (!roles.includes('ADMIN')) return <Navigate to="/forbidden" />;
```

### Component size limit: 150 lines
- If a component exceeds 150 lines: extract logic to a custom hook
- If it still exceeds: split into sub-components

### `lib/api/` functions are pure
```typescript
// ✅ CORRECT — pure function, no side effects, no state
export const getAccount = (id: string): Promise<Account> =>
  axios.get(`/accounts/${id}`).then(res => res.data);
```

---

## Pre-Commit Checklist

- [ ] Component < 150 lines
- [ ] No `any` types
- [ ] Server data fetching via TanStack Query
- [ ] Multi-step flows via Redux Toolkit
- [ ] Role checks on all admin-only components/routes
- [ ] Tests written (TDD)
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

---

## Git Workflow Policy (MANDATORY)

**Direct commits to `main` are FORBIDDEN.**

1. All work on feature branches: `feature/desc`, `fix/desc`, `docs/desc`
2. Auto-create branch if on `main` when user requests a commit
3. Create PR only on explicit request ("create PR", "make PR")
4. Merge only on explicit confirmation ("merge this PR")

---

## Specification Maintenance (MANDATORY)

**`specification.md` in the project root MUST be kept up to date.**

After every commit that introduces functional changes (new features, new pages, new components, new API functions, new routes, new types, schema changes, or test coverage changes), update `specification.md` to reflect:

1. **Project Structure** — add/remove/rename files in the directory tree
2. **Routes** — add/remove/change routes and their associated pages
3. **Pages** — update page descriptions if behavior changes
4. **Components** — add new components, update descriptions of modified ones
5. **State Management** — update slice state shape, thunks, or selectors if changed
6. **API Layer** — add/remove API functions
7. **Custom Hooks** — add/remove hooks
8. **Types & Interfaces** — add/update type definitions
9. **Validation Schemas** — add/update schemas
10. **Test Coverage** — re-run `npm test -- --coverage --coverageReporters=text` and update the coverage table and percentages. Update the `_Last updated_` date at the top.

**Do not update `specification.md` for:**
- Refactors with no visible behavior change
- Style/formatting-only changes
- Config-only changes (`vite.config.ts`, `.eslintrc`, etc.)

---

## Cypress Maintenance on API Changes (MANDATORY)

**Every API change MUST be reflected in the Cypress suite in the same commit.**

This includes — but is not limited to:

1. **API version bump** (e.g. v2 → v3): update every `cy.intercept(...)` URL in `cypress/e2e/**/*.cy.ts` to the new version. Prefer the host-agnostic `**/api/<version>/...` glob so tests work against both `localhost` and remote backends.
2. **Endpoint path / method change**: update the matching intercept's URL and method.
3. **Request payload change**: update fixtures in `cypress/fixtures/` and any inline request-body assertions.
4. **Response shape change**: update fixtures in `cypress/fixtures/` so the mocked response matches what the real backend now returns.
5. **JWT / auth shape change**: regenerate `cypress/fixtures/employee-auth.json` and `cypress/fixtures/client-auth.json` — the encoded payload must match the real backend's JWT (field names, types, role/permission values).
6. **New endpoint**: add intercepts and fixtures for any test path that exercises it.
7. **Removed endpoint**: delete the orphan intercepts/fixtures.

**Verification before committing an API change:**

- `grep -rE "/api/v[0-9]" cypress/` returns nothing for stale versions.
- Decode each updated fixture JWT and confirm it matches the live backend's payload.
- All `cy.intercept` URLs in changed test files use the new version/path.

A successful frontend code change with an outdated Cypress suite is treated as an incomplete change.
