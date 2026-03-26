# Cypress Exchange Tests (Celina 5: Menjačnica) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 24–26 (exchange rate and conversion) from `docs/cypress-scenariji/Testovi-menjacnica.md`, covering the exchange rate list, equivalence calculator, and cross-currency transfer conversion.

**Architecture:** Tests live in `cypress/e2e/exchange.cy.ts`. Scenarios 24–25 test two separate pages (`/exchange/rates` and `/exchange/calculator`). Scenario 26 tests the cross-currency transfer flow at `/transfers/new` — this overlaps with Scenario 18 from the transfers plan but focuses on the exchange rate and commission aspects.

**Tech Stack:** Cypress 14+, cypress-real-events (for Radix UI Select), TypeScript

---

## UI Reference (from source code)

**Exchange Rates Page** (`/exchange/rates` → `ExchangeRatesPage.tsx`):
- Title: `<h1>Exchange Rates</h1>`
- Filters data to `to_currency === 'RSD'` before rendering
- Table columns: Currency, Buy Rate, Sell Rate
- Data from `GET /api/exchange/rates` → `{ rates: ExchangeRate[] }`
- Empty state: "No exchange rate data available."

**Exchange Calculator Page** (`/exchange/calculator` → `ExchangeCalculatorPage.tsx`):
- Card title: "Check Equivalence"
- Uses `convertCurrency()` which internally calls `GET /api/exchange/rates/:from/:to`
- Falls back to local computation using all rates if specific rate call fails

**Calculator Form** (`EquivalenceCalculator.tsx`):

| Field | Selector | Default |
|-------|----------|---------|
| Amount | `#amount` (also `aria-label="Amount"`) | 0 |
| From Currency | `[aria-label="From Currency"]` | RSD |
| To Currency | `[aria-label="To Currency"]` | EUR |
| Submit | `button` containing "Calculate" | — |

**Result display:**
- Format: `{fromAmount formatted} = {toAmount formatted}` (e.g., "100,00 RSD = 0,86 EUR")
- Rate: `Rate: {rate.toFixed(4)}`

**Supported currencies** (from `SUPPORTED_CURRENCIES` constant):
`RSD, EUR, CHF, USD, GBP, JPY, CAD, AUD`

**Foreign currencies** (from `FOREIGN_CURRENCIES` constant):
`EUR, CHF, USD, GBP, JPY, CAD, AUD`

## API Endpoints

| Action | Method | URL | Notes |
|--------|--------|-----|-------|
| List all rates | GET | `/api/exchange/rates` | Returns `{ rates: ExchangeRate[] }` |
| Get specific rate | GET | `/api/exchange/rates/:from/:to` | Returns `ExchangeRate` |

---

## Task 1: Create fixture and scaffold `exchange.cy.ts` with Scenario 24 (exchange rate list)

**Files:**
- Create: `cypress/fixtures/exchange-rates.json`
- Create: `cypress/e2e/exchange.cy.ts`
- Reference: `src/pages/ExchangeRatesPage.tsx` (filters `to_currency === 'RSD'`)
- Reference: `src/components/exchange/ExchangeRateTable.tsx` (columns: Currency, Buy Rate, Sell Rate)

**Spec reference — Scenario 24:**
> When otvori sekciju "Menjačnica" i izabere "Kursna lista"
> Then sistem prikazuje trenutne kurseve za EUR, CHF, USD, GBP, JPY, CAD, AUD
> And prikazuje odnos svake valute prema RSD

- [ ] **Step 1: Create `exchange-rates.json` fixture**

Response from `GET /api/exchange/rates` — all 7 foreign currencies vs RSD, plus reverse pairs (to test the `to_currency === 'RSD'` filter):

```json
{
  "rates": [
    {
      "from_currency": "EUR",
      "to_currency": "RSD",
      "buy_rate": 116.50,
      "sell_rate": 117.80,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "USD",
      "to_currency": "RSD",
      "buy_rate": 105.20,
      "sell_rate": 106.50,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "CHF",
      "to_currency": "RSD",
      "buy_rate": 118.90,
      "sell_rate": 120.30,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "GBP",
      "to_currency": "RSD",
      "buy_rate": 136.40,
      "sell_rate": 138.20,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "JPY",
      "to_currency": "RSD",
      "buy_rate": 0.70,
      "sell_rate": 0.72,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "CAD",
      "to_currency": "RSD",
      "buy_rate": 76.30,
      "sell_rate": 77.50,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "AUD",
      "to_currency": "RSD",
      "buy_rate": 68.10,
      "sell_rate": 69.20,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "RSD",
      "to_currency": "EUR",
      "buy_rate": 0.0086,
      "sell_rate": 0.0085,
      "updated_at": "2026-03-26T08:00:00Z"
    },
    {
      "from_currency": "RSD",
      "to_currency": "USD",
      "buy_rate": 0.0095,
      "sell_rate": 0.0094,
      "updated_at": "2026-03-26T08:00:00Z"
    }
  ]
}
```

The fixture includes 7 foreign→RSD rates plus 2 reverse (RSD→foreign) rates to verify that the `ExchangeRatesPage` correctly filters to show only `to_currency === 'RSD'`.

- [ ] **Step 2: Write the test file**

```typescript
describe('Celina 5: Menjačnica — Provera kursa i konverzija valuta', () => {
  describe('Exchange Rate List (Scenario 24)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/exchange/rates', { fixture: 'exchange-rates.json' }).as(
        'getExchangeRates'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.loginAsClient('/exchange/rates')
    })

    // Scenario 24: Pregled kursne liste
    it('should display exchange rates for all supported currencies vs RSD (Scenario 24)', () => {
      cy.wait('@getExchangeRates')

      cy.contains('h1', 'Exchange Rates').should('be.visible')

      // Verify table headers
      cy.contains('th', 'Currency').should('be.visible')
      cy.contains('th', 'Buy Rate').should('be.visible')
      cy.contains('th', 'Sell Rate').should('be.visible')

      // All 7 foreign currencies should be displayed (filtered to to_currency=RSD)
      cy.contains('td', 'EUR').should('be.visible')
      cy.contains('td', 'USD').should('be.visible')
      cy.contains('td', 'CHF').should('be.visible')
      cy.contains('td', 'GBP').should('be.visible')
      cy.contains('td', 'JPY').should('be.visible')
      cy.contains('td', 'CAD').should('be.visible')
      cy.contains('td', 'AUD').should('be.visible')

      // RSD should NOT appear as a row (reverse rates filtered out)
      cy.get('tbody td.font-medium').each(($td) => {
        expect($td.text()).to.not.equal('RSD')
      })

      // Verify only 7 rows (not 9 — the 2 RSD→foreign rates are filtered)
      cy.get('tbody tr').should('have.length', 7)

      // Verify EUR buy/sell rates are formatted correctly
      cy.contains('tr', 'EUR').within(() => {
        cy.contains('116.50').should('exist')
        cy.contains('117.80').should('exist')
      })
    })
  })
})
```

- [ ] **Step 3: Verify fixture and run**

```bash
node -e "require('./cypress/fixtures/exchange-rates.json'); console.log('OK')"
npx cypress run --spec "cypress/e2e/exchange.cy.ts"
```
Expected: 1 test passes

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/exchange-rates.json cypress/e2e/exchange.cy.ts
git commit -m "test: add Cypress Scenario 24 — exchange rate list"
```

---

## Task 2: Scenario 25 — equivalence calculator

**Files:**
- Modify: `cypress/e2e/exchange.cy.ts`
- Reference: `src/pages/ExchangeCalculatorPage.tsx` (calls `convertCurrency()` which uses `GET /api/exchange/rates/:from/:to`)
- Reference: `src/components/exchange/EquivalenceCalculator.tsx` (selectors: `aria-label="Amount"`, `aria-label="From Currency"`, `aria-label="To Currency"`)
- Reference: `src/lib/api/exchange.ts:14-24` (`convertCurrency` computes result client-side using `buy_rate`)

**Spec reference — Scenario 25:**
> When unese iznos u jednoj valuti i izabere drugu valutu
> Then sistem izračunava ekvivalentnu vrednost prema trenutnom kursu
> And prikazuje rezultat bez izvršavanja transakcije

The `convertCurrency()` function in `exchange.ts` fetches the exchange rate via `GET /api/exchange/rates/:from/:to`, then computes: `to_amount = amount * buy_rate`. The result is displayed as `{fromAmount} = {toAmount}` with `Rate: {rate}`.

- [ ] **Step 1: Add Scenario 25 describe block and test**

Add at the end of the outer `describe`, after the Exchange Rate List block:

```typescript
  describe('Equivalence Calculator (Scenario 25)', () => {
    beforeEach(() => {
      // The calculator page also fetches all rates for local fallback
      cy.intercept('GET', '/api/exchange/rates', { fixture: 'exchange-rates.json' }).as(
        'getExchangeRates'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.loginAsClient('/exchange/calculator')
    })

    // Scenario 25: Provera ekvivalentnosti valute
    it('should calculate equivalence without executing a transaction (Scenario 25)', () => {
      // Stub the specific rate lookup (called by convertCurrency)
      cy.intercept('GET', '/api/exchange/rates/RSD/EUR', {
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          buy_rate: 0.0086,
          sell_rate: 0.0085,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getRate')

      cy.contains('Check Equivalence').should('be.visible')

      // Default: From=RSD, To=EUR
      cy.get('[aria-label="From Currency"]').should('contain.text', 'RSD')
      cy.get('[aria-label="To Currency"]').should('contain.text', 'EUR')

      // Enter amount
      cy.get('#amount').type('10000')

      // Click "Calculate"
      cy.contains('button', 'Calculate').click()
      cy.wait('@getRate')

      // Result should display the conversion (10000 * 0.0086 = 86 EUR)
      cy.contains('Rate:').should('be.visible')

      // The result section shows formatted amounts
      // formatCurrency(10000, 'RSD') = something like "10.000,00 RSD"
      // formatCurrency(86, 'EUR') = something like "86,00 EUR"
      cy.contains('RSD').should('be.visible')
      cy.contains('EUR').should('be.visible')

      // No transaction was created — verify no POST requests were made
      // (The calculator only uses GET for exchange rate lookup)
    })

    it('should allow changing currencies and recalculating (Scenario 25 — different pair)', () => {
      cy.intercept('GET', '/api/exchange/rates/EUR/USD', {
        body: {
          from_currency: 'EUR',
          to_currency: 'USD',
          buy_rate: 1.11,
          sell_rate: 1.12,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getRate')

      // Change From Currency to EUR
      cy.get('[aria-label="From Currency"]').click()
      cy.contains('[role="option"]', 'EUR').realClick()

      // Change To Currency to USD
      cy.get('[aria-label="To Currency"]').click()
      cy.contains('[role="option"]', 'USD').realClick()

      cy.get('#amount').type('100')
      cy.contains('button', 'Calculate').click()
      cy.wait('@getRate')

      // Result should show conversion result
      cy.contains('Rate:').should('be.visible')
    })

    it('should disable Calculate button when same currency selected', () => {
      // Select EUR for both From and To
      cy.get('[aria-label="From Currency"]').click()
      cy.contains('[role="option"]', 'EUR').realClick()

      cy.get('[aria-label="To Currency"]').click()
      cy.contains('[role="option"]', 'EUR').realClick()

      cy.get('#amount').type('100')

      // Button should be disabled
      cy.contains('button', 'Calculate').should('be.disabled')

      // Error message should appear
      cy.contains('Cannot convert to same currency').should('be.visible')
    })
  })
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/exchange.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/exchange.cy.ts
git commit -m "test: add Cypress Scenario 25 — equivalence calculator"
```

---

## Task 3: Scenario 26 — currency conversion during transfer

**Files:**
- Modify: `cypress/e2e/exchange.cy.ts`
- Reference: `src/pages/CreateTransferPage.tsx:33-37` (`useTransferPreview` fetches exchange rate)
- Reference: `src/pages/CreateTransferPage.tsx:115-119` (rate/finalAmount in TransferPreview props)
- Reference: `src/components/transfers/TransferPreview.tsx` (shows Rate, Commission, Final Amount)

**Spec reference — Scenario 26:**
> Given klijent ima tekući račun u RSD i devizni račun u EUR
> When izvrši transfer između ova dva računa
> Then sistem vrši konverziju koristeći prodajni kurs banke, obračunava proviziju

> **Note:** This scenario overlaps with Scenario 18 from `cypress-transfer-tests.md`. The test here focuses specifically on verifying the exchange rate display and commission calculation in the transfer confirmation, not the full transfer flow.

- [ ] **Step 1: Add Scenario 26 describe block and test**

```typescript
  describe('Currency Conversion During Transfer (Scenario 26)', () => {
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
      // Stub exchange rate lookup for RSD→EUR
      cy.intercept('GET', '/api/exchange/rates/RSD/EUR', {
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          buy_rate: 116.5,
          sell_rate: 117.8,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getExchangeRate')
      cy.loginAsClient('/transfers/new')
    })

    // Scenario 26: Konverzija valute tokom transfera
    it('should display exchange rate and commission on cross-currency transfer (Scenario 26)', () => {
      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 201,
        body: {
          id: 205,
          from_account_number: '265000000000000011',
          to_account_number: '265000000000000022',
          initial_amount: 11650,
          final_amount: 100,
          exchange_rate: 116.5,
          commission: 0,
          timestamp: '2026-03-26T12:00:00Z',
        },
      }).as('createTransfer')
      cy.intercept('POST', '/api/me/transfers/205/execute', {
        statusCode: 200,
        body: {
          id: 205,
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

      // Select EUR destination account
      cy.get('[aria-label="Destination Account"]').click()
      cy.contains('[role="option"]', 'Devizni EUR').realClick()

      cy.get('#amount').clear().type('11650')
      cy.contains('button', 'Make Transfer').click()

      // Wait for exchange rate to load
      cy.wait('@getExchangeRate')

      // Confirmation step — verify exchange rate details
      cy.contains('Confirm Transfer').should('be.visible')

      // Rate should show the exchange rate (116.5)
      cy.contains('Rate').parent().should('contain.text', '116.5')

      // Commission should be displayed
      cy.contains('Commission').should('be.visible')

      // Final Amount should be displayed (converted amount in target currency)
      cy.contains('Final Amount').should('be.visible')

      // Complete the transfer
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.contains('Transfer successful!').should('be.visible')
    })
  })
```

> **Dependency:** This test uses the `transfer-accounts.json` fixture (3 accounts: 2 RSD + 1 EUR) from the transfer tests plan. If executing this plan before the transfer plan, create that fixture first.

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/exchange.cy.ts"
```
Expected: 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/exchange.cy.ts
git commit -m "test: add Cypress Scenario 26 — cross-currency transfer conversion"
```

---

## Summary

| Task | Scenario | What it tests |
|------|----------|---------------|
| 1 | 24 | Exchange rate list: all 7 currencies vs RSD, correct filtering, formatted rates |
| 2 | 25 | Calculator: RSD→EUR conversion, different currency pair, same-currency disabled |
| 3 | 26 | Cross-currency transfer: exchange rate in confirmation, commission display |

**Total: 5 Cypress tests across 3 scenarios. 1 fixture file.**

**Dependencies:**
- Task 3 (Scenario 26) requires `transfer-accounts.json` from the transfer tests plan (`cypress-transfer-tests.md`, Task 1)
