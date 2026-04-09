# Cypress Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write Cypress e2e tests for all 15 untested pages/features, closing the coverage gap identified in the test audit.

**Architecture:** Each test file follows the established pattern: fixture-based API mocking via `cy.intercept()`, auth via `cy.loginAsEmployee()`/`cy.loginAsClient()`, `realClick()` for Radix/Shadcn selects, request body verification, and both success and error paths.

**Tech Stack:** Cypress, cypress-real-events, JSON fixtures

**Reference files for patterns:**
- `cypress/e2e/employee-management.cy.ts` — admin page test pattern
- `cypress/e2e/payments.cy.ts` — multi-step flow pattern
- `cypress/support/commands.ts` — custom login commands
- `cypress/fixtures/employees-list.json` — fixture format

---

## File Structure

| Action | File | Tests For |
|--------|------|-----------|
| Create | `cypress/e2e/home.cy.ts` | Client dashboard |
| Create | `cypress/e2e/admin-loans.cy.ts` | Admin loans list |
| Create | `cypress/e2e/admin-card-requests.cy.ts` | Card request approval |
| Create | `cypress/e2e/internal-transfer.cy.ts` | Internal transfer |
| Create | `cypress/e2e/password-reset.cy.ts` | Password reset form |
| Create | `cypress/e2e/securities.cy.ts` | Securities list |
| Create | `cypress/e2e/stock-detail.cy.ts` | Stock detail page |
| Create | `cypress/e2e/futures-detail.cy.ts` | Futures detail page |
| Create | `cypress/e2e/forex-detail.cy.ts` | Forex detail page |
| Create | `cypress/e2e/create-order.cy.ts` | Order creation |
| Create | `cypress/e2e/my-orders.cy.ts` | My orders list |
| Create | `cypress/e2e/portfolio.cy.ts` | Portfolio page |
| Create | `cypress/e2e/admin-orders.cy.ts` | Admin order approval |
| Create | `cypress/e2e/admin-tax.cy.ts` | Tax management |
| Create | `cypress/e2e/admin-actuaries.cy.ts` | Actuary management |
| Create | ~20 fixture JSON files in `cypress/fixtures/` | Test data |

---

### Task 1: Home Dashboard tests

**Files:**
- Create: `cypress/fixtures/home-accounts.json`
- Create: `cypress/fixtures/home-recent-payments.json`
- Create: `cypress/e2e/home.cy.ts`

- [ ] **Step 1: Create fixtures**

Create `cypress/fixtures/home-accounts.json`:

```json
{
  "accounts": [
    {
      "id": 1,
      "account_number": "2650001000000001",
      "account_name": "Main Account",
      "currency_code": "RSD",
      "account_kind": "current",
      "account_type": "standard",
      "account_category": "personal",
      "balance": 150000,
      "available_balance": 148000,
      "status": "ACTIVE",
      "owner_id": 1,
      "daily_limit": 250000,
      "monthly_limit": 1000000,
      "daily_spending": 50000,
      "monthly_spending": 200000
    },
    {
      "id": 2,
      "account_number": "2650001000000002",
      "account_name": "EUR Savings",
      "currency_code": "EUR",
      "account_kind": "foreign",
      "account_type": "standard",
      "account_category": "personal",
      "balance": 5000,
      "available_balance": 5000,
      "status": "ACTIVE",
      "owner_id": 1
    }
  ],
  "total": 2
}
```

Create `cypress/fixtures/home-recent-payments.json`:

```json
{
  "payments": [
    {
      "id": 101,
      "sender_account_number": "2650001000000001",
      "recipient_account_number": "2650001000000099",
      "recipient_name": "Marko Petrović",
      "amount": "15000.00",
      "currency_code": "RSD",
      "status": "COMPLETED",
      "created_at": "2026-04-03T14:30:00Z"
    },
    {
      "id": 102,
      "sender_account_number": "2650001000000001",
      "recipient_account_number": "2650001000000088",
      "recipient_name": "Ana Jovanović",
      "amount": "5000.00",
      "currency_code": "RSD",
      "status": "PENDING",
      "created_at": "2026-04-02T10:00:00Z"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Write tests**

Create `cypress/e2e/home.cy.ts`:

```typescript
describe('Client Home Dashboard', () => {
  it('should display welcome message and account cards', () => {
    cy.intercept('GET', '/api/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
    cy.intercept('GET', '/api/me/payments*', { fixture: 'home-recent-payments.json' }).as('getPayments')

    cy.loginAsClient('/home')
    cy.wait('@getAccounts')

    // Welcome section
    cy.contains('h1', /Welcome/i).should('be.visible')

    // Account cards displayed
    cy.contains('Main Account').should('be.visible')
    cy.contains('EUR Savings').should('be.visible')
    cy.contains('150,000').should('be.visible')
  })

  it('should display recent transactions', () => {
    cy.intercept('GET', '/api/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
    cy.intercept('GET', '/api/me/payments*', { fixture: 'home-recent-payments.json' }).as('getPayments')

    cy.loginAsClient('/home')
    cy.wait('@getAccounts')
    cy.wait('@getPayments')

    cy.contains('Marko Petrović').should('be.visible')
    cy.contains('15,000').should('be.visible')
    cy.contains('COMPLETED').should('be.visible')
    cy.contains('PENDING').should('be.visible')
  })

  it('should navigate to new payment via quick actions', () => {
    cy.intercept('GET', '/api/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
    cy.intercept('GET', '/api/me/payments*', { fixture: 'home-recent-payments.json' }).as('getPayments')

    cy.loginAsClient('/home')
    cy.wait('@getAccounts')

    cy.contains('New Payment').click()
    cy.url().should('include', '/payments/new')
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add cypress/fixtures/home-accounts.json cypress/fixtures/home-recent-payments.json cypress/e2e/home.cy.ts
git commit -m "test: add Cypress e2e tests for client home dashboard"
```

---

### Task 2: Admin Loans and Admin Card Requests tests

**Files:**
- Create: `cypress/fixtures/admin-loans-list.json`
- Create: `cypress/fixtures/admin-card-requests-list.json`
- Create: `cypress/e2e/admin-loans.cy.ts`
- Create: `cypress/e2e/admin-card-requests.cy.ts`

- [ ] **Step 1: Create fixtures**

Create `cypress/fixtures/admin-loans-list.json`:

```json
{
  "loans": [
    {
      "id": 1,
      "client_id": 7,
      "client_name": "Marko Jovanović",
      "loan_type": "CASH",
      "amount": "500000.00",
      "interest_rate": "6.50",
      "period_months": 24,
      "status": "ACTIVE",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "client_id": 8,
      "client_name": "Ana Petrović",
      "loan_type": "HOUSING",
      "amount": "5000000.00",
      "interest_rate": "4.25",
      "period_months": 240,
      "status": "DELINQUENT",
      "created_at": "2025-06-01T10:00:00Z"
    }
  ],
  "total": 2
}
```

Create `cypress/fixtures/admin-card-requests-list.json`:

```json
{
  "requests": [
    {
      "id": 1,
      "client_id": 7,
      "account_number": "265-0000000001-00",
      "card_brand": "visa",
      "card_type": "debit",
      "card_name": "My Main Card",
      "status": "pending",
      "reason": "",
      "approved_by": 0,
      "created_at": "2026-04-01T10:00:00Z",
      "updated_at": "2026-04-01T10:00:00Z"
    },
    {
      "id": 2,
      "client_id": 8,
      "account_number": "265-0000000002-00",
      "card_brand": "mastercard",
      "card_type": "debit",
      "card_name": "Travel Card",
      "status": "pending",
      "reason": "",
      "approved_by": 0,
      "created_at": "2026-04-02T10:00:00Z",
      "updated_at": "2026-04-02T10:00:00Z"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Write admin-loans tests**

Create `cypress/e2e/admin-loans.cy.ts`:

```typescript
describe('Admin Loans Management', () => {
  it('should display loans list with status badges', () => {
    cy.intercept('GET', '/api/loans*', { fixture: 'admin-loans-list.json' }).as('getLoans')

    cy.loginAsEmployee('/admin/loans')
    cy.wait('@getLoans')

    cy.contains('h1', /Loans/i).should('be.visible')
    cy.contains('Marko Jovanović').should('be.visible')
    cy.contains('CASH').should('be.visible')
    cy.contains('ACTIVE').should('be.visible')
    cy.contains('Ana Petrović').should('be.visible')
    cy.contains('HOUSING').should('be.visible')
    cy.contains('DELINQUENT').should('be.visible')
  })

  it('should show empty state when no loans', () => {
    cy.intercept('GET', '/api/loans*', { body: { loans: [], total: 0 } }).as('getLoans')

    cy.loginAsEmployee('/admin/loans')
    cy.wait('@getLoans')

    cy.contains(/No loans/i).should('be.visible')
  })
})
```

- [ ] **Step 3: Write admin-card-requests tests**

Create `cypress/e2e/admin-card-requests.cy.ts`:

```typescript
describe('Admin Card Requests', () => {
  it('should display pending card requests', () => {
    cy.intercept('GET', '/api/cards/requests*', {
      fixture: 'admin-card-requests-list.json',
    }).as('getRequests')

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    cy.contains('265-0000000001-00').should('be.visible')
    cy.contains('visa').should('be.visible')
    cy.contains('pending').should('be.visible')
    cy.contains('265-0000000002-00').should('be.visible')
    cy.contains('mastercard').should('be.visible')
  })

  it('should approve a card request', () => {
    cy.intercept('GET', '/api/cards/requests*', {
      fixture: 'admin-card-requests-list.json',
    }).as('getRequests')
    cy.intercept('PUT', '/api/cards/requests/1/approve', {
      statusCode: 200,
      body: { id: 1, status: 'approved' },
    }).as('approveRequest')

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    cy.contains('tr', '265-0000000001-00').within(() => {
      cy.contains('button', /Approve/i).click()
    })

    cy.wait('@approveRequest')
  })

  it('should deny a card request with reason', () => {
    cy.intercept('GET', '/api/cards/requests*', {
      fixture: 'admin-card-requests-list.json',
    }).as('getRequests')
    cy.intercept('PUT', '/api/cards/requests/1/deny', {
      statusCode: 200,
      body: { id: 1, status: 'rejected', reason: 'Insufficient credit history' },
    }).as('denyRequest')

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    cy.contains('tr', '265-0000000001-00').within(() => {
      cy.contains('button', /Deny/i).click()
    })

    // Deny dialog with reason input
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('[role="dialog"]').within(() => {
      cy.get('textarea, input').type('Insufficient credit history')
      cy.contains('button', /Confirm/i).click()
    })

    cy.wait('@denyRequest')
    cy.get('@denyRequest')
      .its('request.body')
      .should('have.property', 'reason', 'Insufficient credit history')
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/admin-loans-list.json cypress/fixtures/admin-card-requests-list.json cypress/e2e/admin-loans.cy.ts cypress/e2e/admin-card-requests.cy.ts
git commit -m "test: add Cypress e2e tests for admin loans and card requests"
```

---

### Task 3: Internal Transfer and Password Reset tests

**Files:**
- Create: `cypress/fixtures/internal-transfer-accounts.json`
- Create: `cypress/e2e/internal-transfer.cy.ts`
- Create: `cypress/e2e/password-reset.cy.ts`

- [ ] **Step 1: Create fixture**

Create `cypress/fixtures/internal-transfer-accounts.json`:

```json
{
  "accounts": [
    {
      "id": 1,
      "account_number": "2650001000000001",
      "account_name": "Main RSD",
      "currency_code": "RSD",
      "balance": 150000,
      "available_balance": 148000,
      "status": "ACTIVE",
      "account_kind": "current"
    },
    {
      "id": 2,
      "account_number": "2650001000000002",
      "account_name": "Savings RSD",
      "currency_code": "RSD",
      "balance": 500000,
      "available_balance": 500000,
      "status": "ACTIVE",
      "account_kind": "current"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Write internal-transfer tests**

Create `cypress/e2e/internal-transfer.cy.ts`:

```typescript
describe('Internal Transfer', () => {
  it('should transfer between own accounts', () => {
    cy.intercept('GET', '/api/me/accounts*', {
      fixture: 'internal-transfer-accounts.json',
    }).as('getAccounts')
    cy.intercept('POST', '/api/me/transfers', {
      statusCode: 201,
      body: { id: 1, status: 'pending_verification' },
    }).as('createTransfer')

    cy.loginAsClient('/payments/transfer')
    cy.wait('@getAccounts')

    // Select From and To accounts — the exact UI depends on the InternalTransferPage
    // implementation. The implementing agent should read InternalTransferPage.tsx and
    // adapt these selectors to match the actual form structure (Select components or
    // radio buttons for account selection, Input for amount).
    cy.contains('h1', /Internal Transfer|Transfer/i).should('be.visible')
  })
})
```

Note: The implementing agent MUST read `src/pages/InternalTransferPage.tsx` to write accurate selectors for this test. The above is a scaffold — fill in the actual form interaction pattern after reading the page.

- [ ] **Step 3: Write password-reset tests**

Create `cypress/e2e/password-reset.cy.ts`:

```typescript
describe('Password Reset', () => {
  it('should submit new password with valid token', () => {
    cy.intercept('POST', '/api/auth/password/reset', {
      statusCode: 200,
      body: { message: 'password reset successfully' },
    }).as('resetPassword')

    cy.visit('/password-reset?token=valid-reset-token-123')

    cy.get('input[type="password"]').first().type('NewSecure99Pass')
    cy.get('input[type="password"]').last().type('NewSecure99Pass')
    cy.contains('button', /Reset|Submit|Confirm/i).click()

    cy.wait('@resetPassword')
    cy.get('@resetPassword')
      .its('request.body')
      .should((body) => {
        expect(body.token).to.equal('valid-reset-token-123')
        expect(body.password).to.equal('NewSecure99Pass')
      })
  })

  it('should show error for weak password', () => {
    cy.visit('/password-reset?token=valid-reset-token-123')

    cy.get('input[type="password"]').first().type('weak')
    cy.get('input[type="password"]').last().type('weak')
    cy.contains('button', /Reset|Submit|Confirm/i).click()

    // Validation error should appear (min 8 chars, 2 numbers, 1 upper, 1 lower)
    cy.contains(/password|least|characters/i).should('be.visible')
  })

  it('should show error for mismatched passwords', () => {
    cy.visit('/password-reset?token=valid-reset-token-123')

    cy.get('input[type="password"]').first().type('NewSecure99Pass')
    cy.get('input[type="password"]').last().type('DifferentPass99')
    cy.contains('button', /Reset|Submit|Confirm/i).click()

    cy.contains(/match|mismatch/i).should('be.visible')
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/internal-transfer-accounts.json cypress/e2e/internal-transfer.cy.ts cypress/e2e/password-reset.cy.ts
git commit -m "test: add Cypress e2e tests for internal transfer and password reset"
```

---

### Task 4: Securities list and detail page tests

**Files:**
- Create: `cypress/fixtures/securities-stocks.json`
- Create: `cypress/fixtures/stock-detail.json`
- Create: `cypress/fixtures/stock-price-history.json`
- Create: `cypress/e2e/securities.cy.ts`
- Create: `cypress/e2e/stock-detail.cy.ts`
- Create: `cypress/e2e/futures-detail.cy.ts`
- Create: `cypress/e2e/forex-detail.cy.ts`

- [ ] **Step 1: Create fixtures**

The implementing agent should read `src/types/security.ts` (or similar) and the securities API responses to create accurate fixture data. Each fixture should match the API response format from `GET /api/securities/stocks`, `GET /api/securities/stocks/:id`, `GET /api/securities/stocks/:id/history`.

- [ ] **Step 2: Write securities list tests**

Create `cypress/e2e/securities.cy.ts` — test tabbed interface (Stocks/Futures/Forex tabs), search functionality, pagination, and clicking a security navigates to detail page. Use `cy.loginAsClient()` for client view, `cy.loginAsEmployee()` for employee view (which may show additional tabs).

- [ ] **Step 3: Write stock-detail tests**

Create `cypress/e2e/stock-detail.cy.ts` — test info panel renders stock data, price chart is displayed, options chain table shows calls/puts, Buy/Sell buttons navigate to `/securities/order/new?listingId=X&direction=buy`.

- [ ] **Step 4: Write futures-detail and forex-detail tests**

Create `cypress/e2e/futures-detail.cy.ts` and `cypress/e2e/forex-detail.cy.ts` — follow same pattern as stock-detail but for their respective security types and routes.

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/securities-*.json cypress/fixtures/stock-*.json cypress/fixtures/futures-*.json cypress/fixtures/forex-*.json cypress/e2e/securities.cy.ts cypress/e2e/stock-detail.cy.ts cypress/e2e/futures-detail.cy.ts cypress/e2e/forex-detail.cy.ts
git commit -m "test: add Cypress e2e tests for securities list and detail pages"
```

---

### Task 5: Order creation and My Orders tests

**Files:**
- Create: `cypress/fixtures/order-created.json`
- Create: `cypress/fixtures/my-orders-list.json`
- Create: `cypress/e2e/create-order.cy.ts`
- Create: `cypress/e2e/my-orders.cy.ts`

- [ ] **Step 1: Create fixtures**

The implementing agent should read `src/types/order.ts` and `src/pages/CreateOrderPage.tsx` to create accurate fixtures matching the API response format.

- [ ] **Step 2: Write create-order tests**

Create `cypress/e2e/create-order.cy.ts` — test navigating to order page with query params (`?listingId=1&direction=buy`), filling form fields (order_type select, quantity input, limit/stop values if applicable, account select), submitting, verifying request body.

- [ ] **Step 3: Write my-orders tests**

Create `cypress/e2e/my-orders.cy.ts` — test order list renders, filter by status/direction/type, cancel action with confirmation, empty state.

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/order-created.json cypress/fixtures/my-orders-list.json cypress/e2e/create-order.cy.ts cypress/e2e/my-orders.cy.ts
git commit -m "test: add Cypress e2e tests for order creation and my orders list"
```

---

### Task 6: Portfolio tests

**Files:**
- Create: `cypress/fixtures/portfolio-holdings.json`
- Create: `cypress/fixtures/portfolio-summary.json`
- Create: `cypress/e2e/portfolio.cy.ts`

- [ ] **Step 1: Create fixtures**

The implementing agent should read `src/types/portfolio.ts` and API responses to create accurate fixtures for holdings and portfolio summary.

- [ ] **Step 2: Write portfolio tests**

Create `cypress/e2e/portfolio.cy.ts` — test summary card displays total value/cost/P&L, holdings table renders with columns, filter by security type, "Make Public" action, "Exercise" action for options.

- [ ] **Step 3: Commit**

```bash
git add cypress/fixtures/portfolio-holdings.json cypress/fixtures/portfolio-summary.json cypress/e2e/portfolio.cy.ts
git commit -m "test: add Cypress e2e tests for portfolio page"
```

---

### Task 7: Admin orders, tax, and actuaries tests

**Files:**
- Create: `cypress/fixtures/admin-orders-list.json`
- Create: `cypress/fixtures/admin-tax-records.json`
- Create: `cypress/fixtures/admin-actuaries-list.json`
- Create: `cypress/e2e/admin-orders.cy.ts`
- Create: `cypress/e2e/admin-tax.cy.ts`
- Create: `cypress/e2e/admin-actuaries.cy.ts`

- [ ] **Step 1: Create fixtures**

The implementing agent should read the existing types (`src/types/order.ts`, `src/types/tax.ts`, `src/types/actuary.ts`) and corresponding pages to create accurate fixtures.

- [ ] **Step 2: Write admin-orders tests**

Create `cypress/e2e/admin-orders.cy.ts` — test order list renders, approve action, decline action, verify request bodies. Use `cy.loginAsEmployee()`.

- [ ] **Step 3: Write admin-tax tests**

Create `cypress/e2e/admin-tax.cy.ts` — test tax records table renders, any collection action available, pagination.

- [ ] **Step 4: Write admin-actuaries tests**

Create `cypress/e2e/admin-actuaries.cy.ts` — test actuary list renders with limit/used_limit columns, edit limit dialog opens and saves, reset limit action, toggle approval action. This is the e2e complement to the existing unit test for ActuaryListPage.

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/admin-orders-list.json cypress/fixtures/admin-tax-records.json cypress/fixtures/admin-actuaries-list.json cypress/e2e/admin-orders.cy.ts cypress/e2e/admin-tax.cy.ts cypress/e2e/admin-actuaries.cy.ts
git commit -m "test: add Cypress e2e tests for admin orders, tax, and actuaries"
```

---

### Task 8: Verify all Cypress tests run

- [ ] **Step 1: Run all Cypress tests in headless mode**

Run: `npx cypress run`
Expected: All 27 test files pass (12 existing + 15 new)

- [ ] **Step 2: Fix any failing tests**

If any tests fail, read the specific page component to understand the actual DOM structure and adjust selectors accordingly. Common fixes:
- Radix Select: use `realClick()` instead of `click()`
- Async data: add `cy.wait('@alias')` before asserting
- Dialog portals: scope assertions with `.within()` or use `[role="dialog"]`

- [ ] **Step 3: Commit any fixes**

```bash
git add cypress/
git commit -m "fix: adjust Cypress test selectors after verification run"
```

---

## Important Implementation Notes

1. **Read before writing:** Each task that creates Cypress tests for an existing page MUST begin by reading the actual page component to understand the DOM structure, element selectors, and data flow. The fixtures and assertions above are templates — adapt them to match reality.

2. **Fixture accuracy:** All fixture JSON must match the exact API response shape. Read the corresponding types in `src/types/` and API functions in `src/lib/api/` to verify field names.

3. **Selector strategy priority:** (a) `cy.contains('text')` for visible text, (b) `[role="..."]` for semantic elements, (c) `#id` for form inputs, (d) `[data-testid="..."]` as last resort.

4. **Radix/Shadcn Select handling:** Always use `realClick()` from cypress-real-events, then `cy.contains('[role="option"]', 'text').realClick()` for options.

5. **LIFO intercept ordering:** Register generic intercepts before page load, then register more specific intercepts after `cy.wait()` to handle filtered/subsequent requests.
