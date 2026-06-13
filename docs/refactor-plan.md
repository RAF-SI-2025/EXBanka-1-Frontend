# Frontend Refactor Plan

_Authored 2026-05-16. Living document — update as work lands._

## Where we are

- **12 view modules** under `src/views/` are now self-contained (entry + components + hooks + api + types + tests in one directory): `notificationTemplates`, `otcOptions`, `adminFees`, `peerBanks`, `exchangeRates`, `paymentRecipients`, `stockExchanges`, `tax`, `securities`, `otcPortal`, `funds`, plus the `shared` toolkit (`ViewShell`, `LoadingState`, `ErrorState`, `EmptyState`, animation tokens).
- **Build status**: `npm run build` green, `npx tsc --noEmit` clean, **1175 tests / 215 suites all passing**.
- **Quality baseline**: 0 `console.log`, 0 `: any`, 0 `TODO/FIXME` in source. The codebase is in good shape — this plan is about consistency and finishing the modularisation, not putting out fires.

The biggest risk surface is now **drift**: half the app uses `ViewShell` + `LoadingState`, the other half still uses ad-hoc `<div className="space-y-4"><h1 …>` headers, `<LoadingSpinner />`, and inline `<p>No X found.</p>` placeholders. Until the migration is finished, the UI is visibly two halves stitched together.

---

## What's still on the page side

`src/pages/` still owns ~50 routes that need to become view modules. Grouped by feature so we can ship a coherent slice at a time:

### Trading drill-downs (share components with `src/views/securities`)
- `StockDetailPage`, `FuturesDetailPage`, `ForexDetailPage`, `OptionDetailPage`, `CreateOrderPage`, `MyOrdersPage`, `AdminOrdersPage`
- These all import `useSecurities` and the shared trading primitives (`PriceChart`, `SecurityInfoPanel`, `OptionsChain`, `BuyOrderDialog`). When the last one moves over, fold `src/components/securities/` into `src/views/securities/components/` and drop the parallel directory.

### Accounts
- `AccountListPage`, `AccountDetailsPage`, `CreateAccountPage`, `AccountActivityPage`, `BankAccountActivityPage`, `AdminAccountsPage`, `AdminAccountCardsPage`
- Drain `src/components/accounts/` into the views as they migrate.

### Cards
- `CardListPage`, `CardRequestPage`, `AdminCardRequestsPage`
- Drain `src/components/cards/`.

### People (clients / employees)
- `CreateClientPage`, `EditClientPage`, `AdminClientsPage`, `EmployeeListPage`, `CreateEmployeePage`, `EditEmployeePage`
- Drain `src/components/clients/` and `src/components/employees/`.

### Loans
- `LoanListPage`, `LoanDetailsPage`, `LoanApplicationPage`, `AdminLoanRequestsPage`, `AdminLoansPage`
- Drain `src/components/loans/`.

### Transfers & payments
- `CreateTransferPage`, `TransferHistoryPage`, `NewPaymentPage`, `InternalTransferPage`, `PaymentHistoryPage`
- Drain remaining `src/components/transfers/` and the residual `src/components/payments/`.

### Funds drill-downs
- `FundDetailsPage`, `CreateFundPage`, `BankFundPositionsPage`
- Move into `src/views/funds/` alongside the already-migrated discovery view.

### OTC drill-downs
- `OtcContractsPage`, `OtcContractDetailPage`
- Move into a new `src/views/otcContracts/`. Drain the rest of `src/components/otc/` (`OtcContractsTable`, `ExerciseContractDialog`, `OtcOptionStatusBadge`).

### Actuaries / profit / portfolio
- `ActuaryListPage`, `ActuaryPerformancePage`, `PortfolioPage`, `HoldingTransactionsPage`
- Drain `src/components/actuaries/`, `src/components/profit/`, `src/components/portfolio/`.

### Admin settings (your stated priority)
- `AdminRolesPage`, `AdminEmployeeLimitsPage`, `AdminClientLimitsPage`, `AdminInterestRatesPage`
- These are the simplest remaining migrations — single tables/forms with no shared components.

### Exchange
- `ExchangeCalculatorPage`
- Drain the rest of `src/components/exchange/`.

### Top of nav (low priority — already coherent)
- `HomePage`. Auth pages (`LoginPage`, `PasswordResetRequestPage`, `PasswordResetPage`, `ActivationPage`) — these live behind `AuthLayout` and don't need `ViewShell`; an animation pass is still worth doing.

---

## Cleanup & simplification

### Stale / dead code to remove

| File / Folder | Why it's stale | Action |
| --- | --- | --- |
| `src/components/shared/LoadingSpinner.tsx` | 24 callers still use it; `LoadingState` replaces it | Replace as each page migrates; delete when count hits 0 |
| `getByTestId('loading-spinner')` in 19 test files | Pages-side artefact of the same | Updates fall out of each migration |
| `<p>No X found.</p>` literals in 10+ pages | `EmptyState` replaces them | Replace as each page migrates |
| `<h1 className="text-2xl font-bold">…` in 39 spots | `ViewShell title=` replaces them | Replace as each page migrates |
| `src/components/dev/RoleSwitcher.tsx` | Dev-only role impersonation widget | Confirm it's gated by env, then move to `src/views/dev/` or keep but mark `// dev-only` |
| `src/components/animations/Capybara`, `MenuStolenOverlay`, `PiggyAnimation` + `CapybaraContext`, `PiggyContext` | Easter-egg animations wired through global context | Audit: are these intentional brand features? If yes, leave; if no, prune |
| `dist/` directory in repo (currently 8.3 MB `.gif` shipped) | Build artefact accidentally committed | Add `dist/` to `.gitignore`, remove from repo |
| `.claude/worktrees/cool-shaw-fa9ca1/` | Old git worktree; the 7 lint errors live here | Delete the worktree |
| `src/components/shared/PageTransition.tsx` | Wraps the whole `<Outlet>` in `AppLayout` with `animate-in fade-in duration-150`; redundant once every view uses `ViewShell` (which animates itself) | Keep for now — switching at the very end avoids a flicker regression during the rest of the migration |

### Simplifications worth doing alongside migrations

1. **One way to fetch list data.** Several feature hooks (`useFees`, `usePeerBanks`, `useStockExchanges`, `useTax`) had the exact same shape — `useQuery({queryKey: […], queryFn: api.X})`. The migrated versions collapsed the per-function APIs into one object literal (`adminFeesApi.list`, `peerBanksApi.create`, …). Apply this to every remaining hook/api pair as they move into view modules.
2. **Drop the `_fixtures.ts` parallel tree.** As view modules absorb their own fixtures (`src/views/stockExchanges/__tests__/fixtures.ts`, `src/views/tax/__tests__/fixtures.ts`), the orphans in `src/__tests__/fixtures/` will shrink. End state: only truly cross-cutting fixtures (`auth-fixtures`, `account-fixtures`, `client-fixtures`) live there.
3. **Standardise mutation hooks.** Every `useCreateX / useUpdateX / useDeleteX` triple does the same `mutation + queryClient.invalidateQueries` dance. After the migration is done, consider one `createCrudHooks(api, queryKey)` factory in `src/views/shared/` if the duplication is irritating. Don't pre-emptively — wait until every view is migrated.
4. **Kill `<LoadingSpinner />` + `useStocks`-style separated `getStocks` / `useStocks` / `securitiesApi.list`** when the entire securities subtree has moved.
5. **Consolidate `src/types/` into view modules.** Most type files are owned by one view (`fund.ts`, `loan.ts`, `card.ts`, …). After migration only cross-cutting types (`auth`, `account`, `client`, `filters`) need to stay in `src/types/`.

### Quality gates already worth raising
- Re-enable the **`react-refresh/only-export-components`** errors in `src/components/ui/*` by splitting non-component exports (`buttonVariants`, `badgeVariants`, `tabsTriggerVariants`) into sibling `*-variants.ts` files. Each is 5 minutes of work.
- Promote one of the `react-hooks/exhaustive-deps` warnings in `src/hooks/useSecurities.ts:156` to a real fix rather than a long-lived warning.

---

## Animations roadmap

The shared toolkit already gives every migrated view a fade + slide enter, hover affordances on rows, and a pulse on loading. To close the gap, add these as we go:

1. **Apply view-enter to every view.** Migration does this automatically (`ViewShell` includes `viewEnter`). Auth pages can adopt `viewEnter` even without `ViewShell` — the class is exported standalone.
2. **Dialog animations.** Shadcn's `<Dialog>` already animates, but the dialog **content** doesn't. Add a `dialogEnter` token (`animate-in fade-in zoom-in-95 duration-200`) to `src/views/shared/animations.ts` and apply it on dialog body sections in upcoming migrations.
3. **Tab content transitions.** `Tabs` swap content instantly today. Wrap `<TabsContent>` body in `<div className={viewEnter}>` for a subtle fade when switching — most impactful on `SecuritiesView` and `OtcOptionsView`.
4. **Tabular row enter stagger.** Each migrated table uses `rowEnter` on every row, but they all animate simultaneously. A real stagger needs CSS `animation-delay` per index — add a tiny `staggerRow(index)` helper that returns `animation-delay: ${index * 30}ms`.
5. **Sidebar nav active-state animation.** `Sidebar.tsx` currently flips colours instantly when the route changes. Add a sliding indicator (`absolute inset-y-0 left-0 w-0.5 bg-primary transition-all`) that animates between active items.
6. **Page-to-page route transitions.** The `PageTransition` wrapper handles only the route-change fade. After every view migrates to `ViewShell`, replace `PageTransition` with the simpler `viewEnter` baked into each shell. The route key is no longer needed.
7. **Toast entrance.** `sonner` already animates. No work needed — listed here so we don't reinvent.
8. **Empty-state illustration micro-animation.** The existing `PiggyAnimation` / `Capybara` set is a good template — re-skin one for "empty data" so empty cards feel less stark.

The whole animation pass is 30–60 minutes once a view has migrated; it's not a separate phase, just a checklist item per migration.

---

## Phased execution

Recommend tackling in this order:

**Phase A — Settings (you asked for this; smallest blast radius)**
- `AdminRolesPage` → `src/views/adminRoles/`
- `AdminInterestRatesPage` → `src/views/interestRates/`
- `AdminEmployeeLimitsPage` → `src/views/employeeLimits/`
- `AdminClientLimitsPage` → `src/views/clientLimits/`
- One commit per view, ~20 min each.

**Phase B — Trading drill-downs (closes out securities)**
- `MyOrdersPage`, `StockDetailPage`, `FuturesDetailPage`, `ForexDetailPage`, `OptionDetailPage`, `CreateOrderPage`, `AdminOrdersPage`
- After this phase: delete `src/components/securities/` and `src/components/orders/` entirely.

**Phase C — Funds drill-downs**
- `FundDetailsPage`, `CreateFundPage`, `BankFundPositionsPage`
- After this phase: delete most of `src/components/funds/`.

**Phase D — OTC contracts**
- `OtcContractsPage`, `OtcContractDetailPage`
- After this phase: delete `src/components/otc/`.

**Phase E — Money movement (transfers + payments)**
- All 5 transfer/payment pages migrate into a `src/views/transfers/` + `src/views/payments/` pair (or a single `money` umbrella — decide during Phase E).

**Phase F — People & accounts (largest tree, save for last)**
- Accounts (7 pages), Cards (3 pages), People (6 pages), Loans (5 pages).
- Drain `src/components/{accounts,cards,clients,employees,loans}` as each migrates.

**Phase G — Cleanup**
- Delete `LoadingSpinner`, `PageTransition`, and any remaining `src/components/<feature>/` folders that are now empty.
- Run the simplification pass: collapse remaining duplicated hooks into the object-literal API pattern.
- Split shadcn `*-variants` into sibling files so fast-refresh stops complaining.
- Update `specification.md` and `docs/views-migration-guide.md` to reflect the final tree.

**Phase H — Animation polish pass**
- Walk through every view and apply the animation roadmap items above.
- Add staggered row delays, sliding sidebar indicator, tab-content fade.

Each phase is reviewable independently. Phases A–D are mechanical and low-risk; E–F touch more shared state and deserve smaller commits; G–H are the rewarding polish.

---

## What I'd do next, concretely

If you want to continue in this session: **Phase A**. The four settings pages are nearly identical in shape (one table, one CRUD dialog), so they migrate fast and produce visible, consistent results immediately on the most-used admin surfaces.

If you'd rather take a break and review what's landed: the 12 modules in `src/views/` and the two docs (`docs/views-migration-guide.md`, this file) are the surface to read.
