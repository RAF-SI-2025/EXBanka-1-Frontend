# Standardized Error Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every error visible to the user — never silent. Whether the failure is a backend response (HTTP 4xx/5xx with a JSON body), a network outage, an unexpected render-time exception, or a frontend bug, the user sees a consistent toast or page-level fallback. Establish one canonical surface so feature code doesn't need to reinvent it.

**Architecture:**

Three layers, each with one responsibility:

1. **Parser** (`lib/errors/parseApiError.ts`) — pure function: `unknown → { title, message, code? }`. Knows the backend's error envelope and degrades gracefully when the error is a network failure, an Axios timeout, or a non-Error throw.
2. **Notifier** (`lib/errors/notify.ts`) — calls the parser + `sonner` `toast.error`. One-liner that every feature can import.
3. **Global safety nets:**
   - QueryClient `queryCache.onError` and `mutationCache.onError` defaults → call `notifyError` whenever the consumer didn't pass its own `onError`. This is the "never silent" guarantee for React Query.
   - `<AppErrorBoundary>` mounted at the layout root → catches render-time exceptions; shows a fallback page with a "Try again" button and a "Report problem" link.
   - Sonner `<Toaster>` mounted at the root of `main.tsx` (currently MISSING — installed but never rendered).

The flow: feature code may opt into local error UX (e.g. inline form errors); if it doesn't, the cache defaults catch the error and toast. Render exceptions hit the boundary. **Errors never disappear.**

**Tech Stack:** Sonner (`src/components/ui/sonner.tsx` already exists), React Query v5, Axios (existing interceptors), Jest + RTL.

**Backend reference:** The backend returns errors as `{ error: string, code?: string, details?: object }` per the auth/payment/order routes inspected in `REST_API_v3.md`. The parser handles both this shape and Axios's network-failure branch.

---

## Pre-flight verification

```sh
test -f src/components/ui/sonner.tsx && echo "Sonner Toaster wrapper exists"
grep -n "<Toaster" src/main.tsx src/App.tsx 2>/dev/null || echo "Toaster NOT mounted anywhere (expected)"
grep -rn "ErrorBoundary" src/ 2>/dev/null || echo "No ErrorBoundary in app (expected)"
grep -n "queryCache\|mutationCache" src/main.tsx src/store/ 2>/dev/null || echo "QueryClient has no global error handlers (expected)"
```

If any "expected" check produces an unexpected result, stop and reconcile.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/errors/parseApiError.ts` | Create | `parseApiError(err: unknown): AppError` — handles AxiosError (response/network/timeout), generic Error, string, and the catch-all unknown |
| `src/lib/errors/parseApiError.test.ts` | Create | Tests every input shape |
| `src/lib/errors/notify.ts` | Create | `notifyError(err: unknown)` and `notifySuccess(msg: string)` — the single import every feature uses |
| `src/lib/errors/notify.test.ts` | Create | Tests with `sonner` mocked |
| `src/lib/errors/index.ts` | Create | Re-exports both modules so callers do `from '@/lib/errors'` |
| `src/components/shared/AppErrorBoundary.tsx` | Create | Class component implementing `componentDidCatch`; renders `ErrorFallback` |
| `src/components/shared/AppErrorBoundary.test.tsx` | Create | RTL — child throws → fallback shows; "Try again" resets |
| `src/components/shared/ErrorFallback.tsx` | Create | Stateless presentational fallback page (icon, message, CTA) |
| `src/components/shared/ErrorFallback.test.tsx` | Create | RTL |
| `src/lib/queryClient.ts` | Create | Builds the QueryClient with `queryCache` + `mutationCache` defaults that call `notifyError`. Exports `createQueryClient()` (factory so tests can build their own) |
| `src/lib/queryClient.test.ts` | Create | Tests the global onError fallback fires when consumer omits onError, and DOES NOT fire when consumer provides one |
| `src/main.tsx` | Modify | Use `createQueryClient()`, mount `<Toaster />`, wrap routes in `<AppErrorBoundary>` |
| `src/__tests__/utils/test-utils.tsx` | Modify | Use `createQueryClient()` in `renderWithProviders` so test environment matches prod |
| `docs/error-handling.md` | Create | Developer guide: "how do I surface a backend error in a new feature?" with copy-pasteable patterns |
| `specification.md` | Modify | Document the new util module + ErrorBoundary + Toaster mount; add note in §7 State Management about React Query global error policy |

**Why this split:** the parser is testable in isolation (no React, no DOM), the notifier is the only place that imports `sonner`, the boundary is just a UI surface. Each file ≤ 150 lines (CLAUDE.md cap).

---

## Lock the contract

```ts
// src/lib/errors/parseApiError.ts
export interface AppError {
  /** Short title shown as the toast heading. */
  title: string
  /** User-facing one-line message. NEVER undefined — fall back to "Something went wrong." */
  message: string
  /** Optional machine code from the backend, used by callers that want to branch. */
  code?: string
  /** HTTP status when known. */
  status?: number
}
```

Backend error envelope (observed across REST_API_v3 endpoints):

```json
{ "error": "Insufficient funds", "code": "FUNDS_INSUFFICIENT" }
```

Or, for validation errors:

```json
{ "error": "Validation failed", "code": "VALIDATION", "details": { "amount": "must be positive" } }
```

Parser rules (in order):
1. If `err` is an `AxiosError` AND has a `response` AND `response.data.error` is a string → `{ title: titleByStatus(response.status), message: data.error, code: data.code, status: response.status }`.
2. If `err` is an `AxiosError` AND has a `response` but no parsable body → `{ title: titleByStatus(response.status), message: defaultByStatus(response.status), status }`.
3. If `err` is an `AxiosError` with no `response` → network failure → `{ title: 'Network error', message: 'Could not reach the server. Check your connection.' }`.
4. If `err.code === 'ECONNABORTED'` → timeout → `{ title: 'Request timed out', message: 'The server took too long to respond. Please try again.' }`.
5. If `err instanceof Error` → `{ title: 'Something went wrong', message: err.message }`.
6. If `typeof err === 'string'` → `{ title: 'Something went wrong', message: err }`.
7. Else → `{ title: 'Something went wrong', message: 'Unexpected error occurred.' }`.

`titleByStatus`:
- 400 → "Invalid request"
- 401 → "Not authenticated" (note: the axios interceptor handles refresh; if we still get 401 here it means refresh failed)
- 403 → "Not allowed"
- 404 → "Not found"
- 409 → "Conflict"
- 422 → "Validation failed"
- 5xx → "Server error"
- else → "Request failed"

`defaultByStatus` provides a generic message when the body is missing the `error` field.

---

## Task 1: `parseApiError`

**Files:**
- Create: `src/lib/errors/parseApiError.ts`
- Create: `src/lib/errors/parseApiError.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/errors/parseApiError.test.ts
import { AxiosError } from 'axios'
import { parseApiError } from './parseApiError'

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('req failed')
  err.response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as AxiosError['config'],
  } as AxiosError['response']
  return err
}

describe('parseApiError', () => {
  it('uses backend error string + code for 4xx with JSON body', () => {
    const result = parseApiError(
      makeAxiosError(400, { error: 'Insufficient funds', code: 'FUNDS_INSUFFICIENT' })
    )
    expect(result).toEqual({
      title: 'Invalid request',
      message: 'Insufficient funds',
      code: 'FUNDS_INSUFFICIENT',
      status: 400,
    })
  })

  it('falls back to status-based default when body has no error field', () => {
    const result = parseApiError(makeAxiosError(500, {}))
    expect(result.title).toBe('Server error')
    expect(result.message).toMatch(/server/i)
    expect(result.status).toBe(500)
  })

  it('classifies a network error (no response) as network', () => {
    const err = new AxiosError('Network Error')
    expect(parseApiError(err)).toEqual({
      title: 'Network error',
      message: expect.stringMatching(/connection|reach the server/i),
    })
  })

  it('classifies ECONNABORTED as timeout', () => {
    const err = new AxiosError('timeout')
    err.code = 'ECONNABORTED'
    expect(parseApiError(err).title).toBe('Request timed out')
  })

  it('handles a plain Error', () => {
    expect(parseApiError(new Error('boom'))).toEqual({
      title: 'Something went wrong',
      message: 'boom',
    })
  })

  it('handles a string', () => {
    expect(parseApiError('manual error')).toEqual({
      title: 'Something went wrong',
      message: 'manual error',
    })
  })

  it('handles unknown garbage', () => {
    expect(parseApiError({ wat: true })).toEqual({
      title: 'Something went wrong',
      message: 'Unexpected error occurred.',
    })
  })

  it('maps 401 to "Not authenticated"', () => {
    expect(parseApiError(makeAxiosError(401, {})).title).toBe('Not authenticated')
  })

  it('maps 403 to "Not allowed"', () => {
    expect(parseApiError(makeAxiosError(403, {})).title).toBe('Not allowed')
  })

  it('maps 404 to "Not found"', () => {
    expect(parseApiError(makeAxiosError(404, {})).title).toBe('Not found')
  })
})
```

- [ ] **Step 2: Run — FAIL** (`parseApiError` not defined).

- [ ] **Step 3: Implement** per the rules in "Lock the contract". Concrete shape:

```ts
import { AxiosError } from 'axios'

export interface AppError {
  title: string
  message: string
  code?: string
  status?: number
}

const TITLE_BY_STATUS: Record<number, string> = {
  400: 'Invalid request',
  401: 'Not authenticated',
  403: 'Not allowed',
  404: 'Not found',
  409: 'Conflict',
  422: 'Validation failed',
}

function titleByStatus(s: number): string {
  if (TITLE_BY_STATUS[s]) return TITLE_BY_STATUS[s]
  if (s >= 500) return 'Server error'
  return 'Request failed'
}

function defaultByStatus(s: number): string {
  if (s >= 500) return 'The server reported an error. Please try again in a moment.'
  if (s === 401) return 'Your session expired. Please log in again.'
  if (s === 403) return 'You do not have permission to do that.'
  if (s === 404) return 'We could not find what you were looking for.'
  return 'Request could not be completed.'
}

function isAxiosError(err: unknown): err is AxiosError {
  return Boolean(err) && typeof err === 'object' && 'isAxiosError' in (err as object)
}

export function parseApiError(err: unknown): AppError {
  if (isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return {
        title: 'Request timed out',
        message: 'The server took too long to respond. Please try again.',
      }
    }
    if (err.response) {
      const status = err.response.status
      const data = err.response.data as { error?: unknown; code?: unknown } | undefined
      const message =
        typeof data?.error === 'string' ? data.error : defaultByStatus(status)
      return {
        title: titleByStatus(status),
        message,
        ...(typeof data?.code === 'string' ? { code: data.code } : {}),
        status,
      }
    }
    return {
      title: 'Network error',
      message: 'Could not reach the server. Check your connection.',
    }
  }
  if (err instanceof Error) {
    return { title: 'Something went wrong', message: err.message }
  }
  if (typeof err === 'string') {
    return { title: 'Something went wrong', message: err }
  }
  return { title: 'Something went wrong', message: 'Unexpected error occurred.' }
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/lib/errors/parseApiError.ts src/lib/errors/parseApiError.test.ts
git commit -m "feat(errors): add parseApiError"
```

---

## Task 2: `notify` helper

**Files:**
- Create: `src/lib/errors/notify.ts`
- Create: `src/lib/errors/notify.test.ts`
- Create: `src/lib/errors/index.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/lib/errors/notify.test.ts
import { notifyError, notifySuccess } from './notify'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

describe('notifyError', () => {
  it('shows toast.error with title and parsed message', () => {
    notifyError(new Error('boom'))
    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong',
      expect.objectContaining({ description: 'boom' })
    )
  })

  it('does not throw when given undefined', () => {
    expect(() => notifyError(undefined)).not.toThrow()
    expect(toast.error).toHaveBeenCalled()
  })
})

describe('notifySuccess', () => {
  it('shows toast.success', () => {
    notifySuccess('Saved')
    expect(toast.success).toHaveBeenCalledWith('Saved')
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```ts
// src/lib/errors/notify.ts
import { toast } from 'sonner'
import { parseApiError } from './parseApiError'

export function notifyError(err: unknown): void {
  const { title, message } = parseApiError(err)
  toast.error(title, { description: message })
}

export function notifySuccess(message: string): void {
  toast.success(message)
}
```

```ts
// src/lib/errors/index.ts
export { parseApiError } from './parseApiError'
export type { AppError } from './parseApiError'
export { notifyError, notifySuccess } from './notify'
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/lib/errors/notify.ts src/lib/errors/notify.test.ts src/lib/errors/index.ts
git commit -m "feat(errors): add notifyError / notifySuccess helpers"
```

---

## Task 3: `createQueryClient` with global error fallback

**Files:**
- Create: `src/lib/queryClient.ts`
- Create: `src/lib/queryClient.test.ts`

The QueryClient defaults must:
- Call `notifyError(error)` for every query failure where the consumer did NOT supply its own `meta.suppressGlobalError = true`.
- Call `notifyError(error)` for every mutation failure UNLESS the mutation defines its own `onError` callback (TanStack Query v5: `mutation.options.onError` is set).

This is the "never silent" guarantee.

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/queryClient.test.ts
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createQueryClient } from './queryClient'
import { notifyError } from './errors/notify'

jest.mock('./errors/notify', () => ({ notifyError: jest.fn() }))

function wrap(client = createQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => jest.clearAllMocks())

describe('createQueryClient', () => {
  it('queryCache.onError calls notifyError when a query fails', async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['boom'],
          queryFn: () => Promise.reject(new Error('q-fail')),
          retry: false,
        }),
      { wrapper: wrap() }
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(notifyError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('queryCache.onError is suppressed when meta.suppressGlobalError is true', async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['boom-silent'],
          queryFn: () => Promise.reject(new Error('q-fail')),
          retry: false,
          meta: { suppressGlobalError: true },
        }),
      { wrapper: wrap() }
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(notifyError).not.toHaveBeenCalled()
  })

  it('mutationCache.onError fires when mutation has no onError', async () => {
    const { result } = renderHook(
      () => useMutation({ mutationFn: () => Promise.reject(new Error('m-fail')) }),
      { wrapper: wrap() }
    )
    await act(async () => {
      try {
        await result.current.mutateAsync(undefined as unknown)
      } catch {
        /* expected */
      }
    })
    expect(notifyError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('mutationCache.onError does NOT fire when mutation defines onError', async () => {
    const onError = jest.fn()
    const { result } = renderHook(
      () => useMutation({ mutationFn: () => Promise.reject(new Error('m-fail')), onError }),
      { wrapper: wrap() }
    )
    await act(async () => {
      try {
        await result.current.mutateAsync(undefined as unknown)
      } catch {
        /* expected */
      }
    })
    expect(onError).toHaveBeenCalled()
    expect(notifyError).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement**

```ts
// src/lib/queryClient.ts
import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query'
import { notifyError } from './errors/notify'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.suppressGlobalError) return
        notifyError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.options.onError) return
        notifyError(error)
      },
    }),
  })
}
```

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit**

```sh
git add src/lib/queryClient.ts src/lib/queryClient.test.ts
git commit -m "feat(errors): central QueryClient with global notifyError fallback"
```

---

## Task 4: `ErrorFallback` + `AppErrorBoundary`

**Files:**
- Create: `src/components/shared/ErrorFallback.tsx`
- Create: `src/components/shared/ErrorFallback.test.tsx`
- Create: `src/components/shared/AppErrorBoundary.tsx`
- Create: `src/components/shared/AppErrorBoundary.test.tsx`

`ErrorFallback` is a stateless component:

```tsx
// src/components/shared/ErrorFallback.tsx
import { OctagonXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <div role="alert" className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
      <OctagonXIcon className="h-10 w-10 text-destructive" aria-hidden />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        {message ?? 'An unexpected error occurred while rendering this page.'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
```

`AppErrorBoundary` is a class component (React Error Boundaries can only be classes):

```tsx
// src/components/shared/AppErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { notifyError } from '@/lib/errors/notify'

interface State {
  error: Error | null
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error to the user too — boundaries normally only render the fallback
    notifyError(error)
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary caught:', error, info.componentStack)
  }

  reset = (): void => this.setState({ error: null })

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorFallback message={this.state.error.message} onRetry={this.reset} />
    }
    return this.props.children
  }
}
```

Tests should cover:
- ErrorFallback renders the title, message, and (optional) retry button
- AppErrorBoundary catches a child error, renders fallback, calls `notifyError`, resets on retry

- [ ] RED → GREEN → COMMIT for each.

```sh
git commit -m "feat(errors): add AppErrorBoundary + ErrorFallback"
```

---

## Task 5: Mount Toaster + ErrorBoundary in `main.tsx`

**Files:**
- Modify: `src/main.tsx`

Final `main.tsx` shape (the BrowserRouter/Routes section is unchanged; only the providers + boundary + toaster wrap):

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import App from '@/App'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary'
import { createQueryClient } from '@/lib/queryClient'
import './index.css'

const queryClient = createQueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
```

- [ ] Manual verification: start dev server, force a 500 from a mocked endpoint via Devtools Override, confirm toast appears. Document the steps in `docs/error-handling.md` (Task 7).
- [ ] No automated test — `main.tsx` is the composition root and isn't normally unit-tested.
- [ ] COMMIT.

```sh
git add src/main.tsx
git commit -m "feat(errors): mount Toaster and AppErrorBoundary at app root"
```

---

## Task 6: Align `renderWithProviders` with the new QueryClient

**Files:**
- Modify: `src/__tests__/utils/test-utils.tsx`

Replace the inline `new QueryClient(...)` with `createQueryClient()` so tests exercise the same global onError fallback as prod. **Important:** existing tests that assert "an error happens" will start showing toast calls. Audit and adjust:

- [ ] **Step 1:** Switch `renderWithProviders` and `createQueryWrapper` to use `createQueryClient()`.
- [ ] **Step 2:** Run the full suite: `npm test`.
- [ ] **Step 3:** Any test that fails because of an unexpected toast call is signal that prod code was silently swallowing an error — those tests should be updated to also assert the toast (this is the *point* of the migration). Where a test legitimately wants a query to fail without the global fallback, it must add `meta: { suppressGlobalError: true }` to the query under test.

Likely affected tests (audit list — confirm with `grep`):
- `src/components/admin/CreateCardDialog.test.tsx` (already mocks onError, should be unaffected)
- Anywhere else that mocks a query/mutation to reject

- [ ] **Step 4:** All green.
- [ ] **Step 5:** COMMIT.

```sh
git add src/__tests__/utils/test-utils.tsx <any-affected-test-files>
git commit -m "refactor(tests): use createQueryClient in renderWithProviders so tests match prod global onError"
```

---

## Task 7: Developer guide

**Files:**
- Create: `docs/error-handling.md`

Contents (one page, copy-paste examples):

1. **Default behavior:** all React Query errors AND render errors surface to the user automatically. Don't add `try/catch` or `onError` just to call `toast.error` — it's already covered.
2. **When to opt out:** if a query expects to fail (e.g. polling for "is record ready yet?"), set `meta: { suppressGlobalError: true }`.
3. **When to add a custom `onError`:** when you need feature-specific UX (e.g. inline form error, modal, redirect). Setting any `onError` on a mutation suppresses the global toast.
4. **When to call `notifyError` manually:** in non-React-Query contexts — Redux thunk catches, top-level event listeners (e.g. file upload `xhr.onerror`).
5. **When to throw inside a component:** rarely. The boundary catches it, but the user UX is a full-page fallback. Prefer toasts for recoverable errors.
6. **Manual testing:** force a backend 500 by adding `cy.intercept('POST', '...', { statusCode: 500, body: { error: 'forced' } })` in any Cypress test, or use Chrome DevTools "Network → throttling → Offline" to test the network-error branch.

- [ ] Write the doc.
- [ ] COMMIT.

```sh
git add docs/error-handling.md
git commit -m "docs: developer guide for error handling"
```

---

## Task 8: Adopt the new helpers in two existing call-sites (smoke migration)

To prove the new infrastructure works end-to-end, migrate two existing local-state error handlers to either rely on the global fallback (delete the local handler) or call `notifyError` explicitly:

- [ ] `src/pages/NewPaymentPage.tsx` — `setVerificationError('Payment execution failed. Please try again.')` is good UX (shows in the verification widget). Keep the local state, but the underlying mutation no longer needs its `onError` callback when the local message is good enough — review case-by-case. If we keep the verification-error display, also call `notifyError(err)` so the user sees the toast even after dismissing the dialog. **Don't remove behavior the user depends on.**
- [ ] `src/components/admin/CreateCardDialog.tsx` — currently catches `onError` and stuffs the message into a state variable. With the global fallback, this becomes redundant; delete the local error state and let the toast handle it. Update the test accordingly.

- [ ] Each migration in its own commit:

```sh
git commit -m "refactor(payments): rely on global error toast for verification mutation"
git commit -m "refactor(admin): drop local error state in CreateCardDialog (covered by global toast)"
```

These are intentionally tiny — the goal is to validate the migration pattern, not to refactor the entire app in one PR. A follow-up issue can roll out the same migration across the rest of the codebase.

---

## Task 9: Quality gates + spec update

- [ ] **Step 1:** Run gates — `npm test`, `npm run lint`, `npx tsc --noEmit`, `npx prettier --check "src/**/*.{ts,tsx}"`, `npm run build`. All must pass.
- [ ] **Step 2:** Update `specification.md`:
  - Project Structure: add `lib/errors/` subtree, `lib/queryClient.ts`, `components/shared/AppErrorBoundary.tsx`, `components/shared/ErrorFallback.tsx`.
  - §7 State Management: add a new sub-section "Error Handling" describing the global onError policy and the `meta.suppressGlobalError` opt-out.
  - §3 Project Structure / file tree: include the new files.
  - §12 Test Coverage: re-run `npm test -- --coverage --coverageReporters=text` and bump.
  - `_Last updated_` date.
- [ ] **Step 3:** Confirm `grep -rE "/api/v[0-9]" cypress/` is clean (no Cypress changes needed for this plan).
- [ ] **Step 4:** COMMIT.

```sh
git add specification.md
git commit -m "docs: update specification for standardized error handling"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - "Errors are not silently ignored" → global queryCache + mutationCache onError fallbacks. ✅
   - "User gets an error message if either front or back-route doesn't work" → backend errors via parser; render errors via boundary. ✅
   - "Errors should be standardized across the frontend" → one `parseApiError` + one `notifyError`. Single source of truth. ✅
2. **YAGNI:** no error-reporting service integration, no retry button on every toast, no error-categorization logging — all out of scope.
3. **No silent regressions:** the migration test (Task 6) catches places where existing code was silently swallowing errors.
4. **Component size:** every new file ≤150 lines.
5. **TDD:** every implementation step is preceded by a failing test, except `main.tsx` (composition root, no unit test) and `ErrorFallback`'s presentational JSX (still tested via RTL in Task 4).
6. **Reversible:** if the global onError turns out too noisy in a corner case, the per-call opt-out (`meta.suppressGlobalError` or providing a custom `onError`) is already the escape hatch.

---

## Open questions to resolve before starting

1. Do we want the toast to be auto-dismissed (default Sonner behavior) or sticky for errors? Recommend sticky-on-error (`toast.error(title, { description, duration: Infinity })`) so users can read it; users can swipe to dismiss. **Pick one before Task 2 implementation.**
2. Should the boundary catch *router-level* errors too? React Router v6 has `errorElement` for this. Consider Task 10 follow-up: add `errorElement={<ErrorFallback />}` to top-level routes. Out of scope here unless requested.
3. Are there features that actually want a silent retry on transient failure (e.g. SSE / polling)? If so, those should set `suppressGlobalError` from day one — call out in `docs/error-handling.md`.
