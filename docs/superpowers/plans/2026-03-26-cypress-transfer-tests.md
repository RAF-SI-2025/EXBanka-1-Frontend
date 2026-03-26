# Cypress Transfer Tests (Celina 3: Transferi) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 17–20 (transfer flows) from `docs/cypress-scenariji/Testovi-transferi.md`, covering same-currency and cross-currency transfers between own accounts, transfer history, and error handling.

**Architecture:** Tests live in `cypress/e2e/transfers.cy.ts` following the established pattern from `accounts.cy.ts`. Each scenario maps to one `it()` block. Tests use `cy.intercept()` with fixture files. The client logs in via `cy.loginAsClient()`.

**Tech Stack:** Cypress 14+, cypress-real-events (for Radix UI Select), TypeScript

---

## Conventions (from existing `accounts.cy.ts`)

- **Login:** `cy.loginAsClient('/path')` — sets JWT in sessionStorage, navigates to page
- **API stubs:** `cy.intercept('METHOD', '/api/...', { fixture: '...' }).as('alias')`
- **Radix Select:** `cy.get('[aria-label="..."]').click()` → `cy.contains('[role="option"]', 'Text').realClick()`
- **Assertions on request bodies:** `cy.get('@alias').its('request.body').should(...)`

## API Endpoints (from `src/lib/api/transfers.ts`)

| Action | Method | URL |
|--------|--------|-----|
| Create transfer | POST | `/api/me/transfers` |
| Execute transfer | POST | `/api/me/transfers/:id/execute` |
| List transfers | GET | `/api/me/transfers` |
| List accounts | GET | `/api/me/accounts` |
| Get exchange rate | GET | `/api/exchange/rates/:from/:to` |
| Get self | GET | `/api/me` |

## Page Flow (from `src/pages/CreateTransferPage.tsx`)

```
CreateTransferForm step → "Make Transfer" button
  ↓
TransferPreview step → shows Rate, Commission, Final Amount → "Confirm" button → POST /api/me/transfers
  ↓
VerificationStep → enter code → "Confirm" → POST /api/me/transfers/:id/execute
  ↓
Success → "Transfer successful!" + Transaction ID
```

## Form Fields (from `src/components/transfers/CreateTransferForm.tsx`)

| Field | Selector | Type |
|-------|----------|------|
| Source Account | `[aria-label="Source Account"]` | Radix Select |
| Destination Account | `[aria-label="Destination Account"]` | Radix Select |
| Amount | `#amount` | Input (number) |
| Submit | `button` containing "Make Transfer" | Button |

## Preview Fields (from `src/components/transfers/TransferPreview.tsx`)

Displays: Client, From Account, To Account, Amount, Rate, Commission, Final Amount. Buttons: "Back", "Confirm".

## Fixture Requirements

The existing `accounts.json` has only 2 accounts (1 RSD, 1 EUR). Scenario 17 requires a same-currency transfer, so we need 2 accounts in the same currency. A dedicated `transfer-accounts.json` fixture provides 3 accounts (2 RSD + 1 EUR) without modifying the shared fixture.

---

## Chunk 1: Fixtures & Same-Currency Transfer (Tasks 1–2)

### Task 1: Create transfer fixture files

**Files:**
- Create: `cypress/fixtures/transfer-accounts.json`
- Create: `cypress/fixtures/transfer-created.json`
- Create: `cypress/fixtures/transfer-executed.json`
- Create: `cypress/fixtures/transfer-history.json`

- [ ] **Step 1: Create `transfer-accounts.json`**

3 accounts: 2 RSD (for same-currency tests) + 1 EUR (for cross-currency tests):

```json
{
  "accounts": [
    {
      "id": 1,
      "account_number": "265000000000000011",
      "account_name": "Tekući RSD",
      "currency_code": "RSD",
      "account_kind": "current",
      "account_type": "standard",
      "account_category": "personal",
      "balance": 150000,
      "available_balance": 145000,
      "status": "ACTIVE",
      "owner_id": 42,
      "owner_name": "Marko Jovanović",
      "daily_limit": 1000000,
      "monthly_limit": 10000000,
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": 3,
      "account_number": "265000000000000033",
      "account_name": "Štedni RSD",
      "currency_code": "RSD",
      "account_kind": "current",
      "account_type": "savings",
      "account_category": "personal",
      "balance": 50000,
      "available_balance": 50000,
      "status": "ACTIVE",
      "owner_id": 42,
      "owner_name": "Marko Jovanović",
      "daily_limit": 500000,
      "monthly_limit": 5000000,
      "created_at": "2026-02-01T10:00:00Z"
    },
    {
      "id": 2,
      "account_number": "265000000000000022",
      "account_name": "Devizni EUR",
      "currency_code": "EUR",
      "account_kind": "foreign",
      "account_type": "standard",
      "account_category": "personal",
      "balance": 500,
      "available_balance": 500,
      "status": "ACTIVE",
      "owner_id": 42,
      "owner_name": "Marko Jovanović",
      "daily_limit": 5000,
      "monthly_limit": 50000,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 3
}
```

- [ ] **Step 2: Create `transfer-created.json`**

Response from `POST /api/me/transfers` (same-currency, rate=1, commission=0):

```json
{
  "id": 201,
  "from_account_number": "265000000000000011",
  "to_account_number": "265000000000000033",
  "initial_amount": 10000,
  "final_amount": 10000,
  "exchange_rate": 1,
  "commission": 0,
  "timestamp": "2026-03-26T11:00:00Z"
}
```

- [ ] **Step 3: Create `transfer-executed.json`**

Response from `POST /api/me/transfers/:id/execute`:

```json
{
  "id": 201,
  "from_account_number": "265000000000000011",
  "to_account_number": "265000000000000033",
  "initial_amount": 10000,
  "final_amount": 10000,
  "exchange_rate": 1,
  "commission": 0,
  "timestamp": "2026-03-26T11:00:00Z"
}
```

- [ ] **Step 4: Create `transfer-history.json`**

Response from `GET /api/me/transfers` — 3 transfers sorted newest-first:

```json
{
  "transfers": [
    {
      "id": 203,
      "from_account_number": "265000000000000011",
      "to_account_number": "265000000000000022",
      "initial_amount": 23300,
      "final_amount": 200,
      "exchange_rate": 116.5,
      "commission": 0,
      "timestamp": "2026-03-26T09:00:00Z"
    },
    {
      "id": 202,
      "from_account_number": "265000000000000011",
      "to_account_number": "265000000000000033",
      "initial_amount": 10000,
      "final_amount": 10000,
      "exchange_rate": 1,
      "commission": 0,
      "timestamp": "2026-03-25T15:00:00Z"
    },
    {
      "id": 201,
      "from_account_number": "265000000000000022",
      "to_account_number": "265000000000000011",
      "initial_amount": 50,
      "final_amount": 5825,
      "exchange_rate": 116.5,
      "commission": 0,
      "timestamp": "2026-03-24T08:00:00Z"
    }
  ],
  "total": 3
}
```

- [ ] **Step 5: Verify fixtures**

Run:
```bash
node -e "['transfer-accounts','transfer-created','transfer-executed','transfer-history'].forEach(f => { require('./cypress/fixtures/' + f + '.json'); console.log(f + ' OK') })"
```
Expected: All 4 print "OK"

- [ ] **Step 6: Commit**

```bash
git add cypress/fixtures/transfer-accounts.json cypress/fixtures/transfer-created.json cypress/fixtures/transfer-executed.json cypress/fixtures/transfer-history.json
git commit -m "test: add Cypress fixtures for transfer E2E tests"
```

---

### Task 2: Scaffold `transfers.cy.ts` with shared `beforeEach` and Scenario 17 (same-currency transfer)

**Files:**
- Create: `cypress/e2e/transfers.cy.ts`
- Reference: `cypress/e2e/accounts.cy.ts` (pattern)
- Reference: `src/pages/CreateTransferPage.tsx` (flow)
- Reference: `src/components/transfers/CreateTransferForm.tsx` (selectors: `aria-label="Source Account"`, `aria-label="Destination Account"`)
- Reference: `src/components/transfers/TransferPreview.tsx` (confirmation labels: "Rate", "Commission", "Final Amount")

**Spec reference — Scenario 17:**
> Given klijent je na stranici "Transferi"
> When izabere izvorni i odredišni račun u istoj valuti, unese iznos, klikne "Potvrdi"
> Then transfer se izvršava bez provizije, stanje na oba računa se ažurira

- [ ] **Step 1: Write the test file**

```typescript
describe('Celina 3: Transferi — Prenos sredstava između sopstvenih računa', () => {
  describe('Transfer Flow (Scenarios 17–18, 20)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.loginAsClient('/transfers/new')
    })

    // Scenario 17: Transfer između sopstvenih računa u istoj valuti
    it('should complete same-currency transfer without commission (Scenario 17)', () => {
      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-created.json',
      }).as('createTransfer')
      cy.intercept('POST', '/api/me/transfers/201/execute', {
        statusCode: 200,
        fixture: 'transfer-executed.json',
      }).as('executeTransfer')

      // Step 1: Fill transfer form
      // Select source account (Tekući RSD)
      cy.get('[aria-label="Source Account"]').click()
      cy.contains('[role="option"]', 'Tekući RSD').realClick()

      // Select destination account (Štedni RSD — same currency)
      cy.get('[aria-label="Destination Account"]').click()
      cy.contains('[role="option"]', 'Štedni RSD').realClick()

      // Enter amount (less than available balance of 145,000)
      cy.get('#amount').clear().type('10000')

      // Click "Make Transfer"
      cy.contains('button', 'Make Transfer').click()

      // Step 2: Confirmation — TransferPreview
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('265-0000000000000-11').should('be.visible')
      cy.contains('265-0000000000000-33').should('be.visible')

      // For same-currency, rate should be 1 and commission should be 0
      cy.contains('Rate').parent().should('contain.text', '1')

      // Click "Confirm" to submit
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      // Verify request body
      cy.get('@createTransfer')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000033')
          expect(body.amount).to.equal(10000)
        })

      // Step 3: Verification
      cy.contains('Verification').should('be.visible')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.get('@executeTransfer')
        .its('request.body')
        .should('have.property', 'verification_code', '123456')

      // Step 4: Success
      cy.contains('Transfer successful!').should('be.visible')
      cy.contains('Transaction ID: 201').should('be.visible')
    })
  })
})
```

- [ ] **Step 2: Run Cypress to verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/transfers.cy.ts"
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/transfers.cy.ts
git commit -m "test: add Cypress Scenario 17 — same-currency transfer"
```

---

## Chunk 2: Cross-Currency, History & Error Scenarios (Tasks 3–5)

### Task 3: Scenario 18 — cross-currency transfer with conversion

**Files:**
- Modify: `cypress/e2e/transfers.cy.ts`
- Create: `cypress/fixtures/transfer-cross-currency.json`
- Reference: `src/hooks/useTransfers.ts:13-18` (`useTransferPreview` calls `GET /api/exchange/rates/:from/:to` when currencies differ)
- Reference: `src/pages/CreateTransferPage.tsx:33-37` (rateData from exchange rate query)
- Reference: `src/pages/CreateTransferPage.tsx:115-119` (rate and finalAmount calculation in TransferPreview props)

**Spec reference — Scenario 18:**
> When izabere račune koji imaju različite valute, unese iznos, klikne "Potvrdi"
> Then sistem vrši konverziju valute prema važećem kursu i obračunava proviziju banke

The `CreateTransferPage` uses `useTransferPreview` which calls `GET /api/exchange/rates/:from/:to` when currencies differ. The result is passed to `TransferPreview` as `rate` and used to compute `finalAmount`. The confirmation shows the exchange rate, commission, and final converted amount.

- [ ] **Step 1: Create `transfer-cross-currency.json`**

Response from `POST /api/me/transfers` for RSD→EUR transfer:

```json
{
  "id": 204,
  "from_account_number": "265000000000000011",
  "to_account_number": "265000000000000022",
  "initial_amount": 11650,
  "final_amount": 100,
  "exchange_rate": 116.5,
  "commission": 0,
  "timestamp": "2026-03-26T12:00:00Z"
}
```

- [ ] **Step 2: Add Scenario 18 test**

Add inside the `describe('Transfer Flow')` block, after Scenario 17:

```typescript
    // Scenario 18: Transfer između sopstvenih računa u različitim valutama
    it('should complete cross-currency transfer with exchange rate (Scenario 18)', () => {
      // Stub exchange rate lookup (triggered when currencies differ)
      cy.intercept('GET', '/api/exchange/rates/RSD/EUR', {
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          buy_rate: 116.5,
          sell_rate: 117.8,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getExchangeRate')

      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-cross-currency.json',
      }).as('createTransfer')
      cy.intercept('POST', '/api/me/transfers/204/execute', {
        statusCode: 200,
        body: {
          id: 204,
          from_account_number: '265000000000000011',
          to_account_number: '265000000000000022',
          initial_amount: 11650,
          final_amount: 100,
          exchange_rate: 116.5,
          commission: 0,
          timestamp: '2026-03-26T12:00:00Z',
        },
      }).as('executeTransfer')

      // Select RSD source account
      cy.get('[aria-label="Source Account"]').click()
      cy.contains('[role="option"]', 'Tekući RSD').realClick()

      // Select EUR destination account (different currency)
      cy.get('[aria-label="Destination Account"]').click()
      cy.contains('[role="option"]', 'Devizni EUR').realClick()

      cy.get('#amount').clear().type('11650')
      cy.contains('button', 'Make Transfer').click()

      // Wait for exchange rate query to resolve (fires when confirmation step renders with formData)
      cy.wait('@getExchangeRate')

      // Confirmation — exchange rate should be fetched and shown
      cy.contains('Confirm Transfer').should('be.visible')

      // TransferPreview shows the exchange rate value and computed amounts
      cy.contains('Rate').parent().should('contain.text', '116.5')
      cy.contains('Commission').should('be.visible')
      cy.contains('Final Amount').should('be.visible')

      // Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      cy.get('@createTransfer')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000022')
          expect(body.amount).to.equal(11650)
        })

      // Complete verification
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.contains('Transfer successful!').should('be.visible')
    })
```

- [ ] **Step 3: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/transfers.cy.ts"
```
Expected: 2 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/transfer-cross-currency.json cypress/e2e/transfers.cy.ts
git commit -m "test: add Cypress Scenario 18 — cross-currency transfer"
```

---

### Task 4: Scenario 19 — transfer history viewing

**Files:**
- Modify: `cypress/e2e/transfers.cy.ts`
- Reference: `src/pages/TransferHistoryPage.tsx` (renders `<h1>Transfer History</h1>`, `<TransferHistoryTable>`, `<PaginationControls>`)
- Reference: `src/components/transfers/TransferHistoryTable.tsx` (columns: Date, From Account, To Account, Amount, Final Amount, Rate, Commission)

**Spec reference — Scenario 19:**
> When otvori sekciju "Istorija transfera"
> Then prikazuje se lista svih transfera klijenta, sortirana od najnovijeg ka najstarijem

- [ ] **Step 1: Add Scenario 19 describe block and test**

Add at the end of the outer `describe`, after the `Transfer Flow` block closes:

```typescript
  describe('Transfer History (Scenario 19)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/transfers*', { fixture: 'transfer-history.json' }).as(
        'getTransfers'
      )
      cy.loginAsClient('/transfers/history')
    })

    // Scenario 19: Pregled istorije transfera
    it('should display transfer history sorted newest first (Scenario 19)', () => {
      cy.wait('@getTransfers')

      cy.contains('h1', 'Transfer History').should('be.visible')

      // Verify all table headers are present
      cy.contains('th', 'Date').should('be.visible')
      cy.contains('th', 'From Account').should('be.visible')
      cy.contains('th', 'To Account').should('be.visible')
      cy.contains('th', 'Amount').should('be.visible')
      cy.contains('th', 'Final Amount').should('be.visible')
      cy.contains('th', 'Rate').should('be.visible')
      cy.contains('th', 'Commission').should('be.visible')

      // Verify transfers from fixture are shown (3 rows)
      cy.get('tbody tr').should('have.length', 3)

      // Verify first row is the newest transfer (id=203, March 26)
      // The fixture is already sorted newest-first
      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.contains('265-0000000000000-11').should('exist')
          cy.contains('265-0000000000000-22').should('exist')
        })

      // Verify pagination controls are present
      cy.contains('Page').should('be.visible')
    })

    it('should show empty state when no transfers exist', () => {
      cy.intercept('GET', '/api/me/transfers*', {
        body: { transfers: [], total: 0 },
      }).as('getEmptyTransfers')

      cy.visit('/transfers/history')
      cy.wait('@getEmptyTransfers')

      cy.contains('No transfers.').should('be.visible')
    })
  })
```

- [ ] **Step 2: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/transfers.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/transfers.cy.ts
git commit -m "test: add Cypress Scenario 19 — transfer history"
```

---

### Task 5: Scenario 20 — failed transfer due to insufficient funds

**Files:**
- Modify: `cypress/e2e/transfers.cy.ts`
- Reference: `src/store/slices/transferSlice.ts:46-49` (error extraction: `error.response?.data?.error?.message ?? 'Transfer failed'`)
- Reference: `src/pages/CreateTransferPage.tsx:106-124` (TransferPreview shows error via Redux state, NOT as a prop — actually looking more carefully, the `error` from transferSlice is NOT passed to TransferPreview)

**Important implementation detail:** Looking at `CreateTransferPage.tsx`, when `submitTransfer` is rejected, the `error` field in Redux is set, but the `TransferPreview` component does NOT receive or display an `error` prop. The `error` state from Redux (`useAppSelector((s) => s.transfer).error`) is destructured at line 24 but not used in the JSX at all.

This means when the API rejects the transfer, the user stays on the confirmation step but sees NO error message. The `submitting` prop goes from `true` back to `false`, and the "Confirm" button re-enables, but there's no visible error feedback.

> **Spec deviation:** The spec says "sistem prikazuje poruku 'Nedovoljno sredstava na računu'" (system shows message). The current implementation does NOT display the API error on the confirmation step — the `error` from `transferSlice` is destructured but never rendered in JSX. The test below verifies the observable behavior: the user stays on the confirmation step and can retry.
>
> **Follow-up required:** Fix `CreateTransferPage.tsx` to display the `error` string from Redux on the confirmation step (similar to how `PaymentConfirmation` receives an `error` prop). Once fixed, update this test to assert `cy.contains('Nedovoljno sredstava na računu').should('be.visible')`.

- [ ] **Step 1: Add Scenario 20 test**

Add inside the `describe('Transfer Flow')` block:

```typescript
    // Scenario 20: Neuspešan transfer zbog nedovoljnih sredstava
    it('should handle failed transfer due to insufficient funds (Scenario 20)', () => {
      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 400,
        body: {
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Nedovoljno sredstava na računu',
          },
        },
      }).as('createTransfer')

      // Select source and destination (same currency)
      cy.get('[aria-label="Source Account"]').click()
      cy.contains('[role="option"]', 'Tekući RSD').realClick()
      cy.get('[aria-label="Destination Account"]').click()
      cy.contains('[role="option"]', 'Štedni RSD').realClick()

      // Enter amount exceeding available balance (145,000)
      cy.get('#amount').clear().type('200000')
      cy.contains('button', 'Make Transfer').click()

      // Confirmation step
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      // User stays on confirmation step — transfer was not created
      // The "Confirm" button should re-enable (submitting=false after rejection)
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('button', 'Confirm').should('not.be.disabled')

      // The step does NOT advance to verification (no transactionId was set)
      cy.get('#verification-code').should('not.exist')
    })
```

- [ ] **Step 2: Run Cypress and verify all tests pass**

Run:
```bash
npx cypress run --spec "cypress/e2e/transfers.cy.ts"
```
Expected: 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/transfers.cy.ts
git commit -m "test: add Cypress Scenario 20 — insufficient funds error"
```

---

## Summary

| Task | Scenario | What it tests |
|------|----------|---------------|
| 1 | — | Fixture files (3 accounts, transfer responses, history) |
| 2 | 17 | Same-currency transfer: RSD→RSD, rate=1, commission=0, full flow |
| 3 | 18 | Cross-currency transfer: RSD→EUR with exchange rate lookup |
| 4 | 19 | Transfer history display + empty state |
| 5 | 20 | Insufficient funds error on confirmation step |

**Total: 5 Cypress tests across 4 scenarios.**

**Noted spec deviations:**
- **Scenario 20:** The current `CreateTransferPage` does not display API error messages on the confirmation step (the `error` state from Redux is not rendered). The test verifies the user stays on the confirmation step without advancing to verification.
