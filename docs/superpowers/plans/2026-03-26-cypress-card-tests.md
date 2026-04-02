# Cypress Card Tests (Celina 6: Kartice) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 27–32 (card management) from `docs/cypress-scenariji/Testovi-kartice.md`, covering card creation, viewing, blocking (client + employee), unblocking, and deactivation restrictions.

**Architecture:** Tests live in `cypress/e2e/cards.cy.ts` with two `describe` blocks: one for client-facing scenarios (28–30, 32) and one for employee-facing scenarios (27, 31). Each uses its own `beforeEach` with appropriate login (`cy.loginAsClient` / `cy.loginAsEmployee`).

**Tech Stack:** Cypress 14+, cypress-real-events (for Radix UI Select), TypeScript

---

## UI Reference (from source code)

**CardListPage** (`/cards` — client):
- Title: `<h1>Cards</h1>`
- "Request Card" button → navigates to `/cards/request`
- `CardGrid` renders `CardItem` components
- ACTIVE cards show "Block" button → dialog: "Temporarily Block Card?" with "Block for 12 Hours"
- `CardVisual` shows: brand gradient, chip, logo, masked card number, card name, holder name, expiry
- Status overlay: BLOCKED cards show "BLOCKED" overlay, DEACTIVATED cards show "DEACTIVATED" overlay

**CardRequestPage** (`/cards/request` — client):
- `CardRequestForm`: Account select (`aria-label="Account"`), Card Type select (`aria-label="Card Type"` — Visa/MasterCard/DinaCard)
- Submit: "Request" button
- Personal accounts → direct request → success
- Success: "Card request submitted!" + "Your card request has been received and is pending approval."

**AdminAccountCardsPage** (`/admin/accounts/:id/cards` — employee):
- Title: `<h1>Cards — {accountName}</h1>`
- `AdminCardItem`: ACTIVE → "Block", BLOCKED → "Unblock" + "Deactivate"
- Dialog confirmations with action-specific text

## API Endpoints

| Action | Method | URL | Auth |
|--------|--------|-----|------|
| List client cards | GET | `/api/me/cards` | Client |
| Client profile | GET | `/api/me` | Client |
| Request card | POST | `/api/me/cards/requests` | Client |
| Temporary block | POST | `/api/me/cards/:id/temporary-block` | Client |
| List client accounts | GET | `/api/me/accounts` | Client |
| Get account (admin) | GET | `/api/accounts/:id` | Employee |
| Get account cards | GET | `/api/cards?account_number=...` | Employee |
| Block card | POST | `/api/cards/:id/block` | Employee |
| Unblock card | POST | `/api/cards/:id/unblock` | Employee |
| Deactivate card | POST | `/api/cards/:id/deactivate` | Employee |

---

## Chunk 1: Fixtures & Client Card Scenarios (Tasks 1–3)

### Task 1: Create card fixture files

**Files:**
- Create: `cypress/fixtures/cards-list.json`
- Create: `cypress/fixtures/admin-account.json`
- Create: `cypress/fixtures/admin-cards.json`

- [ ] **Step 1: Create `cards-list.json`**

Client's cards — 3 cards with mixed statuses (ACTIVE, BLOCKED, DEACTIVATED):

```json
{
  "cards": [
    {
      "id": 10,
      "card_number": "4111111111111111",
      "card_type": "DEBIT",
      "card_name": "Visa Debit",
      "brand": "VISA",
      "created_at": "2026-01-20T10:00:00Z",
      "expires_at": "2029-01-20T10:00:00Z",
      "account_number": "265000000000000011",
      "cvv": "123",
      "limit": 100000,
      "status": "ACTIVE",
      "owner_name": "MARKO JOVANOVIĆ"
    },
    {
      "id": 11,
      "card_number": "5500000000000004",
      "card_type": "DEBIT",
      "card_name": "MasterCard Debit",
      "brand": "MASTERCARD",
      "created_at": "2026-02-15T10:00:00Z",
      "expires_at": "2029-02-15T10:00:00Z",
      "account_number": "265000000000000011",
      "cvv": "456",
      "limit": 100000,
      "status": "BLOCKED",
      "owner_name": "MARKO JOVANOVIĆ"
    },
    {
      "id": 12,
      "card_number": "9891000000000001",
      "card_type": "DEBIT",
      "card_name": "DinaCard Debit",
      "brand": "DINACARD",
      "created_at": "2026-01-10T10:00:00Z",
      "expires_at": "2028-01-10T10:00:00Z",
      "account_number": "265000000000000022",
      "cvv": "789",
      "limit": 50000,
      "status": "DEACTIVATED",
      "owner_name": "MARKO JOVANOVIĆ"
    }
  ]
}
```

- [ ] **Step 2: Create `admin-account.json`**

Single account for the admin cards page:

```json
{
  "id": 1,
  "account_number": "265000000000000011",
  "account_name": "Tekući RSD — Marko J.",
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
}
```

- [ ] **Step 3: Create `admin-cards.json`**

Cards for admin view — 2 cards (ACTIVE + BLOCKED):

```json
{
  "cards": [
    {
      "id": 10,
      "card_number": "4111111111111111",
      "card_type": "DEBIT",
      "card_name": "Visa Debit",
      "brand": "VISA",
      "created_at": "2026-01-20T10:00:00Z",
      "expires_at": "2029-01-20T10:00:00Z",
      "account_number": "265000000000000011",
      "cvv": "123",
      "limit": 100000,
      "status": "ACTIVE",
      "owner_name": "MARKO JOVANOVIĆ"
    },
    {
      "id": 11,
      "card_number": "5500000000000004",
      "card_type": "DEBIT",
      "card_name": "MasterCard Debit",
      "brand": "MASTERCARD",
      "created_at": "2026-02-15T10:00:00Z",
      "expires_at": "2029-02-15T10:00:00Z",
      "account_number": "265000000000000011",
      "cvv": "456",
      "limit": 100000,
      "status": "BLOCKED",
      "owner_name": "MARKO JOVANOVIĆ"
    }
  ]
}
```

- [ ] **Step 4: Verify fixtures**

```bash
node -e "['cards-list','admin-account','admin-cards'].forEach(f => { require('./cypress/fixtures/' + f + '.json'); console.log(f + ' OK') })"
```

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/cards-list.json cypress/fixtures/admin-account.json cypress/fixtures/admin-cards.json
git commit -m "test: add Cypress fixtures for card E2E tests"
```

---

### Task 2: Scaffold `cards.cy.ts` with Scenarios 28–29 (card request + card list)

**Files:**
- Create: `cypress/e2e/cards.cy.ts`
- Reference: `src/pages/CardRequestPage.tsx` (flow: select → success)
- Reference: `src/components/cards/CardRequestForm.tsx` (`aria-label="Account"`, `aria-label="Card Type"`)
- Reference: `src/pages/CardListPage.tsx` (cards display)
- Reference: `src/components/cards/CardVisual.tsx` (masked number, status overlay)

**Spec — Scenario 28:**
> When zatraži novu karticu za određeni račun i potvrdi zahtev
> Then sistem kreira novu karticu

**Spec — Scenario 29:**
> When otvori sekciju "Kartice"
> Then prikazuje se lista svih kartica sa maskiranim brojevima

- [ ] **Step 1: Write the test file**

```typescript
describe('Celina 6: Kartice — Upravljanje bankarskim karticama', () => {
  describe('Client: Card Request & Viewing (Scenarios 28–30, 32)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/cards', { fixture: 'cards-list.json' }).as('getCards')
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
    })

    // Scenario 28: Kreiranje kartice na zahtev klijenta
    it('should request a new card for a personal account (Scenario 28)', () => {
      cy.intercept('POST', '/api/me/cards/requests', {
        statusCode: 201,
        body: {
          id: 5,
          account_number: '265000000000000011',
          card_brand: 'VISA',
          status: 'PENDING',
          created_at: '2026-03-26T10:00:00Z',
        },
      }).as('requestCard')

      cy.loginAsClient('/cards/request')

      cy.contains('Request New Card').should('be.visible')

      // Select account
      cy.get('[aria-label="Account"]').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      // Select card type (brand)
      cy.get('[aria-label="Card Type"]').click()
      cy.contains('[role="option"]', 'Visa').realClick()

      // Click "Request"
      cy.contains('button', 'Request').click()
      cy.wait('@requestCard')

      // Verify request body
      cy.get('@requestCard')
        .its('request.body')
        .should((body) => {
          expect(body.account_number).to.equal('265000000000000011')
          expect(body.card_brand).to.equal('VISA')
        })

      // Success screen
      cy.contains('Card request submitted!').should('be.visible')
      cy.contains('pending approval').should('be.visible')
    })

    // Scenario 29: Pregled liste kartica
    it('should display all cards with masked numbers and status badges (Scenario 29)', () => {
      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      cy.contains('h1', 'Cards').should('be.visible')

      // All 3 cards should be rendered
      // Card numbers are masked by maskCardNumber: "4111 **** **** 1111" format
      cy.contains('4111').should('be.visible')
      cy.contains('1111').should('be.visible')

      // Status badges
      cy.contains('Active').should('be.visible')
      cy.contains('Blocked').should('be.visible')
      cy.contains('Deactivated').should('be.visible')

      // BLOCKED card should have "BLOCKED" overlay text
      cy.contains('BLOCKED').should('be.visible')

      // DEACTIVATED card should have "DEACTIVATED" overlay text
      cy.contains('DEACTIVATED').should('be.visible')

      // Only ACTIVE card should have "Block" button
      cy.get('button').contains('Block').should('have.length', 1)
    })
  })
})
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/cards.cy.ts"
```
Expected: 2 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/cards.cy.ts
git commit -m "test: add Cypress Scenarios 28–29 — card request and card list"
```

---

### Task 3: Scenarios 30 and 32 — client blocks card + deactivated card restrictions

**Files:**
- Modify: `cypress/e2e/cards.cy.ts`
- Reference: `src/pages/CardListPage.tsx:38-67` (block dialog: "Temporarily Block Card?", "Block for 12 Hours")
- Reference: `src/components/cards/CardItem.tsx:31-35` (only ACTIVE cards show "Block" button)

**Spec — Scenario 30:**
> When klikne na "Blokiraj karticu"
> Then status se menja u "Blokirana"

**Spec — Scenario 32:**
> Given kartica ima status "Deaktivirana"
> When klijent pokuša da aktivira
> Then sistem ne dozvoljava aktivaciju

> **Spec deviation (Scenario 32):** The spec says "prikazuje poruku 'Kartica je deaktivirana i ne može se ponovo aktivirati'". The current implementation does NOT show an explicit error message — deactivated cards simply have no action buttons and a "DEACTIVATED" overlay. There is no way for the client to attempt activation. The test verifies this passive restriction.

- [ ] **Step 1: Add Scenarios 30 and 32**

Add inside the client `describe` block:

```typescript
    // Scenario 30: Blokiranje kartice od strane klijenta
    it('should temporarily block an active card for 12 hours (Scenario 30)', () => {
      cy.intercept('POST', '/api/me/cards/10/temporary-block', {
        statusCode: 200,
        body: {},
      }).as('blockCard')

      // After block, refetch returns updated card list
      cy.intercept('GET', '/api/me/cards', {
        body: {
          cards: [
            {
              id: 10,
              card_number: '4111111111111111',
              card_type: 'DEBIT',
              card_name: 'Visa Debit',
              brand: 'VISA',
              created_at: '2026-01-20T10:00:00Z',
              expires_at: '2029-01-20T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '123',
              limit: 100000,
              status: 'BLOCKED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
            {
              id: 11,
              card_number: '5500000000000004',
              card_type: 'DEBIT',
              card_name: 'MasterCard Debit',
              brand: 'MASTERCARD',
              created_at: '2026-02-15T10:00:00Z',
              expires_at: '2029-02-15T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '456',
              limit: 100000,
              status: 'BLOCKED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
            {
              id: 12,
              card_number: '9891000000000001',
              card_type: 'DEBIT',
              card_name: 'DinaCard Debit',
              brand: 'DINACARD',
              created_at: '2026-01-10T10:00:00Z',
              expires_at: '2028-01-10T10:00:00Z',
              account_number: '265000000000000022',
              cvv: '789',
              limit: 50000,
              status: 'DEACTIVATED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
          ],
        },
      }).as('getCardsUpdated')

      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      // Click "Block" on the active Visa card
      cy.contains('button', 'Block').click()

      // Confirmation dialog
      cy.contains('Temporarily Block Card?').should('be.visible')
      cy.contains('temporarily block this card for 12 hours').should('be.visible')

      // Confirm block
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Block for 12 Hours').click()
      })
      cy.wait('@blockCard')

      // Verify request body
      cy.get('@blockCard')
        .its('request.body')
        .should('have.property', 'duration_hours', 12)

      // After block, card list refreshes — no more "Block" buttons
      cy.wait('@getCardsUpdated')
    })

    // Scenario 32: Pokušaj aktivacije deaktivirane kartice
    it('should not allow any actions on a deactivated card (Scenario 32)', () => {
      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      // The deactivated DinaCard (id=12) should have the DEACTIVATED overlay
      cy.contains('DEACTIVATED').should('be.visible')

      // No action buttons should be visible for deactivated cards
      // Only the ACTIVE card (id=10) has a "Block" button
      // BLOCKED and DEACTIVATED cards have no buttons
      cy.get('button').contains('Block').should('have.length', 1)

      // There should be no "Unblock" or "Activate" button anywhere on the client page
      cy.contains('button', 'Unblock').should('not.exist')
      cy.contains('button', 'Activate').should('not.exist')
    })
  })
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/cards.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/cards.cy.ts
git commit -m "test: add Cypress Scenarios 30, 32 — card blocking and deactivation restrictions"
```

---

## Chunk 2: Employee Card Scenarios (Tasks 4–5)

### Task 4: Scenario 27 — automatic card creation with account (employee)

**Files:**
- Modify: `cypress/e2e/cards.cy.ts`

**Spec — Scenario 27:**
> Given zaposleni je na stranici za kreiranje računa i čekirana je "Napravi karticu"
> When zaposleni potvrdi kreiranje računa
> Then sistem automatski generiše karticu

> **Note:** This scenario is already tested in `accounts.cy.ts` Scenario 3 (creates account with `create_card: true`, `card_brand: 'visa'`). This test adds a card-focused verification using the same flow to confirm the card is tied to the new account.

- [ ] **Step 1: Add Scenario 27**

Add a new `describe` block after the client block:

```typescript
  describe('Employee: Card Management (Scenarios 27, 31)', () => {
    // Scenario 27: Automatsko kreiranje kartice prilikom otvaranja računa
    it('should create a card automatically when account is created with card option (Scenario 27)', () => {
      cy.intercept('GET', '/api/clients?*', { fixture: 'clients.json' }).as('searchClients')
      cy.intercept('POST', '/api/accounts', {
        statusCode: 201,
        fixture: 'create-account-response.json',
      }).as('createAccount')
      cy.intercept('GET', '/api/accounts?*', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/clients', { fixture: 'clients.json' }).as('getAllClients')
      cy.loginAsEmployee('/accounts/new')

      // Search and select client
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Check "Create Card" checkbox
      cy.get('#create_card').check()

      // Select card brand
      cy.get('[aria-label="Card Brand"]').click()
      cy.contains('[role="option"]', 'Visa').realClick()

      // Submit account creation
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify request includes card creation fields
      cy.get('@createAccount')
        .its('request.body')
        .should((body) => {
          expect(body.create_card).to.equal(true)
          expect(body.card_brand).to.equal('visa')
        })

      cy.url().should('include', '/admin/accounts')
    })
  })
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/cards.cy.ts"
```
Expected: 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/cards.cy.ts
git commit -m "test: add Cypress Scenario 27 — automatic card creation with account"
```

---

### Task 5: Scenario 31 — employee unblocks a card

**Files:**
- Modify: `cypress/e2e/cards.cy.ts`
- Reference: `src/pages/AdminAccountCardsPage.tsx` (dialog: "Unblock Card?", confirm: "Unblock")
- Reference: `src/components/admin/AdminCardItem.tsx` (BLOCKED → "Unblock" + "Deactivate" buttons)

**Spec — Scenario 31:**
> Given kartica ima status "Blokirana" i zaposleni je na portalu
> When zaposleni pronađe karticu i klikne "Odblokiraj"
> Then status se menja u "Aktivna"

The `AdminAccountCardsPage` at `/admin/accounts/:id/cards`:
- Uses `useAccount(accountId)` → `GET /api/accounts/:id`
- Uses `useAccountCards(accountNumber)` → `GET /api/cards?account_number=...`
- "Unblock" button only on BLOCKED cards → dialog: title "Unblock Card?", desc "Are you sure you want to unblock this card?", confirm "Unblock"
- `POST /api/cards/:id/unblock`

- [ ] **Step 1: Add Scenario 31**

Add inside the Employee `describe` block:

```typescript
    // Scenario 31: Odblokiranje kartice od strane zaposlenog
    it('should unblock a blocked card from admin panel (Scenario 31)', () => {
      cy.intercept('GET', '/api/accounts/1', { fixture: 'admin-account.json' }).as('getAccount')
      cy.intercept('GET', '/api/cards?account_number=265000000000000011', {
        fixture: 'admin-cards.json',
      }).as('getAccountCards')
      cy.intercept('POST', '/api/cards/11/unblock', {
        statusCode: 200,
        body: {},
      }).as('unblockCard')

      // After unblock, refetch shows card as ACTIVE
      cy.intercept('GET', '/api/cards?account_number=265000000000000011', {
        body: {
          cards: [
            {
              id: 10,
              card_number: '4111111111111111',
              card_type: 'DEBIT',
              card_name: 'Visa Debit',
              brand: 'VISA',
              created_at: '2026-01-20T10:00:00Z',
              expires_at: '2029-01-20T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '123',
              limit: 100000,
              status: 'ACTIVE',
              owner_name: 'MARKO JOVANOVIĆ',
            },
            {
              id: 11,
              card_number: '5500000000000004',
              card_type: 'DEBIT',
              card_name: 'MasterCard Debit',
              brand: 'MASTERCARD',
              created_at: '2026-02-15T10:00:00Z',
              expires_at: '2029-02-15T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '456',
              limit: 100000,
              status: 'ACTIVE',
              owner_name: 'MARKO JOVANOVIĆ',
            },
          ],
        },
      }).as('getAccountCardsUpdated')

      cy.loginAsEmployee('/admin/accounts/1/cards')
      cy.wait('@getAccount')
      cy.wait('@getAccountCards')

      // Page title shows account name
      cy.contains('h1', 'Cards').should('be.visible')

      // The BLOCKED MasterCard (id=11) should show "Unblock" button
      cy.contains('button', 'Unblock').should('be.visible')

      // Click "Unblock"
      cy.contains('button', 'Unblock').click()

      // Confirmation dialog
      cy.contains('Unblock Card?').should('be.visible')
      cy.contains('Are you sure you want to unblock this card?').should('be.visible')

      // Confirm
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Unblock').click()
      })
      cy.wait('@unblockCard')

      // After unblock, card list refreshes — both cards now ACTIVE
      cy.wait('@getAccountCardsUpdated')
    })
```

- [ ] **Step 2: Run all Cypress card tests**

```bash
npx cypress run --spec "cypress/e2e/cards.cy.ts"
```
Expected: 6 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/cards.cy.ts
git commit -m "test: add Cypress Scenario 31 — employee unblocks card"
```

---

## Summary

| Task | Scenario | What it tests |
|------|----------|---------------|
| 1 | — | Fixture files (client cards, admin account, admin cards) |
| 2 | 28, 29 | Card request (select account + brand → success) and card list display (masked numbers, status badges, overlays) |
| 3 | 30, 32 | Client temporary block (12h dialog) and deactivated card has no actions |
| 4 | 27 | Employee creates account with automatic card (checkbox + brand) |
| 5 | 31 | Employee unblocks a blocked card from admin panel |

**Total: 6 Cypress tests across 6 scenarios. 3 fixture files.**

**Noted spec deviations:**
- **Scenario 32:** The spec says the system shows "Kartica je deaktivirana i ne može se ponovo aktivirati". The implementation does not show an explicit message — deactivated cards simply have no action buttons and a "DEACTIVATED" overlay. The test verifies this passive restriction.
