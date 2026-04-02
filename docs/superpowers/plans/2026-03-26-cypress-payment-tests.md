# Cypress Payment Tests (Celina 2: Plaćanja) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 9–16 (payment flows) from `docs/cypress-scenariji/Testovi-placanja.md`, covering successful/failed payments, verification codes, recipient management, and payment history.

**Architecture:** All tests live in a single `cypress/e2e/payments.cy.ts` file following the existing pattern in `accounts.cy.ts`. Each scenario maps to one `it()` block. Tests use `cy.intercept()` with fixture files to stub API responses — no live backend required. The client logs in via `cy.loginAsClient()` which injects JWT tokens into `sessionStorage`.

**Tech Stack:** Cypress 14+, cypress-real-events (for Radix UI Select), TypeScript

---

## Conventions (from existing `accounts.cy.ts`)

- **Login:** `cy.loginAsClient('/path')` — sets JWT in sessionStorage, navigates to page
- **API stubs:** `cy.intercept('METHOD', '/api/...', { fixture: '...' }).as('alias')` or `cy.intercept('METHOD', '/api/...', { statusCode: N, body: {...} }).as('alias')`
- **Radix Select:** `cy.get('[aria-label="..."]').click()` → `cy.contains('[role="option"]', 'Text').realClick()`
- **Assertions on request bodies:** `cy.get('@alias').its('request.body').should(...)` or `.should((body) => { expect(...) })`
- **Wait for intercepts:** `cy.wait('@alias')` before asserting on response-driven UI

## API Endpoints (from `src/lib/api/payments.ts`)

| Action | Method | URL | Notes |
|--------|--------|-----|-------|
| List payments | GET | `/api/me/payments` | Query params: `date_from`, `date_to`, `status_filter`, `amount_min`, `amount_max`, `page`, `page_size` |
| Create payment | POST | `/api/me/payments` | Body: `CreatePaymentRequest` |
| Execute payment | POST | `/api/me/payments/:id/execute` | Body: `{ verification_code }` |
| List accounts | GET | `/api/me/accounts` | Response: `{ accounts: [...], total }` |
| Get self | GET | `/api/me` | Client profile |
| List recipients | GET | `/api/me/payment-recipients` | Response: `{ recipients: [...] }` |
| Create recipient | POST | `/api/me/payment-recipients` | Body: `{ recipient_name, account_number }` |
| Exchange rates | GET | `/api/exchange/rates` | For cross-currency conversion display |

## Page Flow (from `src/pages/NewPaymentPage.tsx`)

```
Form step → "Continue" button
  ↓
Confirmation step → "Confirm" button → POST /api/me/payments
  ↓
Verification step → enter code → "Confirm" button → POST /api/me/payments/:id/execute
  ↓
Success step → "Payment successful!" + Transaction ID + AddRecipientPrompt
```

## Form Fields (from `src/components/payments/NewPaymentForm.tsx`)

| Field | Selector | Type |
|-------|----------|------|
| From Account | Select with placeholder "Select account" | Radix Select |
| Recipient Account | `#to_account_number` | Input |
| Recipient Name | `#recipient_name` | Input |
| Amount | `#amount` | Input (number) |
| Payment Code | Select (default: '289') | Radix Select |
| Reference Number | `#reference_number` | Input (optional) |
| Payment Purpose | `#payment_purpose` | Input (optional) |
| Submit | `button` containing "Continue" | Button |

---

## Chunk 1: Fixtures & Happy-Path Scenarios (Tasks 1–4)

### Task 1: Create payment fixture files

**Files:**
- Create: `cypress/fixtures/payment-created.json`
- Create: `cypress/fixtures/payment-executed.json`
- Create: `cypress/fixtures/payment-recipients.json`
- Create: `cypress/fixtures/payment-history.json`

These fixtures match the types in `src/types/payment.ts`.

- [ ] **Step 1: Create `payment-created.json`**

This is the response from `POST /api/me/payments` (creates a pending payment):

```json
{
  "id": 101,
  "from_account_number": "265000000000000011",
  "to_account_number": "265000000000000099",
  "initial_amount": 5000,
  "final_amount": 5000,
  "commission": 0,
  "recipient_name": "Ana Petrović",
  "payment_code": "289",
  "reference_number": "",
  "payment_purpose": "Test payment",
  "status": "PENDING",
  "timestamp": "2026-03-26T10:00:00Z"
}
```

- [ ] **Step 2: Create `payment-executed.json`**

This is the response from `POST /api/me/payments/:id/execute` (payment confirmed):

```json
{
  "id": 101,
  "from_account_number": "265000000000000011",
  "to_account_number": "265000000000000099",
  "initial_amount": 5000,
  "final_amount": 5000,
  "commission": 0,
  "recipient_name": "Ana Petrović",
  "payment_code": "289",
  "reference_number": "",
  "payment_purpose": "Test payment",
  "status": "COMPLETED",
  "timestamp": "2026-03-26T10:00:00Z"
}
```

- [ ] **Step 3: Create `payment-recipients.json`**

Response from `GET /api/me/payment-recipients`:

```json
{
  "recipients": [
    {
      "id": 1,
      "client_id": 42,
      "recipient_name": "Jelena Marković",
      "account_number": "265000000000000088",
      "created_at": "2026-02-10T12:00:00Z"
    }
  ]
}
```

- [ ] **Step 4: Create `payment-history.json`**

Response from `GET /api/me/payments` (list):

```json
{
  "payments": [
    {
      "id": 101,
      "from_account_number": "265000000000000011",
      "to_account_number": "265000000000000099",
      "initial_amount": 5000,
      "final_amount": 5000,
      "commission": 0,
      "recipient_name": "Ana Petrović",
      "payment_code": "289",
      "reference_number": "RF-001",
      "payment_purpose": "Test payment",
      "status": "COMPLETED",
      "timestamp": "2026-03-25T14:30:00Z"
    },
    {
      "id": 102,
      "from_account_number": "265000000000000011",
      "to_account_number": "265000000000000088",
      "initial_amount": 15000,
      "final_amount": 15000,
      "commission": 0,
      "recipient_name": "Jelena Marković",
      "payment_code": "289",
      "reference_number": "",
      "payment_purpose": "",
      "status": "PENDING",
      "timestamp": "2026-03-26T09:15:00Z"
    },
    {
      "id": 103,
      "from_account_number": "265000000000000011",
      "to_account_number": "265000000000000077",
      "initial_amount": 200000,
      "final_amount": 0,
      "commission": 0,
      "recipient_name": "Petar Nikolić",
      "payment_code": "289",
      "reference_number": "",
      "payment_purpose": "",
      "status": "FAILED",
      "timestamp": "2026-03-24T08:00:00Z"
    }
  ],
  "total": 3
}
```

- [ ] **Step 5: Verify fixtures are valid JSON**

Run:
```bash
node -e "['payment-created','payment-executed','payment-recipients','payment-history'].forEach(f => { require('./cypress/fixtures/' + f + '.json'); console.log(f + ' OK') })"
```
Expected: All 4 print "OK"

- [ ] **Step 6: Commit fixtures**

```bash
git add cypress/fixtures/payment-created.json cypress/fixtures/payment-executed.json cypress/fixtures/payment-recipients.json cypress/fixtures/payment-history.json
git commit -m "test: add Cypress fixtures for payment E2E tests"
```

---

### Task 2: Scaffold `payments.cy.ts` with shared `beforeEach` and Scenario 9 (successful payment)

**Files:**
- Create: `cypress/e2e/payments.cy.ts`
- Reference: `cypress/e2e/accounts.cy.ts` (pattern to follow)
- Reference: `src/pages/NewPaymentPage.tsx` (flow steps)
- Reference: `src/components/payments/NewPaymentForm.tsx` (form selectors)

**Spec reference — Scenario 9:**
> Given klijent je ulogovan i na stranici "Novo plaćanje"
> When unese broj računa primaoca, unese iznos manji od stanja, klikne "Potvrdi"
> Then transakcija se uspešno izvršava

- [ ] **Step 1: Write the test file with `describe`, `beforeEach`, and Scenario 9**

```typescript
describe('Celina 2: Plaćanja — Izvršavanje plaćanja između klijenata', () => {
  describe('Payment Flow (Scenarios 9–15)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      }).as('getMe')
      cy.intercept('GET', '/api/me/payment-recipients', {
        body: { recipients: [] },
      }).as('getRecipients')
      cy.intercept('GET', '/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.loginAsClient('/payments/new')
    })

    // Scenario 9: Uspešno plaćanje drugom klijentu
    it('should complete a payment successfully (Scenario 9)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', '/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')

      // Step 1: Fill the payment form
      // Select source account (first account — "Moj tekući račun")
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      // Enter recipient account number
      cy.get('#to_account_number').type('265000000000000099')

      // Enter recipient name
      cy.get('#recipient_name').type('Ana Petrović')

      // Enter amount (less than account balance of 150,000)
      cy.get('#amount').type('5000')

      // Click "Continue" to go to confirmation
      cy.contains('button', 'Continue').click()

      // Step 2: Confirmation screen — verify details shown
      cy.contains('Confirm Payment').should('be.visible')
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('265000000000000099').should('be.visible')

      // Click "Confirm" to submit payment
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Verify the request body
      cy.get('@createPayment')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000099')
          expect(body.recipient_name).to.equal('Ana Petrović')
          expect(body.amount).to.equal(5000)
        })

      // Step 3: Verification step — enter code and confirm
      cy.contains('Verification').should('be.visible')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      // Verify execute request has verification code
      cy.get('@executePayment')
        .its('request.body')
        .should('have.property', 'verification_code', '123456')

      // Step 4: Success screen
      cy.contains('Payment successful!').should('be.visible')
      cy.contains('Transaction ID: 101').should('be.visible')
    })
  })
})
```

- [ ] **Step 2: Run Cypress to verify the test passes**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 9 — successful payment flow"
```

---

### Task 3: Scenario 10 — failed payment (insufficient funds) and Scenario 11 — nonexistent account

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 10:**
> When unese iznos veći od raspoloživog stanja i klikne "Potvrdi"
> Then sistem prikazuje poruku "Nedovoljno sredstava na računu"

**Spec reference — Scenario 11:**
> When unese broj računa koji ne postoji i klikne "Potvrdi"
> Then sistem prikazuje poruku "Uneti račun ne postoji"

Both scenarios follow the same pattern: fill form → continue → confirm → API error → error shown on confirmation step. The `submitPayment` thunk in `paymentSlice.ts:48-50` extracts the error from `error.response?.data?.error?.message` and displays it via the `error` prop on `PaymentConfirmation`.

> **Spec deviation (Scenario 11):** The spec says "klijent ostaje na stranici 'Novo plaćanje' i polje za unos računa primaoca se prazni" (client stays on "New Payment" page and recipient field clears). The actual implementation shows the error on the **confirmation step** — it does not return to the form step or clear any fields. The tests below match the current implementation behavior.

- [ ] **Step 1: Add Scenario 10 test**

Add inside the `describe('Payment Flow (Scenarios 9–15)')` block, after Scenario 9:

```typescript
    // Scenario 10: Neuspešno plaćanje zbog nedovoljnih sredstava
    it('should show error when payment amount exceeds balance (Scenario 10)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 400,
        body: {
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Nedovoljno sredstava na računu',
          },
        },
      }).as('createPayment')

      // Fill form with amount exceeding available balance (145,000)
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('200000')
      cy.contains('button', 'Continue').click()

      // Confirmation — click Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Error message should appear on confirmation step
      cy.contains('Nedovoljno sredstava na računu').should('be.visible')

      // User stays on confirmation step (not redirected)
      cy.contains('Confirm Payment').should('be.visible')
    })
```

- [ ] **Step 2: Add Scenario 11 test**

```typescript
    // Scenario 11: Neuspešno plaćanje zbog nepostojećeg računa
    it('should show error when recipient account does not exist (Scenario 11)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 404,
        body: {
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Uneti račun ne postoji',
          },
        },
      }).as('createPayment')

      // Fill form with nonexistent account
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('999999999999999999')
      cy.get('#recipient_name').type('Nepoznati Korisnik')
      cy.get('#amount').type('1000')
      cy.contains('button', 'Continue').click()

      // Confirmation — click Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Error message should appear
      cy.contains('Uneti račun ne postoji').should('be.visible')

      // User stays on confirmation step
      cy.contains('Confirm Payment').should('be.visible')
    })
```

- [ ] **Step 3: Run Cypress to verify all tests pass**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenarios 10–11 — payment error handling"
```

---

### Task 4: Scenario 12 — cross-currency payment with conversion

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 12:**
> Given račun pošiljaoca je u jednoj valuti, račun primaoca u drugoj
> When klijent unese iznos i potvrdi transakciju
> Then sistem vrši konverziju koristeći prodajni kurs banke i obračunava proviziju

The frontend sends the payment to `POST /api/me/payments` — the backend handles conversion and returns `final_amount` and `commission` in the response. The test verifies:
1. Source account is in EUR
2. The payment is created successfully
3. The payment completes through the full flow

> **Spec gap:** The spec says "obračunava proviziju za konverziju" (calculates conversion commission). The current UI does **not** display `commission` or `final_amount` on the success screen — it only shows "Payment successful!" and the transaction ID. Commission/conversion details are captured in the API response but not surfaced to the user. This test covers what the UI currently supports.

- [ ] **Step 1: Create cross-currency payment fixture**

Create `cypress/fixtures/payment-cross-currency.json`:

```json
{
  "id": 104,
  "from_account_number": "265000000000000022",
  "to_account_number": "265000000000000099",
  "initial_amount": 100,
  "final_amount": 11650,
  "commission": 50,
  "recipient_name": "Ana Petrović",
  "payment_code": "289",
  "reference_number": "",
  "payment_purpose": "Cross-currency test",
  "status": "PENDING",
  "timestamp": "2026-03-26T10:00:00Z"
}
```

- [ ] **Step 2: Add Scenario 12 test**

```typescript
    // Scenario 12: Plaćanje u različitim valutama uz konverziju
    it('should handle cross-currency payment with conversion (Scenario 12)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-cross-currency.json',
      }).as('createPayment')
      cy.intercept('POST', '/api/me/payments/104/execute', {
        statusCode: 200,
        body: {
          id: 104,
          from_account_number: '265000000000000022',
          to_account_number: '265000000000000099',
          initial_amount: 100,
          final_amount: 11650,
          commission: 50,
          recipient_name: 'Ana Petrović',
          payment_code: '289',
          reference_number: '',
          payment_purpose: 'Cross-currency test',
          status: 'COMPLETED',
          timestamp: '2026-03-26T10:00:00Z',
        },
      }).as('executePayment')

      // Select EUR foreign account as source
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Devizni EUR').realClick()

      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('100')
      cy.get('#payment_purpose').type('Cross-currency test')

      cy.contains('button', 'Continue').click()

      // Confirmation — verify EUR account shown
      cy.contains('Confirm Payment').should('be.visible')
      cy.contains('265000000000000022').should('be.visible')

      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Verify request was sent with EUR account
      cy.get('@createPayment')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000022')
          expect(body.amount).to.equal(100)
        })

      // Complete verification
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      cy.contains('Payment successful!').should('be.visible')
    })
```

- [ ] **Step 3: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/payment-cross-currency.json cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 12 — cross-currency payment"
```

---

## Chunk 2: Verification & Recipient Scenarios (Tasks 5–7)

### Task 5: Scenario 13 — payment with verification code (explicit flow)

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 13:**
> Given klijent je popunio nalog i kliknuo "Nastavi"
> When sistem pošalje verifikacioni kod, klijent unese validan kod u roku od 5 minuta
> Then transakcija se potvrđuje i izvršava

The verification step (`src/components/verification/VerificationStep.tsx`) shows:
- Before `codeRequested`: "Send Code" button (but in `NewPaymentPage.tsx:95`, `codeRequested` is set to `true` by `submitPayment.fulfilled`, so it goes straight to code input)
- After `codeRequested`: code input (`#verification-code`, placeholder "000000", maxLength 6), "Back" + "Confirm" buttons
- Message: "The code is valid for 5 minutes"

This test specifically validates the verification step UI elements and message.

- [ ] **Step 1: Add Scenario 13 test**

```typescript
    // Scenario 13: Plaćanje uz verifikacioni kod
    it('should verify payment with 6-digit code within 5 minutes (Scenario 13)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', '/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')

      // Fill form quickly
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()

      // Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Verification step UI
      cy.contains('Verification').should('be.visible')
      cy.contains('5 minutes').should('be.visible')
      cy.get('#verification-code').should('be.visible')
      cy.get('#verification-code').should('have.attr', 'maxlength', '6')
      cy.get('#verification-code').should('have.attr', 'placeholder', '000000')

      // "Confirm" button should be disabled when code is empty
      cy.contains('button', 'Confirm').should('be.disabled')

      // Enter valid 6-digit code
      cy.get('#verification-code').type('654321')
      cy.contains('button', 'Confirm').should('not.be.disabled')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      cy.get('@executePayment')
        .its('request.body')
        .should('have.property', 'verification_code', '654321')

      cy.contains('Payment successful!').should('be.visible')
    })
```

- [ ] **Step 2: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 13 — verification code flow"
```

---

### Task 6: Scenario 14 — transaction cancelled after 3 wrong verification codes

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 14:**
> Given klijent je pokrenuo proces verifikacije
> When tri puta unese pogrešan verifikacioni kod
> Then sistem automatski otkazuje transakciju i prikazuje poruku o neuspešnoj verifikaciji

In `NewPaymentPage.tsx:120-128`, when `executePayment.mutate` fails (`onError`), it dispatches `setVerificationError('Payment execution failed. Please try again.')`. The `VerificationStep` component displays `error` as a red error message.

> **Implementation note:** The frontend hardcodes the error message `'Payment execution failed. Please try again.'` on every verification failure, regardless of the backend error response. The backend distinguishes between "invalid code" and "transaction cancelled after 3 attempts", but the frontend does not surface these distinct messages. The test below verifies the error appears after each failed attempt. Full 3-attempt cancellation logic is enforced by the backend.

- [ ] **Step 1: Add Scenario 14 test**

```typescript
    // Scenario 14: Otkazivanje transakcije nakon tri pogrešna koda
    it('should show error after failed verification attempts (Scenario 14)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')

      // First two attempts: generic failure
      let attemptCount = 0
      cy.intercept('POST', '/api/me/payments/101/execute', (req) => {
        attemptCount++
        if (attemptCount < 3) {
          req.reply({
            statusCode: 400,
            body: {
              error: {
                code: 'INVALID_CODE',
                message: 'Invalid verification code',
              },
            },
          })
        } else {
          // Third attempt: transaction cancelled
          req.reply({
            statusCode: 400,
            body: {
              error: {
                code: 'TRANSACTION_CANCELLED',
                message: 'Transaction cancelled after too many failed attempts',
              },
            },
          })
        }
      }).as('executePayment')

      // Fill form and get to verification step
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // First wrong code
      cy.get('#verification-code').type('000001')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')
      cy.contains('Payment execution failed').should('be.visible')

      // Second wrong code
      cy.get('#verification-code').clear().type('000002')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')
      cy.contains('Payment execution failed').should('be.visible')

      // Third wrong code — transaction should be cancelled
      cy.get('#verification-code').clear().type('000003')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')
      cy.contains('Payment execution failed').should('be.visible')
    })
```

- [ ] **Step 2: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 6 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 14 — failed verification attempts"
```

---

### Task 7: Scenario 15 — add recipient after successful payment

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 15:**
> Given klijent je izvršio plaćanje novom primaocu
> When klikne na opciju "Dodaj primaoca"
> Then primalac se dodaje u listu "Primaoci plaćanja"

In `NewPaymentPage.tsx:86-100`, when payment is successful and the recipient is NOT already in the saved recipients list, an `AddRecipientPrompt` component is shown with a "Save Recipient" button. Clicking it calls `createRecipient.mutate(...)` → `POST /api/me/payment-recipients`.

- [ ] **Step 1: Add Scenario 15 test**

```typescript
    // Scenario 15: Dodavanje primaoca nakon uspešnog plaćanja
    it('should allow saving recipient after successful payment (Scenario 15)', () => {
      cy.intercept('POST', '/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', '/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')
      cy.intercept('POST', '/api/me/payment-recipients', {
        statusCode: 201,
        body: {
          id: 2,
          client_id: 42,
          recipient_name: 'Ana Petrović',
          account_number: '265000000000000099',
          created_at: '2026-03-26T10:05:00Z',
        },
      }).as('saveRecipient')

      // Complete payment flow
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      // Success screen — AddRecipientPrompt should be visible
      cy.contains('Payment successful!').should('be.visible')
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('button', 'Save Recipient').should('be.visible')

      // Click "Save Recipient"
      cy.contains('button', 'Save Recipient').click()
      cy.wait('@saveRecipient')

      // Verify request body
      cy.get('@saveRecipient')
        .its('request.body')
        .should((body) => {
          expect(body.recipient_name).to.equal('Ana Petrović')
          expect(body.account_number).to.equal('265000000000000099')
        })

      // After saving, should show confirmation
      cy.contains('Recipient saved.').should('be.visible')
    })
```

- [ ] **Step 2: Run Cypress and verify**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 7 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 15 — save recipient after payment"
```

---

## Chunk 3: Payment History (Task 8)

### Task 8: Scenario 16 — payment history viewing and filtering

**Files:**
- Modify: `cypress/e2e/payments.cy.ts`

**Spec reference — Scenario 16:**
> Given klijent je ulogovan
> When otvori sekciju "Pregled plaćanja"
> Then prikazuje se lista svih izvršenih plaćanja
> And moguće je filtriranje po datumu, iznosu i statusu

The `PaymentHistoryPage` (`src/pages/PaymentHistoryPage.tsx`) renders:
- `<h1>Payment History</h1>`
- `<FilterBar>` with fields: "From Date" (date), "To Date" (date), "Status" (multiselect: Completed/Rejected/Processing), "Min Amount" (number), "Max Amount" (number)
- `<PaymentHistoryTable>` showing: Date, From Account, Recipient, Amount, Status (badge), PDF button
- `<PaginationControls>` with "Previous"/"Next" buttons

This needs a separate `describe` block since it navigates to `/payments/history` instead of `/payments/new`.

- [ ] **Step 1: Add Scenario 16 describe block and test**

Add at the end of the outer `describe`, after the `Payment Flow` block closes:

```typescript
  describe('Payment History (Scenario 16)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      }).as('getMe')
      cy.intercept('GET', '/api/me/payments*', { fixture: 'payment-history.json' }).as(
        'getPayments'
      )
      cy.loginAsClient('/payments/history')
    })

    // Scenario 16: Pregled istorije plaćanja
    it('should display payment history list with all statuses (Scenario 16)', () => {
      cy.wait('@getPayments')

      cy.contains('h1', 'Payment History').should('be.visible')

      // Verify all 3 payments from fixture are shown
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('Jelena Marković').should('be.visible')
      cy.contains('Petar Nikolić').should('be.visible')

      // Verify status badges
      cy.contains('Completed').should('be.visible')
      cy.contains('Processing').should('be.visible')
      cy.contains('Rejected').should('be.visible')
    })

    it('should filter payments by status (Scenario 16 — filtering)', () => {
      cy.wait('@getPayments')

      // Intercept the filtered request
      cy.intercept('GET', '/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('status_filter') === 'COMPLETED') {
          req.reply({
            body: {
              payments: [
                {
                  id: 101,
                  from_account_number: '265000000000000011',
                  to_account_number: '265000000000000099',
                  initial_amount: 5000,
                  final_amount: 5000,
                  commission: 0,
                  recipient_name: 'Ana Petrović',
                  payment_code: '289',
                  reference_number: 'RF-001',
                  payment_purpose: 'Test payment',
                  status: 'COMPLETED',
                  timestamp: '2026-03-25T14:30:00Z',
                },
              ],
              total: 1,
            },
          })
        }
      }).as('getFilteredPayments')

      // Click Status dropdown and select "Completed" checkbox
      // The MultiselectDropdown trigger renders as a button with the label text
      cy.contains('button', 'Status').click()
      // Scope to the popover content to avoid matching the "Completed" badge in the table
      cy.get('[data-radix-popper-content-wrapper]').find('input[aria-label="Completed"]').check()
      cy.wait('@getFilteredPayments')

      // Only completed payment should be shown
      cy.contains('Ana Petrović').should('be.visible')
    })

    it('should filter payments by date range (Scenario 16 — date filter)', () => {
      cy.wait('@getPayments')

      // Intercept filtered request
      cy.intercept('GET', '/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('date_from')) {
          req.reply({ fixture: 'payment-history.json' })
        }
      }).as('getDateFiltered')

      // Set "From Date" filter
      cy.get('input[placeholder="From Date"]').type('2026-03-24')
      cy.wait('@getDateFiltered')

      // Verify the request includes date_from param
      cy.get('@getDateFiltered')
        .its('request.url')
        .should('include', 'date_from=2026-03-24')
    })

    it('should filter payments by amount range (Scenario 16 — amount filter)', () => {
      cy.wait('@getPayments')

      cy.intercept('GET', '/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('amount_min')) {
          req.reply({ fixture: 'payment-history.json' })
        }
      }).as('getAmountFiltered')

      // Set Min Amount filter
      cy.get('input[placeholder="Min Amount"]').type('1000')
      cy.wait('@getAmountFiltered')

      cy.get('@getAmountFiltered')
        .its('request.url')
        .should('include', 'amount_min=1000')
    })
  })
```

- [ ] **Step 2: Run Cypress and verify all tests pass**

Run:
```bash
npx cypress run --spec "cypress/e2e/payments.cy.ts"
```
Expected: 11 tests pass (7 payment flow + 4 history)

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/payments.cy.ts
git commit -m "test: add Cypress Scenario 16 — payment history and filtering"
```

---

## Summary

| Task | Scenario(s) | What it tests |
|------|-------------|---------------|
| 1 | — | Fixture files for all payment stubs |
| 2 | 9 | Successful end-to-end payment flow (form → confirm → verify → success) |
| 3 | 10, 11 | Error handling: insufficient funds, nonexistent account |
| 4 | 12 | Cross-currency payment with EUR source account |
| 5 | 13 | Verification code UI (input, maxlength, placeholder, 5-min message) |
| 6 | 14 | Multiple failed verification attempts |
| 7 | 15 | Save recipient prompt after successful payment |
| 8 | 16 | Payment history viewing + filtering (status, date, amount) |

**Total: 11 Cypress tests across 8 scenarios.**
