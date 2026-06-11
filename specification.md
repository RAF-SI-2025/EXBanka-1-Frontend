# EXBanka Frontend — Project Specification

_Last updated: 2026-05-28 (added stricter form validations — phone format `/^\+?[0-9]+$/`, date of birth not in future and ≥ 16 years old, inline display of server-side duplicate-email errors via `isDuplicateEmailError` helper; added FundPortfolioView at `/funds/:id/portfolio` — fund portfolio-style page with summary cards, performance chart and an enriched holdings table that calls `useStock(stock_id)` per row to fill in ticker/name/price/market value; added Price Alerts — bell-icon button on every Stocks/Futures/Forex table row opens `CreatePriceAlertDialog` (POST `/me/price-alerts`), and a new "My Price Alerts" tab on `/portfolio` lists alerts with Pause/Resume/Delete actions via PUT/DELETE `/me/price-alerts/:id`; added recurring buy scheduling — on the create-order form (`/securities/order/new`) a client or employee placing a market **buy** can tick "Schedule order", pick Weekly/Monthly, and either "Place order and schedule" (immediate buy + recurring template) or "Schedule" (template only) via POST `/me/recurring-orders` (caller-scoped: an employee's template is created under the employee principal); added a **Recurring Orders** tab on `/portfolio` (`?tab=recurring-orders`) that lists the caller's recurring-order templates via GET `/me/recurring-orders` and supports Pause/Resume/Cancel via POST `/me/recurring-orders/:id/{pause,resume,cancel}` — Cancel is gated behind a confirmation dialog)_

_Updated: 2026-05-30_
_Last updated: 2026-06-11 (OTC Options view module — slim create payload, updateListing API, useUpdateOtcOption hook, AmountEditor in OfferActivityPanel)_

_Last updated: 2026-06-07b (fund detail stats redesign — `FundDetailsView` (`/funds/:id`) now mirrors the Portfolio page: `FundSummaryCards` hero stats (total value / profit ± % / total contributed / investors), a `FundNavChart` (this fund's daily NAV indexed to 100 vs. the system-average benchmark from `history`/`average_history`), a `FundAllocationPieChart` (value-weighted holdings), and `FundRiskMetrics` cards (annualized return, volatility, Sharpe = reward_to_variability, max drawdown — hidden behind a notice when `metrics_available === false`). `FundDetailsPanel` slimmed to a secondary "Fund details" card. New optional fund types: SP3 metrics on `Fund`, `FundNavPoint`, `history`/`average_history` on `FundDetailResponse`.)_

_Last updated: 2026-06-07 (named watchlists — replaced the single default `/me/watchlist` calls with multi-list `/me/watchlists` + `/me/watchlists/:id/items`; the Portfolio → Favorites tab now renders `WatchlistPanel` with a list dropdown (default list shown as "Favorites"), a "New list" button → `CreateWatchlistDialog`, and a per-list delete; the securities heart now opens `AddToWatchlistDialog` to pick which list to add to, and shows filled when a listing is in any of the caller's lists. Owner (client vs. bank) is resolved server-side from the JWT.)_

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Routes](#4-routes)
5. [Pages](#5-pages)
6. [Components](#6-components)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Custom Hooks](#9-custom-hooks)
10. [Types & Interfaces](#10-types--interfaces)
11. [Validation Schemas](#11-validation-schemas)
12. [Test Coverage](#12-test-coverage)

---

## 1. Project Overview

**EXBanka** is a banking platform frontend. It provides role-based access for two roles:

- **Admin (`EmployeeAdmin`)** — full management: list, create, edit employees and clients, manage accounts, loans, and payments
- **User (`EmployeeBasic`)** — view own profile only

The app communicates with a backend API at `http://localhost:8080` via REST.

All users (employees and clients) authenticate via a single `/login` route. The JWT `system_type` field (`"employee"` | `"client"`) determines the portal they are redirected to after login: employees are sent to `/admin/accounts`, clients are sent to `/home`.

---

## 2. Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build | Vite | ^7.3 |
| UI | Shadcn UI + Tailwind CSS | ^4 |
| Server state | TanStack Query (React Query) | v5 |
| Global state | Redux Toolkit | ^2.11 |
| Routing | React Router | v7 |
| HTTP client | Axios | ^1.13 |
| Form handling | React Hook Form + Zod | ^7 / ^4 |
| Testing | Jest + React Testing Library | ^30 / ^16 |
| Linting | ESLint + Prettier | ^9 / ^3 |
| Git hooks | Husky + lint-staged | ^9 / ^16 |

---

## 3. Project Structure

```
src/
├── __tests__/
│   ├── fixtures/
│   │   ├── auth-fixtures.ts          # Mock auth data factories
│   │   ├── card-fixtures.ts          # Mock card request data factories
│   │   ├── employee-fixtures.ts      # Mock employee data factories
│   │   ├── actuary-fixtures.ts       # Mock actuary data factories
│   │   ├── stockExchange-fixtures.ts # Mock stock exchange data factories
│   │   ├── security-fixtures.ts     # Mock stock, futures, forex, option, price history factories
│   │   ├── order-fixtures.ts        # Mock order factory
│   │   ├── portfolio-fixtures.ts    # Mock holding, portfolio summary factories
│   │   ├── tax-fixtures.ts          # Mock tax record factory
│   │   ├── otc-fixtures.ts          # Mock OTC offer factory
│   │   └── verification-fixtures.ts # Mock verification data factory
│   ├── mocks/
│   │   └── select-mock.tsx           # Shadcn Select mock for tests
│   └── utils/
│       ├── test-utils.tsx            # renderWithProviders(), createQueryWrapper()
│       ├── setupTests.ts             # Jest global setup
│       └── fileMock.ts               # Asset import stub
│
├── components/
│   ├── ui/                           # Shadcn UI primitives (do not modify)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── auth/
│   │   ├── AuthFormCard.tsx          # Shared card wrapper for all auth forms
│   │   ├── AuthFormCard.test.tsx
│   │   ├── LoginForm.tsx             # Email/password login form
│   │   ├── LoginForm.test.tsx
│   │   ├── PasswordResetRequestForm.tsx  # Email input to request reset
│   │   ├── PasswordResetRequestForm.test.tsx
│   │   ├── PasswordResetForm.tsx     # Token + new password form
│   │   ├── PasswordResetForm.test.tsx
│   │   ├── ActivationForm.tsx        # Token + initial password form
│   │   ├── ActivationForm.test.tsx
│   │   ├── BackendSelector.tsx       # Dropdown to choose backend host (5 presets + custom URL)
│   │   ├── BackendSelector.test.tsx
│   │   └── BackendSwitcherButton.tsx # Sidebar dialog launcher for in-app backend switch
│   ├── employees/
│   │   ├── EmployeeForm.tsx          # Thin wrapper: delegates to Create or Edit form
│   │   ├── EmployeeForm.test.tsx
│   │   ├── EmployeeCreateForm.tsx    # Create employee form (~131 lines)
│   │   ├── EmployeeEditForm.tsx      # Edit/view employee form (~143 lines)
│   │   ├── PhoneInput.tsx            # Country code + phone number input
│   │   ├── PhoneInput.test.tsx
│   │   ├── EmployeeProfileTab.tsx    # "Me" tab: current user's read-only profile
│   │   ├── EmployeeProfileTab.test.tsx
│   │   ├── EmployeeTable.tsx         # Employee list table
│   │   ├── EmployeeTable.test.tsx
│   │   ├── EmployeeFilters.tsx       # Category + text filter bar
│   │   ├── EmployeeFilters.test.tsx
│   │   ├── EmployeeStatusBadge.tsx   # Active/Inactive badge
│   │   ├── EmployeeStatusBadge.test.tsx
│   │   └── employeeConstants.ts     # Re-export shim (imports from lib/utils/constants)
│   ├── actuaries/
│   │   ├── ActuaryTable.tsx + .test.tsx       # Table displaying actuaries with actions
│   │   └── EditLimitDialog.tsx + .test.tsx    # Dialog for editing agent's limit
│   ├── stockExchanges/
│   │   └── StockExchangeTable.tsx + .test.tsx # Table displaying stock exchanges
│   ├── securities/
│   │   ├── StockTable.tsx + .test.tsx         # Stocks list table
│   │   ├── FuturesTable.tsx + .test.tsx       # Futures contracts list table
│   │   ├── ForexTable.tsx + .test.tsx         # Forex pairs list table
│   │   ├── PriceChart.tsx + .test.tsx         # Recharts line chart with period selector
│   │   ├── SecurityInfoPanel.tsx + .test.tsx  # Key-value detail info panel
│   │   ├── OptionsChain.tsx + .test.tsx       # Calls/Puts options chain table
│   │   ├── WatchlistButton.tsx + .test.tsx    # Per-row heart; opens the add-to-list picker
│   │   └── AddToWatchlistDialog.tsx + .test.tsx # Pick which watchlist to add a listing to
│   ├── accounts/
│   │   ├── LimitsUsageCard.tsx + .test.tsx    # Daily/monthly spending usage progress bars
│   │   └── AccountSelector.tsx + .test.tsx   # Search-as-you-type account picker; businessOnly prop filters to business accounts
│   ├── orders/
│   │   ├── CreateOrderForm.tsx + .test.tsx    # Order creation form
│   │   ├── OrderTable.tsx + .test.tsx         # Reusable orders table with actions (cancel/approve/decline)
│   │   └── OrdersTable.tsx + .test.tsx        # Simplified admin orders table (approve/decline only)
│   ├── notifications/
│   │   ├── NotificationItem.tsx + .test.tsx       # Single row with unread dot + relative time
│   │   ├── NotificationDropdown.tsx + .test.tsx   # Popover content: list, empty/loading/error states, Mark all as read
│   │   └── NotificationBell.tsx + .test.tsx       # Bell icon + unread badge ("9+" cap); base-ui Popover
│   ├── shared/
│   │   ├── AppErrorBoundary.tsx + .test.tsx       # Class boundary at router root; toasts + renders ErrorFallback
│   │   ├── ErrorFallback.tsx + .test.tsx          # Stateless fallback page used by the boundary
│   │   ├── PageTransition.tsx + .test.tsx         # Re-keys on pathname; 200ms fade + slide-in for every route change
│   │   ├── TopProgressBar.tsx + .test.tsx         # Top-of-viewport accent bar driven by useIsFetching/useIsMutating (250ms grace)
│   │   ├── LoadingSpinner.tsx                     # Existing
│   │   ├── PaginationControls.tsx                 # Existing
│   │   └── ProtectedRoute.tsx + .test.tsx         # Existing
│   ├── otc/
│   │   ├── OtcOffersTable.tsx + .test.tsx          # OTC offers list with Buy action
│   │   ├── BuyOtcDialog.tsx + .test.tsx            # Dialog to buy an OTC offer (client variant)
│   │   └── BuyOnBehalfOtcDialog.tsx + .test.tsx    # Dialog to buy on behalf of a client (employee variant)
│   ├── funds/
│   │   ├── FundsTable.tsx + .test.tsx              # Discovery table; rows linked to /funds/:id
│   │   ├── FundDetailsPanel.tsx + .test.tsx        # Secondary "Fund details" card (manager via useEmployee)
│   │   ├── FundSummaryCards.tsx + .test.tsx        # Hero stat cards (value/profit/contributed/investors)
│   │   ├── FundNavChart.tsx + .test.tsx            # NAV-vs-system-average performance line chart
│   │   ├── FundAllocationPieChart.tsx + .test.tsx  # Value-weighted holdings allocation pie
│   │   ├── FundRiskMetrics.tsx + .test.tsx         # SP3 risk/return metric cards (metrics_available guard)
│   │   ├── fundFormat.ts                           # Shared formatRsd/formatPct/signClass helpers
│   │   ├── FundHoldingsTable.tsx                   # Per-row useStock to resolve ticker
│   │   ├── CreateFundForm.tsx + .test.tsx          # name + description + minimum_contribution_rsd
│   │   ├── InvestInFundDialog.tsx + .test.tsx      # Source account + amount + currency; asBank toggle
│   │   ├── RedeemFromFundDialog.tsx + .test.tsx    # Amount or "withdraw full"; asBank toggle
│   │   └── MyFundsList.tsx + .test.tsx             # Per-position cards with Invest/Redeem
│   ├── profit/
│   │   ├── ActuaryPerformanceTable.tsx + .test.tsx # Sorted by realised_profit_rsd desc
│   │   └── BankFundPositionsTable.tsx              # Linked to /funds/:id with Invest/Redeem actions
│   ├── portfolio/
│   │   ├── HoldingTable.tsx + .test.tsx       # Holdings table with Make Public/Exercise actions
│   │   ├── HoldingsTable.tsx + .test.tsx      # Alternative holdings table variant
│   │   ├── MakePublicDialog.tsx + .test.tsx   # Dialog to set holding public quantity
│   │   ├── SellOrderDialog.tsx + .test.tsx    # Dialog to create sell order from portfolio
│   │   ├── PortfolioSummaryCard.tsx + .test.tsx # Summary stats card
│   │   ├── WatchlistPanel.tsx + .test.tsx     # Favorites tab: list dropdown, New list, delete, items
│   │   ├── CreateWatchlistDialog.tsx + .test.tsx # New named-list form (1–64 chars)
│   │   └── FavoritesTable.tsx + .test.tsx     # Tracked listings of the selected list
│   ├── tax/
│   │   ├── TaxTable.tsx + .test.tsx           # Tax records table (used in TaxPage)
│   │   └── TaxTrackingTable.tsx + .test.tsx   # Tax tracking table (used in TaxTrackingPage)
│   ├── cards/
│   │   ├── CardRequestDenyDialog.tsx     # Deny confirmation dialog with optional reason textarea
│   │   └── CardRequestDenyDialog.test.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx             # Sidebar + main content wrapper
│   │   ├── AuthLayout.tsx            # Full-screen GIF background + centered Outlet
│   │   └── Sidebar.tsx               # Nav links, user email, logout
│   │   └── Sidebar.test.tsx
│   ├── cards/
│   │   ├── CardVisual.tsx + .test.tsx    # Credit-card-shaped visual: gradient, chip, brand logo, status overlay
│   │   ├── CardBrandLogo.tsx + .test.tsx # SVG brand logos: Visa, Mastercard, DinaCard, Amex
│   │   ├── CardItem.tsx + .test.tsx      # User-facing card tile using CardVisual
│   │   ├── CardGrid.tsx + .test.tsx      # Responsive grid of CardItem components
│   │   ├── CardRequestForm.tsx + .test.tsx  # Account selector for card request
│   │   ├── AuthorizedPersonForm.tsx + .test.tsx  # Authorized person form (all fields incl. date_of_birth, gender)
│   │   └── VerificationCodeInput.tsx + .test.tsx  # SMS/OTP code input for card confirmation
│   ├── payments/
│   │   ├── NewPaymentForm.tsx + .test.tsx       # Payment form; "Payment Purpose" label; uses SavedRecipientSelect (~146 lines)
│   │   ├── SavedRecipientSelect.tsx              # Extracted select for saved recipients (onSelect: string => void)
│   │   ├── PaymentConfirmation.tsx + .test.tsx  # Confirmation step; props: {formData, currency, onConfirm, onBack, submitting, error}
│   │   ├── PaymentHistoryTable.tsx + .test.tsx  # Payment history table; PDF button uses e.stopPropagation()
│   │   ├── RecipientForm.tsx + .test.tsx        # Props: {onSubmit, onCancel?, submitting, isEditing?, defaultValues?}; button label: "Save"/"Add"
│   │   ├── RecipientList.tsx                    # Table of recipients with Edit/Delete buttons
│   │   └── AddRecipientPrompt.tsx               # Prompt to save new recipient after payment success
│   ├── transfers/
│   │   ├── CreateTransferForm.tsx + .test.tsx   # Transfer form; same-currency transfers allowed
│   │   ├── TransferPreview.tsx                  # Confirmation/preview step for transfers
│   │   └── TransferHistoryTable.tsx + .test.tsx # Transfer history; columns: Date, From, To, Amount, Final, Rate, Commission
│   ├── verification/
│   │   └── VerificationStep.tsx + .test.tsx     # OTP/SMS verification step (used by payments and transfers)
│   ├── admin/
│   │   ├── AdminCardItem.tsx + .test.tsx  # Admin card tile using CardVisual + block/unblock/deactivate buttons
│   │   ├── AccountTable.tsx + .test.tsx   # Admin account list table
│   │   ├── ClientTable.tsx + .test.tsx    # Admin client list table
│   │   ├── EditClientForm.tsx + .test.tsx # Admin edit client form
│   │   ├── RolesTable.tsx                 # Roles list table with edit-permissions action
│   │   ├── PermissionsTable.tsx           # Permissions list table
│   │   ├── CreateRoleDialog.tsx           # Dialog to create a new role
│   │   ├── EditRolePermissionsDialog.tsx  # Dialog to update a role's permissions
│   │   ├── InterestRateTiersTable.tsx     # Interest rate tiers table with CRUD actions
│   │   ├── BankMarginsTable.tsx           # Bank margins table with edit action
│   │   ├── CreateTierDialog.tsx           # Dialog to create an interest rate tier
│   │   ├── EditTierDialog.tsx             # Dialog to edit an interest rate tier
│   │   ├── EditMarginDialog.tsx           # Dialog to edit a bank margin
│   │   ├── FeesTable.tsx                  # Transfer fees table with edit/deactivate actions
│   │   ├── CreateFeeDialog.tsx            # Dialog to create a transfer fee
│   │   ├── EditFeeDialog.tsx              # Dialog to edit a transfer fee
│   │   ├── EditEmployeeLimitsDialog.tsx   # Dialog to edit an employee's limits
│   │   ├── EditClientLimitsDialog.tsx     # Dialog to edit a client's limits
│   │   ├── LimitTemplatesDialog.tsx       # Dialog to view/apply limit templates
│   │   └── CreateCardDialog.tsx + .test.tsx  # Dialog for employee card issuance: account search, client search, card brand dropdown
│   └── shared/
│       ├── ProtectedRoute.tsx        # Auth + permission guard
│       ├── ProtectedRoute.test.tsx
│       ├── FormField.tsx             # Reusable label + input + error wrapper
│       ├── PaginationControls.tsx    # Previous/Next + "Page X of Y" controls
│       ├── ErrorMessage.tsx          # Styled error paragraph
│       └── LoadingSpinner.tsx        # Animated spinner (data-testid="loading-spinner")
│
├── pages/
│   ├── LoginPage.tsx + .test.tsx
│   ├── PasswordResetRequestPage.tsx + .test.tsx
│   ├── PasswordResetPage.tsx + .test.tsx
│   ├── ActivationPage.tsx + .test.tsx
│   ├── EmployeeListPage.tsx + .test.tsx
│   ├── CreateEmployeePage.tsx + .test.tsx
│   ├── EditEmployeePage.tsx + .test.tsx
│   ├── HomePage.tsx + .test.tsx
│   ├── AccountListPage.tsx + .test.tsx
│   ├── AccountDetailsPage.tsx + .test.tsx
│   ├── AdminAccountsPage.tsx + .test.tsx
│   ├── AdminAccountCardsPage.tsx + .test.tsx     # Lists cards for an account; block/unblock/deactivate per card; "Create Card" button opens CreateCardDialog
│   ├── BankAccountActivityPage.tsx + .test.tsx  # Paginated ledger (debit/credit) for a bank-owned account; employee-only (bank-accounts.manage)
│   ├── AdminClientsPage.tsx + .test.tsx
│   ├── AdminCardRequestsPage.tsx + .test.tsx
│   ├── AdminLoanRequestsPage.tsx + .test.tsx
│   ├── AdminLoansPage.tsx + .test.tsx
│   ├── ActuaryListPage.tsx + .test.tsx
│   ├── StockExchangesPage.tsx + .test.tsx
│   ├── SecuritiesPage.tsx + .test.tsx
│   ├── StockDetailPage.tsx + .test.tsx
│   ├── FuturesDetailPage.tsx + .test.tsx
│   ├── ForexDetailPage.tsx + .test.tsx
│   ├── CreateOrderPage.tsx + .test.tsx
│   ├── MyOrdersPage.tsx + .test.tsx
│   ├── PortfolioPage.tsx + .test.tsx
│   ├── AdminOrdersPage.tsx + .test.tsx
│   ├── TaxPage.tsx + .test.tsx
│   ├── TaxTrackingPage.tsx + .test.tsx   # (not yet routed)
│   ├── OtcPortalPage.tsx + .test.tsx     # /otc — role-aware: clients use BuyOtcDialog, employees use BuyOnBehalfOtcDialog
│   ├── FundsDiscoveryPage.tsx            # /funds — search + active-only + InvestInFundDialog
│   ├── FundDetailsPage.tsx               # /funds/:id — hero cards + NAV chart + allocation pie + risk metrics + details + holdings + Invest
│   ├── FundPortfolioView.tsx             # /funds/:id/portfolio — portfolio-style page (summary + perf + enriched holdings)
│   ├── CreateFundPage.tsx                # /funds/new — gated on funds.manage
│   ├── ActuaryPerformancePage.tsx        # /admin/profit/actuaries — gated on actuaries.read.all
│   ├── BankFundPositionsPage.tsx         # /admin/profit/funds — gated on funds.bank-position-read; reuses Invest/Redeem dialogs with asBank
│   ├── AdminRolesPage.tsx + .test.tsx
│   ├── AdminEmployeeLimitsPage.tsx + .test.tsx
│   ├── AdminClientLimitsPage.tsx
│   ├── AdminInterestRatesPage.tsx + .test.tsx
│   ├── AdminFeesPage.tsx + .test.tsx
│   ├── AdminPeerBanksPage.tsx + .test.tsx  # Settings: SI-TX peer bank registry CRUD
│   ├── CardListPage.tsx + .test.tsx
│   ├── CardRequestPage.tsx + .test.tsx
│   ├── CreateAccountPage.tsx + .test.tsx
│   ├── CreateClientPage.tsx + .test.tsx
│   ├── CreateTransferPage.tsx + .test.tsx
│   ├── EditClientPage.tsx + .test.tsx
│   ├── ExchangeCalculatorPage.tsx + .test.tsx
│   ├── ExchangeRatesPage.tsx + .test.tsx
│   ├── InternalTransferPage.tsx + .test.tsx
│   ├── LoanApplicationPage.tsx + .test.tsx
│   ├── LoanDetailsPage.tsx + .test.tsx
│   ├── LoanListPage.tsx + .test.tsx
│   ├── NewPaymentPage.tsx + .test.tsx
│   ├── PaymentHistoryPage.tsx + .test.tsx
│   ├── PaymentRecipientsPage.tsx + .test.tsx
│   └── TransferHistoryPage.tsx + .test.tsx
│
├── store/
│   ├── index.ts                      # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts              # Auth domain: login, logout, token refresh
│   │   └── authSlice.test.ts
│   └── selectors/
│       ├── authSelectors.ts          # Memoized reselect selectors
│       └── authSelectors.test.ts
│
├── hooks/
│   ├── useAppDispatch.ts             # Typed Redux dispatch
│   ├── useAppSelector.ts             # Typed Redux selector
│   ├── useEmployees.ts + .test.ts    # React Query: fetch employees with server-side filters
│   ├── useEmployee.ts + .test.ts     # React Query: fetch single employee
│   ├── useMutationWithRedirect.ts + .test.ts  # Mutation + invalidate + navigate
│   ├── usePagination.ts + .test.ts   # Client-side pagination over an array
│   ├── useActuaries.ts + .test.ts   # React Query: actuaries CRUD hooks
│   ├── useStockExchanges.ts + .test.ts # React Query: stock exchanges + testing mode hooks
│   ├── useSecurities.ts + .test.ts   # React Query: stocks, futures, forex, options hooks
│   ├── useOrders.ts + .test.ts       # React Query: orders CRUD hooks (my + admin)
│   ├── usePortfolio.ts + .test.ts    # React Query: portfolio, holdings, exercise hooks
│   ├── useWatchlist.ts + .test.ts    # React Query: named watchlists + items + membership hooks
│   ├── useTax.ts + .test.ts          # React Query: tax records + collect hooks
│   ├── useOtc.ts + .test.ts          # React Query: OTC offers + buy hooks
│   ├── useRoles.ts                   # React Query: roles CRUD hooks
│   ├── usePermissions.ts             # React Query: permissions + employee role/permission assignment
│   ├── useFees.ts                    # React Query: transfer fees CRUD hooks
│   ├── useInterestRateTiers.ts       # React Query: interest rate tiers CRUD + apply hooks
│   ├── useBankMargins.ts             # React Query: bank margins + update hooks
│   └── useLimits.ts                  # React Query: employee/client limits + template hooks
│
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors (token refresh, runtime baseURL)
│   │   ├── backendHost.ts + .test.ts # Runtime-configurable backend host (5 presets + custom URL, persisted in localStorage)
│   │   ├── auth.ts + .test.ts        # Auth API calls
│   │   ├── employees.ts + .test.ts   # Employee CRUD API calls
│   │   ├── accounts.ts               # Account API calls
│   │   ├── cards.ts                  # Card API calls
│   │   ├── clients.ts                # Client CRUD API calls
│   │   ├── exchange.ts + .test.ts    # Exchange rates API calls
│   │   ├── loans.ts                  # Loan API calls
│   │   ├── payments.ts               # Payment API calls
│   │   ├── transfers.ts              # Transfer API calls
│   │   ├── verification.ts           # Verification API calls
│   │   ├── roles.ts + .test.ts       # Roles & permissions API calls
│   │   ├── interestRateTiers.ts + .test.ts  # Interest rate tiers API calls
│   │   ├── bankMargins.ts + .test.ts # Bank margins API calls
│   │   ├── actuaries.ts + .test.ts   # Actuary API calls
│   │   ├── stockExchanges.ts + .test.ts # Stock exchange API calls
│   │   ├── securities.ts + .test.ts # Securities API calls (stocks, futures, forex, options)
│   │   ├── orders.ts + .test.ts     # Orders API calls (create, cancel, approve, decline)
│   │   ├── portfolio.ts + .test.ts  # Portfolio API calls (holdings, make public, exercise)
│   │   ├── watchlist.ts + .test.ts  # Named watchlist API calls (lists + items)
│   │   ├── tax.ts + .test.ts        # Tax API calls (records, collect)
│   │   ├── otc.ts + .test.ts        # OTC API calls (offers, buy)
│   │   ├── fees.ts                  # Transfer fees API calls (CRUD)
│   │   ├── limits.ts                # Employee/client limits + template API calls
│   │   └── permissions.ts + .test.ts # Permissions API + employee role/permission assignment
│   └── utils/
│       ├── constants.ts              # EMPLOYEE_ROLES, GENDERS, COUNTRY_CODES, formatRoleLabel
│       ├── banking.ts                # CARD_BRANDS, CARD_STATUSES, CARD_STATUS_LABELS, CARD_STATUS_VARIANT, CARD_LIMITS
│       ├── format.ts + .test.ts      # maskCardNumber (spaced format), formatAccountNumber, formatCurrency
│       ├── dateFormatter.ts + .test.ts  # todayISO, formatDateDisplay, formatDateLocale
│       ├── watchlist.ts + .test.ts   # Watchlist label helpers (default list → "Favorites")
│       ├── jwt.ts + .test.ts         # JWT decode utility
│       └── validation.ts + .test.ts  # Zod schemas
│
├── types/
│   ├── auth.ts                       # Auth-related TypeScript interfaces
│   ├── employee.ts                   # Employee-related TypeScript interfaces
│   ├── account.ts                    # Account-related TypeScript interfaces
│   ├── authorized-person.ts          # Authorized person interfaces
│   ├── card.ts                       # CardStatus, CardType, CardBrand ('VISA'|'MASTERCARD'|'DINACARD'|'AMEX'), Card, CreateCardPayload interfaces
│   ├── cardRequest.ts                # CardRequest, CardRequestListResponse, CardRequestFilters types
│   ├── client.ts                     # Client-related TypeScript interfaces
│   ├── exchange.ts                   # Exchange rate interfaces
│   ├── filters.ts                    # Shared filter interfaces
│   ├── loan.ts                       # Loan-related TypeScript interfaces
│   ├── payment.ts                    # Payment-related TypeScript interfaces
│   ├── transfer.ts                   # Transfer-related TypeScript interfaces
│   ├── verification.ts               # Verification interfaces
│   ├── roles.ts                      # Role, Permission, CreateRolePayload interfaces
│   ├── interestRateTiers.ts          # InterestRateTier, CreateTierPayload interfaces
│   ├── bankMargins.ts                # BankMargin interface
│   ├── actuary.ts                    # Actuary, ActuaryListResponse, ActuaryFilters, SetLimitPayload, SetApprovalPayload
│   ├── stockExchange.ts             # StockExchange, StockExchangeListResponse, StockExchangeFilters, TestingModeResponse
│   ├── security.ts                  # Stock, FuturesContract, ForexPair, Option, PriceHistory types + filters
│   ├── order.ts                     # Order, CreateOrderPayload, OrderFilters types
│   ├── portfolio.ts                 # Holding, PortfolioSummary, PortfolioFilters types
│   ├── watchlist.ts                 # WatchlistItem, Watchlist, WatchlistsResponse, CreateWatchlistPayload types
│   ├── tax.ts                       # TaxRecord, TaxFilters, CollectTaxResponse types
│   ├── otc.ts                       # OtcOffer, OtcOfferListResponse, OtcBuyRequest, OtcFilters types
│   ├── fee.ts                       # TransferFee, FeeListResponse, CreateFeePayload, UpdateFeePayload types
│   ├── limits.ts                    # EmployeeLimits, ClientLimits, LimitTemplate, update payload types
│   └── verification.ts              # Verification interfaces
│
├── contexts/                         # Reserved for theme/locale (currently empty)
├── assets/
│   └── people-walking.gif            # Auth page background
├── assets.d.ts                       # GIF/image type declaration
├── App.tsx                           # Route definitions
└── main.tsx                          # React DOM entry + providers
```

---

## 4. Routes

### Public Routes (AuthLayout)

| Route | Page | Notes |
|---|---|---|
| `/login` | LoginPage | Unified login for employees and clients; redirects based on `userType` from Redux state |
| `/password-reset-request` | PasswordResetRequestPage | Sends reset email |
| `/password-reset?token=...` | PasswordResetPage | Completes reset with URL token |
| `/activate?token=...` | ActivationPage | Sets initial password for new accounts |

### Protected Routes — Employee Portal (AppLayout + ProtectedRoute)

| Route | Page | Required Permission |
|---|---|---|
| `/employees` | EmployeeListPage | `employees.read` |
| `/employees/new` | CreateEmployeePage | `employees.create` |
| `/employees/:id` | EditEmployeePage | `employees.update` |
| `/admin/accounts` | AdminAccountsPage | admin |
| `/admin/accounts/:id/cards` | AdminAccountCardsPage | admin |
| `/admin/bank-accounts/:id/activity` | BankAccountActivityPage | `bank-accounts.manage` |
| `/admin/clients` | AdminClientsPage | admin |
| `/admin/clients/new` | CreateClientPage | admin |
| `/admin/clients/:id` | EditClientPage | admin |
| `/admin/cards/requests` | AdminCardRequestsPage | Employee |
| `/admin/loan-requests` | AdminLoanRequestsPage | admin |
| `/admin/loans` | AdminLoansPage | admin |
| `/admin/actuaries` | ActuaryListPage | `agents.manage` |
| `/admin/stock-exchanges` | StockExchangesPage | Employee |
| `/admin/exchange-rates` | ExchangeRatesPage | admin |
| `/admin/orders` | AdminOrdersPage | `orders.approve` |
| `/admin/tax` | TaxPage | `tax.manage` |
| `/admin/roles` | AdminRolesPage | `employees.permissions` |
| `/admin/limits/employees` | AdminEmployeeLimitsPage | `limits.manage` |
| `/admin/limits/clients` | AdminClientLimitsPage | `limits.manage` |
| `/admin/interest-rates` | AdminInterestRatesPage | `interest-rates.manage` |
| `/admin/fees` | AdminFeesPage | `fees.manage` |
| `/admin/peer-banks` | AdminPeerBanksPage | `requireAdmin` |

### Protected Routes — Shared Trading (AppLayout + ProtectedRoute)

| Route | Page | Notes |
|---|---|---|
| `/securities` | SecuritiesPage | Any authenticated — tabbed (Stocks/Futures/Forex) |
| `/securities/stocks/:id` | StockDetailPage | Chart + info + options chain |
| `/securities/futures/:id` | FuturesDetailPage | Chart + info |
| `/securities/forex/:id` | ForexDetailPage | Chart + info |
| `/securities/order/new` | CreateOrderPage | `?listingId=X&direction=buy` query params |
| `/orders` | MyOrdersPage | User's own orders |
| `/portfolio` | PortfolioPage | Holdings + summary |

### Protected Routes — Client Portal (AppLayout + ProtectedRoute)

| Route | Page | Notes |
|---|---|---|
| `/home` | HomePage | Client dashboard |
| `/accounts` | AccountListPage | Client account list |
| `/accounts/:id` | AccountDetailsPage | Account details |
| `/cards` | CardListPage | Client card list |
| `/cards/request` | CardRequestPage | Request a new card |
| `/create-account` | CreateAccountPage | Open a new account |
| `/transfer` | CreateTransferPage | Initiate a transfer |
| `/internal-transfer` | InternalTransferPage | Internal transfer between own accounts |
| `/payment-history` | PaymentHistoryPage | Payment history |
| `/payment-recipients` | PaymentRecipientsPage | Manage payment recipients |
| `/new-payment` | NewPaymentPage | Create a new payment |
| `/loans` | LoanListPage | Client loan list |
| `/loans/:id` | LoanDetailsPage | Loan details |
| `/loan-application` | LoanApplicationPage | Apply for a loan |
| `/exchange-calculator` | ExchangeCalculatorPage | Currency exchange calculator |
| `/transfer-history` | TransferHistoryPage | Transfer history |

**Catch-all:** `*` redirects to `/login`.

---

## 5. Pages

### LoginPage
- Renders `BackendSelector` (dropdown to choose which backend the frontend talks to) above `LoginForm`. Background GIF is provided by `AuthLayout`.
- Handles unified login for both employees and clients via a single `/login` route.
- After successful login, reads `userType` from Redux state (derived from JWT `system_type` field): redirects employees to `/admin/accounts`, clients to `/home`.

### PasswordResetRequestPage
- Renders `PasswordResetRequestForm`.
- On success, shows a confirmation message.

### PasswordResetPage
- Reads `?token` from URL query params and passes it to `PasswordResetForm`.
- On success, shows a confirmation message.

### ActivationPage
- Reads `?token` from URL query params and passes it to `ActivationForm`.
- On success, shows a confirmation message.

### EmployeeListPage
- Two tabs: **Employees** and **Me**.
- **Employees tab:**
  - Fetches employees via `useEmployees(apiFilters)` with **server-side filtering and pagination**.
  - Filter state (`category` + `value`) and `page` are kept in local React state.
  - `apiFilters` is built from state: `{ page, page_size: 20, [category]: value }`.
  - Changing filter resets page to 1.
  - `totalPages` derived from `data.total_count / PAGE_SIZE`.
  - Renders `EmployeeFilters` + `EmployeeTable` + `PaginationControls`.
- **Me tab:**
  - Rendered by `EmployeeProfileTab` — fetches and displays the current user's read-only profile.

### CreateEmployeePage
- Admin-only (requires `employees.create`).
- Renders `EmployeeForm` in create mode.
- On success, invalidates `['employees']` query and navigates to `/employees`.

### EditEmployeePage
- Fetches employee by `:id` via `useEmployee(id)`.
- Renders `EmployeeForm` in edit mode.
- If the employee is an admin (`EmployeeAdmin` role), form is read-only.
- On success, invalidates `['employees']` query and navigates to `/employees`.

### AdminCardRequestsPage
- Employee-only (`requiredRole="Employee"`).
- Fetches pending card requests via `useCardRequests({ status: 'pending', page, page_size: 10 })`.
- Resolves client names via `useAllClients()` lookup map (`clientsById`).
- Table columns: First Name | Last Name | Account Number | Card Type | Actions.
- **Approve** button: fires `useApproveCardRequest` mutation immediately.
- **Deny** button: sets `selectedRequestId` state to open `CardRequestDenyDialog`.
- Deny dialog rendered once outside the table; controlled by `selectedRequestId: number | null`.
- Pagination: `PAGE_SIZE = 10`, `PaginationControls`.

### ActuaryListPage
- Supervisor portal page for managing trading agents (actuaries).
- Requires `agents.manage` permission.
- Fetches actuaries via `useActuaries(apiFilters)` with server-side filtering (search, position) and pagination.
- Filter state and `page` kept in local React state; changing filter resets page to 1.
- Actions: Edit Limit (opens `EditLimitDialog`), Reset Used Limit, Toggle Approval.
- Mutations: `useSetActuaryLimit`, `useResetActuaryLimit`, `useSetActuaryApproval`.

### StockExchangesPage
- Displays list of stock exchanges with search filter and pagination.
- Accessible to all employees (`requiredRole="Employee"`).
- Testing mode toggle button visible to admins (`EmployeeAdmin`) and to users with `exchanges.manage` permission (checked via `selectHasPermission`, which bypasses for admins).
- Fetches exchanges via `useStockExchanges(apiFilters)` and testing mode via `useTestingMode()`.
- Toggle calls `useSetTestingMode` mutation.

### SecuritiesPage
- Tabbed interface: Stocks, Futures, Forex tabs (clients see Stocks + Futures only).
- Each tab has FilterBar with search + pagination.
- Fetches via `useStocks`, `useFutures`, `useForexPairs` hooks.
- Rows link to detail pages (`/securities/stocks/:id`, etc.).

### StockDetailPage
- Fetches stock via `useStock(id)` and price history via `useStockHistory(id, period)`.
- Renders `SecurityInfoPanel` + `PriceChart` + `OptionsChain` for the stock's options.
- Buy/Sell buttons link to `CreateOrderPage`.

### FuturesDetailPage
- Fetches futures contract via `useFuture(id)` and price history.
- Renders `SecurityInfoPanel` + `PriceChart`. Buy/Sell buttons.

### ForexDetailPage
- Fetches forex pair via `useForexPair(id)` and price history.
- Renders `SecurityInfoPanel` + `PriceChart`. Buy/Sell buttons.

### CreateOrderPage
- Reads `listingId` and `direction` from URL query params.
- Renders `CreateOrderForm` with fields: direction, order type, quantity, limit/stop values, account.
- Submits via `useCreateOrder` mutation.

### MyOrdersPage
- Fetches user's orders via `useMyOrders(filters)`.
- FilterBar (status, direction, type) + `OrderTable` with Cancel action + pagination.

### PortfolioPage
- Fetches holdings via `usePortfolio(filters)` and summary via `usePortfolioSummary()`.
- Renders `PortfolioSummaryCard` + security_type filter + `HoldingTable` + pagination.
- Actions: Make Public (opens `MakePublicDialog`), Exercise (for options).
- Make Public uses `useMakePublic` mutation; Exercise uses `useExerciseOption` mutation.
- Tabs (URL-synced via `?tab=`): My Holdings, My Funds, My Price Alerts, Favorites, and **Recurring Orders** (`?tab=recurring-orders`). The Recurring Orders tab renders `RecurringOrdersTable` from `useRecurringOrders()` with Pause/Resume/Cancel wired to `usePause/Resume/CancelRecurringOrder` mutations. The **Favorites** tab renders `WatchlistPanel` — a list dropdown (default shown as "Favorites"), a "New list" button, per-list delete, and the selected list's `FavoritesTable` (named watchlists via `/me/watchlists`).

### AdminOrdersPage
- Supervisor view for order approval. Requires `orders.approve` permission.
- Fetches all orders via `useAllOrders(filters)`.
- FilterBar (status, direction, type) + `OrderTable` with Approve/Decline actions + pagination.

### TaxPage
- Tax management page. Requires `tax.manage` permission.
- Fetches tax records via `useTaxRecords(filters)`.
- FilterBar (user_type, search) + `TaxTable` + pagination.
- "Collect Taxes" button triggers `useCollectTaxes` mutation.

### AdminRolesPage
- Settings page for role and permission management. Requires `employees.permissions` permission.
- Two tabs: **Roles** and **Permissions**.
- **Roles tab:** Fetches roles via `useRoles()`; renders `RolesTable` with Create and Edit Permissions actions.
  - Create Role: opens `CreateRoleDialog`.
  - Edit Permissions: opens `EditRolePermissionsDialog` to update role's permission codes.
- **Permissions tab:** Fetches all permissions via `usePermissions()`; renders `PermissionsTable` (read-only).

### AdminEmployeeLimitsPage
- Settings page for employee limits management. Requires `limits.manage` permission.
- Two tabs: **Employee Limits** and **Limit Templates**.
- **Employee Limits tab:** Fetches employees via `useEmployees()`; renders inline table with Edit Limits button per row.
  - Edit Limits: opens `EditEmployeeLimitsDialog`; uses `useUpdateEmployeeLimits` mutation.
  - Apply Template: uses `useApplyLimitTemplate` mutation.
- **Limit Templates tab:** Fetches templates via `useLimitTemplates()`; renders table; uses `useLimitTemplatesDialog` for creation.
- Pagination: `PAGE_SIZE = 10`, `PaginationControls`.

### AdminClientLimitsPage
- Settings page for client limits management. Requires `limits.manage` permission.
- Fetches all clients via `useAllClients()`; renders inline table with Edit Limits button per row.
- Edit Limits: opens `EditClientLimitsDialog`; uses `useUpdateClientLimits` mutation.
- Pagination: `PAGE_SIZE = 10`, `PaginationControls`.

### AdminInterestRatesPage
- Settings page for interest rate tiers and bank margins. Requires `interest-rates.manage` permission.
- Two tabs: **Interest Rate Tiers** and **Bank Margins**.
- **Interest Rate Tiers tab:** Fetches tiers via `useInterestRateTiers()`; renders `InterestRateTiersTable`.
  - Create, Edit, Delete (soft), Apply tier via respective mutations.
- **Bank Margins tab:** Fetches margins via `useBankMargins()`; renders `BankMarginsTable`.
  - Edit margin: opens `EditMarginDialog`; uses `useUpdateBankMargin` mutation.

### AdminFeesPage
- Settings page for transfer fee management. Requires `fees.manage` permission.
- Fetches fees via `useFees()`; renders `FeesTable` with Create, Edit, Deactivate actions.
- Create: opens `CreateFeeDialog`; Edit: opens `EditFeeDialog`; Deactivate: confirmation dialog → `useDeleteFee` mutation.
- Mutations: `useCreateFee`, `useUpdateFee`, `useDeleteFee`.

### AdminPeerBanksPage
- Settings page for the SI-TX cross-bank peer registry. Admin-only (`requireAdmin`); see REST_API_v3 §38.
- Fetches the registry via `usePeerBanks()` (`GET /api/v3/peer-banks`); renders `PeerBanksTable` with Edit, Disable/Enable, and Remove actions per row.
- **Add Peer Bank** dialog (`CreatePeerBankDialog`): collects `bank_code`, `routing_number`, `base_url`, `api_token` (required) plus optional `hmac_inbound_key` / `hmac_outbound_key` and an `active` flag. Validates the URL is `http(s)://...` before submit.
- **Edit Peer Bank** dialog (`EditPeerBankDialog`): updates `base_url` / `active`; lets the admin rotate `api_token` and HMAC keys (blank fields keep the current secret). Identifying fields (`bank_code`, `routing_number`) are read-only after creation.
- **Toggle Active** is a one-click `PUT /api/v3/peer-banks/:id` with `{active: !current}` — disabling a peer immediately stops both inbound and outbound traffic without losing the configuration.
- **Remove** confirms via dialog before `DELETE /api/v3/peer-banks/:id`.
- API: `lib/api/peerBanks.ts`. Hooks: `usePeerBanks`, `useCreatePeerBank`, `useUpdatePeerBank`, `useDeletePeerBank` (`hooks/usePeerBanks.ts`). Types: `types/peerBank.ts`.

### OtcPortalPage
- OTC trading portal for clients.
- Fetches OTC offers via `useOtcOffers()`; fetches client accounts via `useClientAccounts()`.
- Renders `OtcOffersTable`. Selecting an offer opens `BuyOtcDialog` to specify quantity and account.
- Buy action uses `useBuyOtcOffer` mutation; invalidates `['otc-offers']` and `['portfolio']`.

### TaxTrackingPage _(created, not yet routed)_
- Alternative tax tracking page (complements `TaxPage`).
- Fetches tax records via `useTaxRecords(filters)`; renders `TaxTrackingTable`.
- Filters: search input, user_type select. "Collect Taxes" button.

---

## 6. Components

### Account Components

**LimitsUsageCard** (`components/accounts/LimitsUsageCard.tsx`)
- Displays daily and monthly spending usage as progress bars with amounts.
- Props: `dailyLimit`, `monthlyLimit`, `dailySpending?`, `monthlySpending?` (all numbers).
- Shown on `AccountDetailsPage` below account details.

---

### Auth Components

**AuthFormCard** (`components/auth/AuthFormCard.tsx`)
- Shared card wrapper used by all four auth forms.
- Renders a `Card` with `border-t-4 border-t-primary`.
- Props: `title`, `children`, `error?`, `isSuccess?`, `successContent?`
- When `isSuccess=true`: renders `successContent` instead of the form.

**LoginForm** (`components/auth/LoginForm.tsx`, ~82 lines)
- Fields: email, password
- Validation: `loginSchema` (Zod)
- Dispatches `loginThunk`; shows error message on failure
- Link to `/password-reset-request`

**PasswordResetRequestForm** (~76 lines)
- Field: email
- On submit: calls `requestPasswordReset(email)` API
- On success: replaces form with confirmation message + back-to-login link

**PasswordResetForm** (~87 lines)
- Fields: new_password, confirm_password
- Validation: `passwordResetSchema` (8+ chars, 2+ digits, 1+ uppercase, 1+ lowercase, must match)
- On submit: calls `resetPassword({token, new_password, confirm_password})`
- On success: confirmation message

**ActivationForm** (~82 lines)
- Fields: password, confirm_password
- Validation: `activationSchema`
- On submit: calls `activateAccount({token, password, confirm_password})`
- On success: confirmation message

**BackendSelector** (`components/auth/BackendSelector.tsx`)
- Dropdown to choose the API host the frontend talks to. Five presets: `localhost` (`http://localhost:8080`), `instance1` / `instance2` / `instance3` (`https://project-exbanka.bytenity.com/instanceN`), and `custom` (user-entered URL).
- Persists selection in `localStorage` under `exbanka.backendPreset` / `exbanka.backendCustomUrl`. Selecting a preset persists immediately; the custom URL requires hitting **Apply** and is validated as `http(s)://...`.
- Optional `onHostChange(host)` callback fires after a successful save.
- Backed by `lib/api/backendHost.ts` (presets, getters, `setSelection`, `subscribeToHostChange`); `lib/api/axios.ts` reads the host on every request, so a switch takes effect without a rebuild.

**BackendSwitcherButton** (`components/auth/BackendSwitcherButton.tsx`)
- Sidebar entry that opens a dialog containing `BackendSelector` for in-app switching. The Sidebar wires `onHostChange` to clear tokens (`sessionStorage`), `queryClient.clear()`, dispatch `clearAuth()`, and navigate to `/login` — since a new backend issues different tokens, the existing session is no longer valid.

---

### Employee Components

**EmployeeForm** (~24 lines) — thin wrapper
- Delegates to `EmployeeCreateForm` (when no `employee` prop) or `EmployeeEditForm` (when `employee` prop present).

**EmployeeCreateForm** (~131 lines)
- All fields, date of birth required, converts DOB string to Unix timestamp on submit.
- Imports constants from `lib/utils/constants`, date helpers from `lib/utils/dateFormatter`.

**EmployeeEditForm** (~143 lines)
- Read-only fields: first_name, email, username, date_of_birth.
- Editable: last_name, gender, phone (via `PhoneInput`), address, position, department, role, active, jmbg.
- Shows admin warning banner when `readOnly=true`.

**PhoneInput** (`components/employees/PhoneInput.tsx`)
- Country code dropdown (30+ countries from `lib/utils/constants`) + phone number text input.

**EmployeeProfileTab** (`components/employees/EmployeeProfileTab.tsx`)
- "Me" tab content: fetches current user's employee record via `useEmployee(currentUser.id)`.
- Displays a read-only `EmployeeForm` with loading/error states.

**EmployeeTable** (~47 lines)
- Renders a Shadcn `Table` with columns: Name, Email, Position, Phone, Status.
- Each row is clickable → calls `onRowClick(id)`.
- Status column uses `EmployeeStatusBadge`.

**EmployeeFilters** (~85 lines)
- Category dropdown: **Name**, Email, Position (aligned with API `EmployeeFilters` fields).
- Text search input with clear (X) button.
- Calls `onFilterChange({category, value})` or `onFilterChange(null)` to clear.

**EmployeeStatusBadge** (~13 lines)
- `active: true` → green "Active" badge
- `active: false` → gray "Inactive" badge

---

### Cards Components

**CardRequestDenyDialog** (`components/cards/CardRequestDenyDialog.tsx`)
- Shadcn `Dialog` with title "Deny Card Request".
- `Textarea` with placeholder "Reason (optional)".
- Footer: Cancel (`ghost` variant) + "Confirm Deny" (`destructive` variant).
- Props: `open: boolean`, `onClose: () => void`, `onConfirm: (reason: string) => void`
- Uses inner component pattern (`CardRequestDenyDialogInner`) to reset textarea state on close via natural unmount.

---

### Actuary Components

**ActuaryTable** (`components/actuaries/ActuaryTable.tsx`)
- Displays actuaries in a Shadcn `Table` with columns: Name, Email, Position, Limit, Used Limit, Approval, Actions.
- Props: `actuaries: Actuary[]`, `onEditLimit`, `onResetLimit`, `onToggleApproval`.
- Action buttons per row: Edit Limit, Reset, Toggle Approval.

**EditLimitDialog** (`components/actuaries/EditLimitDialog.tsx`)
- Shadcn `Dialog` for editing an agent's trading limit.
- Props: `open`, `actuary`, `onClose`, `onConfirm(limit: string)`.
- Uses inner component pattern (`EditLimitDialogInner`) to reset input state on close.
- Input pre-filled with current limit value.

---

### Stock Exchange Components

**StockExchangeTable** (`components/stockExchanges/StockExchangeTable.tsx`)
- Displays stock exchanges in a Shadcn `Table` with columns: Name, Acronym, MIC Code, Country, Currency, Time Zone.
- Props: `exchanges: StockExchange[]`.
- Time zone displayed as `UTC+/-X` format.

---

### Securities Components

**StockTable** (`components/securities/StockTable.tsx`)
- Displays stocks in a Shadcn `Table` with columns: Ticker, Name, Exchange, Price, Change, Volume.
- Props: `stocks: Stock[]`, `onRowClick`.

**FuturesTable** (`components/securities/FuturesTable.tsx`)
- Displays futures contracts. Columns: Ticker, Name, Exchange, Price, Change, Settlement Date.
- Props: `futures: FuturesContract[]`, `onRowClick`.

**ForexTable** (`components/securities/ForexTable.tsx`)
- Displays forex pairs. Columns: Ticker, Name, Rate, Liquidity, Change, Volume.
- Props: `pairs: ForexPair[]`, `onRowClick`.

**PriceChart** (`components/securities/PriceChart.tsx`)
- Recharts `LineChart` showing price history with period selector (day/week/month/year/5y/all).
- Props: `history: PriceHistoryEntry[]`, `period`, `onPeriodChange`.

**SecurityInfoPanel** (`components/securities/SecurityInfoPanel.tsx`)
- Key-value display panel for security details (price, bid, ask, volume, margins, etc.).
- Props: `entries: { label: string; value: string }[]`.

**OptionsChain** (`components/securities/OptionsChain.tsx`)
- Calls/Puts options chain table with ITM/OTM coloring.
- Props: `options: Option[]`, `currentPrice: string`.

**WatchlistButton** (`views/securities/components/WatchlistButton.tsx`)
- Heart toggle rendered per row in the Stocks/Futures/Forex/Options tables. Filled when the listing is in **any** of the caller's lists (`inWatchlist`). Clicking always opens the add-to-list picker — removal is done from the Favorites tab.
- Props: `listingId`, `ticker`, `inWatchlist`, `disabled?`, `onOpen(listingId, ticker)`.

**AddToWatchlistDialog** (`views/securities/components/AddToWatchlistDialog.tsx`)
- Dialog opened by the heart. A `Select` of the caller's watchlists (default shown as "Favorites" via `displayWatchlistName`); confirming POSTs to `/me/watchlists/:id/items`. Disabled when the caller has no lists.
- Props: `open`, `onOpenChange`, `listing: { listing_id, ticker }`, `watchlists: Watchlist[]`, `onSubmit(watchlistId)`, `loading`.

> The four securities tables (`StockTable`, `FuturesTable`, `ForexTable`, `OptionsTable`) take `watchlistIds?: Set<number>` (membership for the filled heart) and `onOpenWatchlist?: (listingId, ticker) => void`.

---

### Order Components

**CreateOrderForm** (`views/orders/components/CreateOrderForm.tsx`)
- Order form: direction (buy/sell), order type, quantity, conditional limit/stop values, account selector.
- State/payload logic lives in the `useCreateOrderForm` hook; order-type/limit/stop fields are extracted to `OrderTypeFields`.
- Scheduling: when `schedulingEnabled` (any market **buy** of a non-option/non-forex security, by a client or an employee in any charge mode) and order type is Market, a **"Schedule order"** checkbox renders `ScheduleOrderFields` (frequency Weekly/Monthly). Checked, the primary button becomes **"Place order and schedule"** (buy now + create recurring order) and a secondary **"Schedule"** button creates the recurring order only. Note: `/me/recurring-orders` is caller-scoped, so an employee's template is created under the employee principal (with the chosen `account_id`), not the client/fund being charged.
- Props: `defaultDirection`, `onSubmit(payload, frequency?)`, `submitting`, `listingId?`, `accounts?`, `depositAccounts?`, `schedulingEnabled?`, `onScheduleOnly?`.

**OrderTypeFields** (`views/orders/components/OrderTypeFields.tsx`)
- Order-type select with conditional Limit/Stop value inputs. Extracted from `CreateOrderForm`.

**ScheduleOrderFields** (`views/orders/components/ScheduleOrderFields.tsx`)
- "Schedule order" checkbox + Frequency (Weekly/Monthly) select for recurring buy templates.

**OrderTable** (`components/orders/OrderTable.tsx`)
- Reusable orders table. Columns: Ticker, Security, Direction, Type, Quantity, Status, Actions.
- Props: `orders: Order[]`, `onCancel?`, `onApprove?`, `onDecline?`. Actions shown conditionally for pending orders.

**OrdersTable** (`components/orders/OrdersTable.tsx`)
- Simplified admin orders table (approve/decline only, no cancel).
- Props: `orders: Order[]`, `onApprove?`, `onDecline?`.

---

### Portfolio Components

**HoldingTable** (`components/portfolio/HoldingTable.tsx`)
- Holdings table. Columns: Ticker, Name, Type, Qty, Avg Price, Current, P&L, P&L%, Public, Actions.
- Props: `holdings: Holding[]`, `onMakePublic`, `onExercise`.
- "Make Public" shown for non-public holdings. "Exercise" shown for option holdings.

**HoldingsTable** (`components/portfolio/HoldingsTable.tsx`)
- Alternative holdings table variant (complements `HoldingTable`).

**MakePublicDialog** (`components/portfolio/MakePublicDialog.tsx`)
- Dialog to set a holding's public quantity.
- Props: `open`, `holding: Holding`, `onClose`, `onConfirm(quantity: number)`.

**SellOrderDialog** (`components/portfolio/SellOrderDialog.tsx`)
- Dialog to pre-fill and submit a sell order directly from the portfolio view.

**PortfolioSummaryCard** (`components/portfolio/PortfolioSummaryCard.tsx`)
- Grid of summary stats: Total Value, Total Cost, Profit/Loss (color-coded), Holdings count.
- Props: `summary: PortfolioSummary`.

**RecurringOrdersTable** (`views/portfolio/components/RecurringOrdersTable.tsx`)
- Lists the caller's recurring-order templates. Columns: Security (ticker via `useListingMap`, fallback `#<listing_id>`), Side, Quantity, Frequency (`Weekly · <weekday>` / `Monthly · day <n>`), Status (Badge), Actions.
- Status-aware actions: `active` → Pause + Cancel; `paused` → Resume + Cancel; `cancelled` → none. Cancel opens `CancelRecurringOrderDialog` and only fires `onCancel` after confirmation. Buttons disabled while `busyId === order.id`.
- Props: `orders: RecurringOrder[]`, `onPause(id)`, `onResume(id)`, `onCancel(id)`, `busyId?: number`.

**CancelRecurringOrderDialog** (`views/portfolio/components/CancelRecurringOrderDialog.tsx`)
- Confirmation dialog (on Shadcn `Dialog`) for the irreversible cancel of a recurring order. "Keep order" closes; "Cancel order" confirms.
- Props: `open`, `onOpenChange`, `onConfirm`, `loading?`.

**WatchlistPanel** (`views/portfolio/components/WatchlistPanel.tsx`)
- Container rendered in the Portfolio → Favorites tab. A `Select` of the caller's watchlists (default labelled "Favorites", each option suffixed with its item count), a **New list** button opening `CreateWatchlistDialog`, and — for non-default lists — a **Delete list** button. Initially selects the default list and fetches its items via `useWatchlistItems`; selecting another list switches the fetch. Renders `FavoritesTable` wired to `useRemoveFromWatchlistItems` for the selected list.
- No props (self-contained; uses `useWatchlists` / `useWatchlistItems` / `useCreateWatchlist` / `useDeleteWatchlist` / `useRemoveFromWatchlistItems`).

**CreateWatchlistDialog** (`views/portfolio/components/CreateWatchlistDialog.tsx`)
- Small form to create a named list. Name input validated to 1–64 characters; submits the trimmed name (POST `/me/watchlists`).
- Props: `open`, `onOpenChange`, `onSubmit(name)`, `loading`.

**FavoritesTable** (`views/portfolio/components/FavoritesTable.tsx`)
- Table of a list's tracked listings. Columns: Ticker, Type, Price, Change, Change %, Added, Actions (Remove). Empty-state prompt when the list has no items.
- Props: `items: WatchlistItem[]`, `onRemove(listingId)`, `busyListingId?: number`.

---

### OTC Components

**OtcOffersTable** (`components/otc/OtcOffersTable.tsx`)
- Displays OTC offers. Columns: Ticker, Name, Type, Quantity, Price, Actions.
- Props: `offers: OtcOffer[]`, `onBuy: (offer: OtcOffer) => void`.

**BuyOtcDialog** (`components/otc/BuyOtcDialog.tsx`)
- Shadcn Dialog to buy an OTC offer. Fields: quantity, account selector.
- Props: `open`, `onOpenChange`, `offer: OtcOffer`, `accounts: Account[]`.
- Submits via `useBuyOtcOffer` mutation.

---

### OTC Options View Module Components (`views/otcOptions/components/`)

**CreateOtcOptionDialog** (`views/otcOptions/components/CreateOtcOptionDialog.tsx`)
- Dialog for listing owners to post a new OTC option. Collects: direction (buy/sell), ticker, quantity, and settlement account (`account_id`).
- Strike price, premium, and settlement date are NOT collected here — bidders name those terms when they place a bid.
- Submits via `useCreateOtcOption` mutation (POST `/me/otc/options`).

**OfferActivityPanel** (`views/otcOptions/components/OfferActivityPanel.tsx`)
- Owner-only panel showing cross-chain timeline for a listing. Contains an inline `AmountEditor` sub-component allowing the listing owner to change the stock amount:
  - Edit button reveals a numeric input; Save is disabled unless a positive number is entered.
  - Save calls `useUpdateOtcOption` mutation (PUT `/me/otc/options/:id` with `{ quantity }`).

---

### Admin Management Components

**RolesTable** (`components/admin/RolesTable.tsx`)
- Displays roles list. Columns: Name, Description, Permissions count, Actions (Edit Permissions).
- Props: `roles: Role[]`, `onEditPermissions: (role: Role) => void`.

**PermissionsTable** (`components/admin/PermissionsTable.tsx`)
- Read-only permissions list. Columns: Code, Description, Category.
- Props: `permissions: Permission[]`.

**CreateRoleDialog / EditRolePermissionsDialog** — dialogs for role CRUD and permission assignment.

**InterestRateTiersTable** (`components/admin/InterestRateTiersTable.tsx`)
- Displays interest rate tiers. Columns: Amount From, Amount To, Fixed Rate, Variable Base, Actions.
- Props: `tiers: InterestRateTier[]`, `onEdit`, `onDelete`, `onApply`.

**BankMarginsTable** (`components/admin/BankMarginsTable.tsx`)
- Displays bank margins. Columns: Loan Type, Margin, Active, Updated At, Actions (Edit).
- Props: `margins: BankMargin[]`, `onEdit: (margin: BankMargin) => void`.

**FeesTable** (`components/admin/FeesTable.tsx`)
- Displays transfer fees. Columns: Name, Type, Value, Min Amount, Max Fee, Transaction Type, Currency, Active, Actions.
- Props: `fees: TransferFee[]`, `onEdit`, `onDeactivate`.

**EditEmployeeLimitsDialog** (`components/admin/EditEmployeeLimitsDialog.tsx`)
- Dialog to edit an employee's limits (max loan approval, single/daily transaction, client daily/monthly limits).
- Props: `open`, `employee: Employee`, `onClose`, `onConfirm`.

**EditClientLimitsDialog** (`components/admin/EditClientLimitsDialog.tsx`)
- Dialog to edit a client's limits (daily, monthly, transfer).
- Props: `open`, `client: Client`, `onClose`, `onConfirm`.

**LimitTemplatesDialog** (`components/admin/LimitTemplatesDialog.tsx`)
- Dialog to view and apply predefined limit templates to employees.

---

### Tax Components

**TaxTable** (`components/tax/TaxTable.tsx`)
- Tax records table. Columns: User, Email, Type, Taxable Amount, Tax Amount, Status, Date.
- Props: `records: TaxRecord[]`.

**TaxTrackingTable** (`components/tax/TaxTrackingTable.tsx`)
- Tax tracking table used in `TaxTrackingPage`. Similar columns to `TaxTable`.
- Props: `records: TaxRecord[]`.

---

### Layout Components

**AppLayout** (~14 lines) — `Sidebar` on the left, `<Outlet />` on the right

**AuthLayout** (~14 lines) — full-screen background GIF wrapper with centered `<Outlet />`; all auth pages render inside this layout without duplicating the background.

**Sidebar**
- Logo: "EXBanka"
- Nav links (employee portal): Employees, Card Requests (`/admin/cards/requests`), Loan Requests, etc.
- Tax link shown only for users with `tax.manage` permission.
- **Settings section** (shown to `EmployeeAdmin`):
  - Roles & Permissions → `/admin/roles` (requires `employees.permissions`)
  - Employee Limits → `/admin/limits/employees` (requires `limits.manage`)
  - Interest Rates → `/admin/interest-rates` (requires `interest-rates.manage`)
  - Fees → `/admin/fees` (requires `fees.manage`)
  - Peer Banks → `/admin/peer-banks` (admin-only — manage SI-TX cross-bank peer registry)
- Displays current user's email
- Logout button → dispatches `logoutThunk` → redirects to `/login`

---

### Shared Components

**ProtectedRoute** (~28 lines)
- Reads `isAuthenticated` from Redux
- Optionally checks a `permission` prop via `selectHasPermission`
- Unauthenticated → redirect to `/login`
- Missing permission → redirect to `/`

**FormField** (`components/shared/FormField.tsx`)
- Reusable wrapper: `Label` + children + optional error message (`text-destructive`).
- Props: `label`, `id`, `error?`, `children`.

**PaginationControls** (`components/shared/PaginationControls.tsx`)
- Renders Previous / Next buttons and "Page X of Y" text.
- Renders nothing when `totalPages <= 1`.

**ErrorMessage** (~7 lines) — styled `<p>` with destructive text color

**LoadingSpinner** (~8 lines) — animated border-spinning div; has `data-testid="loading-spinner"`

---

## 7. State Management

### Redux Store (`store/index.ts`)

Single reducer: `auth` from `authSlice`.

### authSlice (`store/slices/authSlice.ts`)

**State shape:**
```typescript
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  userType: 'employee' | 'client' | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}
```

**Async thunks:**

| Thunk | Action | Side Effects |
|---|---|---|
| `loginThunk(LoginRequest)` | Calls `authApi.login()`, decodes JWT, derives `userType` from JWT `system_type` field, sets user + tokens | Saves tokens to `sessionStorage` |
| `logoutThunk()` | Calls `authApi.logout(refreshToken)` | Clears `sessionStorage`, resets state |

**Sync reducers:**

| Reducer | Purpose |
|---|---|
| `setTokens(AuthTokens)` | Hydrates state from stored tokens (used on app init); also sets `userType` from JWT `system_type` |
| `clearAuth()` | Resets state to initial |

**Auth Selectors (`store/selectors/authSelectors.ts`) — memoized with reselect:**

| Selector | Returns |
|---|---|
| `selectIsAuthenticated` | `status === 'authenticated'` |
| `selectIsAdmin` | `user.role === 'EmployeeAdmin'` |
| `selectCurrentUser` | `AuthUser \| null` |
| `selectHasPermission(state, perm)` | `boolean` — returns `true` for `EmployeeAdmin` (bypass); otherwise prefix-matches against `user.permissions[]` |

### Error Handling (`lib/errors/`, `lib/queryClient.ts`, `components/shared/AppErrorBoundary.tsx`)

Errors are surfaced to the user through one canonical pipeline. **No silent failures.** See [Error Handling — Developer Guide](/docs/error-handling.md) and the policy in `CLAUDE.md`.

| Layer | File | Responsibility |
|---|---|---|
| Parser | `lib/errors/parseApiError.ts` | Pure `unknown -> AppError`. Maps `AxiosError` (4xx/5xx, network, timeout), `Error`, `string`, unknown. |
| Notifier | `lib/errors/notify.ts` | `notifyError(err)` parses + `toast.error`. `notifySuccess(msg)` for happy paths. |
| Global query fallback | `lib/queryClient.ts` | `createQueryClient()` configures `queryCache.onError` and `mutationCache.onError`. Queries/mutations without their own `onError` automatically toast. |
| Render boundary | `components/shared/AppErrorBoundary.tsx` | Class boundary at the router root; catches render exceptions, toasts, shows `ErrorFallback`. |
| Toaster mount | `main.tsx` | One `<Toaster richColors position="top-right" />` at the providers root. |

**Per-call opt-outs:**
- Query: `meta: { suppressGlobalError: true }` to suppress the global toast for an "expected to fail" query (e.g., polling).
- Mutation: defining ANY `onError` callback suppresses the global toast — you own the error UX. Recommended pattern is to still call `notifyError(err)` inside that callback.

---

## 8. API Layer

### Axios Client (`lib/api/axios.ts`)

- Base URL: resolved at request time as `${getCurrentHost()}/api/${API_VERSION}` — see `lib/api/backendHost.ts`. The host is user-selectable from the login screen (and the sidebar) and persisted in `localStorage`; falls back to the build-time `VITE_API_HOST` (default `http://localhost:8080`).
- **Request interceptor:** sets `config.baseURL` from `getApiBaseUrl()` and attaches `Authorization: Bearer <access_token>` from `sessionStorage`
- **Response interceptor:** on 401, attempts token refresh via `/auth/refresh` against the current resolved host, retries original request. If refresh fails, clears session and redirects to `/login`.

### Backend Host (`lib/api/backendHost.ts`)

- `BACKEND_PRESETS`: localhost · instance1 · instance2 · instance3 · custom (`https://project-exbanka.bytenity.com/instance{1,2,3}` for the bytenity entries).
- `getCurrentHost()` / `getCurrentSelection()` read from `localStorage` (keys `exbanka.backendPreset`, `exbanka.backendCustomUrl`); fall back to the env default when nothing is stored.
- `setSelection({ presetId, customUrl? })` persists and validates (custom URL must be `http(s)://...`), then notifies subscribers.
- `subscribeToHostChange(listener)` for components / clients that need to react to a switch.

### Auth API (`lib/api/auth.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `login(credentials)` | POST | `/api/auth/login` |
| `logout(refreshToken)` | POST | `/api/auth/logout` |
| `requestPasswordReset(email)` | POST | `/api/auth/password/reset-request` |
| `resetPassword(payload)` | POST | `/api/auth/password/reset` |
| `activateAccount(payload)` | POST | `/api/auth/activate` |

### Employee API (`lib/api/employees.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getEmployees(filters?)` | GET | `/api/employees` — supports `name`, `email`, `position`, `page`, `page_size` query params |
| `getEmployee(id)` | GET | `/api/employees/{id}` |
| `createEmployee(payload)` | POST | `/api/employees` |
| `updateEmployee(id, payload)` | PUT | `/api/employees/{id}` |

### Cards API (`lib/api/cards.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getCardRequests(filters?)` | GET | `/api/cards/requests` — supports `status`, `page`, `page_size` query params |
| `approveCardRequest(id)` | PUT | `/api/cards/requests/{id}/approve` |
| `rejectCardRequest(id, reason)` | PUT | `/api/cards/requests/{id}/reject` — body `{ reason: string }` |
| `createAuthorizedPerson(payload)` | POST | `/api/cards/authorized-persons` — body `CreateAuthorizedPersonPayload`; returns `AuthorizedPerson & { id }` |
| `createCard(payload)` | POST | `/api/cards` — body `CreateCardPayload`; returns `Card` |

### Roles API (`lib/api/roles.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getRoles()` | GET | `/api/roles` |
| `getRole(id)` | GET | `/api/roles/{id}` |
| `createRole(payload)` | POST | `/api/roles` |
| `updateRolePermissions(id, permissionCodes)` | PUT | `/api/roles/{id}/permissions` |
| `getPermissions()` | GET | `/api/permissions` |
| `setEmployeeRoles(employeeId, roleNames)` | PUT | `/api/employees/{id}/roles` |
| `setEmployeePermissions(employeeId, permissionCodes)` | PUT | `/api/employees/{id}/permissions` |

### Interest Rate Tiers API (`lib/api/interestRateTiers.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getInterestRateTiers()` | GET | `/api/interest-rate-tiers` |
| `createTier(payload)` | POST | `/api/interest-rate-tiers` |
| `updateTier(id, payload)` | PUT | `/api/interest-rate-tiers/{id}` |
| `deleteTier(id)` | DELETE | `/api/interest-rate-tiers/{id}` |
| `applyTier(id)` | POST | `/api/interest-rate-tiers/{id}/apply` |

### Bank Margins API (`lib/api/bankMargins.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getBankMargins()` | GET | `/api/bank-margins` |
| `updateBankMargin(id, margin)` | PUT | `/api/bank-margins/{id}` |

### Actuaries API (`lib/api/actuaries.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getActuaries(filters?)` | GET | `/api/actuaries` — supports `search`, `position`, `page`, `page_size` query params |
| `setActuaryLimit(id, payload)` | PUT | `/api/actuaries/{id}/limit` — body `{ limit: string }` |
| `resetActuaryLimit(id)` | POST | `/api/actuaries/{id}/reset-limit` |
| `setActuaryApproval(id, payload)` | POST | `/api/actuaries/{id}/require-approval` if `payload.need_approval` is `true`, else `/api/actuaries/{id}/skip-approval` (no body) |

### Stock Exchanges API (`lib/api/stockExchanges.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getStockExchanges(filters?)` | GET | `/api/stock-exchanges` — supports `search`, `page`, `page_size` query params |
| `getTestingMode()` | GET | `/api/stock-exchanges/testing-mode` |
| `setTestingMode(enabled)` | POST | `/api/stock-exchanges/testing-mode` — body `{ enabled: boolean }` |

### Notifications API (`lib/api/notifications.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getNotifications(filters?)` | GET | `/me/notifications` — supports `page`, `page_size`, `read` ("read" \| "unread") |
| `getUnreadCount()` | GET | `/me/notifications/unread-count` |
| `markNotificationRead(id)` | POST | `/me/notifications/{id}/read` |
| `markAllNotificationsRead()` | POST | `/me/notifications/read-all` |

### OTC API (extension — `lib/api/otc.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `buyOtcOfferOnBehalf(id, payload)` | POST | `/otc/offers/{id}/buy-on-behalf` — body `{ client_id, account_id, quantity }` (employee variant) |

### Investment Funds API (`lib/api/funds.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getFunds(filters?)` | GET | `/investment-funds` — `page`, `page_size`, `search`, `active_only` |
| `getFund(id)` | GET | `/investment-funds/{id}` — returns `{ fund, holdings, performance }` |
| `createFund(payload)` | POST | `/investment-funds` — body `CreateFundPayload`; requires `funds.manage` |
| `updateFund(id, payload)` | PUT | `/investment-funds/{id}` — body `UpdateFundPayload`; requires `funds.manage` |
| `investInFund(id, payload)` | POST | `/investment-funds/{id}/invest` — body `{ source_account_id, amount, currency, on_behalf_of_type? }` |
| `redeemFromFund(id, payload)` | POST | `/investment-funds/{id}/redeem` — body `{ amount_rsd, target_account_id, on_behalf_of_type? }` |
| `getMyFundPositions()` | GET | `/me/investment-funds` — caller's positions (employees act as bank) |

### Profit Banke API (`lib/api/profit.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getActuaryPerformance()` | GET | `/actuaries/performance` — requires `actuaries.read.all` |
| `getBankFundPositions()` | GET | `/investment-funds/positions` — requires `funds.bank-position-read` |

### OTC Option Contracts API (`lib/api/otcOption.ts`) — §29

| Function | Method | Endpoint |
|---|---|---|
| `createOtcOptionOffer(payload)` | POST | `/otc/offers` — open negotiation thread |
| `counterOtcOptionOffer(id, payload)` | POST | `/otc/offers/{id}/counter` |
| `acceptOtcOptionOffer(id, payload)` | POST | `/otc/offers/{id}/accept` — premium SAGA + creates contract |
| `rejectOtcOptionOffer(id)` | POST | `/otc/offers/{id}/reject` |
| `getOtcOptionOffer(id)` | GET | `/otc/offers/{id}` — returns `{ offer, revisions }` |
| `getMyOtcOptionOffers(filters?)` | GET | `/me/otc/offers` — `role`, `page`, `page_size` |
| `getOtcOptionContract(id)` | GET | `/otc/contracts/{id}` |
| `getMyOtcOptionContracts(filters?)` | GET | `/me/otc/contracts` |
| `exerciseOtcOptionContract(id, payload)` | POST | `/otc/contracts/{id}/exercise` — 5-phase SAGA |

### OTC Options View-Module API (`views/otcOptions/api/otcOptionsApi.ts`)

Self-contained API surface for the `views/otcOptions/` module (spec §47.2). All functions call `/me/otc/options` or `/otc/options` routes on the shared `apiClient`.

| Function | Method | Endpoint |
|---|---|---|
| `listAll(filters?)` | GET | `/otc/options` — discovery feed; supports `ticker`, `direction`, `kind`, `bank_code`, `page`, `page_size` |
| `listMine(filters?)` | GET | `/me/otc/options` — caller's own open listings |
| `createListing(payload)` | POST | `/me/otc/options` — body `CreateOtcOptionPayload { direction, ticker, quantity, account_id }` |
| `updateListing(offerId, payload)` | PUT | `/me/otc/options/:id` — owner-only; body `UpdateOtcOptionPayload { quantity }` |
| `cancelListing(offerId)` | DELETE | `/me/otc/options/:id` |
| `placeBid(offerId, payload)` | POST | `/otc/options/:id/bid` |
| `counter(offerId, negotiationId, payload)` | POST | `/me/otc/options/:id/negotiations/:nid/counter` |
| `acceptNegotiation(offerId, negotiationId, payload)` | POST | `/me/otc/options/:id/negotiations/:nid/accept` |
| `rejectNegotiation(offerId, negotiationId)` | POST | `/me/otc/options/:id/negotiations/:nid/reject` |
| `withdrawNegotiation(offerId, negotiationId)` | DELETE | `/me/otc/options/:id/negotiations/:nid` |
| `listNegotiations(offerId)` | GET | `/otc/options/:id/negotiations` |
| `listMyNegotiations(filters?)` | GET | `/me/otc/options/negotiations` — bidder's own chains |
| `listNegotiationRevisions(negotiationId)` | GET | `/me/otc/options/negotiations/:nid/revisions` |
| `getOfferTimeline(offerId)` | GET | `/otc/options/:id/timeline` — owner cross-chain activity stream |
| `listMyHoldings()` | GET | delegates to `getPortfolio()` — used by sell-direction ticker picker |
| `listStockCatalog()` | GET | `/securities/stocks` — used by buy-direction ticker picker |

Raw `negotiation` and `revision` responses are normalized at the API boundary (`normalizeNegotiation`, `normalizeRevision`) to unify flat backend fields into the typed `OtcNegotiation` / `OtcNegotiationRevision` shapes.

### Securities API (`lib/api/securities.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getStocks(filters?)` | GET | `/api/listings/stocks` |
| `getStock(id)` | GET | `/api/listings/stocks/{id}` |
| `getStockHistory(id, filters?)` | GET | `/api/listings/stocks/{id}/history` |
| `getFutures(filters?)` | GET | `/api/listings/futures` |
| `getFuture(id)` | GET | `/api/listings/futures/{id}` |
| `getFutureHistory(id, filters?)` | GET | `/api/listings/futures/{id}/history` |
| `getForexPairs(filters?)` | GET | `/api/listings/forex` |
| `getForexPair(id)` | GET | `/api/listings/forex/{id}` |
| `getForexHistory(id, filters?)` | GET | `/api/listings/forex/{id}/history` |
| `getOptions(filters)` | GET | `/api/listings/options` |
| `getOption(id)` | GET | `/api/listings/options/{id}` |

### Orders API (`lib/api/orders.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `createOrder(payload)` | POST | `/api/me/orders` |
| `getMyOrders(filters?)` | GET | `/api/me/orders` |
| `getMyOrder(id)` | GET | `/api/me/orders/{id}` |
| `cancelOrder(id)` | POST | `/api/me/orders/{id}/cancel` |
| `getAllOrders(filters?)` | GET | `/api/orders` |
| `approveOrder(id)` | POST | `/api/orders/{id}/approve` |
| `declineOrder(id)` | POST | `/api/orders/{id}/reject` |

### Recurring Orders API (`lib/api/recurringOrders.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `createRecurringOrder(payload)` | POST | `/api/v3/me/recurring-orders` |
| `getMyRecurringOrders()` | GET | `/api/v3/me/recurring-orders` |
| `pauseRecurringOrder(id)` | POST | `/api/v3/me/recurring-orders/:id/pause` |
| `resumeRecurringOrder(id)` | POST | `/api/v3/me/recurring-orders/:id/resume` |
| `cancelRecurringOrder(id)` | POST | `/api/v3/me/recurring-orders/:id/cancel` |

- Creates a weekly/monthly recurring market-order template. Payload: `{ listing_id, side, quantity, account_id, interval, day_of_week?|day_of_month?, start_date_unix, end_date_unix }`. Returns the created `recurring_order`.
- `getMyRecurringOrders()` lists the caller's recurring-order templates (returns `recurring_orders ?? []`). `pause`/`resume`/`cancel` transition a template's status (active ⇄ paused, and the terminal `cancelled`); each returns the updated `recurring_order`.
- `buildRecurringOrderPayload(payload, interval, now?)` (`views/orders/components/buildRecurringOrderPayload.ts`) — pure helper that derives the recurring payload from a buy `CreateOrderPayload` + chosen frequency (weekly → today's `day_of_week`, monthly → today's `day_of_month` capped at 28); returns `null` when `listing_id`/`account_id` are missing.

### Portfolio API (`lib/api/portfolio.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getPortfolio(filters?)` | GET | `/api/me/portfolio` |
| `getPortfolioSummary()` | GET | `/api/me/portfolio/summary` |
| `makeHoldingPublic(id, payload)` | POST | `/api/me/portfolio/{id}/public` |
| `exerciseOption(id)` | POST | `/api/me/portfolio/{id}/exercise` |

### Watchlist API (`lib/api/watchlist.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getWatchlists()` | GET | `/api/v3/me/watchlists` |
| `createWatchlist(name)` | POST | `/api/v3/me/watchlists` |
| `deleteWatchlist(watchlistId)` | DELETE | `/api/v3/me/watchlists/:id` |
| `getWatchlistItems(watchlistId, filters?)` | GET | `/api/v3/me/watchlists/:id/items` |
| `addToWatchlistItems(watchlistId, listing_id)` | POST | `/api/v3/me/watchlists/:id/items` |
| `removeFromWatchlistItems(watchlistId, listing_id)` | DELETE | `/api/v3/me/watchlists/:id/items/:listing_id` |

- Named watchlists replace the legacy single `/me/watchlist` calls. `getWatchlists()` tolerates either a `{ watchlists }` envelope or a bare array and defaults to `[]`; `getWatchlistItems` defaults `items` to `[]`. Owner (client vs. bank) is resolved server-side from the JWT. The default list comes back named `"My Watchlist"` and is displayed as `"Favorites"` via `displayWatchlistName` (`lib/utils/watchlist.ts`).

### Tax API (`lib/api/tax.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getTaxRecords(filters?)` | GET | `/api/tax` |
| `collectTaxes()` | POST | `/api/tax/collect` |

### OTC API (`lib/api/otc.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getOtcOffers(filters?)` | GET | `/api/otc/offers` — supports `page`, `page_size`, `security_type`, `ticker` query params |
| `buyOtcOffer(id, payload)` | POST | `/api/otc/offers/{id}/buy` — body `{ quantity, account_id }` |

### Fees API (`lib/api/fees.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getFees()` | GET | `/api/fees` |
| `createFee(payload)` | POST | `/api/fees` |
| `updateFee(id, payload)` | PUT | `/api/fees/{id}` |
| `deleteFee(id)` | DELETE | `/api/fees/{id}` |

### Limits API (`lib/api/limits.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getEmployeeLimits(id)` | GET | `/api/employees/{id}/limits` |
| `updateEmployeeLimits(id, payload)` | PUT | `/api/employees/{id}/limits` |
| `applyLimitTemplate(employeeId, templateName)` | POST | `/api/employees/{id}/limits/template` — body `{ template_name }` |
| `getLimitTemplates()` | GET | `/api/limits/templates` |
| `createLimitTemplate(payload)` | POST | `/api/limits/templates` |
| `getClientLimits(id)` | GET | `/api/clients/{id}/limits` |
| `updateClientLimits(id, payload)` | PUT | `/api/clients/{id}/limits` |

### Permissions API (`lib/api/permissions.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getPermissions()` | GET | `/api/permissions` |
| `setEmployeeRoles(employeeId, roleNames)` | PUT | `/api/employees/{id}/roles` — body `{ role_names }` |
| `setEmployeePermissions(employeeId, permissionCodes)` | PUT | `/api/employees/{id}/permissions` — body `{ permission_codes }` |

---

## 9. Custom Hooks

| Hook | Type | Purpose |
|---|---|---|
| `useAppDispatch` | Redux | Typed `AppDispatch` hook |
| `useAppSelector` | Redux | Typed `RootState` selector hook |
| `useEmployees(filters?)` | React Query | Fetch employees with server-side filters; query key: `['employees', filters]` |
| `useEmployee(id)` | React Query | Fetch single employee; query key: `['employee', id]`; disabled when `id <= 0` |
| `useMutationWithRedirect(options)` | React Query | `useMutation` + query invalidation + `navigate` on success |
| `usePagination(items, pageSize)` | Local state | Slice an array into pages; returns `{ page, setPage, totalPages, paginatedItems }` |
| `useCardRequests(filters?)` | React Query | Fetch card requests; query key: `['card-requests', filters]` |
| `useApproveCardRequest()` | React Query | Mutation: PUT approve; invalidates `['card-requests']` on success |
| `useRejectCardRequest()` | React Query | Mutation: PUT reject with reason; invalidates `['card-requests']` on success |
| `useActuaries(filters?)` | React Query | Fetch actuaries with server-side filters; query key: `['actuaries', filters]` |
| `useSetActuaryLimit()` | React Query | Mutation: PUT limit; invalidates `['actuaries']` on success |
| `useResetActuaryLimit()` | React Query | Mutation: POST reset limit; invalidates `['actuaries']` on success |
| `useSetActuaryApproval()` | React Query | Mutation: POST require-approval/skip-approval action; invalidates `['actuaries']` on success |
| `useStockExchanges(filters?)` | React Query | Fetch stock exchanges; query key: `['stock-exchanges', filters]` |
| `useTestingMode()` | React Query | Fetch testing mode status; query key: `['stock-exchanges', 'testing-mode']` |
| `useSetTestingMode()` | React Query | Mutation: POST testing mode; invalidates `['stock-exchanges', 'testing-mode']` on success |
| `useNotifications(filters?)` | React Query | Fetch notifications list; query key: `['notifications', filters]` |
| `useUnreadNotificationCount()` | React Query | Fetch unread count; query key: `['notifications', 'unread-count']`; polls every 60s while tab is visible |
| `useMarkNotificationRead()` | React Query | Mutation: POST mark single notification read; invalidates `['notifications']` |
| `useMarkAllNotificationsRead()` | React Query | Mutation: POST mark all read; invalidates `['notifications']` |
| `useBuyOtcOfferOnBehalf()` | React Query | Mutation: employee POST `/otc/offers/:id/buy-on-behalf`; invalidates `['otc-offers']` |
| `useFunds(filters?)` | React Query | List funds; `['funds', filters]` |
| `useFund(id)` | React Query | Fund detail; `['funds', id]`, disabled when id is null |
| `useMyFundPositions()` | React Query | `['funds', 'me']` |
| `useCreateFund()` | React Query | Mutation: invalidates `['funds']` |
| `useUpdateFund(id)` | React Query | Mutation: invalidates `['funds']` + `['funds', id]` |
| `useInvestFund(id)` | React Query | Mutation: invalidates `['funds', id]` + `['funds', 'me']` + `['accounts']` |
| `useRedeemFund(id)` | React Query | Mutation: same invalidations as invest |
| `useActuaryPerformance()` | React Query | `['profit', 'actuaries']` |
| `useBankFundPositions()` | React Query | `['profit', 'bank-fund-positions']` |
| `useStocks(filters?)` | React Query | Fetch stocks; query key: `['stocks', filters]` |
| `useStock(id)` | React Query | Fetch single stock; query key: `['stock', id]` |
| `useStockHistory(id, filters?)` | React Query | Fetch stock price history; query key: `['stock-history', id, filters]` |
| `useFutures(filters?)` | React Query | Fetch futures; query key: `['futures', filters]` |
| `useFuture(id)` | React Query | Fetch single future; query key: `['future', id]` |
| `useFutureHistory(id, filters?)` | React Query | Fetch future price history; query key: `['future-history', id, filters]` |
| `useForexPairs(filters?)` | React Query | Fetch forex pairs; query key: `['forex', filters]` |
| `useForexPair(id)` | React Query | Fetch single forex pair; query key: `['forex-pair', id]` |
| `useForexHistory(id, filters?)` | React Query | Fetch forex price history; query key: `['forex-history', id, filters]` |
| `useOptions(filters)` | React Query | Fetch options for a stock; query key: `['options', filters]` |
| `useMyOrders(filters?)` | React Query | Fetch user's orders; query key: `['my-orders', filters]` |
| `useCreateOrder()` | React Query | Mutation: create order; invalidates `['my-orders']` + `['portfolio']` |
| `useCancelOrder()` | React Query | Mutation: cancel order; invalidates `['my-orders']` |
| `useAllOrders(filters?)` | React Query | Fetch all orders (admin); query key: `['all-orders', filters]` |
| `useApproveOrder()` | React Query | Mutation: approve order; invalidates `['all-orders']` |
| `useDeclineOrder()` | React Query | Mutation: decline order; invalidates `['all-orders']` |
| `useCreateRecurringOrder()` | React Query | Mutation: create recurring buy template (POST `/me/recurring-orders`); invalidates `['recurring-orders']` |
| `useRecurringOrders()` | React Query | Query: list the caller's recurring-order templates (`['recurring-orders']`) |
| `usePauseRecurringOrder()` | React Query | Mutation: pause a template (POST `/me/recurring-orders/:id/pause`); invalidates `['recurring-orders']` |
| `useResumeRecurringOrder()` | React Query | Mutation: resume a template (POST `/me/recurring-orders/:id/resume`); invalidates `['recurring-orders']` |
| `useCancelRecurringOrder()` | React Query | Mutation: cancel a template (POST `/me/recurring-orders/:id/cancel`); invalidates `['recurring-orders']` |
| `usePortfolio(filters?)` | React Query | Fetch portfolio holdings; query key: `['portfolio', filters]` |
| `usePortfolioSummary()` | React Query | Fetch portfolio summary; query key: `['portfolio-summary']` |
| `useMakePublic()` | React Query | Mutation: make holding public; invalidates `['portfolio']` |
| `useExerciseOption()` | React Query | Mutation: exercise option; invalidates `['portfolio']` |
| `useWatchlists()` | React Query | List the caller's named watchlists; query key: `['watchlists']` |
| `useWatchlistItems(watchlistId, filters?)` | React Query | Fetch one list's items; key `['watchlist-items', id, filters]`; disabled when `watchlistId == null` |
| `useCreateWatchlist()` | React Query | Mutation: create a named list; invalidates `['watchlists']` |
| `useDeleteWatchlist()` | React Query | Mutation: delete a list; invalidates `['watchlists']` + `['watchlist-items']` |
| `useAddToWatchlistItems()` | React Query | Mutation `{ watchlistId, listingId }`: add to a list; invalidates `['watchlists']` + `['watchlist-items']` |
| `useRemoveFromWatchlistItems()` | React Query | Mutation `{ watchlistId, listingId }`: remove from a list; invalidates `['watchlists']` + `['watchlist-items']` |
| `useWatchlistMembership()` | React Query | `useQueries` over every list, unioned into a `Set<number>` of listing ids in any list (drives the filled-heart state) |
| `useTaxRecords(filters?)` | React Query | Fetch tax records; query key: `['tax', filters]` |
| `useCollectTaxes()` | React Query | Mutation: collect taxes; invalidates `['tax']` |
| `useOtcOffers(filters?)` | React Query | Fetch OTC offers; query key: `['otc-offers', filters]` |
| `useBuyOtcOffer()` | React Query | Mutation: buy OTC offer; invalidates `['otc-offers']` + `['portfolio']` |
| `useUpdateOtcOption()` | React Query | Mutation (OTC Options module): PUT `/me/otc/options/:id` with `{ quantity }`; onSuccess toasts "Amount updated" + invalidates OTC options lists; no custom onError (global toast) |
| `useRoles()` | React Query | Fetch roles; query key: `['roles']` |
| `useCreateRole()` | React Query | Mutation: create role; invalidates `['roles']` |
| `useUpdateRolePermissions()` | React Query | Mutation: update role permissions; invalidates `['roles']` |
| `usePermissions()` | React Query | Fetch all permissions; query key: `['permissions']` |
| `useSetEmployeeRoles()` | React Query | Mutation: set employee's roles; invalidates `['employees']` |
| `useSetEmployeePermissions()` | React Query | Mutation: set employee's permissions; invalidates `['employees']` |
| `useFees()` | React Query | Fetch transfer fees; query key: `['fees']` |
| `useCreateFee()` | React Query | Mutation: create fee; invalidates `['fees']` |
| `useUpdateFee()` | React Query | Mutation: update fee; invalidates `['fees']` |
| `useDeleteFee()` | React Query | Mutation: delete/deactivate fee; invalidates `['fees']` |
| `useInterestRateTiers()` | React Query | Fetch interest rate tiers; query key: `['interestRateTiers']` |
| `useCreateTier()` | React Query | Mutation: create tier; invalidates `['interestRateTiers']` |
| `useUpdateTier()` | React Query | Mutation: update tier; invalidates `['interestRateTiers']` |
| `useDeleteTier()` | React Query | Mutation: delete tier; invalidates `['interestRateTiers']` |
| `useApplyTier()` | React Query | Mutation: apply tier to loans; invalidates `['interestRateTiers']` |
| `useBankMargins()` | React Query | Fetch bank margins; query key: `['bankMargins']` |
| `useUpdateBankMargin()` | React Query | Mutation: update bank margin; invalidates `['bankMargins']` |
| `useEmployeeLimits(id)` | React Query | Fetch employee limits; query key: `['employeeLimits', id]`; disabled when `id <= 0` |
| `useUpdateEmployeeLimits()` | React Query | Mutation: update employee limits; invalidates `['employeeLimits', id]` |
| `useApplyLimitTemplate()` | React Query | Mutation: apply template to employee; invalidates `['employeeLimits', id]` |
| `useLimitTemplates()` | React Query | Fetch limit templates; query key: `['limitTemplates']` |
| `useCreateLimitTemplate()` | React Query | Mutation: create limit template; invalidates `['limitTemplates']` |
| `useClientLimits(id)` | React Query | Fetch client limits; query key: `['clientLimits', id]` |
| `useUpdateClientLimits()` | React Query | Mutation: update client limits; invalidates `['clientLimits', id]` |
| `useSearchAccounts(query)` | React Query | Search accounts by account_number_filter; query key: `['accounts', 'search', query]`; disabled when query is empty |
| `useBankAccountActivity(id, filters?)` | React Query | Fetch ledger entries for a bank-owned account; query key: `['bankAccountActivity', id, filters]`; calls `GET /api/v3/bank-accounts/:id/activity` |
| `useCreateCard()` | React Query | Mutation: POST authorized person then POST card sequentially; invalidates `['cards', 'account', account_number]` on success |

---

## 10. Types & Interfaces

### Auth Types (`types/auth.ts`)

```typescript
LoginRequest         { email: string; password: string }
AuthTokens           { access_token: string; refresh_token: string }
PasswordResetPayload { token: string; new_password: string; confirm_password: string }
AccountActivationPayload { token: string; password: string; confirm_password: string }
AuthUser             { id: number; email: string; role: string; permissions: string[];
                       system_type: 'employee' | 'client' | null }
```

### Employee Types (`types/employee.ts`)

```typescript
Employee {
  id: number; first_name: string; last_name: string
  date_of_birth: number          // Unix timestamp
  gender: string; email: string; phone: string; address: string
  username: string; position: string; department: string
  active: boolean; role: string; permissions: string[]; jmbg?: string
}

CreateEmployeeRequest { first_name, last_name, date_of_birth (required), gender?, email,
                        phone?, address?, username, position?, department?, role, active?, jmbg? }

UpdateEmployeeRequest { last_name?, gender?, phone?, address?, position?,
                        department?, role?, active?, jmbg? }

EmployeeListResponse  { employees: Employee[]; total_count: number }
EmployeeFilters       { email?, name?, position?, page?, page_size? }
FilterCategory        = 'name' | 'email' | 'position'
```

### Role & Permission Types (`types/roles.ts`)

```typescript
Permission           { id: number; code: string; description: string; category: string }
Role                 { id: number; name: string; description: string; permissions: string[] }
CreateRolePayload    { name: string; description?: string; permission_codes?: string[] }
```

### Interest Rate Tier Types (`types/interestRateTiers.ts`)

```typescript
InterestRateTier     { id: number; amount_from: number; amount_to: number;
                       fixed_rate: number; variable_base: number }
CreateTierPayload    { amount_from: number; amount_to: number;
                       fixed_rate: number; variable_base: number }
```

### Authorized Person Types (`types/authorized-person.ts`)

```typescript
CreateAuthorizedPersonPayload {
  first_name: string; last_name: string
  date_of_birth?: number; gender?: string
  email?: string; phone?: string; address?: string
  account_id: number
}
```

### Card Payload Types (`types/card.ts`)

```typescript
CreateCardPayload {
  account_number: string
  owner_id: number
  owner_type: 'AUTHORIZED_PERSON'
  card_brand: CardBrand
}
```

### Card Request Types (`types/cardRequest.ts`)

```typescript
CardRequestStatus    = 'pending' | 'approved' | 'rejected'   // lowercase — matches REST API

CardRequest {
  id: number; client_id: number; account_number: string
  card_brand: string; card_type: string; card_name: string
  status: CardRequestStatus; reason: string; approved_by: number
  created_at: string; updated_at: string
}

CardRequestListResponse  { requests: CardRequest[]; total: number }
CardRequestFilters       { status?: CardRequestStatus; page?: number; page_size?: number }
```

### Bank Margin Types (`types/bankMargins.ts`)

```typescript
BankMargin           { id: number; loan_type: string; margin: number;
                       active: boolean; created_at: string; updated_at: string }
```

### Actuary Types (`types/actuary.ts`)

```typescript
Actuary              { id: number; first_name: string; last_name: string; email: string;
                       phone: string; position: string; department: string; active: boolean;
                       limit: string; used_limit: string; need_approval: boolean }
ActuaryListResponse  { actuaries: Actuary[]; total_count: number }
ActuaryFilters       { page?: number; page_size?: number; search?: string; position?: string }
SetLimitPayload      { limit: string }
SetApprovalPayload   { need_approval: boolean }
```

### Stock Exchange Types (`types/stockExchange.ts`)

```typescript
StockExchange        { id: number; exchange_name: string; exchange_acronym: string;
                       exchange_mic_code: string; polity: string; currency: string; time_zone: string }
StockExchangeListResponse  { exchanges: StockExchange[]; total_count: number }
StockExchangeFilters       { page?: number; page_size?: number; search?: string }
TestingModeResponse        { testing_mode: boolean }
```

### Security Types (`types/security.ts`)

```typescript
Stock                { id, ticker, name, outstanding_shares, dividend_yield, exchange_acronym,
                       price, ask, bid, change, volume, last_refresh, market_cap,
                       maintenance_margin, initial_margin_cost }
FuturesContract      { id, ticker, name, contract_size, contract_unit, settlement_date,
                       exchange_acronym, price, ask, bid, change, volume, last_refresh,
                       maintenance_margin, initial_margin_cost }
ForexPair            { id, ticker, name, base_currency, quote_currency, exchange_rate,
                       liquidity: 'high'|'medium'|'low', price, ask, bid, change, volume,
                       last_refresh, maintenance_margin, initial_margin_cost }
Option               { id, ticker, name, stock_listing_id, option_type: 'call'|'put',
                       strike_price, implied_volatility, premium, open_interest,
                       settlement_date, price, ask, bid, volume }
PriceHistoryEntry    { date, price, high, low, change, volume }
PriceHistoryResponse { history: PriceHistoryEntry[]; total_count: number }
SecurityType         = 'stock' | 'futures' | 'forex'
PriceHistoryPeriod   = 'day' | 'week' | 'month' | 'year' | '5y' | 'all'
StockListResponse    { stocks: Stock[]; total_count: number }
FuturesListResponse  { futures: FuturesContract[]; total_count: number }
ForexListResponse    { forex_pairs: ForexPair[]; total_count: number }
OptionsListResponse  { options: Option[]; total_count: number }
StockFilters         { page?, page_size?, search?, exchange_acronym?, min_price?, max_price?, sort_by?, sort_order? }
FuturesFilters       { page?, page_size?, search?, exchange_acronym?, settlement_date_from?, settlement_date_to?, sort_by?, sort_order? }
ForexFilters         { page?, page_size?, search?, base_currency?, quote_currency?, liquidity?, sort_by?, sort_order? }
OptionsFilters       { stock_id, page?, page_size?, option_type?, settlement_date?, min_strike?, max_strike? }
```

### Order Types (`types/order.ts`)

```typescript
OrderDirection       = 'buy' | 'sell'
OrderType            = 'market' | 'limit' | 'stop' | 'stop_limit'
OrderStatus          = 'pending' | 'approved' | 'declined' | 'cancelled' | 'filled' | 'partial'
Order                { id, listing_id, holding_id, direction, order_type, status, quantity,
                       limit_value, stop_value, all_or_none, margin, account_id, ticker,
                       security_name, created_at, updated_at }
CreateOrderPayload   { listing_id?, holding_id?, direction, order_type, quantity,
                       limit_value?, stop_value?, all_or_none?, margin?, account_id? }
OrderListResponse    { orders: Order[]; total_count: number }
MyOrderFilters       { page?, page_size?, status?, direction?, order_type? }
AdminOrderFilters    extends MyOrderFilters { agent_email? }
```

### Recurring Order Types (`types/recurringOrder.ts`)

```typescript
RecurringOrderInterval      = 'weekly' | 'monthly'
RecurringOrderStatus        = 'active' | 'paused' | 'cancelled'
CreateRecurringOrderPayload { listing_id, side: 'buy'|'sell', quantity, account_id, interval,
                              day_of_week?, day_of_month?, start_date_unix, end_date_unix }
RecurringOrder              { id, listing_id, side, quantity, account_id, interval,
                              day_of_week?, day_of_month?, start_date_unix, end_date_unix,
                              status, created_at, updated_at }
CreateRecurringOrderResponse { recurring_order: RecurringOrder }
RecurringOrderListResponse   { recurring_orders: RecurringOrder[] }
```

### Portfolio Types (`types/portfolio.ts`)

```typescript
Holding              { id, security_type: 'stock'|'futures'|'option', ticker, security_name,
                       quantity, average_price, current_price, total_value, profit_loss,
                       profit_loss_percent, is_public, public_quantity }
PortfolioSummary     { total_value, total_cost, total_profit_loss, total_profit_loss_percent,
                       holdings_count }
HoldingListResponse  { holdings: Holding[]; total_count: number }
PortfolioFilters     { page?, page_size?, security_type? }
MakePublicPayload    { quantity: number }
```

### Watchlist Types (`types/watchlist.ts`)

```typescript
WatchlistSecurityType = 'stock' | 'option' | 'futures' | 'forex'
WatchlistItem         { id, listing_id, security_type, ticker, current_price,
                        daily_change, daily_change_percent, added_at_unix }
WatchlistResponse     { items: WatchlistItem[] }
WatchlistFilters      { listing_type? }
Watchlist             { id, name, item_count, created_at }       // a named list
WatchlistsResponse    { watchlists: Watchlist[] }
CreateWatchlistPayload { name }
WatchlistItemRef      { watchlistId, listingId }
```

Display helpers live in `lib/utils/watchlist.ts`: `DEFAULT_WATCHLIST_NAME` (`'My Watchlist'`), `FAVORITES_LABEL` (`'Favorites'`), `displayWatchlistName(name)`, `isDefaultWatchlist(list)`.

### Tax Types (`types/tax.ts`)

```typescript
TaxRecord            { id, user_type: 'client'|'actuary', user_name, user_email,
                       taxable_amount, tax_amount, status, created_at }
TaxListResponse      { tax_records: TaxRecord[]; total_count: number }
TaxFilters           { page?, page_size?, user_type?, search? }
CollectTaxResponse   { collected_count, total_collected_rsd, failed_count }
```

### OTC Types (`types/otc.ts`)

```typescript
OtcOffer             { id, ticker, name, security_type: 'stock'|'futures', quantity, price, seller_id }
OtcOfferListResponse { offers: OtcOffer[]; total_count: number }
OtcBuyRequest        { quantity: number; account_id: number }
OtcFilters           { page?, page_size?, security_type?, ticker? }
```

### OTC Options View-Module Types (`views/otcOptions/types.ts`)

Module-private types; kept in the view module for self-containment.

```typescript
CreateOtcOptionPayload { direction: OtcOptionDirection; ticker: string; quantity: string; account_id: number }
  // NOTE: strike_price, premium, and settlement_date are NOT part of the create payload.
  // Bidders name those terms when placing a bid; the listing is direction/ticker/quantity/account only.

UpdateOtcOptionPayload { quantity: string }
  // PUT /me/otc/options/:id — owner-only; re-sizes the listing's stock amount.

PlaceBidPayload        { bidder_account_id: number; quantity: string; strike_price: string; premium: string; settlement_date: string }
CounterNegotiationPayload { quantity: string; strike_price: string; premium: string; settlement_date: string }
AcceptNegotiationPayload  { acceptor_account_id: number; on_behalf_of_fund_id?: number }
```

### Fee Types (`types/fee.ts`)

```typescript
TransferFee          { id, name, fee_type: 'percentage'|'fixed', fee_value, min_amount, max_fee,
                       transaction_type: 'payment'|'transfer'|'all', currency_code, active }
FeeListResponse      { fees: TransferFee[] }
CreateFeePayload     { name, fee_type, fee_value, min_amount?, max_fee?,
                       transaction_type, currency_code? }
UpdateFeePayload     { name?, fee_type?, fee_value?, min_amount?, max_fee?,
                       transaction_type?, currency_code?, active? }
```

### Limits Types (`types/limits.ts`)

```typescript
EmployeeLimits       { id, employee_id, max_loan_approval_amount, max_single_transaction,
                       max_daily_transaction, max_client_daily_limit, max_client_monthly_limit }
ClientLimits         { id, client_id, daily_limit, monthly_limit, transfer_limit, set_by_employee }
LimitTemplate        { id, name, description, max_loan_approval_amount, max_single_transaction,
                       max_daily_transaction, max_client_daily_limit, max_client_monthly_limit }
LimitTemplateListResponse { templates: LimitTemplate[] }
UpdateEmployeeLimitsPayload { max_loan_approval_amount, max_single_transaction,
                              max_daily_transaction, max_client_daily_limit, max_client_monthly_limit }
UpdateClientLimitsPayload   { daily_limit, monthly_limit, transfer_limit }
CreateLimitTemplatePayload  { name, description, ...all limit fields }
```

### Account Type Updates (`types/account.ts`)

The `Account` interface now includes two optional spending fields:
```typescript
daily_spending?: number    // current day's spending amount
monthly_spending?: number  // current month's spending amount
```
These are used by `LimitsUsageCard` on `AccountDetailsPage`.

---

### Shared Constants (`lib/utils/constants.ts`)

```typescript
EMPLOYEE_ROLES   // array of { value, label } — roles selectable in forms
GENDERS          // flat string array — ['Male', 'Female', 'Other', 'Misha']
COUNTRY_CODES    // array of { code, label } — 30+ countries for PhoneInput
formatRoleLabel(role: string): string
```

### Banking Constants (`lib/constants/banking.ts`)

```typescript
CARD_BRANDS          // [{ value: 'VISA'|'MASTERCARD'|'DINACARD'|'AMEX', label }]
CARD_STATUSES        // [{ value: 'ACTIVE'|'BLOCKED'|'DEACTIVATED', label }]
CARD_STATUS_LABELS   // Record<string, string> — display label per status
CARD_STATUS_VARIANT  // Record<string, 'default'|'secondary'|'destructive'> — badge variant per status
CARD_LIMITS          // { PERSONAL: 2, BUSINESS_PER_PERSON: 1 }
```

### Format Utilities (`lib/utils/format.ts`)

```typescript
maskCardNumber(cardNumber: string): string  // '4111111111111111' → '4111 **** **** 1111'
formatAccountNumber(accountNumber: string): string  // 18-digit → 'XXX-XXXXXXXXXX-XX'
formatCurrency(amount: number, currency: string): string
```

### Date Utilities (`lib/utils/dateFormatter.ts`)

```typescript
todayISO(): string                     // "YYYY-MM-DD" of today
formatDateDisplay(ts: number): string  // Unix timestamp → "dd/mm/yyyy"
formatDateLocale(ts: number): string   // Unix timestamp → locale string, "—" if falsy
```

---

## 11. Validation Schemas

All defined in `lib/utils/validation.ts` using Zod.

| Schema | Used In | Key Rules |
|---|---|---|
| `passwordSchema` | Shared | 8–32 chars, 2+ digits, 1+ uppercase, 1+ lowercase |
| `emailSchema` | Shared | Valid email format |
| `phoneSchema` | Shared building block | `/^\+?[0-9]+$/`, max 15 chars — digits only, optional `+` at start |
| `dateOfBirthStringSchema` | Shared building block (string DoB) | required, parseable date, not in the future, ≥ 16 years old |
| `dateOfBirthTimestampSchema` | Shared building block (Unix timestamp DoB) | not in the future, ≥ 16 years old |
| `loginSchema` | LoginForm | `{email, password}` |
| `passwordResetSchema` | PasswordResetForm | `{token, new_password, confirm_password}` — passwords must match |
| `activationSchema` | ActivationForm | `{token, password, confirm_password}` — passwords must match |
| `createEmployeeSchema` | EmployeeCreateForm | All required fields + JMBG 13-digit regex; DoB via `dateOfBirthTimestampSchema`; phone via `phoneSchema` |
| `updateEmployeeSchema` | EmployeeEditForm | All optional; JMBG `/^\d{13}$/` if provided; phone via `phoneSchema` |
| `createClientSchema` | CreateClientView | first_name, last_name, email, jmbg required; DoB via `dateOfBirthStringSchema`; phone via `phoneSchema` |
| `updateClientSchema` | EditClientForm | All optional; phone via `phoneSchema` |
| `authorizedPersonSchema` | AuthorizedPersonForm | first_name, last_name, email required; DoB via `dateOfBirthStringSchema`; phone via `phoneSchema` |
| `createLoanRequestSchema` | LoanApplicationForm | loan_type, interest_type, account_number, amount, currency_code, repayment_period required; phone via `phoneSchema` |

### Server-side uniqueness — duplicate email

Email uniqueness is enforced by the backend (no dedicated check endpoint). When a create/update mutation responds with HTTP 409 or HTTP 400 carrying a message matching email + (`exist`|`taken`|`duplicate`|`unique`|`alread`), the helper `lib/errors/isDuplicateEmailError.ts` recognizes the response and the affected forms surface an inline `setError('email', ...)` instead of a global toast. Wired in: `CreateEmployeeView`, `CreateClientView`, `EditClientView`, `CardRequestView` (for `AuthorizedPersonForm`).

---

## 12. Test Coverage

_Measured: 2026-06-11 — 240 test suites, 1419 tests, all passing._

### Overall Coverage

| Metric | Coverage |
|---|---|
| **Statements** | **79.61%** |
| **Branches** | **65.69%** |
| **Functions** | **63.03%** |
| **Lines** | **81.22%** |

> The named-watchlist feature is fully unit-tested: `lib/api/watchlist.ts`, `hooks/useWatchlist.ts`, and `lib/utils/watchlist.ts` at 100%; `WatchlistButton` 100%, `AddToWatchlistDialog`/`CreateWatchlistDialog` ~94% statements, `WatchlistPanel` ~84%.

> Coverage decreased slightly from the previous measurement due to significant new code added (admin management pages, OTC portal, limits dashboard) that lacks unit test coverage. Cypress e2e tests (28+ test files) provide integration-level coverage for these new features but are not counted in Jest metrics.

> **Cypress e2e tests added:** 28+ test files covering auth, accounts, activation, actuaries, cards, loans, orders (admin + my orders), portfolio, payments, recipients, securities (stocks, futures, forex detail pages), tax, transfers, employees.

### Coverage by Module

| Module | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `components/auth` | 100% | 75% | 100% | 100% |
| `components/accounts/LimitsUsageCard` | ~90% | ~80% | ~80% | ~90% |
| `components/accounts/AccountSelector` | 100% | 80% | 100% | 100% |
| `components/admin/CreateCardDialog` | 91% | 72% | 88% | 97% |
| `components/cards` | ~87% | ~67% | ~69% | ~88% |
| `components/employees` | ~93% | ~77% | ~79% | ~94% |
| `components/layout` | ~95% | 100% | ~67% | ~95% |
| `components/shared` | 100% | 100% | 100% | 100% |
| `components/admin` | low — no unit tests for new dialogs/tables | — | — | — |
| `hooks` | ~70% | ~40% | ~50% | ~72% |
| `lib/api/auth.ts` | 100% | 100% | 100% | 100% |
| `lib/api/roles.ts` | 100% | 100% | 100% | 100% |
| `lib/api/interestRateTiers.ts` | 100% | 100% | 100% | 100% |
| `lib/api/actuaries.ts` | 100% | 100% | 100% | 100% |
| `lib/api/stockExchanges.ts` | 100% | 100% | 100% | 100% |
| `lib/api/exchange.ts` | 100% | 100% | 100% | 100% |
| `lib/api/watchlist.ts` | 100% | 100% | 100% | 100% |
| `hooks/useWatchlist.ts` | 100% | 100% | 100% | 100% |
| `lib/utils/watchlist.ts` | 100% | 100% | 100% | 100% |
| `views/securities/WatchlistButton` | 100% | 100% | 100% | 100% |
| `views/securities/AddToWatchlistDialog` | 94.73% | 75% | 100% | 100% |
| `views/portfolio/CreateWatchlistDialog` | 94.11% | 80% | 100% | 100% |
| `views/portfolio/WatchlistPanel` | 83.72% | 70.37% | 80% | 87.5% |
| `views/otcOptions` (module total) | 82.08% | 80% | 53.33% | 85.71% |
| `views/otcOptions/api/otcOptionsApi.ts` | 87.17% | 59.75% | 84.21% | 87.17% |
| `views/otcOptions/components` | 73.02% | 60.42% | 44.56% | 75.09% |
| `views/otcOptions/hooks` | 79.13% | 71.42% | 65.21% | 78.57% |
| `views/otcOptions/lib` | 100% | 93.75% | 100% | 100% |
| `lib/utils` | 92.52% | 82.14% | 76.19% | 93.61% |
| `pages/LoginPage.tsx` | 100% | 83.33% | 100% | 100% |
| `pages/StockExchangesPage.tsx` | 100% | 100% | 100% | 100% |
| `pages/ActuaryListPage.tsx` | 97.05% | 91.66% | 85.71% | 97.05% |
| `pages/AdminCardRequestsPage.tsx` | 96.66% | 61.11% | 85.71% | 96.55% |
| `pages/StockDetailPage.tsx` | ~93% | 70% | 80% | ~96% |
| `pages/TaxPage.tsx` | ~90% | ~92% | ~67% | ~90% |
| `pages/AdminOrdersPage.tsx` | ~90% | ~92% | ~67% | ~90% |
| `pages/MyOrdersPage.tsx` | ~90% | 100% | ~67% | ~90% |
| `pages/OtcPortalPage.tsx` | ~79% | 60% | 25% | ~82% |
| `pages/TaxTrackingPage.tsx` | ~79% | ~57% | ~33% | ~87% |
| `pages/PortfolioPage.tsx` | ~85% | 100% | 25% | ~85% |
| `pages/AdminFeesPage.tsx` | low — new, no unit tests | — | — | — |
| `pages/AdminRolesPage.tsx` | low — new, no unit tests | — | — | — |
| `pages/AdminInterestRatesPage.tsx` | low — new, no unit tests | — | — | — |
| `pages/AdminEmployeeLimitsPage.tsx` | low — new, no unit tests | — | — | — |
| `store` | 100% | 100% | 100% | 100% |
| `store/selectors` | 100% | 50% | 100% | 100% |
| `store/slices/authSlice.ts` | 98.14% | 76.92% | 100% | 98.14% |
| `store/slices/loanSlice.ts` | ~41% | 0% | 25% | ~41% |
| `store/slices/paymentSlice.ts` | ~29% | 0% | ~15% | ~29% |
| `store/slices/transferSlice.ts` | ~32% | 0% | ~17% | ~32% |

### Notable Coverage Gaps

| File | Gap |
|---|---|
| `lib/api/axios.ts` | 20% statements — axios interceptors (token refresh flow) untested |
| `lib/api/accounts.ts` | 23.33% statements — most account API calls untested |
| `lib/api/loans.ts` | 19.04% statements — most loan API calls untested |
| `lib/api/payments.ts` | 21.21% statements — most payment API calls untested |
| `lib/api/fees.ts` | no unit tests (new module) |
| `lib/api/limits.ts` | no unit tests (new module) |
| `pages/AdminFeesPage.tsx` | no unit tests (new page) |
| `pages/AdminRolesPage.tsx` | no unit tests (new page) |
| `pages/AdminInterestRatesPage.tsx` | no unit tests (new page) |
| `pages/AdminEmployeeLimitsPage.tsx` | no unit tests (new page) |
| `pages/AdminClientLimitsPage.tsx` | no unit tests (new page) |
| `pages/InternalTransferPage.tsx` | ~44% — most transfer flow paths untested |
| `pages/NewPaymentPage.tsx` | ~49% — confirmation and multi-step flow paths untested |
| `store/slices/loanSlice.ts` | ~41% — async thunk paths untested |
| `store/slices/paymentSlice.ts` | ~29% — async thunk paths untested |
| `store/slices/transferSlice.ts` | ~32% — async thunk paths untested |
| `store/slices/authSlice.ts` | Branch 50% — error path in `logoutThunk` uncovered |
| `store/selectors/authSelectors.ts` | Branch 50% — null-user path in one selector |
| `hooks/usePayments.ts` | 31.03% statements — query hooks untested |
| `hooks/useRecipientAutofill.ts` | 30% statements — autofill hook untested |

### Test Infrastructure

- **`renderWithProviders(ui, options?)`** — wraps component with Redux store, QueryClient, MemoryRouter
- **`createQueryWrapper()`** — QueryClient provider factory for hook tests
- **`createMockAuthUser(overrides?)`** — generates mock `AuthUser` objects
- **`createMockAuthState(overrides?)`** — generates mock `AuthState` objects
- **`createMockEmployee(overrides?)`** — generates mock `Employee` objects
- **`createMockCardRequest(overrides?)`** — generates mock `CardRequest` objects
