# Implementation Audit — Plans vs Codebase

_Generated: 2026-03-18_

All 9 plans have been **partially or fully implemented** at the page/feature level. However, each plan specified granular sub-components, dedicated hooks, and test files that were skipped in favour of inlining the logic into pages. The items below are what the plans explicitly required but are not present in the codebase.

---

## Plan 2 — Account Creation (`2026-03-13-account-creation.md`)

### Missing
| Item | Path |
|------|------|
| Hook tests | `src/hooks/useAccounts.test.ts` |
| Hook tests | `src/hooks/useClients.test.ts` |

---

## Plan 3 — Admin Portals (`2026-03-13-admin-portals.md`)

The plan required dedicated admin hooks and a `src/components/admin/` folder with sub-components. Instead, the logic was inlined into the admin pages directly.

### Missing hooks
| Item | Path |
|------|------|
| Admin accounts hook | `src/hooks/useAdminAccounts.ts` |
| Admin accounts hook test | `src/hooks/useAdminAccounts.test.ts` |
| Admin clients hook | `src/hooks/useAdminClients.ts` |
| Admin clients hook test | `src/hooks/useAdminClients.test.ts` |

### Missing components (`src/components/admin/`)
| Item | Path |
|------|------|
| Account filter bar | `src/components/admin/AccountFilters.tsx` + test |
| Account table | `src/components/admin/AccountTable.tsx` + test |
| Admin card item | `src/components/admin/AdminCardItem.tsx` + test |
| Client filter bar | `src/components/admin/ClientFilters.tsx` + test |
| Client table | `src/components/admin/ClientTable.tsx` + test |
| Edit client form | `src/components/admin/EditClientForm.tsx` + test |

---

## Plan 4 — Cards (`2026-03-13-cards.md`)

### Missing
| Item | Path |
|------|------|
| Hook tests | `src/hooks/useCards.test.ts` |

---

## Plan 5 — Client Dashboard (`2026-03-13-client-dashboard.md`)

The plan required several sub-components used inside `AccountDetailsPage`, `AccountListPage`, and `HomePage`. These were either inlined into the pages or not implemented.

### Missing components (`src/components/accounts/`)
| Item | Path |
|------|------|
| Recent transactions list | `src/components/accounts/RecentTransactions.tsx` + test |
| Change limits dialog | `src/components/accounts/ChangeLimitsDialog.tsx` + test |
| Business account info panel | `src/components/accounts/BusinessAccountInfo.tsx` + test |

### Missing components (`src/components/home/`)
| Item | Path |
|------|------|
| Mini exchange calculator | `src/components/home/ExchangeCalculator.tsx` + test |
| Quick payment shortcuts | `src/components/home/QuickPayment.tsx` + test |

---

## Plan 6 — Exchange (`2026-03-13-exchange.md`)

### Missing
| Item | Path |
|------|------|
| Hook tests | `src/hooks/useExchange.test.ts` |

---

## Plan 7 — Loans (`2026-03-13-loans.md`)

The plan required dedicated loan sub-components and a separate admin hook. The logic was inlined into pages instead.

### Missing hooks
| Item | Path |
|------|------|
| Admin loans hook | `src/hooks/useAdminLoans.ts` |
| Admin loans hook test | `src/hooks/useAdminLoans.test.ts` |
| Hook tests (client) | `src/hooks/useLoans.test.ts` |

### Missing Redux slice
| Item | Path |
|------|------|
| Loan application slice (plan calls it `loanApplicationSlice`) | `src/store/slices/loanApplicationSlice.ts` _(implemented as `loanSlice.ts` — name differs)_ |
| Slice tests | `src/store/slices/loanSlice.test.ts` |

### Missing components (`src/components/loans/`)
| Item | Path |
|------|------|
| Loan card | `src/components/loans/LoanCard.tsx` + test |
| Loan detail panel | `src/components/loans/LoanDetails.tsx` + test |
| Installment table | `src/components/loans/InstallmentTable.tsx` + test |
| Loan application form | `src/components/loans/LoanApplicationForm.tsx` + test |
| Loan request card | `src/components/loans/LoanRequestCard.tsx` + test |
| Loan filters bar | `src/components/loans/LoanFilters.tsx` + test |

---

## Plan 8 — Payments (`2026-03-13-payments.md`)

The plan required dedicated payment sub-components and a separate recipients hook. These were inlined.

### Missing hooks
| Item | Path |
|------|------|
| Payment recipients hook (separate file) | `src/hooks/usePaymentRecipients.ts` _(logic is in `usePayments.ts`)_ |
| Hook tests | `src/hooks/usePayments.test.ts` |

### Missing utilities
| Item | Path |
|------|------|
| PDF receipt generator | `src/lib/utils/receipt-pdf.ts` + test |

### Missing Redux slice tests
| Item | Path |
|------|------|
| Payment slice tests | `src/store/slices/paymentSlice.test.ts` |

### Missing components (`src/components/payments/`)
| Item | Path |
|------|------|
| New payment form | `src/components/payments/NewPaymentForm.tsx` + test |
| Payment confirmation | `src/components/payments/PaymentConfirmation.tsx` + test |
| Internal transfer form | `src/components/payments/InternalTransferForm.tsx` + test |
| Transfer confirmation | `src/components/payments/TransferConfirmation.tsx` + test |
| Recipient form | `src/components/payments/RecipientForm.tsx` + test |
| Recipient list | `src/components/payments/RecipientList.tsx` + test |
| Payment filters bar | `src/components/payments/PaymentFilters.tsx` + test |
| Payment history table | `src/components/payments/PaymentHistoryTable.tsx` + test |

### Missing page (name differs)
| Plan specified | Implemented as |
|----------------|----------------|
| `PaymentTransferPage.tsx` at `/payments/transfer` | `InternalTransferPage.tsx` at `/payments/transfer` ✅ (functionally equivalent) |

---

## Plan 9 — Transfers (`2026-03-13-transfers.md`)

### Missing
| Item | Path |
|------|------|
| Transfer slice tests | `src/store/slices/transferSlice.test.ts` |
| Hook tests | `src/hooks/useTransfers.test.ts` |

---

## Summary

| Plan | Pages/Features | Sub-components | Hooks/Tests |
|------|---------------|----------------|-------------|
| User Management | ✅ | ✅ | ✅ |
| Account Creation | ✅ | ✅ | ⚠️ Hook tests missing |
| Admin Portals | ✅ | ❌ `admin/` folder not created | ❌ Admin hooks missing |
| Cards | ✅ | ✅ | ⚠️ Hook tests missing |
| Client Dashboard | ✅ | ❌ RecentTransactions, ChangeLimitsDialog, BusinessAccountInfo, home/ components missing | ⚠️ |
| Exchange | ✅ | ✅ | ⚠️ Hook tests missing |
| Loans | ✅ | ❌ `loans/` folder not created | ❌ Admin hook + slice tests missing |
| Payments | ✅ | ❌ `payments/` folder not created | ❌ PDF util + slice tests missing |
| Transfers | ✅ | ✅ | ⚠️ Slice + hook tests missing |

### What was implemented differently
- Sub-components that plans put in `components/loans/`, `components/payments/`, `components/admin/` were inlined directly into their respective pages instead of being extracted into reusable components
- `loanApplicationSlice` was implemented as `loanSlice` (same functionality)
- `usePaymentRecipients` was merged into `usePayments`
- `PaymentTransferPage` was implemented as `InternalTransferPage`
