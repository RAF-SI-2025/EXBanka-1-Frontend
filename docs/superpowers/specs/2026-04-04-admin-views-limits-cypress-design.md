# Design: Admin Management Views, User Limits Dashboard & Cypress Test Coverage

_Date: 2026-04-04_

---

## Overview

Three independent sub-projects to extend the EXBanka frontend:

1. **Admin Management Views** — new admin pages for roles, permissions, employee/client limits, interest rates, bank margins, and transfer fees
2. **User Limits Dashboard** — visual limit usage display on account details for all user types
3. **Cypress Test Coverage** — e2e tests for all untested pages

Each sub-project gets its own implementation plan and can be worked independently on separate branches.

---

## Sub-Project 1: Admin Management Views

### New Pages

| Page | Route | Permission Required | API Endpoints |
|------|-------|------------|-----|
| Roles & Permissions | `/admin/roles` | `employees.permissions` | `GET/POST /api/roles`, `PUT /api/roles/:id/permissions`, `GET /api/permissions` |
| Employee Limits | `/admin/limits/employees` | `limits.manage` | `GET/PUT /api/employees/:id/limits`, `GET/POST /api/limits/templates`, `POST /api/employees/:id/limits/template` |
| Client Limits | `/admin/limits/clients` | `limits.manage` | `GET/PUT /api/clients/:id/limits` |
| Interest Rates & Margins | `/admin/interest-rates` | `interest-rates.manage` | `GET/POST/PUT/DELETE /api/interest-rate-tiers`, `POST /api/interest-rate-tiers/:id/apply`, `GET/PUT /api/bank-margins` |
| Transfer Fees | `/admin/fees` | `fees.manage` | `GET/POST/PUT/DELETE /api/fees` |

### Sidebar Navigation

New "Settings" section in the employee sidebar, below existing navigation:

```
Settings
  Roles & Permissions  (if employees.permissions)
  Limits               (if limits.manage)
  Interest Rates       (if interest-rates.manage)
  Transfer Fees        (if fees.manage)
```

The "Limits" link leads to `/admin/limits/employees` with a tab switcher to `/admin/limits/clients`.

### Page Designs

#### AdminRolesPage (`/admin/roles`)

**Layout:** Tabs component with two tabs: "Roles" and "All Permissions".

**Roles tab:**
- Table columns: Name, Description, Permissions (count badge), Actions
- "Create Role" button in header -> `CreateRoleDialog`
  - Fields: name (required), description, permission_codes (multi-select grouped by category)
  - Calls `POST /api/roles`
- Row click -> `EditRolePermissionsDialog`
  - Displays role name/description (read-only)
  - Checkbox grid of all permissions grouped by `category` field
  - Save calls `PUT /api/roles/:id/permissions`
- Employee role assignment: accessible from existing employee edit page via new "Manage Roles" button
  - `AssignRolesDialog`: multi-select of role names, calls `PUT /api/employees/:id/roles`
  - "Additional Permissions" section: multi-select, calls `PUT /api/employees/:id/permissions`

**All Permissions tab:**
- Read-only reference table: Code, Description, Category
- FilterBar: search by code or description
- Grouped visually by category with section headers
- Data from `GET /api/permissions`

#### AdminEmployeeLimitsPage (`/admin/limits/employees`)

**Layout:** Tabs for "Employee Limits" / "Client Limits" (shared between the two limits pages).

**Employee Limits tab:**
- Reuses existing employee list via `GET /api/employees` (search by name/email, pagination)
- Table columns: Name, Email, Position, Actions (Edit Limits button)
- Limit values are NOT shown in the table (the API only provides limits per-employee via `GET /api/employees/:id/limits`, not in bulk)
- Row click -> fetches `GET /api/employees/:id/limits` then opens `EditEmployeeLimitsDialog`
  - Fields: max_loan_approval_amount, max_single_transaction, max_daily_transaction, max_client_daily_limit, max_client_monthly_limit
  - All fields are decimal string inputs
  - "Apply Template" dropdown in the dialog footer -> selects from `GET /api/limits/templates`, calls `POST /api/employees/:id/limits/template`
  - Save calls `PUT /api/employees/:id/limits`
- "Manage Templates" button in page header -> `LimitTemplatesDialog`
  - Lists all templates from `GET /api/limits/templates`
  - "Create Template" button -> form with name, description, and 5 limit fields
  - Calls `POST /api/limits/templates`

#### AdminClientLimitsPage (`/admin/limits/clients`)

**Layout:** Same tab wrapper, "Client Limits" tab active.

- Reuses existing client list via `GET /api/clients` (search by name/email, pagination)
- Table columns: Name, Email, Actions (Edit Limits button)
- Limit values are NOT shown in the table (the API only provides limits per-client via `GET /api/clients/:id/limits`, not in bulk)
- Row click -> fetches `GET /api/clients/:id/limits` then opens `EditClientLimitsDialog`
  - Fields: daily_limit, monthly_limit, transfer_limit
  - Shows info banner: "Your authority: max daily X, max monthly Y" (from the authenticated employee's own limits)
  - Validation: requested limits must not exceed employee's `max_client_daily_limit` / `max_client_monthly_limit`
  - Save calls `PUT /api/clients/:id/limits`

#### AdminInterestRatesPage (`/admin/interest-rates`)

**Layout:** Tabs with "Interest Rate Tiers" and "Bank Margins".

**Interest Rate Tiers tab:**
- Table columns: Amount Range (from - to, formatted as currency), Fixed Rate (%), Variable Base (%), Active (badge), Actions
- "Create Tier" button -> `CreateTierDialog`
  - Fields: amount_from, amount_to (both >= 0), fixed_rate (required, >= 0), variable_base (required, >= 0)
  - Calls `POST /api/interest-rate-tiers`
- Row actions:
  - Edit -> `EditTierDialog` (same fields, calls `PUT /api/interest-rate-tiers/:id`)
  - Delete -> confirmation dialog, calls `DELETE /api/interest-rate-tiers/:id`
  - "Apply to Loans" -> confirmation dialog explaining impact, calls `POST /api/interest-rate-tiers/:id/apply`, shows result "X loans updated"

**Bank Margins tab:**
- Table columns: Loan Type (capitalized), Margin (%), Active (badge), Last Updated
- Row action: Edit -> `EditMarginDialog`
  - Single field: margin (>= 0)
  - Calls `PUT /api/bank-margins/:id`
- No create/delete — margins are predefined per loan type by the backend

#### AdminFeesPage (`/admin/fees`)

- Table columns: Name, Type (badge: percentage/fixed), Value, Min Amount, Max Fee Cap, Transaction Type, Currency, Active (badge), Actions
- "Create Fee Rule" button -> `CreateFeeDialog`
  - Fields: name (required), fee_type (select: percentage/fixed), fee_value (required), min_amount, max_fee, transaction_type (select: payment/transfer/all), currency_code (select from SUPPORTED_CURRENCIES or empty for all)
  - Calls `POST /api/fees`
- Row actions:
  - Edit -> `EditFeeDialog` (same fields + active toggle, calls `PUT /api/fees/:id`)
  - Deactivate -> confirmation dialog, calls `DELETE /api/fees/:id` (soft delete)
  - Reactivate (if inactive) -> calls `PUT /api/fees/:id` with `active: true`

### New Types

```typescript
// types/role.ts (update existing)
interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
}

// types/permission.ts (update existing)
interface Permission {
  id: number
  code: string
  description: string
  category: string
}

// types/limits.ts (new)
interface EmployeeLimits {
  id: number
  employee_id: number
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

interface ClientLimits {
  id: number
  client_id: number
  daily_limit: string
  monthly_limit: string
  transfer_limit: string
  set_by_employee: number
}

interface LimitTemplate {
  id: number
  name: string
  description: string
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

// types/fee.ts (new)
interface TransferFee {
  id: number
  name: string
  fee_type: 'percentage' | 'fixed'
  fee_value: string
  min_amount: string
  max_fee: string
  transaction_type: 'payment' | 'transfer' | 'all'
  currency_code: string
  active: boolean
}
```

Existing types `InterestRateTier` and `BankMargin` in `types/interestRateTiers.ts` and `types/bankMargins.ts` are already defined and sufficient.

### New API Functions

| File | Functions |
|------|-----------|
| `lib/api/roles.ts` | `getRoles()`, `getRole(id)`, `createRole(payload)`, `updateRolePermissions(id, codes)` |
| `lib/api/permissions.ts` | `getPermissions()`, `setEmployeeRoles(id, roleNames)`, `setEmployeePermissions(id, codes)` |
| `lib/api/limits.ts` | `getEmployeeLimits(id)`, `updateEmployeeLimits(id, payload)`, `applyLimitTemplate(id, templateName)`, `getLimitTemplates()`, `createLimitTemplate(payload)`, `getClientLimits(id)`, `updateClientLimits(id, payload)` |
| `lib/api/interestRateTiers.ts` | `getInterestRateTiers()`, `createTier(payload)`, `updateTier(id, payload)`, `deleteTier(id)`, `applyTier(id)` |
| `lib/api/bankMargins.ts` | `getBankMargins()`, `updateBankMargin(id, payload)` |
| `lib/api/fees.ts` | `getFees()`, `createFee(payload)`, `updateFee(id, payload)`, `deleteFee(id)` |

### New TanStack Query Hooks

| File | Hooks |
|------|-------|
| `hooks/useRoles.ts` | `useRoles()`, `useCreateRole()`, `useUpdateRolePermissions()` |
| `hooks/usePermissions.ts` | `usePermissions()`, `useSetEmployeeRoles()`, `useSetEmployeePermissions()` |
| `hooks/useLimits.ts` | `useEmployeeLimits(id)`, `useUpdateEmployeeLimits()`, `useApplyLimitTemplate()`, `useLimitTemplates()`, `useCreateLimitTemplate()`, `useClientLimits(id)`, `useUpdateClientLimits()` |
| `hooks/useInterestRateTiers.ts` | `useInterestRateTiers()`, `useCreateTier()`, `useUpdateTier()`, `useDeleteTier()`, `useApplyTier()` |
| `hooks/useBankMargins.ts` | `useBankMargins()`, `useUpdateBankMargin()` |
| `hooks/useFees.ts` | `useFees()`, `useCreateFee()`, `useUpdateFee()`, `useDeleteFee()` |

### Route Registration

In `App.tsx`, inside the employee `ProtectedRoute` block:

```tsx
<Route path="admin/roles" element={<ProtectedRoute requiredRole="Employee" requiredPermission="employees.permissions"><AdminRolesPage /></ProtectedRoute>} />
<Route path="admin/limits/employees" element={<ProtectedRoute requiredRole="Employee" requiredPermission="limits.manage"><AdminEmployeeLimitsPage /></ProtectedRoute>} />
<Route path="admin/limits/clients" element={<ProtectedRoute requiredRole="Employee" requiredPermission="limits.manage"><AdminClientLimitsPage /></ProtectedRoute>} />
<Route path="admin/interest-rates" element={<ProtectedRoute requiredRole="Employee" requiredPermission="interest-rates.manage"><AdminInterestRatesPage /></ProtectedRoute>} />
<Route path="admin/fees" element={<ProtectedRoute requiredRole="Employee" requiredPermission="fees.manage"><AdminFeesPage /></ProtectedRoute>} />
```

### Error Handling

All pages follow the existing pattern:
- `isLoading` -> `LoadingSpinner`
- `error` -> error message display
- Mutation errors -> toast or inline error message from API response
- 403 responses -> handled by `ProtectedRoute` redirect

---

## Sub-Project 2: User Limits Dashboard

### Component: LimitsUsageCard

**Location:** `src/components/accounts/LimitsUsageCard.tsx`

**Props:**
```typescript
interface LimitsUsageCardProps {
  dailyLimit: number | undefined
  monthlyLimit: number | undefined
  dailySpending: number | undefined
  monthlySpending: number | undefined
  currency: string
}
```

**Visual Design:**
- Card with title "Spending Limits"
- Two rows, each containing:
  - Label ("Daily" / "Monthly")
  - Progress bar (Tailwind `bg-gray-200` track + colored fill)
  - Text: "150,000.00 / 250,000.00 RSD (60%)"
- Color coding based on usage percentage:
  - Green (`bg-green-500`): < 70%
  - Yellow (`bg-yellow-500`): 70% - 90%
  - Red (`bg-red-500`): > 90%
- If limit is undefined/0: show "No limit configured" in muted text

**Integration point:** `AccountDetailsPage` — replace the current plain-text "Daily Limit" and "Monthly Limit" lines in the details card with the `LimitsUsageCard` component.

**Data source:** Already available on the `Account` object from `GET /api/me/accounts/:id`:
- `daily_limit`, `monthly_limit` (the caps)
- `daily_spending`, `monthly_spending` (current usage)

No new API calls, hooks, or types needed. The existing `Account` type may need `daily_spending` and `monthly_spending` fields added if not already present.

**Visibility:** All authenticated users (clients and employees) see this on their own account details. No permission check needed.

---

## Sub-Project 3: Cypress Test Coverage

### Existing Coverage (12 test files)

| File | Coverage |
|------|----------|
| `auth.cy.ts` | Login, password reset request, activation |
| `accounts.cy.ts` | Account creation, viewing, renaming |
| `cards.cy.ts` | Card request, view, block/unblock |
| `payments.cy.ts` | Payment flow, verification, history, filters |
| `transfers.cy.ts` | Transfer flow, history |
| `recipients.cy.ts` | Add, edit, delete recipients |
| `exchange.cy.ts` | Rates display, calculator, conversion |
| `loans.cy.ts` | Loan application, list, approve/reject |
| `employees.cy.ts` | Employee creation |
| `employee-management.cy.ts` | Employee list, edit, deactivate |
| `employee-portal.cy.ts` | Client search, edit |
| `activation.cy.ts` | Account activation flow |

### New Test Files (15 files)

**High Priority — Core Banking:**

| File | Route | Key Scenarios |
|------|-------|---------------|
| `home.cy.ts` | `/home` | Dashboard loads, account cards display, recent transactions, quick actions navigation |
| `admin-loans.cy.ts` | `/admin/loans` | Loan list with filters, status badges, pagination |
| `admin-card-requests.cy.ts` | `/admin/cards/requests` | List pending requests, approve with confirmation, deny with reason dialog |
| `internal-transfer.cy.ts` | `/payments/transfer` | Transfer between own accounts, validation, success |
| `password-reset.cy.ts` | `/password-reset` | Reset form with token, validation, success/error |

**Medium Priority — Trading/Securities:**

| File | Route | Key Scenarios |
|------|-------|---------------|
| `securities.cy.ts` | `/securities` | Tabbed list (stocks/futures/forex), search, pagination, navigate to detail |
| `stock-detail.cy.ts` | `/securities/stocks/:id` | Info panel, price chart renders, options chain, buy/sell buttons navigate to order |
| `futures-detail.cy.ts` | `/securities/futures/:id` | Info panel, chart, buy/sell navigation |
| `forex-detail.cy.ts` | `/securities/forex/:id` | Info panel, chart, buy/sell navigation |
| `create-order.cy.ts` | `/securities/order/new` | Order form by type (market/limit/stop/stop_limit), validation, submission |
| `my-orders.cy.ts` | `/orders` | Order list, filter by status/direction/type, cancel action |
| `portfolio.cy.ts` | `/portfolio` | Summary card, holdings table, make public action, exercise option |

**Lower Priority — Admin Trading:**

| File | Route | Key Scenarios |
|------|-------|---------------|
| `admin-orders.cy.ts` | `/admin/orders` | Order approval list, approve/decline actions |
| `admin-tax.cy.ts` | `/admin/tax` | Tax records table, collection action |
| `admin-actuaries.cy.ts` | `/admin/actuaries` | Actuary list, edit limit dialog, reset limit, toggle approval |

### Test Patterns

All new tests follow established conventions:
- **Auth:** `cy.loginAsEmployee()` or `cy.loginAsClient()` per test
- **API mocking:** `cy.intercept('GET', '/api/...', { fixture: '...' }).as('alias')`
- **Fixture files:** One JSON fixture per API response, stored in `cypress/fixtures/`
- **Radix/Shadcn selects:** `realClick()` + visible content filtering
- **Assertions:** Request body verification, status badge checks, navigation verification
- **Both paths:** Success and error/empty state for each flow

### New Fixtures (~30 files)

```
cypress/fixtures/
├── home-accounts.json
├── home-recent-transactions.json
├── admin-loans-list.json
├── admin-card-requests-list.json
├── internal-transfer-accounts.json
├── internal-transfer-created.json
├── securities-stocks.json
├── securities-futures.json
├── securities-forex.json
├── stock-detail.json
├── stock-price-history.json
├── stock-options-chain.json
├── futures-detail.json
├── forex-detail.json
├── order-created.json
├── my-orders-list.json
├── portfolio-holdings.json
├── portfolio-summary.json
├── admin-orders-list.json
├── admin-tax-records.json
├── admin-actuaries-list.json
└── ... (additional error/empty state fixtures as needed)
```

### Note

Cypress tests for the 6 new admin pages from Sub-Project 1 are NOT included here. They will be added as the final step of Sub-Project 1's implementation plan, after the pages exist.

---

## Implementation Order

Recommended sequence:

1. **Sub-Project 2 (User Limits Dashboard)** — smallest scope, quick win, ships independently
2. **Sub-Project 1 (Admin Management Views)** — largest scope, core feature work
3. **Sub-Project 3 (Cypress Tests)** — can begin in parallel with Sub-Project 1 for existing pages; new admin page tests come last

Sub-Projects 2 and 3 (for existing pages) can be worked in parallel since they touch completely different files.
