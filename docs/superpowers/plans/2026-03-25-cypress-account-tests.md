# Cypress Acceptance Tests — Accounts (Celina 1: Računi) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E acceptance tests for all 7 account scenarios (create, view, rename) from `docs/cypress-scenariji/testovi-racuni.md`. (Scenario 5 is missing from the source document.)

**Architecture:** Install Cypress as a dev dependency, configure it for the Vite dev server (`http://localhost:5173`) with API backend at `http://localhost:8080`. Tests use `cy.intercept()` to stub all API calls, so **no running backend is required**. Each scenario maps to a Cypress `it()` block grouped under `describe` blocks by role (employee vs client).

**Tech Stack:** Cypress 14+, TypeScript, cy.intercept for API stubbing

---

## File Structure

```
cypress/
├── tsconfig.json              # Cypress-specific TS config
├── support/
│   ├── e2e.ts                 # Global setup: custom commands imported here
│   └── commands.ts            # loginAsEmployee(), loginAsClient() custom commands
├── fixtures/
│   ├── employee-auth.json     # JWT tokens + decoded user for employee login
│   ├── client-auth.json       # JWT tokens + decoded user for client login
│   ├── accounts.json          # Account list response (multiple accounts)
│   ├── account-detail.json    # Single account detail response
│   ├── clients.json           # Client list response (for client selector)
│   └── create-account-response.json  # POST /api/accounts 201 response
└── e2e/
    └── accounts.cy.ts         # All 7 account scenarios
cypress.config.ts              # Cypress config (baseUrl, specPattern, etc.)
```

**Existing files to modify:**
- `package.json` — add `cypress` dev dependency, add `cy:open` and `cy:run` scripts

---

## Chunk 1: Cypress Setup & Infrastructure

### Task 1: Install Cypress and configure

**Files:**
- Create: `cypress.config.ts`
- Create: `cypress/tsconfig.json`
- Create: `cypress/support/e2e.ts`
- Create: `cypress/support/commands.ts`
- Modify: `package.json` (add devDependency + scripts)

- [ ] **Step 1: Install Cypress**

```bash
npm install --save-dev cypress
```

- [ ] **Step 2: Create `cypress.config.ts`**

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
})
```

- [ ] **Step 3: Create `cypress/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom", "dom.iterable"],
    "types": ["cypress"],
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 4: Create `cypress/support/e2e.ts`**

```typescript
import './commands'
```

- [ ] **Step 5: Create `cypress/support/commands.ts`**

Custom commands simulate login by setting tokens in sessionStorage and stubbing the auth API responses. The app reads JWT from sessionStorage and extracts user info.

```typescript
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsEmployee(): Chainable<void>
      loginAsClient(): Chainable<void>
    }
  }
}

// Employee JWT mock — system_type: "employee", role: admin, permissions include accounts.create
Cypress.Commands.add('loginAsEmployee', () => {
  cy.fixture('employee-auth.json').then((auth) => {
    sessionStorage.setItem('access_token', auth.access_token)
    sessionStorage.setItem('refresh_token', auth.refresh_token)
  })
})

// Client JWT mock — system_type: "client"
Cypress.Commands.add('loginAsClient', () => {
  cy.fixture('client-auth.json').then((auth) => {
    sessionStorage.setItem('access_token', auth.access_token)
    sessionStorage.setItem('refresh_token', auth.refresh_token)
  })
})

export {}
```

> **Note for implementer:** Check `src/store/slices/authSlice.ts` and `src/lib/api/axios.ts` to confirm exactly which sessionStorage keys the app reads. The keys above (`access_token`, `refresh_token`) should match. If the app uses `localStorage` instead, adjust accordingly.

- [ ] **Step 6: Add npm scripts to `package.json`**

Add these to the `"scripts"` section:

```json
"cy:open": "cypress open",
"cy:run": "cypress run"
```

- [ ] **Step 7: Verify Cypress opens**

```bash
npx cypress verify
```

Expected: Cypress verified successfully.

- [ ] **Step 8: Commit**

```bash
git add cypress.config.ts cypress/ package.json package-lock.json
git commit -m "chore: install Cypress and add E2E test infrastructure"
```

---

### Task 2: Create fixtures

**Files:**
- Create: `cypress/fixtures/employee-auth.json`
- Create: `cypress/fixtures/client-auth.json`
- Create: `cypress/fixtures/accounts.json`
- Create: `cypress/fixtures/account-detail.json`
- Create: `cypress/fixtures/clients.json`
- Create: `cypress/fixtures/create-account-response.json`

> **Important:** The app decodes JWTs using the `jwt-decode` library (see `src/lib/utils/jwt.ts`). Tokens must be properly formatted JWTs with base64url-encoded segments (using `-`, `_` instead of `+`, `/`, no padding `=`). The JWT payload must use `user_id` (not `id`) as the field name — the app's `decodeAuthToken` maps `decoded.user_id` → `AuthUser.id`.

- [ ] **Step 1: Create `cypress/fixtures/employee-auth.json`**

The access token payload (JWT middle segment) must decode to:
```json
{ "user_id": 5, "email": "admin@exbanka.rs", "role": "EmployeeAdmin", "permissions": ["accounts.create","accounts.read","accounts.update","clients.read","clients.create","clients.update","employees.read","employees.create","employees.update","cards.approve"], "system_type": "employee" }
```

> **Note:** Field is `user_id`, NOT `id` — the app's `decodeAuthToken` reads `decoded.user_id`.

```json
{
  "access_token": "<GENERATE: a properly formatted JWT whose payload decodes to the above>",
  "refresh_token": "mock-refresh-token-employee"
}
```

> **For implementer:** Generate a valid JWT using this approach:
> ```javascript
> const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
> const payload = btoa(JSON.stringify({ user_id: 5, email: "admin@exbanka.rs", ... })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
> const token = `${header}.${payload}.mock-signature`
> ```
> The `jwt-decode` library only decodes the payload — it doesn't verify signatures. Verify the token works by importing `decodeAuthToken` from `src/lib/utils/jwt.ts` in a unit test.

- [ ] **Step 2: Create `cypress/fixtures/client-auth.json`**

Payload must decode to:
```json
{ "user_id": 42, "email": "marko@example.com", "role": "client", "permissions": [], "system_type": "client" }
```

> **Note:** Field is `user_id`, NOT `id`.

```json
{
  "access_token": "<GENERATE: JWT with above payload>",
  "refresh_token": "mock-refresh-token-client"
}
```

- [ ] **Step 3: Create `cypress/fixtures/clients.json`**

Used by the ClientSelector dropdown on the Create Account page. Must match `ClientListResponse` type.

```json
{
  "clients": [
    {
      "id": 42,
      "first_name": "Marko",
      "last_name": "Jovanović",
      "email": "marko@example.com",
      "phone": "+381601234567",
      "address": "Bulevar Kralja Aleksandra 100",
      "date_of_birth": 631152000,
      "gender": "M"
    }
  ],
  "total": 1
}
```

- [ ] **Step 4: Create `cypress/fixtures/accounts.json`**

Used for client account list. Must match `AccountListResponse`. Include 2+ accounts with different available_balance values (to verify sorting).

```json
{
  "accounts": [
    {
      "id": 1,
      "account_number": "265000000000000011",
      "account_name": "Moj tekući račun",
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
      "daily_limit": 5000,
      "monthly_limit": 50000,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 2
}
```

- [ ] **Step 5: Create `cypress/fixtures/account-detail.json`**

Single account object (same as accounts[0] above but standalone):

```json
{
  "id": 1,
  "account_number": "265000000000000011",
  "account_name": "Moj tekući račun",
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

- [ ] **Step 6: Create `cypress/fixtures/create-account-response.json`**

Response for `POST /api/accounts` (201). Account number must be 18 digits.

```json
{
  "id": 99,
  "account_number": "265000000000099001",
  "account_name": "standard",
  "currency_code": "RSD",
  "account_kind": "current",
  "account_type": "standard",
  "account_category": "personal",
  "balance": 10000,
  "available_balance": 10000,
  "status": "ACTIVE",
  "owner_id": 42,
  "owner_name": "Marko Jovanović",
  "daily_limit": 1000000,
  "monthly_limit": 10000000,
  "created_at": "2026-03-25T12:00:00Z"
}
```

- [ ] **Step 7: Commit**

```bash
git add cypress/fixtures/
git commit -m "chore: add Cypress test fixtures for account scenarios"
```

---

## Chunk 2: Employee Account Creation Tests (Scenarios 1–4)

### Task 3: Write employee account creation tests

**Files:**
- Create: `cypress/e2e/accounts.cy.ts`

**Reference:** `src/components/accounts/CreateAccountForm.tsx` for form field selectors, `src/components/accounts/ClientSelector.tsx` for client search, `src/components/accounts/CompanyForm.tsx` for business fields.

> **Selector strategy:** Use `aria-label`, `id`, `role`, and visible text as selectors. The CreateAccountForm uses these identifiable attributes:
> - Account Type select: `aria-label="Account Type"` (values: `current`, `foreign`)
> - Account Category select: `aria-label="Account Category"` (values: `personal`, `business`)
> - Account Kind select: `aria-label="Account Kind"`
> - Currency select: `aria-label="Currency"`
> - Initial Balance input: `#initial_balance`
> - Create Card checkbox: `#create_card`
> - Card Brand select: `aria-label="Card Brand"`
> - Submit button: text `Create Account`
>
> For the ClientSelector, check `src/components/accounts/ClientSelector.tsx` for the search input and result list structure.

- [ ] **Step 1: Create test file with setup and Scenario 1**

```typescript
describe('Celina 1: Računi — Kreiranje i upravljanje računima', () => {
  describe('Employee: Account Creation (Scenarios 1–4)', () => {
    beforeEach(() => {
      cy.loginAsEmployee()

      // Stub: client search for ClientSelector
      cy.intercept('GET', '/api/clients?*', { fixture: 'clients.json' }).as('searchClients')

      // Stub: create account
      cy.intercept('POST', '/api/accounts', {
        statusCode: 201,
        fixture: 'create-account-response.json',
      }).as('createAccount')

      // Stub: account list (for redirect after creation)
      cy.intercept('GET', '/api/accounts?*', { fixture: 'accounts.json' }).as('getAccounts')
      // Stub: bare clients endpoint (used by useAllClients on AdminAccountsPage after redirect)
      cy.intercept('GET', '/api/clients', { fixture: 'clients.json' }).as('getAllClients')

      cy.visit('/accounts/new')
    })

    // Scenario 1: Kreiranje tekućeg računa za postojećeg klijenta
    it('should create a current account for existing client', () => {
      // "Izabere postojećeg klijenta iz baze" — search and select client
      // NOTE: Check ClientSelector.tsx for actual input selector
      cy.contains('label', 'Owner').should('be.visible')
      // Type in client search to trigger search
      cy.get('input[placeholder*="Search"]').first().type('Marko')
      cy.wait('@searchClients')
      cy.contains('Marko Jovanović').click()

      // "Izabere tip računa 'Tekući račun'" — already default (current)
      // Verify Account Type is "Current"
      cy.get('[aria-label="Account Type"]').should('contain.text', 'Current')

      // "Unese početno stanje računa"
      cy.get('#initial_balance').clear().type('10000')

      // Submit
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // "Sistem generiše broj računa od 18 cifara"
      cy.get('@createAccount').its('request.body').should('have.property', 'owner_id', 42)

      // "Račun se uspešno kreira" — verify redirect to account list
      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 2: Kreiranje deviznog računa za klijenta
    it('should create a foreign currency account', () => {
      // Select client
      cy.get('input[placeholder*="Search"]').first().type('Marko')
      cy.wait('@searchClients')
      cy.contains('Marko Jovanović').click()

      // "Izabere tip računa 'Devizni račun'"
      cy.get('[aria-label="Account Type"]').click()
      cy.get('[role="option"]').contains('Foreign').click()

      // "Izabere valutu računa (npr. EUR)"
      cy.get('[aria-label="Currency"]').click()
      cy.get('[role="option"]').contains('EUR').click()

      // Submit
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify request body
      cy.get('@createAccount').its('request.body').should((body) => {
        expect(body.account_kind).to.equal('foreign')
        expect(body.currency_code).to.equal('EUR')
      })

      // "Račun se prikazuje u listi" — redirected
      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 3: Kreiranje računa sa automatskim kreiranjem kartice
    it('should create account with automatic card creation', () => {
      // Select client
      cy.get('input[placeholder*="Search"]').first().type('Marko')
      cy.wait('@searchClients')
      cy.contains('Marko Jovanović').click()

      // "Čekira opciju 'Napravi karticu'"
      cy.get('#create_card').check()

      // Select card brand
      cy.get('[aria-label="Card Brand"]').click()
      cy.get('[role="option"]').contains('Visa').click()

      // Submit
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify request includes card creation
      cy.get('@createAccount').its('request.body').should((body) => {
        expect(body.create_card).to.be.true
        expect(body.card_brand).to.equal('visa')
      })

      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 4: Kreiranje poslovnog računa za firmu
    it('should create a business account for a company', () => {
      // Select client
      cy.get('input[placeholder*="Search"]').first().type('Marko')
      cy.wait('@searchClients')
      cy.contains('Marko Jovanović').click()

      // "Izabere opciju 'Poslovni račun'"
      cy.get('[aria-label="Account Category"]').click()
      cy.get('[role="option"]').contains('Company').click()

      // "Unese podatke o firmi"
      // CompanyForm uses prefix "company" with dot notation: company.name, company.tax_number, etc.
      // Dots in CSS selectors must be escaped with \\
      cy.get('#company\\.name').type('Tech DOO')
      cy.get('#company\\.tax_number').type('123456789')
      cy.get('#company\\.registration_number').type('12345678')
      cy.get('#company\\.activity_code').type('6201')
      cy.get('#company\\.address').type('Nemanjina 5, Beograd')

      // Submit
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify business account request
      cy.get('@createAccount').its('request.body').should((body) => {
        expect(body.account_category).to.equal('business')
      })

      // "Račun dobija status 'Aktivan'" — verified by fixture response status: "ACTIVE"
      cy.url().should('include', '/admin/accounts')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it works with stubs**

```bash
npx cypress run --spec cypress/e2e/accounts.cy.ts
```

Expected: All 4 employee scenarios pass (stubs handle all API calls).

> **Troubleshooting:** If tests fail due to selector mismatches, read the actual rendered DOM by temporarily using `npx cypress open` and inspecting elements. The selectors in this plan are based on the source code analysis but may need minor adjustment based on how Shadcn Select renders in the DOM.

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/accounts.cy.ts
git commit -m "test: add Cypress E2E tests for employee account creation (scenarios 1-4)"
```

---

## Chunk 3: Client Account View & Management Tests (Scenarios 6–8)

### Task 4: Write client account viewing and management tests

**Files:**
- Modify: `cypress/e2e/accounts.cy.ts`

**Reference:** `src/pages/AccountListPage.tsx` (scenario 6), `src/pages/AccountDetailsPage.tsx` (scenario 7-8), `src/components/accounts/RenameAccountDialog.tsx` (scenario 8), `src/components/accounts/AccountCard.tsx` (click behavior).

- [ ] **Step 1: Add client scenarios to the test file**

Append to `cypress/e2e/accounts.cy.ts`, inside the top-level `describe`:

```typescript
  describe('Client: Account Viewing & Management (Scenarios 6–8)', () => {
    beforeEach(() => {
      cy.loginAsClient()

      // Stub: client's accounts
      cy.intercept('GET', '/api/accounts/client/*', { fixture: 'accounts.json' }).as(
        'getClientAccounts'
      )

      // Stub: payments (for Recent Transactions — actual URL is /api/payments/account/:accountNumber)
      cy.intercept('GET', '/api/payments/account/*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
    })

    // Scenario 6: Pregled računa klijenta
    it('should display all active client accounts', () => {
      cy.visit('/accounts')
      cy.wait('@getClientAccounts')

      // "Prikazuju se svi aktivni računi klijenta"
      cy.contains('My Accounts').should('be.visible')
      cy.contains('Moj tekući račun').should('be.visible')
      cy.contains('Devizni EUR').should('be.visible')

      // "Računi su sortirani po raspoloživom stanju"
      // AccountCard components appear in order — first card has higher balance
      cy.get('[class*="card"]')
        .filter(':contains("RSD")')
        .first()
        .should('contain.text', 'Moj tekući račun')
    })

    // Scenario 7: Pregled detalja računa
    it('should display account details when account is clicked', () => {
      // Stub single account detail
      cy.intercept('GET', '/api/accounts/1', { fixture: 'account-detail.json' }).as(
        'getAccountDetail'
      )
      // Stub: client profile (for clients/me)
      cy.intercept('GET', '/api/clients/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getClientMe')

      cy.visit('/accounts')
      cy.wait('@getClientAccounts')

      // "Klikne na dugme 'Detalji' za određeni račun" — account card is clickable
      cy.contains('Moj tekući račun').click()
      cy.wait('@getAccountDetail')

      // "Sistem prikazuje detaljne informacije o računu"
      // "Prikazani su broj računa, stanje, raspoloživo stanje i tip računa"
      cy.contains('265-0000000000000-11').should('be.visible') // formatted: 3-13-2 digits
      cy.contains('Balance').should('be.visible')
      cy.contains('Available').should('be.visible')
      cy.contains('Account Type').should('be.visible')
    })

    // Scenario 8: Promena naziva računa
    it('should rename an account successfully', () => {
      cy.intercept('GET', '/api/accounts/1', { fixture: 'account-detail.json' }).as(
        'getAccountDetail'
      )
      // Use cy.fixture to load and modify the response (require() doesn't work in Cypress TS)
      cy.fixture('account-detail.json').then((account) => {
        cy.intercept('PUT', '/api/accounts/1/name', {
          statusCode: 200,
          body: { ...account, account_name: 'Glavni račun' },
        }).as('renameAccount')
      })
      cy.intercept('GET', '/api/clients/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      })

      cy.visit('/accounts/1')
      cy.wait('@getAccountDetail')

      // "Izabere opciju 'Promena naziva računa'"
      cy.contains('button', 'Rename Account').click()

      // "Unese novi naziv koji nije već korišćen"
      cy.get('#account-name').clear().type('Glavni račun')

      // Submit rename
      cy.contains('button', 'Save').click()
      cy.wait('@renameAccount')

      // "Sistem uspešno menja naziv računa"
      cy.get('@renameAccount').its('request.body').should('have.property', 'new_name', 'Glavni račun')

      // "Prikazuje potvrdu o uspešnoj promeni" — dialog closes
      cy.contains('Rename Account').should('not.exist')
    })
  })
```

> **Note:** `require()` does not work in Cypress TypeScript files. Always use `cy.fixture()` to load fixture data. See Scenario 8 for the pattern of loading and modifying fixture data inside `cy.fixture().then()`.

- [ ] **Step 2: Run all tests**

```bash
npx cypress run --spec cypress/e2e/accounts.cy.ts
```

Expected: All 7 scenarios pass (4 employee + 3 client).

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/accounts.cy.ts
git commit -m "test: add Cypress E2E tests for client account viewing and renaming (scenarios 6-8)"
```

---

## Chunk 4: Final Verification & Cleanup

### Task 5: End-to-end verification

- [ ] **Step 1: Run all Cypress tests headlessly**

```bash
npx cypress run
```

Expected: 7 tests, all passing.

- [ ] **Step 2: Run in interactive mode to visually verify**

```bash
npx cypress open
```

Select E2E Testing → Chrome → `accounts.cy.ts`. Verify each test visually.

- [ ] **Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors (Cypress tsconfig is isolated from main project tsconfig).

- [ ] **Step 4: Final commit if any adjustments were needed**

```bash
git add -A cypress/
git commit -m "test: finalize Cypress account acceptance tests"
```

---

## Scenario ↔ Test Mapping

| Scenario | Description (Serbian) | Test Name | Role |
|---|---|---|---|
| 1 | Kreiranje tekućeg računa | `should create a current account for existing client` | Employee |
| 2 | Kreiranje deviznog računa | `should create a foreign currency account` | Employee |
| 3 | Kreiranje računa sa karticom | `should create account with automatic card creation` | Employee |
| 4 | Kreiranje poslovnog računa | `should create a business account for a company` | Employee |
| 6 | Pregled računa klijenta | `should display all active client accounts` | Client |
| 7 | Pregled detalja računa | `should display account details when account is clicked` | Client |
| 8 | Promena naziva računa | `should rename an account successfully` | Client |

> **Note:** Scenario 5 is missing from the source document (it skips from 4 to 6).

## Key Implementation Notes

1. **Email notifications** (mentioned in scenarios 1–4): These happen server-side and cannot be verified in frontend E2E tests. The test verifies the API call was made correctly; email delivery is a backend concern.

2. **Account number generation** (scenario 1): The 18-digit account number is generated server-side. The test verifies the response fixture contains an 18-digit number and that the creation succeeded.

3. **Shadcn Select components** render as Radix UI popovers. Clicking a `SelectTrigger` opens a listbox with `role="option"` items. If `cy.get('[role="option"]')` doesn't work, try `cy.get('[data-radix-select-viewport] [role="option"]')`.

4. **ClientSelector** may use a debounced search input. The test types into the search and waits for the intercepted API call before clicking the result.

5. **Session storage keys**: Verify in `src/lib/api/axios.ts` and `src/store/slices/authSlice.ts` which exact keys are used for token storage. The login commands must match.
