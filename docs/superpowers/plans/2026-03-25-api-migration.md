# API Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all frontend API calls to match the new REST API (MIGRATION.md), and remove the verification step from the client card request form.

**Architecture:** Update `src/lib/api/` functions first (URL/method corrections), then ripple changes up through hooks, Redux slices, and pages. Add `executePayment`/`executeTransfer` API functions to replace the old separate generate+validate verification flow. Remove `confirmCardRequest` which called a non-existent endpoint.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Redux Toolkit, Axios, Cypress

---

## Chunk 1: API Layer — Client Self-Service Routes (`/api/me/*`)

Files modified:
- `src/lib/api/clients.ts`
- `src/lib/api/accounts.ts`
- `src/lib/api/cards.ts`
- `src/lib/api/payments.ts`
- `src/lib/api/transfers.ts`
- `src/lib/api/loans.ts`
- `src/lib/api/verification.ts`

---

### Task 1: Fix `clients.ts` — `getClientMe`

**Files:**
- Modify: `src/lib/api/clients.ts:25-28`

Old: `GET /api/clients/me`
New: `GET /api/me`

- [ ] **Step 1: Edit `getClientMe` in `src/lib/api/clients.ts`**

```ts
export async function getClientMe(): Promise<Client> {
  const response = await apiClient.get<Client>('/api/me')
  return response.data
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npm run lint && npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/clients.ts
git commit -m "fix(api): getClientMe uses /api/me instead of /api/clients/me"
```

---

### Task 2: Fix `accounts.ts` — `getClientAccounts`

**Files:**
- Modify: `src/lib/api/accounts.ts:11-14`

Old: `GET /api/accounts/client/${clientId}` (client-side call)
New: `GET /api/me/accounts` (no `clientId` param needed — identity from JWT)

- [ ] **Step 1: Update `getClientAccounts` signature and URL**

```ts
export async function getClientAccounts(): Promise<AccountListResponse> {
  const response = await apiClient.get<AccountListResponse>('/api/me/accounts')
  return response.data
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: TypeScript errors pointing to `useAccounts.ts` — fix in Task 9.

- [ ] **Step 3: Commit (after Task 9 fixes the hook)**

Will be committed together with hook fix.

---

### Task 3: Fix `cards.ts` — client routes + method changes + new function

**Files:**
- Modify: `src/lib/api/cards.ts`

Changes:
- `getCards(clientId)` → `GET /api/me/cards` (no clientId)
- `getAccountCards(accountNumber)` → `GET /api/cards?account_number=X` (query param)
- `requestCard(...)` → `POST /api/me/cards/requests`
- `blockCard`: `PUT` → `POST /api/cards/:id/block` (admin, method change only)
- `unblockCard`: `PUT` → `POST /api/cards/:id/unblock`
- `deactivateCard`: `PUT` → `POST /api/cards/:id/deactivate`
- `approveCardRequest`: `PUT` → `POST /api/cards/requests/:id/approve`
- `rejectCardRequest`: `PUT` → `POST /api/cards/requests/:id/reject`
- ADD `temporaryBlockCard(cardId, durationHours, reason?)` → `POST /api/me/cards/:id/temporary-block`
- REMOVE `confirmCardRequest` (calls non-existent `/api/cards/confirm`)

- [ ] **Step 1: Rewrite `src/lib/api/cards.ts`**

```ts
import { apiClient } from '@/lib/api/axios'
import type { Card } from '@/types/card'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardRequest, CardRequestListResponse, CardRequestFilters } from '@/types/cardRequest'

export async function getCards(): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>('/api/me/cards')
  return response.data.cards
}

export async function getAccountCards(accountNumber: string): Promise<Card[]> {
  const response = await apiClient.get<{ cards: Card[] }>('/api/cards', {
    params: { account_number: accountNumber },
  })
  return response.data.cards
}

export async function requestCard(
  account_number: string,
  card_brand?: string
): Promise<CardRequest> {
  const response = await apiClient.post<CardRequest>('/api/me/cards/requests', {
    account_number,
    ...(card_brand ? { card_brand } : {}),
  })
  return response.data
}

export async function temporaryBlockCard(
  cardId: number,
  durationHours: number = 12,
  reason?: string
): Promise<void> {
  await apiClient.post(`/api/me/cards/${cardId}/temporary-block`, {
    duration_hours: durationHours,
    ...(reason ? { reason } : {}),
  })
}

export async function blockCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/cards/${cardId}/block`)
}

export async function unblockCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/cards/${cardId}/unblock`)
}

export async function deactivateCard(cardId: number): Promise<void> {
  await apiClient.post(`/api/cards/${cardId}/deactivate`)
}

export async function requestCardForAuthorizedPerson(
  authorized_person: CreateAuthorizedPersonRequest & { account_id: number }
): Promise<{ id: number }> {
  const response = await apiClient.post<{ id: number }>(
    '/api/cards/authorized-person',
    authorized_person
  )
  return response.data
}

export async function getCardRequests(
  filters?: CardRequestFilters
): Promise<CardRequestListResponse> {
  const response = await apiClient.get<CardRequestListResponse>('/api/cards/requests', {
    params: filters,
  })
  return response.data
}

export async function approveCardRequest(id: number): Promise<void> {
  await apiClient.post(`/api/cards/requests/${id}/approve`)
}

export async function rejectCardRequest(id: number, reason: string): Promise<void> {
  await apiClient.post(`/api/cards/requests/${id}/reject`, { reason })
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors from hooks importing `confirmCardRequest` — fix in Task 10.

---

### Task 4: Fix `payments.ts` — client routes + add `executePayment`

**Files:**
- Modify: `src/lib/api/payments.ts`

Changes:
- `createPayment`: `POST /api/payments` → `POST /api/me/payments`
- `getPayments(filters?)`: `GET /api/payments/account/:n` → `GET /api/me/payments` (no accountNumber param)
- `getPaymentRecipients()`: `GET /api/payment-recipients/:clientId` → `GET /api/me/payment-recipients` (no clientId)
- `createPaymentRecipient`: `POST /api/payment-recipients` → `POST /api/me/payment-recipients`
- `updatePaymentRecipient`: `PUT /api/payment-recipients/:id` → `PUT /api/me/payment-recipients/:id`
- `deletePaymentRecipient`: `DELETE /api/payment-recipients/:id` → `DELETE /api/me/payment-recipients/:id`
- ADD `executePayment(id, verificationCode)` → `POST /api/me/payments/:id/execute`

- [ ] **Step 1: Rewrite `src/lib/api/payments.ts`**

```ts
import { apiClient } from '@/lib/api/axios'
import type {
  Payment,
  PaymentListResponse,
  PaymentFilters,
  CreatePaymentRequest,
  PaymentRecipient,
  CreatePaymentRecipientRequest,
} from '@/types/payment'

export async function createPayment(payload: CreatePaymentRequest): Promise<Payment> {
  const response = await apiClient.post<Payment>('/api/me/payments', payload)
  return response.data
}

export async function executePayment(id: number, verificationCode: string): Promise<Payment> {
  const response = await apiClient.post<Payment>(`/api/me/payments/${id}/execute`, {
    verification_code: verificationCode,
  })
  return response.data
}

export async function getPayments(filters?: PaymentFilters): Promise<PaymentListResponse> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.status_filter) params.append('status_filter', filters.status_filter)
  if (filters?.amount_min) params.append('amount_min', String(filters.amount_min))
  if (filters?.amount_max) params.append('amount_max', String(filters.amount_max))
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<PaymentListResponse>('/api/me/payments', { params })
  return response.data
}

export async function getPaymentRecipients(): Promise<PaymentRecipient[]> {
  const response = await apiClient.get<{ recipients: PaymentRecipient[] }>(
    '/api/me/payment-recipients'
  )
  return response.data.recipients
}

export async function createPaymentRecipient(
  payload: Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>
): Promise<PaymentRecipient> {
  const response = await apiClient.post<PaymentRecipient>('/api/me/payment-recipients', payload)
  return response.data
}

export async function updatePaymentRecipient(
  id: number,
  payload: Partial<Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>>
): Promise<PaymentRecipient> {
  const response = await apiClient.put<PaymentRecipient>(
    `/api/me/payment-recipients/${id}`,
    payload
  )
  return response.data
}

export async function deletePaymentRecipient(id: number): Promise<void> {
  await apiClient.delete(`/api/me/payment-recipients/${id}`)
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors from hooks using old signatures — fix in Task 11.

---

### Task 5: Fix `transfers.ts` — client routes + add `executeTransfer`

**Files:**
- Modify: `src/lib/api/transfers.ts`

Changes:
- `createTransfer`: `POST /api/transfers` → `POST /api/me/transfers`
- `getTransfers(filters?)`: `GET /api/transfers/client/:clientId` → `GET /api/me/transfers` (no clientId)
- ADD `executeTransfer(id, verificationCode)` → `POST /api/me/transfers/:id/execute`

- [ ] **Step 1: Rewrite `src/lib/api/transfers.ts`**

```ts
import { apiClient } from '@/lib/api/axios'
import type {
  Transfer,
  TransferListResponse,
  TransferFilters,
  CreateTransferRequest,
} from '@/types/transfer'

export async function createTransfer(payload: CreateTransferRequest): Promise<Transfer> {
  const response = await apiClient.post<Transfer>('/api/me/transfers', payload)
  return response.data
}

export async function executeTransfer(id: number, verificationCode: string): Promise<Transfer> {
  const response = await apiClient.post<Transfer>(`/api/me/transfers/${id}/execute`, {
    verification_code: verificationCode,
  })
  return response.data
}

export async function getTransfers(filters?: TransferFilters): Promise<TransferListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<TransferListResponse>('/api/me/transfers', { params })
  return response.data
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors from hooks using old signatures — fix in Task 12.

---

### Task 6: Fix `loans.ts` — client routes + employee method changes

**Files:**
- Modify: `src/lib/api/loans.ts`

Changes:
- `getLoans()`: `GET /api/loans/client/:clientId` → `GET /api/me/loans` (no clientId)
- `createLoanRequest`: `POST /api/loans/requests` → `POST /api/me/loan-requests`
- `getLoanRequests`: `GET /api/loans/requests` → `GET /api/loan-requests`
- `approveLoanRequest`: `PUT /api/loans/requests/:id/approve` → `POST /api/loan-requests/:id/approve`
- `rejectLoanRequest`: `PUT /api/loans/requests/:id/reject` → `POST /api/loan-requests/:id/reject`

- [ ] **Step 1: Rewrite `src/lib/api/loans.ts`**

```ts
import { apiClient } from '@/lib/api/axios'
import type {
  Loan,
  LoanListResponse,
  LoanRequest,
  LoanRequestListResponse,
  LoanFilters,
  LoanRequestFilters,
  CreateLoanRequest,
} from '@/types/loan'

export async function getLoans(): Promise<LoanListResponse> {
  const response = await apiClient.get<LoanListResponse>('/api/me/loans')
  return response.data
}

export async function getLoan(id: number): Promise<Loan> {
  const response = await apiClient.get<Loan>(`/api/loans/${id}`)
  return response.data
}

export async function createLoanRequest(payload: CreateLoanRequest): Promise<LoanRequest> {
  const response = await apiClient.post<LoanRequest>('/api/me/loan-requests', payload)
  return response.data
}

export async function getLoanRequests(
  filters?: LoanRequestFilters
): Promise<LoanRequestListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type_filter', filters.loan_type)
  if (filters?.account_number) params.append('account_number_filter', filters.account_number)
  if (filters?.status) params.append('status_filter', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanRequestListResponse>('/api/loan-requests', { params })
  return response.data
}

export async function approveLoanRequest(id: number): Promise<void> {
  await apiClient.post(`/api/loan-requests/${id}/approve`)
}

export async function rejectLoanRequest(id: number): Promise<void> {
  await apiClient.post(`/api/loan-requests/${id}/reject`)
}

export async function getAllLoans(filters?: LoanFilters): Promise<LoanListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type_filter', filters.loan_type)
  if (filters?.account_number) params.append('account_number_filter', filters.account_number)
  if (filters?.status) params.append('status_filter', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanListResponse>('/api/loans', { params })
  return response.data
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors from hooks using old signatures — fix in Task 13.

---

### Task 7: Fix `verification.ts` — move to `/api/me/verification`

**Files:**
- Modify: `src/lib/api/verification.ts`

Changes:
- `generateVerificationCode`: `POST /api/verification` → `POST /api/me/verification`
- `validateVerificationCode`: `POST /api/verification/validate` → `POST /api/me/verification/validate`

- [ ] **Step 1: Edit `src/lib/api/verification.ts`**

```ts
import { apiClient } from '@/lib/api/axios'
import type {
  GenerateVerificationRequest,
  GenerateVerificationResponse,
  ValidateVerificationRequest,
  ValidateVerificationResponse,
} from '@/types/verification'

export async function generateVerificationCode(
  payload: GenerateVerificationRequest
): Promise<GenerateVerificationResponse> {
  const { data } = await apiClient.post('/api/me/verification', payload)
  return data
}

export async function validateVerificationCode(
  payload: ValidateVerificationRequest
): Promise<ValidateVerificationResponse> {
  const { data } = await apiClient.post('/api/me/verification/validate', payload)
  return data
}
```

- [ ] **Step 2: Run lint/types check + tests**

Run: `npm run lint && npx tsc --noEmit`
Expected: 0 new errors from verification.ts itself.

- [ ] **Step 3: Commit all API layer changes (Tasks 1–7)**

```bash
git add src/lib/api/clients.ts src/lib/api/accounts.ts src/lib/api/cards.ts \
        src/lib/api/payments.ts src/lib/api/transfers.ts src/lib/api/loans.ts \
        src/lib/api/verification.ts
git commit -m "fix(api): migrate all endpoints to new REST API paths and methods"
```

---

## Chunk 2: Hook Layer — Update Signatures and Add New Hooks

Files modified:
- `src/hooks/useAccounts.ts`
- `src/hooks/useCards.ts`
- `src/hooks/usePayments.ts`
- `src/hooks/useTransfers.ts`
- `src/hooks/useLoans.ts`

---

### Task 8: Update `useAccounts.ts` — remove `clientId` dependency

**Files:**
- Modify: `src/hooks/useAccounts.ts:19-27`

`useClientAccounts` used `clientId` from Redux to call `getClientAccounts(clientId)`. Now `getClientAccounts()` takes no args.

- [ ] **Step 1: Edit `useClientAccounts` in `src/hooks/useAccounts.ts`**

```ts
export function useClientAccounts() {
  return useQuery({
    queryKey: ['accounts', 'me'],
    queryFn: () => getClientAccounts(),
  })
}
```

Remove `useAppSelector` and `selectCurrentUser` imports if no longer used elsewhere in the file.

- [ ] **Step 2: Verify import cleanup**

Check that `useAppSelector` import is removed if unused. The other functions in the file don't use it.

Updated import block:
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientAccounts,
  getAccount,
  createAccount,
  updateAccountName,
  updateAccountLimits,
  getAllAccounts,
} from '@/lib/api/accounts'
import type {
  AccountFilters,
  CreateAccountRequest,
  UpdateAccountNameRequest,
  UpdateAccountLimitsRequest,
} from '@/types/account'
```

- [ ] **Step 3: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 9: Update `useCards.ts` — remove `clientId`, add `useTemporaryBlockCard`, remove `useConfirmCardRequest`

**Files:**
- Modify: `src/hooks/useCards.ts`

- [ ] **Step 1: Rewrite `src/hooks/useCards.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCards,
  getAccountCards,
  requestCard,
  blockCard,
  unblockCard,
  deactivateCard,
  temporaryBlockCard,
  requestCardForAuthorizedPerson,
  getCardRequests,
  approveCardRequest,
  rejectCardRequest,
} from '@/lib/api/cards'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardRequestFilters } from '@/types/cardRequest'

export function useCards() {
  return useQuery({
    queryKey: ['cards', 'me'],
    queryFn: () => getCards(),
  })
}

export function useAccountCards(accountNumber: string) {
  return useQuery({
    queryKey: ['cards', 'account', accountNumber],
    queryFn: () => getAccountCards(accountNumber),
    enabled: !!accountNumber,
  })
}

export function useRequestCard() {
  return useMutation({
    mutationFn: ({ account_number, card_brand }: { account_number: string; card_brand?: string }) =>
      requestCard(account_number, card_brand),
  })
}

export function useTemporaryBlockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      cardId,
      durationHours = 12,
      reason,
    }: {
      cardId: number
      durationHours?: number
      reason?: string
    }) => temporaryBlockCard(cardId, durationHours, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useBlockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => blockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useUnblockCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => unblockCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useDeactivateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) => deactivateCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useRequestCardForAuthorizedPerson() {
  return useMutation({
    mutationFn: (payload: CreateAuthorizedPersonRequest & { account_id: number }) =>
      requestCardForAuthorizedPerson(payload),
  })
}

export function useCardRequests(filters?: CardRequestFilters) {
  return useQuery({
    queryKey: ['card-requests', filters],
    queryFn: () => getCardRequests(filters),
  })
}

export function useApproveCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveCardRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}

export function useRejectCardRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectCardRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] })
    },
  })
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors in `CardRequestPage.tsx` (imports `useConfirmCardRequest`) — fixed in Task 16.

---

### Task 10: Update `usePayments.ts` — remove `clientId`/`accountNumber`, add `useExecutePayment`

**Files:**
- Modify: `src/hooks/usePayments.ts`

- [ ] **Step 1: Rewrite `src/hooks/usePayments.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPayments,
  getPaymentRecipients,
  createPaymentRecipient,
  updatePaymentRecipient,
  deletePaymentRecipient,
  executePayment,
} from '@/lib/api/payments'
import type { PaymentFilters, CreatePaymentRecipientRequest } from '@/types/payment'

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPayments(filters),
  })
}

export function usePaymentRecipients() {
  return useQuery({
    queryKey: ['payment-recipients'],
    queryFn: () => getPaymentRecipients(),
  })
}

export function useCreatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      payload: Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>
    ) => createPaymentRecipient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useUpdatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: number } & Partial<
      Pick<CreatePaymentRecipientRequest, 'recipient_name' | 'account_number'>
    >) => updatePaymentRecipient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useDeletePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePaymentRecipient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}

export function useExecutePayment() {
  return useMutation({
    mutationFn: ({ id, verificationCode }: { id: number; verificationCode: string }) =>
      executePayment(id, verificationCode),
  })
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors in pages that call `usePayments(accountNumber, filters)` — fixed in Tasks 18–20.

---

### Task 11: Update `useTransfers.ts` — remove `clientId`, add `useExecuteTransfer`

**Files:**
- Modify: `src/hooks/useTransfers.ts`

- [ ] **Step 1: Rewrite `src/hooks/useTransfers.ts`**

```ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTransfers, executeTransfer } from '@/lib/api/transfers'
import { getExchangeRate } from '@/lib/api/exchange'
import type { TransferFilters } from '@/types/transfer'

export function useTransfers(filters?: TransferFilters) {
  return useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => getTransfers(filters),
  })
}

export function useTransferPreview(fromCurrency: string, toCurrency: string, amount: number) {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency, amount],
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency && amount > 0,
  })
}

export function useExecuteTransfer() {
  return useMutation({
    mutationFn: ({ id, verificationCode }: { id: number; verificationCode: string }) =>
      executeTransfer(id, verificationCode),
  })
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: Errors in pages that called `getTransfers(clientId, filters)` — fixed in Tasks 21–23.

---

### Task 12: Update `useLoans.ts` — remove `clientId`

**Files:**
- Modify: `src/hooks/useLoans.ts:14-22`

- [ ] **Step 1: Edit `useLoans` in `src/hooks/useLoans.ts`**

```ts
export function useLoans() {
  return useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => getLoans(),
  })
}
```

Remove `useAppSelector` and `selectCurrentUser` imports if no longer used elsewhere in the file.

Updated import block (remove unused imports):
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLoans,
  getLoan,
  getLoanRequests,
  approveLoanRequest,
  rejectLoanRequest,
  getAllLoans,
} from '@/lib/api/loans'
import type { LoanFilters, LoanRequestFilters } from '@/types/loan'
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit all hook changes (Tasks 8–12)**

```bash
git add src/hooks/useAccounts.ts src/hooks/useCards.ts src/hooks/usePayments.ts \
        src/hooks/useTransfers.ts src/hooks/useLoans.ts
git commit -m "fix(hooks): update signatures for new API endpoints, add execute hooks, remove confirm"
```

---

## Chunk 3: Redux Slices — Auto-send code on create

Files modified:
- `src/store/slices/paymentSlice.ts`
- `src/store/slices/transferSlice.ts`

---

### Task 13: Update `paymentSlice.ts` — store `flowType` on pending, set `codeRequested` on fulfilled

**Files:**
- Modify: `src/store/slices/paymentSlice.ts:84-101`

When a payment or internal transfer is created, the verification code is now auto-sent by the backend. Set `codeRequested: true` immediately when the thunk fulfills, and store the `flowType` from the action argument so pages know which execute endpoint to call.

- [ ] **Step 1: Edit `extraReducers` in `paymentSlice.ts`**

```ts
extraReducers: (builder) => {
  builder
    .addCase(submitPayment.pending, (state, action) => {
      state.submitting = true
      state.error = null
      state.flowType = action.meta.arg.type
    })
    .addCase(submitPayment.fulfilled, (state, action) => {
      state.submitting = false
      state.result = action.payload
      state.transactionId = action.payload.id
      state.step = 'verification'
      state.codeRequested = true
    })
    .addCase(submitPayment.rejected, (state, action) => {
      state.submitting = false
      state.error = action.payload as string
    })
},
```

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern=paymentSlice`
Expected: All pass (existing tests may test step transitions — verify they still work)

- [ ] **Step 3: Commit**

```bash
git add src/store/slices/paymentSlice.ts
git commit -m "fix(slice): store flowType on pending, set codeRequested on payment submit fulfilled"
```

---

### Task 14: Update `transferSlice.ts` — set `codeRequested` on fulfilled

**Files:**
- Modify: `src/store/slices/transferSlice.ts:76-92`

- [ ] **Step 1: Edit `extraReducers` in `transferSlice.ts`**

```ts
extraReducers: (builder) => {
  builder
    .addCase(submitTransfer.pending, (state) => {
      state.submitting = true
      state.error = null
    })
    .addCase(submitTransfer.fulfilled, (state, action) => {
      state.submitting = false
      state.result = action.payload
      state.transactionId = action.payload.id
      state.step = 'verification'
      state.codeRequested = true
    })
    .addCase(submitTransfer.rejected, (state, action) => {
      state.submitting = false
      state.error = action.payload as string
    })
},
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/store/slices/transferSlice.ts
git commit -m "fix(slice): set codeRequested on transfer submit fulfilled (code auto-sent by backend)"
```

---

## Chunk 4: Card Request — Remove Verification Step

Files modified:
- `src/pages/CardRequestPage.tsx`
- `src/pages/CardRequestPage.test.tsx`

---

### Task 15: Remove verification step from `CardRequestPage.tsx`

**Files:**
- Modify: `src/pages/CardRequestPage.tsx`

The card request flow previously went: select → (business-choice) → verify → success.
After: select → (business-choice) → success.

The `/api/cards/confirm` endpoint does not exist in the REST API. Removing the verify step means the user gets a confirmation message immediately after the request is submitted.

- [ ] **Step 1: Rewrite `src/pages/CardRequestPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useRequestCard, useRequestCardForAuthorizedPerson } from '@/hooks/useCards'
import { CardRequestForm } from '@/components/cards/CardRequestForm'
import { AuthorizedPersonForm } from '@/components/cards/AuthorizedPersonForm'
import { Button } from '@/components/ui/button'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardBrand } from '@/types/card'

type Step = 'select' | 'business-choice' | 'authorized-person' | 'success'

export function CardRequestPage() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const requestCard = useRequestCard()
  const requestForAP = useRequestCardForAuthorizedPerson()
  const [step, setStep] = useState<Step>('select')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<CardBrand | undefined>()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <p>Loading...</p>

  const onMutationError = () => setError('An error occurred. Please try again.')

  const handleSelectAccount = (accountNumber: string, cardBrand: CardBrand) => {
    setSelectedAccount(accountNumber)
    setSelectedBrand(cardBrand)
    setError(null)
    const acc = accounts.find((a) => a.account_number === accountNumber)
    if (acc?.account_category === 'business') {
      setStep('business-choice')
    } else {
      requestCard.mutate(
        { account_number: accountNumber, card_brand: cardBrand },
        { onSuccess: () => setStep('success'), onError: onMutationError }
      )
    }
  }

  const handleRequestForSelf = () => {
    setError(null)
    requestCard.mutate(
      { account_number: selectedAccount, card_brand: selectedBrand },
      { onSuccess: () => setStep('success'), onError: onMutationError }
    )
  }

  const handleRequestForAP = (data: CreateAuthorizedPersonRequest) => {
    setError(null)
    const acc = accounts.find((a) => a.account_number === selectedAccount)
    requestForAP.mutate(
      { ...data, account_id: acc?.id ?? 0 },
      {
        onSuccess: () => {
          requestCard.mutate(
            { account_number: selectedAccount, card_brand: selectedBrand },
            { onSuccess: () => setStep('success'), onError: onMutationError }
          )
        },
        onError: onMutationError,
      }
    )
  }

  const errorBanner = error ? (
    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
  ) : null

  if (step === 'success') {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Card request submitted!</h2>
        <p className="text-muted-foreground">
          Your card request has been received and is pending approval.
        </p>
        <Button onClick={() => navigate('/cards')}>Back to Cards</Button>
      </div>
    )
  }

  if (step === 'authorized-person') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('business-choice')}>
          ← Back
        </Button>
        {errorBanner}
        <AuthorizedPersonForm
          onSubmit={handleRequestForAP}
          loading={requestForAP.isPending || requestCard.isPending}
        />
      </div>
    )
  }

  if (step === 'business-choice') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('select')}>
          ← Back
        </Button>
        {errorBanner}
        <h2 className="text-lg font-semibold">Who do you want a card for?</h2>
        <div className="flex gap-3">
          <Button onClick={handleRequestForSelf} disabled={requestCard.isPending}>
            For Myself
          </Button>
          <Button variant="outline" onClick={() => setStep('authorized-person')}>
            For Authorized Person
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/cards')}>
        ← Back
      </Button>
      {errorBanner}
      <CardRequestForm
        accounts={accounts}
        onSubmit={handleSelectAccount}
        loading={requestCard.isPending}
      />
    </div>
  )
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 16: Update `CardRequestPage.test.tsx` — remove `useConfirmCardRequest` mock

**Files:**
- Modify: `src/pages/CardRequestPage.test.tsx`

- [ ] **Step 1: Edit `CardRequestPage.test.tsx`**

Remove the `useConfirmCardRequest` mock. Updated file:

```tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestPage } from '@/pages/CardRequestPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useCardsHook from '@/hooks/useCards'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useCards')

describe('CardRequestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest
      .mocked(useCardsHook.useRequestCard)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    jest
      .mocked(useCardsHook.useRequestCardForAuthorizedPerson)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  })

  it('renders card request form', () => {
    renderWithProviders(<CardRequestPage />)
    expect(screen.getByText(/request new card/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern=CardRequestPage`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add src/pages/CardRequestPage.tsx src/pages/CardRequestPage.test.tsx
git commit -m "feat(card-request): remove verification step, go to success immediately after submit"
```

---

## Chunk 5: Card List — Client Temporary Block

Files modified:
- `src/pages/CardListPage.tsx`

---

### Task 17: Update `CardListPage.tsx` — use `useTemporaryBlockCard`

**Files:**
- Modify: `src/pages/CardListPage.tsx`

The client "Block Card" button should call `POST /api/me/cards/:id/temporary-block` with `duration_hours: 12`.
Update the dialog text to reflect that the block is temporary.

- [ ] **Step 1: Edit `src/pages/CardListPage.tsx`**

Change `useBlockCard` → `useTemporaryBlockCard`, update dialog text:

```tsx
import { useState } from 'react'
import { useCards, useTemporaryBlockCard } from '@/hooks/useCards'
import { useClientMe } from '@/hooks/useClients'
import { CardGrid } from '@/components/cards/CardGrid'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function CardListPage() {
  const navigate = useNavigate()
  const { data: cards, isLoading, error } = useCards()
  const { data: client } = useClientMe()
  const temporaryBlock = useTemporaryBlockCard()
  const [blockingCardId, setBlockingCardId] = useState<number | null>(null)
  const holderName = client ? `${client.first_name} ${client.last_name}` : undefined

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">Error loading cards. Please try again.</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Button onClick={() => navigate('/cards/request')}>Request Card</Button>
      </div>
      <CardGrid
        cards={cards ?? []}
        onBlock={(id) => setBlockingCardId(id)}
        holderName={holderName}
      />

      <Dialog open={blockingCardId !== null} onOpenChange={() => setBlockingCardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporarily Block Card?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to temporarily block this card for 12 hours? The card will be
            automatically unblocked after the period expires.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockingCardId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={temporaryBlock.isPending}
              onClick={() => {
                if (blockingCardId !== null) {
                  temporaryBlock.mutate(
                    { cardId: blockingCardId, durationHours: 12 },
                    { onSuccess: () => setBlockingCardId(null) }
                  )
                }
              }}
            >
              {temporaryBlock.isPending ? 'Blocking...' : 'Block for 12 Hours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Run lint/types check + tests**

Run: `npm run lint && npx tsc --noEmit && npm test -- --testPathPattern=CardListPage`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add src/pages/CardListPage.tsx
git commit -m "fix(cards): use temporary-block endpoint for client card blocking (12h default)"
```

---

## Chunk 6: Payment/Transfer Execute Flow

Files modified:
- `src/pages/NewPaymentPage.tsx`
- `src/pages/InternalTransferPage.tsx`
- `src/pages/CreateTransferPage.tsx`

The new flow: payment/transfer is created → backend auto-sends verification code → user enters code → call execute endpoint. No need to explicitly request the code. Pass `codeRequested: true` to `VerificationStep` (already set by Redux in Task 13/14) so it skips the "Send Code" button and shows the code input immediately.

---

### Task 18: Update `NewPaymentPage.tsx` — use `executePayment`

**Files:**
- Modify: `src/pages/NewPaymentPage.tsx`

Remove `useGenerateVerification`, `useValidateVerification`. Add `useExecutePayment`.
In verification step: pass `codeRequested` from Redux (already `true`), call `executePayment` on code submit.

- [ ] **Step 1: Edit the verification step in `src/pages/NewPaymentPage.tsx`**

Change imports:
```tsx
import { useExecutePayment } from '@/hooks/usePayments'
```
Remove: `useGenerateVerification`, `useValidateVerification` imports.

Replace the verification step block (currently lines ~113–148):
```tsx
if (step === 'verification' && transactionId !== null) {
  return (
    <VerificationStep
      codeRequested={codeRequested}
      loading={executePayment.isPending}
      error={verificationError}
      onRequestCode={() => {}}
      onVerified={(code) => {
        executePayment.mutate(
          { id: transactionId, verificationCode: code },
          {
            onSuccess: () => dispatch(setPaymentStep('success')),
            onError: () => dispatch(setVerificationError('Payment execution failed. Please try again.')),
          }
        )
      }}
      onBack={() => dispatch(setPaymentStep('confirmation'))}
    />
  )
}
```

Also remove `currentUser`/`clientId` logic that was only used in the old generate/validate calls, if no longer needed elsewhere in the component.

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Run tests**

Run: `npm test -- --testPathPattern=NewPaymentPage`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/NewPaymentPage.tsx
git commit -m "fix(payment): use executePayment endpoint in verification step"
```

---

### Task 19: Update `InternalTransferPage.tsx` — use `executeTransfer`

**Files:**
- Modify: `src/pages/InternalTransferPage.tsx`

Remove `useGenerateVerification`, `useValidateVerification`. Add `useExecuteTransfer`.

- [ ] **Step 1: Edit the verification step in `src/pages/InternalTransferPage.tsx`**

Change imports:
```tsx
import { useExecuteTransfer } from '@/hooks/useTransfers'
```
Remove: `useGenerateVerification`, `useValidateVerification`, `selectCurrentUser` imports.

Replace the verification step block:
```tsx
if (step === 'verification' && transactionId !== null) {
  return (
    <VerificationStep
      codeRequested={codeRequested}
      loading={executeTransfer.isPending}
      error={verificationError}
      onRequestCode={() => {}}
      onVerified={(code) => {
        executeTransfer.mutate(
          { id: transactionId, verificationCode: code },
          {
            onSuccess: () => dispatch(setPaymentStep('success')),
            onError: () => dispatch(setVerificationError('Transfer execution failed. Please try again.')),
          }
        )
      }}
      onBack={() => dispatch(setPaymentStep('confirmation'))}
    />
  )
}
```

Remove `currentUser` and `clientId` usage if no longer needed.

- [ ] **Step 2: Run lint/types check + tests**

Run: `npx tsc --noEmit && npm test -- --testPathPattern=InternalTransferPage`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add src/pages/InternalTransferPage.tsx
git commit -m "fix(transfer): use executeTransfer endpoint in internal transfer verification step"
```

---

### Task 20: Update `CreateTransferPage.tsx` — use `executeTransfer`

**Files:**
- Modify: `src/pages/CreateTransferPage.tsx`

Remove `useGenerateVerification`, `useValidateVerification`. Add `useExecuteTransfer`.

- [ ] **Step 1: Edit the verification step in `src/pages/CreateTransferPage.tsx`**

Change imports:
```tsx
import { useExecuteTransfer } from '@/hooks/useTransfers'
```
Remove: `useGenerateVerification`, `useValidateVerification`, `selectCurrentUser` imports.

Replace the verification step block (lines ~87–120):
```tsx
if (step === 'verification' && transactionId !== null && user !== null) {
  return (
    <VerificationStep
      codeRequested={codeRequested}
      loading={executeTransfer.isPending}
      error={verificationError}
      onRequestCode={() => {}}
      onVerified={(code) => {
        executeTransfer.mutate(
          { id: transactionId, verificationCode: code },
          {
            onSuccess: () => dispatch(setTransferStep('success')),
            onError: () => dispatch(setVerificationError('Transfer execution failed. Please try again.')),
          }
        )
      }}
      onBack={() => dispatch(setTransferStep('confirmation'))}
    />
  )
}
```

- [ ] **Step 2: Run lint/types check + tests**

Run: `npx tsc --noEmit && npm test -- --testPathPattern=CreateTransferPage`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add src/pages/CreateTransferPage.tsx
git commit -m "fix(transfer): use executeTransfer endpoint in cross-account transfer verification step"
```

---

## Chunk 7: Payment History — Remove Account Filter

Files modified:
- `src/pages/AccountListPage.tsx`
- `src/pages/PaymentHistoryPage.tsx`
- `src/pages/HomePage.tsx`

`GET /api/me/payments` returns all payments for the authenticated client — no `account_number` filter. Remove account-specific payment filtering from all client pages.

---

### Task 21: Update `AccountListPage.tsx` — remove account filter from `usePayments`

**Files:**
- Modify: `src/pages/AccountListPage.tsx`

- [ ] **Step 1: Edit `src/pages/AccountListPage.tsx`**

Change:
```tsx
const { data: paymentsData } = usePayments(
  effectiveAccount ? effectiveAccount.account_number : undefined
)
```
To:
```tsx
const { data: paymentsData } = usePayments({ page_size: 5 })
```

Remove the `effectiveAccount` variable (still keep accounts display logic).

Also remove `usePayments` dependency on `effectiveAccount`:
```tsx
// Before
const effectiveAccount = accounts[0] ?? null
const { data: paymentsData } = usePayments(effectiveAccount ? effectiveAccount.account_number : undefined)

// After
const { data: paymentsData } = usePayments({ page_size: 5 })
```

The rest of the component (account cards, recent transactions display) stays unchanged.

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 22: Update `PaymentHistoryPage.tsx` — remove account selector

**Files:**
- Modify: `src/pages/PaymentHistoryPage.tsx`

Remove the account selector dropdown and the `selectedAccountNumber` state.
`usePayments` is called with filters only (no account number).

- [ ] **Step 1: Rewrite `src/pages/PaymentHistoryPage.tsx`**

```tsx
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Rejected', value: 'FAILED' },
      { label: 'Processing', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min Amount', type: 'number' },
  { key: 'amount_max', label: 'Max Amount', type: 'number' },
]

export function PaymentHistoryPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
    page,
    page_size: PAGE_SIZE,
  }

  const { data, isLoading } = usePayments(apiFilters)
  const payments = data?.payments ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment History</h1>
      <FilterBar
        fields={PAYMENT_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />
      {isLoading ? <p>Loading...</p> : <PaymentHistoryTable payments={payments} />}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 2: Run lint/types check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 23: Update `HomePage.tsx` — remove account filter from `usePayments`

**Files:**
- Modify: `src/pages/HomePage.tsx:22-25`

- [ ] **Step 1: Edit `src/pages/HomePage.tsx`**

Change:
```tsx
const { data: paymentsData } = usePayments(
  selectedAccount ? selectedAccount.account_number : undefined,
  selectedAccount ? { page_size: 5 } : undefined
)
```
To:
```tsx
const { data: paymentsData } = usePayments({ page_size: 5 })
```

The `selectedAccount` variable and account selection UI remain unchanged (still used to highlight the selected account card in the list).

- [ ] **Step 2: Run lint/types + tests**

Run: `npx tsc --noEmit && npm test`
Expected: Some test failures in `HomePage.test.tsx` — fix in Task 24.

---

## Chunk 8: Test Updates

Files modified:
- `src/pages/PaymentHistoryPage.test.tsx`
- `src/pages/HomePage.test.tsx`
- `src/pages/AccountListPage.test.tsx`
- `cypress/e2e/accounts.cy.ts`

---

### Task 24: Update `PaymentHistoryPage.test.tsx` — new `usePayments` call signature

**Files:**
- Modify: `src/pages/PaymentHistoryPage.test.tsx`

`usePayments` now takes a single `filters` object, not `(accountNumber, filters)`.
Remove the "resets to page 1 when selected account changes" test (no account selector).
Remove `useClientAccounts` mock (no longer imported by the page).

- [ ] **Step 1: Rewrite `src/pages/PaymentHistoryPage.test.tsx`**

```tsx
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage'
import * as usePaymentsHook from '@/hooks/usePayments'

jest.mock('@/hooks/usePayments')

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders payment history page', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/payment history/i)).toBeInTheDocument()
  })

  it('calls usePayments with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls usePayments with page 2 when next arrow is clicked', async () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    )

    const dateInput = screen.getByPlaceholderText(/from date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } })

    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, date_from: '2024-01-01' })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern=PaymentHistoryPage`
Expected: All pass

---

### Task 25: Update `HomePage.test.tsx` — new `usePayments` signature

**Files:**
- Modify: `src/pages/HomePage.test.tsx`

The test that checks `usePayments` was called with a specific account number must be updated to check the new single-argument signature with `{ page_size: 5 }`.

- [ ] **Step 1: Find and update `usePayments` assertion in `HomePage.test.tsx`**

Find the test "calls usePayments with primary account number and page_size 5" (around line 70) and update:

```tsx
// Old
expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
  'some-account-number',
  { page_size: 5 }
)

// New
expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
  { page_size: 5 }
)
```

Also remove `useClientAccounts` data setup used only for the account number in this test if it's no longer needed for the `usePayments` assertion.

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern=HomePage`
Expected: All pass

---

### Task 26: Update `AccountListPage.test.tsx` — new `usePayments` signature

**Files:**
- Modify: `src/pages/AccountListPage.test.tsx`

- [ ] **Step 1: Find and update `usePayments` assertions in `AccountListPage.test.tsx`**

Update any `usePayments` call assertion from `(accountNumber, filters)` to `(filters)`:

```tsx
// Old
expect(usePaymentsHook.usePayments).toHaveBeenCalledWith('ACC-001', undefined)

// New
expect(usePaymentsHook.usePayments).toHaveBeenCalledWith({ page_size: 5 })
```

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern=AccountListPage`
Expected: All pass

---

### Task 27: Update Cypress test `accounts.cy.ts` — new API URLs

**Files:**
- Modify: `cypress/e2e/accounts.cy.ts`

Three intercepts in the "Client" describe block need updating:

| Old intercept | New intercept |
|---|---|
| `GET /api/accounts/client/*` | `GET /api/me/accounts` |
| `GET /api/payments/account/*` | `GET /api/me/payments*` |
| `GET /api/clients/me` | `GET /api/me` |

- [ ] **Step 1: Edit the `beforeEach` of "Client" describe in `cypress/e2e/accounts.cy.ts`**

```ts
describe('Client: Account Viewing & Management (Scenarios 6–8)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as(
      'getClientAccounts'
    )
    cy.intercept('GET', '/api/me/payments*', {
      body: { payments: [], total: 0 },
    }).as('getPayments')
    cy.intercept('GET', '/api/me', {
      body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
    }).as('getClientMe')
    cy.loginAsClient('/accounts')
  })
  // ... scenarios unchanged
})
```

- [ ] **Step 2: Run Cypress tests (if backend is available)**

Run: `npx cypress run --spec cypress/e2e/accounts.cy.ts`
Expected: Pass (or skip if backend unavailable)

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All pass

- [ ] **Step 4: Run full quality gate**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: All pass

- [ ] **Step 5: Commit all test changes**

```bash
git add src/pages/PaymentHistoryPage.test.tsx src/pages/HomePage.test.tsx \
        src/pages/AccountListPage.test.tsx cypress/e2e/accounts.cy.ts
git commit -m "test: update tests for new API endpoint signatures and removed account filter"
```

---

## Final Quality Gate

- [ ] **Run full test suite**

Run: `npm test`
Expected: All pass

- [ ] **Run lint + types**

Run: `npm run lint && npx tsc --noEmit`
Expected: 0 errors

- [ ] **Run build**

Run: `npm run build`
Expected: Successful

- [ ] **Run coverage**

Run: `npm test -- --coverage`
Expected: New code paths covered
