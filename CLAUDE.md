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
