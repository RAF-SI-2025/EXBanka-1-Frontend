# Error Handling — Developer Guide

This document describes how errors flow through the EXBanka frontend and how to add (or NOT add) error handling when you build a new feature.

> **Mandatory.** Every feature you ship MUST surface its errors through this system. See `CLAUDE.md` for the policy. There are exactly two correct outcomes for any failure: a toast (default) or feature-specific UX (you decide). There is no third "swallow it silently" option.

---

## TL;DR

You almost certainly do not need to write any error-handling code. The infrastructure does it for you:

| What failed | What happens |
|---|---|
| A `useQuery` rejects | Global toast: "Server error" / "Network error" / etc. |
| A `useMutation` rejects (and you didn't pass `onError`) | Global toast |
| A render throws | `<AppErrorBoundary>` shows a fallback page + toast |
| A non–React-Query call rejects (Redux thunk, raw axios, `xhr.onerror`) | You call `notifyError(err)` yourself |

**If you find yourself writing `catch (e) { setErrorState(...) }` for the *only* purpose of showing a message, delete it. It's already covered.**

---

## The pieces

```
src/lib/errors/parseApiError.ts   — pure: unknown -> AppError { title, message, code?, status? }
src/lib/errors/notify.ts          — notifyError(err) calls toast.error(title, { description: message })
src/lib/errors/index.ts           — barrel: import { notifyError, notifySuccess } from '@/lib/errors'
src/lib/queryClient.ts            — createQueryClient() with global queryCache/mutationCache.onError
src/components/shared/AppErrorBoundary.tsx — class boundary mounted at the router root
src/components/shared/ErrorFallback.tsx    — the fallback page UI
src/main.tsx                      — mounts <Toaster>, the boundary, and the QueryClient
```

The backend error envelope `parseApiError` understands:

```json
{ "error": "Insufficient funds", "code": "FUNDS_INSUFFICIENT" }
```

For 4xx/5xx, the toast title comes from the HTTP status (`Invalid request`, `Not allowed`, `Server error`, …) and the description comes from `data.error`. If `data.error` is missing, a generic per-status message is used. Network failures (no response) become a "Network error" toast.

---

## Recipes

### 1. New query — do nothing

```ts
const { data, isLoading } = useQuery({
  queryKey: ['accounts', id],
  queryFn: () => getAccount(id),
})
```

If the request fails the user gets a toast. Done.

### 2. New mutation that should toast on failure — do nothing

```ts
const { mutate } = useMutation({ mutationFn: deleteCard })
// ...
mutate(cardId, { onSuccess: () => notifySuccess('Card deleted') })
```

You don't need `onError`. The global fallback fires.

### 3. New mutation with feature-specific error UX

Setting **any** `onError` suppresses the global toast — you own the error display:

```ts
const { mutate } = useMutation({
  mutationFn: createPayment,
  onError: (err) => {
    setVerificationError('Payment failed. Please review and try again.')
    notifyError(err) // <- still toast it so the user sees the actual reason
  },
})
```

Calling `notifyError(err)` inside your custom `onError` is recommended unless your inline UX *fully replaces* the toast (e.g. a blocking modal).

### 4. A query that is *expected* to fail (polling, etc.) — opt out

```ts
useQuery({
  queryKey: ['job', jobId, 'status'],
  queryFn: () => getJobStatus(jobId),
  meta: { suppressGlobalError: true },
})
```

`meta.suppressGlobalError` is the only documented opt-out for queries.

### 5. A non-React-Query call (Redux thunk, raw axios, file upload xhr)

```ts
import { notifyError } from '@/lib/errors'

try {
  const result = await api.somethingRare()
  return result
} catch (err) {
  notifyError(err)
  throw err
}
```

Don't write your own `parseApiError` / `toast.error` plumbing. Use `notifyError`.

### 6. Showing a success toast

```ts
import { notifySuccess } from '@/lib/errors'
notifySuccess('Saved')
```

---

## Anti-patterns

- **`console.error(err)` and nothing else** — the user never sees it. Either let the global fallback handle it, or call `notifyError(err)` explicitly.
- **`catch { /* ignore */ }`** — never. If you genuinely don't care about the failure, you should still understand *why* it can fail and document the reason in a comment. Almost always this is wrong.
- **Custom error parsing** — don't write `if (err.response.status === 400) ... else if ...`. Use `parseApiError(err)` if you really need the parsed shape. Better: just `notifyError(err)` and let the parser do its job.
- **Empty mutation `onError`** — `onError: () => {}` suppresses the global toast and shows nothing. The user will think the operation succeeded. Either call `notifyError(err)` or remove the handler.

---

## Manual testing

To confirm the global fallback works in the running app:

1. Start a dev server (`npm run dev`).
2. Open Chrome DevTools → Network → Throttling → Offline.
3. Trigger any action that fires a query/mutation. You should see a "Network error" toast.
4. Set throttling back to Online. In DevTools → Network → right-click a request → "Block request URL". Repeat the action. You'll get the same toast (request fails because Chrome blocks it).
5. To test render-level errors, edit a page to `throw new Error('forced')` and visit it. The boundary should render and you should also see a toast.

For Cypress smoke testing of the error path, use `cy.intercept(...)` with `{ statusCode: 500, body: { error: 'forced' } }` and assert the toast text appears.

---

## When to add tests

- **Unit:** the error-handling infrastructure itself has full coverage; you don't need to test that it works.
- **Component:** if your feature *renders* an error inline (form-field validation, in-page banners), test that path. Don't test the global toast — it's covered.
- **Cypress:** smoke a backend 4xx/5xx for at least the most user-visible flows in your feature. Decode the JWT and confirm the fixture matches per the rule in CLAUDE.md.
