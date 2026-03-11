# Architecture Decision Records — Frontend

---

## ADR-001: TanStack Query for Server State, Redux Toolkit for Complex State

**Status:** Accepted

**Decision:** Use TanStack Query (React Query v5) for all server data fetching. Use Redux Toolkit for multi-step flows, global UI state, and auth state. Do NOT use `useState` + `useEffect` for data fetching.

**Rationale:**
- TanStack Query handles caching, background refresh, loading/error states automatically
- Redux Toolkit with `createAsyncThunk` handles complex async flows (multi-step transfers, payment confirmation)
- Clear separation: TanStack = "what the server says now", Redux = "what the user is doing"
- Avoids stale closure bugs common with `useEffect` + `useState` for async data

**When to use which:**

| Scenario | Tool |
|---|---|
| Fetch account balance | TanStack Query |
| Fetch transaction history | TanStack Query |
| Multi-step fund transfer (step 1 → 2 → 3) | Redux Toolkit |
| Auth state (logged-in user, roles) | Redux Toolkit slice |
| Show/hide global notification banner | Redux Toolkit slice |
| Theme/locale | React Context |

---

## ADR-002: Shadcn UI + Tailwind CSS

**Status:** Accepted (tentative — confirm when project starts)

**Decision:** Use Shadcn UI components with Tailwind CSS for styling.

**Rationale:**
- Components are copied into the project (not a black-box dependency) — full control
- Tailwind is co-located with markup — no CSS files to maintain
- Accessible by default (Radix UI primitives)

**Rules:**
- Install Shadcn components via `npx shadcn add [component]` — do not hand-write base UI
- Do not modify files in `components/ui/` — extend by wrapping
- Only Tailwind for styling — no separate CSS files, no inline `style={{}}`

---

## ADR-003: Role-Based Access Control

**Status:** Accepted

**Decision:** Two roles — `ADMIN` and `USER`. Roles come from JWT claims via API Gateway, stored in Redux auth slice.

**Enforcement at every level:**
- Route level: `<ProtectedRoute roles={['ADMIN']}>` wrapper
- Component level: explicit role check before rendering admin actions
- API call level: the backend enforces authorization (frontend check is UX, not security)

```typescript
// ✅ Pattern — explicit role check
const { roles } = useAppSelector(state => state.auth);
if (!roles.includes('ADMIN')) return null;
```

---

## ADR-004: Component Size Limit — 150 Lines

**Status:** Accepted

**Decision:** No component file exceeds 150 lines.

**Rationale:** Large components are a symptom of mixing concerns. Forces extraction of logic into hooks and sub-components.

**When a component grows:**
1. Extract data-fetching/state logic → custom hook (`use[Feature].ts`)
2. Extract rendering sections → sub-components in the same feature folder
3. If still too large → reconsider component responsibility (SRP violation)

---

## ADR-005: Pure Functions in lib/api/

**Status:** Accepted

**Decision:** All API call functions in `lib/api/` are pure — they take parameters, return a Promise, and have no side effects.

```typescript
// ✅ CORRECT — pure function
export const getAccount = (id: string): Promise<Account> =>
  axios.get(`/accounts/${id}`).then(res => res.data);

// ❌ WRONG — side effects, dispatch, state
export const getAccount = (id: string) => {
  dispatch(setLoading(true));  // side effect in lib/
  return axios.get(...)
};
```

Side effects (dispatch, toasts, navigation) belong in hooks or components, not in `lib/`.
