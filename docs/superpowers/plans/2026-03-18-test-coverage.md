# Hook & Slice Test Coverage Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing unit tests for all TanStack Query hooks and Redux Toolkit slices that were specified in the original plans but not implemented.

**Architecture:** Hook tests use `renderHook` from `@testing-library/react` (NOT the deprecated `@testing-library/react-hooks`) with `createQueryWrapper()`. Slice tests use plain Redux `configureStore` with action dispatch assertions. All tests mock API functions at the `@/lib/api/*` level.

**Execution order:** This plan should run AFTER `2026-03-18-missing-features.md`, since that plan deletes `useCreateLoanRequest` and restructures `useUpdatePaymentRecipient`.

**Tech Stack:** Jest, React Testing Library, TanStack Query, Redux Toolkit

**Depends on:** All existing hooks and slices in the codebase.

---

## File Structure

```
src/
  hooks/
    useAccounts.test.ts
    useClients.test.ts
    useCards.test.ts
    useExchange.test.ts
    useTransfers.test.ts
    useLoans.test.ts
    usePayments.test.ts
  store/
    slices/
      transferSlice.test.ts
      paymentSlice.test.ts
      loanSlice.test.ts
```

---

## Chunk 1: Hook Tests

All hook tests follow the same pattern:

**Query hook template:**

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import * as api from '@/lib/api/<module>'
import { use<Hook> } from '@/hooks/use<Module>'
import { createMock<Entity> } from '@/__tests__/fixtures/<module>-fixtures'

jest.mock('@/lib/api/<module>')

describe('use<Hook>', () => {
  it('returns data on success', async () => {
    const mock = createMock<Entity>()
    jest.mocked(api.<function>).mockResolvedValue(mock)
    const { result } = renderHook(() => use<Hook>(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.data).toEqual(mock))
  })
})
```

**Mutation hook template:**

```typescript
describe('use<MutationHook>', () => {
  it('calls API and invalidates queries on success', async () => {
    const mock = createMock<Entity>()
    jest.mocked(api.<function>).mockResolvedValue(mock)
    const { result } = renderHook(() => use<MutationHook>(), { wrapper: createQueryWrapper() })
    result.current.mutate(payload)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.<function>).toHaveBeenCalledWith(payload)
  })
})
```

### Task 1.1: useAccounts.test.ts

**Files:**
- Create: `src/hooks/useAccounts.test.ts`

- [ ] **Step 1: Write tests**

Test `useClientAccounts`, `useAccount(id)`, `useCreateAccount`, `useUpdateAccount(id)`, `useAllAccounts(filters)`. Each test mocks the corresponding API function and verifies data is returned.

- [ ] **Step 2: Run tests — verify they pass**

Run: `npm test -- useAccounts.test`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAccounts.test.ts
git commit -m "test: add useAccounts hook tests"
```

---

### Task 1.2: useClients.test.ts

**Files:**
- Create: `src/hooks/useClients.test.ts`

- [ ] **Step 1: Write tests**

Test `useSearchClients(query)` (enabled only when query.length > 0), `useAllClients(filters)`, `useClient(id)`, `useCreateClient`, `useUpdateClient(id)`.

- [ ] **Step 2: Run and commit**

---

### Task 1.3: useCards.test.ts

- Create: `src/hooks/useCards.test.ts`

Test `useCards`, `useAccountCards(id)`, `useRequestCard`, `useConfirmCardRequest`, `useBlockCard`, `useUnblockCard`, `useDeactivateCard`, `useRequestCardForAuthorizedPerson`.

---

### Task 1.4: useExchange.test.ts

- Create: `src/__tests__/fixtures/exchange-fixtures.ts` — create `createMockExchangeRate()` and `createMockConversionResult()` factories
- Create: `src/hooks/useExchange.test.ts`

Note: No exchange fixtures exist yet. Create them first, then test `useExchangeRates`, `useConvertCurrency`, `useExchangeRate`.

---

### Task 1.5: useTransfers.test.ts

- Create: `src/hooks/useTransfers.test.ts`

Test `useTransfers(filters)`, `useTransferPreview`.

---

### Task 1.6: useLoans.test.ts

- Create: `src/hooks/useLoans.test.ts`

Test `useLoans`, `useLoan(id)`, `useLoanRequests(filters)`, `useApproveLoanRequest`, `useRejectLoanRequest`, `useAllLoans(filters)`.

Note: `useCreateLoanRequest` was removed in the missing-features plan (dead code). Do NOT test it.

---

### Task 1.7: usePayments.test.ts

- Create: `src/hooks/usePayments.test.ts`

Test `usePayments(filters)`, `usePaymentRecipients`, `useCreatePaymentRecipient`, `useUpdatePaymentRecipient(id)`, `useDeletePaymentRecipient`.

---

## Chunk 2: Redux Slice Tests

All slice tests follow:

```typescript
import { configureStore } from '@reduxjs/toolkit'
import reducer, { <actions> } from '@/store/slices/<slice>'

function createStore() {
  return configureStore({ reducer: { <name>: reducer } })
}

describe('<slice>', () => {
  it('sets step', () => {
    const store = createStore()
    store.dispatch(setStep('confirmation'))
    expect(store.getState().<name>.step).toBe('confirmation')
  })
  // ...
})
```

### Task 2.1: transferSlice.test.ts

**Files:**
- Create: `src/store/slices/transferSlice.test.ts`

- [ ] **Step 1: Write tests**

Test: `setTransferStep`, `setTransferFormData`, `setTransferPreview`, `resetTransferFlow`, `submitTransfer` (pending/fulfilled/rejected).

For the async thunk, mock `@/lib/api/transfers` `createTransfer`.

- [ ] **Step 2: Run and commit**

---

### Task 2.2: paymentSlice.test.ts

- Create: `src/store/slices/paymentSlice.test.ts`

Test: `setPaymentStep`, `setPaymentFlowType`, `setPaymentFormData`, `resetPaymentFlow`, `submitPayment` for both `'payment'` and `'internal'` types.

---

### Task 2.3: loanSlice.test.ts

- Create: `src/store/slices/loanSlice.test.ts`

Test: `setLoanStep`, `setLoanFormData`, `resetLoanFlow`, `submitLoanRequest` (pending/fulfilled/rejected).

---

## Chunk 3: Final Verification

### Task 3.1: Full test suite

- [ ] **Step 1: Run all tests with coverage**

```bash
npm test -- --coverage --passWithNoTests
```

- [ ] **Step 2: Verify new test files all pass**

Expected: 75+ test suites, 200+ tests, all pass

- [ ] **Step 3: Verify all tests pass**

Note: Each task (1.1-2.3) should be committed individually as shown in their commit steps. This final step is a verification that the full suite passes together.
