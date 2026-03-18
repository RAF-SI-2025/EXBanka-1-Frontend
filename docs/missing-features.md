# Missing Features & Incomplete Implementations

_Generated: 2026-03-18_

This document covers two categories:
1. **Broken wiring** — infrastructure (API, hook, type) exists but UI is missing or disconnected
2. **Missing sub-components** — components specified in plans but inlined into pages or skipped entirely

---

## Category 1: Broken Wiring (Features That Look Done But Aren't)

### 1. Create New Client — no UI, dead button

**Priority: High** — affects account creation flow

The API function, hook, and type all exist, but there is no page or form for actually creating a client.

| Layer | Status |
|-------|--------|
| `POST /clients` API → `src/lib/api/clients.ts` `createClient()` | ✅ Exists |
| `useCreateClient()` mutation hook → `src/hooks/useClients.ts` | ✅ Exists |
| `CreateClientRequest` type → `src/types/client.ts` | ✅ Exists |
| `ClientSelector` has a "Create New" button that calls `onCreateNew` prop | ✅ Exists |
| `CreateAccountForm` passes `onCreateNew` to `ClientSelector` | ❌ Never passed — button does nothing |
| `CreateClientPage` or inline create-client form | ❌ Does not exist |
| Route `/admin/clients/new` | ❌ Does not exist |

**What needs to be built:**
- A `CreateClientForm` component (similar to `EditClientPage`'s form)
- Either a standalone `CreateClientPage` at `/admin/clients/new`, or an inline modal/drawer triggered by the "Create New" button in `ClientSelector`
- Wire `onCreateNew` in `CreateAccountForm`

---

### 2. Edit Payment Recipient — no UI

**Priority: Medium**

The full CRUD API for payment recipients exists, but the `PaymentRecipientsPage` only implements create and delete — there is no way to edit an existing recipient.

| Layer | Status |
|-------|--------|
| `PUT /recipients/:id` API → `src/lib/api/payments.ts` `updatePaymentRecipient()` | ✅ Exists |
| `useUpdatePaymentRecipient()` mutation hook → `src/hooks/usePayments.ts` | ✅ Exists |
| Edit recipient button or form in `PaymentRecipientsPage` | ❌ Does not exist |

**What needs to be built:**
- An edit button per recipient in `PaymentRecipientsPage`
- A form (inline or dialog) pre-populated with the existing recipient data that calls `useUpdatePaymentRecipient`

---

### 3. `useCreateLoanRequest` Hook — dead code

**Priority: Low** — not a user-facing issue, just a code hygiene issue

`useCreateLoanRequest` in `src/hooks/useLoans.ts` is never used. `LoanApplicationPage` submits via the Redux thunk `submitLoanRequest` (from `loanSlice`) instead. The hook is unreachable.

**Options:**
- Delete `useCreateLoanRequest` from `useLoans.ts` (and `createLoanRequest` import if unused elsewhere)
- Or refactor `LoanApplicationPage` to use it instead of Redux (would require removing `loanSlice`)

---

## Category 2: Missing Sub-Components (Specified in Plans, Not Built)

These are components the plans explicitly required. Their logic was inlined directly into pages instead of being extracted into reusable components.

### Client Dashboard (`2026-03-13-client-dashboard.md`)

| Component | Used By | Status |
|-----------|---------|--------|
| `src/components/accounts/RecentTransactions.tsx` | `AccountListPage`, `HomePage` | ❌ Missing — transactions not shown |
| `src/components/accounts/ChangeLimitsDialog.tsx` | `AccountDetailsPage` | ❌ Missing — limits cannot be changed |
| `src/components/accounts/BusinessAccountInfo.tsx` | `AccountDetailsPage` | ❌ Missing — company info not shown on account detail |
| `src/components/home/QuickPayment.tsx` | `HomePage` | ❌ Missing — quick payment shortcuts absent from dashboard |
| `src/components/home/ExchangeCalculator.tsx` | `HomePage` | ❌ Missing — mini calculator absent from dashboard |

### Admin Portals (`2026-03-13-admin-portals.md`)

| Component | Used By | Status |
|-----------|---------|--------|
| `src/components/admin/AccountFilters.tsx` | `AdminAccountsPage` | ❌ Missing — filtering inlined |
| `src/components/admin/AccountTable.tsx` | `AdminAccountsPage` | ❌ Missing — table inlined |
| `src/components/admin/AdminCardItem.tsx` | `AdminAccountCardsPage` | ❌ Missing — card item inlined |
| `src/components/admin/ClientFilters.tsx` | `AdminClientsPage` | ❌ Missing — filtering inlined |
| `src/components/admin/ClientTable.tsx` | `AdminClientsPage` | ❌ Missing — table inlined |
| `src/components/admin/EditClientForm.tsx` | `EditClientPage` | ❌ Missing — form inlined |
| `src/hooks/useAdminAccounts.ts` | `AdminAccountsPage` | ❌ Missing — uses `useAllAccounts` instead |
| `src/hooks/useAdminClients.ts` | `AdminClientsPage` | ❌ Missing — uses `useAllClients` instead |

### Loans (`2026-03-13-loans.md`)

| Component | Used By | Status |
|-----------|---------|--------|
| `src/components/loans/LoanCard.tsx` | `LoanListPage` | ❌ Missing — inlined |
| `src/components/loans/LoanDetails.tsx` | `LoanDetailsPage` | ❌ Missing — inlined |
| `src/components/loans/InstallmentTable.tsx` | `LoanDetailsPage` | ❌ Missing — inlined |
| `src/components/loans/LoanApplicationForm.tsx` | `LoanApplicationPage` | ❌ Missing — inlined |
| `src/components/loans/LoanRequestCard.tsx` | `AdminLoanRequestsPage` | ❌ Missing — inlined |
| `src/components/loans/LoanFilters.tsx` | `AdminLoansPage` | ❌ Missing — inlined |
| `src/hooks/useAdminLoans.ts` | `AdminLoansPage`, `AdminLoanRequestsPage` | ❌ Missing — uses `useAllLoans`, `useLoanRequests` |
| `src/store/slices/loanSlice.test.ts` | — | ❌ No tests for loan Redux slice |

### Payments (`2026-03-13-payments.md`)

| Component | Used By | Status |
|-----------|---------|--------|
| `src/components/payments/NewPaymentForm.tsx` | `NewPaymentPage` | ❌ Missing — inlined |
| `src/components/payments/PaymentConfirmation.tsx` | `NewPaymentPage` | ❌ Missing — inlined |
| `src/components/payments/InternalTransferForm.tsx` | `InternalTransferPage` | ❌ Missing — inlined |
| `src/components/payments/TransferConfirmation.tsx` | `InternalTransferPage` | ❌ Missing — inlined |
| `src/components/payments/RecipientForm.tsx` | `PaymentRecipientsPage` | ❌ Missing — inlined |
| `src/components/payments/RecipientList.tsx` | `PaymentRecipientsPage` | ❌ Missing — inlined |
| `src/components/payments/PaymentFilters.tsx` | `PaymentHistoryPage` | ❌ Missing — inlined |
| `src/components/payments/PaymentHistoryTable.tsx` | `PaymentHistoryPage` | ❌ Missing — inlined |
| `src/lib/utils/receipt-pdf.ts` | `PaymentHistoryPage` | ❌ Missing — PDF download not implemented |
| `src/store/slices/paymentSlice.test.ts` | — | ❌ No tests for payment Redux slice |

### Transfers (`2026-03-13-transfers.md`)

| Component | Status |
|-----------|--------|
| `src/store/slices/transferSlice.test.ts` | ❌ No tests for transfer Redux slice |

---

## Missing Tests Only

Hook and slice tests that were specified in plans but not created:

| Test File | Plan |
|-----------|------|
| `src/hooks/useAccounts.test.ts` | Account Creation |
| `src/hooks/useClients.test.ts` | Account Creation |
| `src/hooks/useCards.test.ts` | Cards |
| `src/hooks/useExchange.test.ts` | Exchange |
| `src/hooks/useTransfers.test.ts` | Transfers |
| `src/hooks/useLoans.test.ts` | Loans |
| `src/hooks/usePayments.test.ts` | Payments |
| `src/store/slices/transferSlice.test.ts` | Transfers |
| `src/store/slices/paymentSlice.test.ts` | Payments |
| `src/store/slices/loanSlice.test.ts` | Loans |

---

## Quick Priority Reference

| Item | Impact | Effort |
|------|--------|--------|
| Create new client (page + wiring) | High — account creation flow broken | Medium |
| Edit payment recipient | Medium — CRUD incomplete | Low |
| `RecentTransactions` component | Medium — dashboard shows no transactions | Medium |
| `ChangeLimitsDialog` component | Medium — account limits uneditable | Low |
| `BusinessAccountInfo` component | Low — info exists elsewhere | Low |
| `QuickPayment` + `ExchangeCalculator` on HomePage | Low — dashboard is bare | Medium |
| PDF receipt download | Low | High |
| Admin sub-components (filters, tables) | Low — pages work, just not split | Low |
| Loan/Payment/Transfer sub-components | Low — pages work, just not split | Low |
| Hook & slice tests | Low — logic tested via page tests | Medium |
| Dead `useCreateLoanRequest` hook | Low — code hygiene only | Very Low |
