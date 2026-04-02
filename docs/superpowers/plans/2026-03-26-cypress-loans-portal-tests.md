# Cypress Loan & Employee Portal Tests (Celina 7–8) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 33–40 from `docs/cypress-scenariji/Testovi-krediti.md`: loan application (33), loan list (34), approve/reject loan requests (35–36), and employee client management (39–40). Scenarios 37–38 (cron-based installment processing) are backend-only and untestable in E2E.

**Architecture:** Tests split into two files: `cypress/e2e/loans.cy.ts` (Scenarios 33–36) and `cypress/e2e/employee-portal.cy.ts` (Scenarios 39–40). Client scenarios use `cy.loginAsClient`, employee scenarios use `cy.loginAsEmployee`.

**Tech Stack:** Cypress 14+, cypress-real-events, TypeScript

---

## Scope Assessment

| Scenario | Testable? | Notes |
|----------|-----------|-------|
| 33 | Yes | Client submits loan application form |
| 34 | Yes | Client views loan list |
| 35 | Yes | Employee approves loan request |
| 36 | Yes | Employee rejects loan request |
| 37 | **No** | Backend cron job — no frontend UI to test |
| 38 | **No** | Backend cron job — no frontend UI to test |
| 39 | Yes | Employee searches clients |
| 40 | Yes | Employee edits client data |

> **Scenarios 37–38** describe automatic installment processing triggered by a backend cron job. The frontend has no UI for triggering or observing this process in real-time. These require backend integration tests, not Cypress E2E tests.

---

## UI Reference

**LoanApplicationPage** (`/loans/apply` — client):
- Card title: "Submit Loan Request"
- Form selectors: `aria-label="Loan Type"`, Select for Interest Rate Type, Select for Disbursement Account, `#amount`, `aria-label="Repayment Period"`, `#purpose`, `#monthly_salary`, Select for Employment Status, `#employment_period`, `#phone`
- Submit: "Submit Request" / "Submitting..."
- Success: "Loan request submitted successfully!" + "Your request is being processed."

**LoanListPage** (`/loans` — client):
- Title: `<h1>My Loans</h1>`
- "Apply for Loan" button
- `LoanCard` shows: loan type label, loan number, installment amount, approval date, total amount, status badge (Active/Paid Off/Delinquent)
- Empty: "You have no active loans."

**AdminLoanRequestsPage** (`/admin/loans/requests` — employee):
- Title: `<h1>Loan Requests</h1>`
- Table columns: Client, Account Number, Amount, Currency, Repayment Period, Purpose, Actions
- Action buttons: "Approve" + "Reject" per row
- FilterBar: Loan Type (multiselect), Account Number (text), Client Name (text)
- Empty: "No requests."

**AdminClientsPage** (`/admin/clients` — employee):
- Title: `<h1>Client Management</h1>`
- FilterBar: Name (text), Email (text)
- ClientTable columns: First Name, Last Name, Email, Phone, Actions ("Edit" button)
- "New Client" button

**EditClientPage** (`/admin/clients/:id` — employee):
- Card title: "Edit Client"
- Form fields: `#first_name`, `#last_name`, `#email`, `#phone`, `#address`
- Submit: "Save" / "Saving..."
- Cancel: "Cancel" button

## API Endpoints

| Action | Method | URL | Auth |
|--------|--------|-----|------|
| Client loans | GET | `/api/me/loans` | Client |
| Client accounts | GET | `/api/me/accounts` | Client |
| Submit loan request | POST | `/api/me/loan-requests` | Client |
| Loan requests list | GET | `/api/loan-requests` | Employee |
| Approve request | POST | `/api/loan-requests/:id/approve` | Employee |
| Reject request | POST | `/api/loan-requests/:id/reject` | Employee |
| List clients | GET | `/api/clients` | Employee |
| Get client | GET | `/api/clients/:id` | Employee |
| Update client | PUT | `/api/clients/:id` | Employee |

---

## Chunk 1: Loan Tests (Tasks 1–3)

### Task 1: Create loan fixtures and scaffold `loans.cy.ts` with Scenarios 33–34

**Files:**
- Create: `cypress/fixtures/loans-list.json`
- Create: `cypress/fixtures/loan-request-created.json`
- Create: `cypress/fixtures/loan-requests-pending.json`
- Create: `cypress/e2e/loans.cy.ts`

- [ ] **Step 1: Create `loans-list.json`**

Response from `GET /api/me/loans`:

```json
{
  "loans": [
    {
      "id": 1,
      "loan_number": "LN-2026-001",
      "loan_type": "CASH",
      "account_number": "265000000000000011",
      "amount": 500000,
      "interest_rate": 5.5,
      "period": 24,
      "installment_amount": 22000,
      "status": "ACTIVE",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "loan_number": "LN-2026-002",
      "loan_type": "HOUSING",
      "account_number": "265000000000000011",
      "amount": 10000000,
      "interest_rate": 3.2,
      "period": 240,
      "installment_amount": 57000,
      "status": "ACTIVE",
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Create `loan-request-created.json`**

Response from `POST /api/me/loan-requests`:

```json
{
  "id": 10,
  "client_id": 42,
  "loan_type": "CASH",
  "interest_type": "FIXED",
  "account_number": "265000000000000011",
  "amount": 300000,
  "interest_rate": 0,
  "currency_code": "RSD",
  "purpose": "Home renovation",
  "monthly_salary": 120000,
  "employment_status": "EMPLOYED",
  "employment_period": 5,
  "repayment_period": 36,
  "phone": "+381641234567",
  "status": "PENDING",
  "created_at": "2026-03-26T10:00:00Z"
}
```

- [ ] **Step 3: Create `loan-requests-pending.json`**

Response from `GET /api/loan-requests?status_filter=pending`:

```json
{
  "requests": [
    {
      "id": 10,
      "client_id": 42,
      "loan_type": "CASH",
      "interest_type": "FIXED",
      "account_number": "265000000000000011",
      "amount": 300000,
      "interest_rate": 0,
      "currency_code": "RSD",
      "purpose": "Home renovation",
      "monthly_salary": 120000,
      "employment_status": "EMPLOYED",
      "repayment_period": 36,
      "status": "PENDING",
      "created_at": "2026-03-26T10:00:00Z"
    }
  ],
  "total": 1
}
```

- [ ] **Step 4: Write `loans.cy.ts` with Scenarios 33 and 34**

```typescript
describe('Celina 7: Krediti — Upravljanje kreditima', () => {
  describe('Client: Loan Application & Viewing (Scenarios 33–34)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
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
    })

    // Scenario 33: Podnošenje zahteva za kredit
    it('should submit a loan application (Scenario 33)', () => {
      cy.intercept('POST', '/api/me/loan-requests', {
        statusCode: 201,
        fixture: 'loan-request-created.json',
      }).as('submitLoan')

      cy.loginAsClient('/loans/apply')

      cy.contains('Submit Loan Request').should('be.visible')

      // Select Loan Type
      cy.get('[aria-label="Loan Type"]').click()
      cy.contains('[role="option"]', 'Cash').realClick()

      // Select Interest Type
      cy.contains('Select interest type').click()
      cy.contains('[role="option"]', 'Fixed').realClick()

      // Select Disbursement Account
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      // Enter amount
      cy.get('#amount').type('300000')

      // Select repayment period
      cy.get('[aria-label="Repayment Period"]').click()
      cy.contains('[role="option"]', '36 months').realClick()

      // Fill optional fields
      cy.get('#purpose').type('Home renovation')
      cy.get('#monthly_salary').type('120000')

      // Select employment status
      cy.contains('Select status').click()
      cy.contains('[role="option"]', 'Permanent Employment').realClick()

      cy.get('#employment_period').type('5')
      cy.get('#phone').type('+381641234567')

      // Submit
      cy.contains('button', 'Submit Request').click()
      cy.wait('@submitLoan')

      // Verify request body
      cy.get('@submitLoan')
        .its('request.body')
        .should((body) => {
          expect(body.loan_type).to.equal('CASH')
          expect(body.amount).to.equal(300000)
          expect(body.repayment_period).to.equal(36)
          expect(body.account_number).to.equal('265000000000000011')
        })

      // Success screen
      cy.contains('Loan request submitted successfully!').should('be.visible')
      cy.contains('Your request is being processed.').should('be.visible')
    })

    // Scenario 34: Pregled kredita klijenta
    it('should display loan list with status badges (Scenario 34)', () => {
      cy.intercept('GET', '/api/me/loans', { fixture: 'loans-list.json' }).as('getLoans')

      cy.loginAsClient('/loans')
      cy.wait('@getLoans')

      cy.contains('h1', 'My Loans').should('be.visible')

      // Both loans should be displayed
      cy.contains('Cash').should('be.visible')
      cy.contains('Housing').should('be.visible')
      cy.contains('LN-2026-001').should('be.visible')
      cy.contains('LN-2026-002').should('be.visible')

      // Status badges
      cy.contains('Active').should('be.visible')

      // "Apply for Loan" button
      cy.contains('button', 'Apply for Loan').should('be.visible')
    })
  })
})
```

- [ ] **Step 5: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/loans.cy.ts"
```
Expected: 2 tests pass

- [ ] **Step 6: Commit**

```bash
git add cypress/fixtures/loans-list.json cypress/fixtures/loan-request-created.json cypress/fixtures/loan-requests-pending.json cypress/e2e/loans.cy.ts
git commit -m "test: add Cypress Scenarios 33–34 — loan application and list"
```

---

### Task 2: Scenarios 35–36 — employee approves/rejects loan requests

**Files:**
- Modify: `cypress/e2e/loans.cy.ts`
- Reference: `src/pages/AdminLoanRequestsPage.tsx` (table with Approve/Reject buttons)

**Spec — Scenario 35:** Employee clicks "Approve" → loan status changes to "Approved"
**Spec — Scenario 36:** Employee clicks "Reject" → loan status changes to "Rejected"

The `AdminLoanRequestsPage` fetches loan requests with `status_filter=pending`. It also fetches all clients to display client names. The table shows "Approve" and "Reject" buttons per row.

- [ ] **Step 1: Add employee describe block with Scenarios 35 and 36**

Add at the end of the outer `describe`:

```typescript
  describe('Employee: Loan Request Management (Scenarios 35–36)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/loan-requests*', {
        fixture: 'loan-requests-pending.json',
      }).as('getLoanRequests')
      cy.intercept('GET', '/api/clients*', {
        body: {
          clients: [
            {
              id: 42,
              first_name: 'Marko',
              last_name: 'Jovanović',
              email: 'marko@example.com',
              phone: '+381641234567',
            },
          ],
          total: 1,
        },
      }).as('getClients')
      cy.loginAsEmployee('/admin/loans/requests')
    })

    // Scenario 35: Odobravanje kredita
    it('should approve a pending loan request (Scenario 35)', () => {
      cy.intercept('POST', '/api/loan-requests/10/approve', {
        statusCode: 200,
        body: {},
      }).as('approveRequest')

      // After approve, refetch returns empty list
      cy.intercept('GET', '/api/loan-requests*', {
        body: { requests: [], total: 0 },
      }).as('getLoanRequestsUpdated')

      cy.wait('@getLoanRequests')
      cy.wait('@getClients')

      cy.contains('h1', 'Loan Requests').should('be.visible')

      // Verify request row shows client name and amount
      cy.contains('Marko Jovanović').should('be.visible')
      cy.contains('265000000000000011').should('be.visible')
      cy.contains('36 months').should('be.visible')

      // Click "Approve"
      cy.contains('button', 'Approve').click()
      cy.wait('@approveRequest')

      // List refreshes — request no longer shown
      cy.wait('@getLoanRequestsUpdated')
    })

    // Scenario 36: Odbijanje zahteva za kredit
    it('should reject a pending loan request (Scenario 36)', () => {
      cy.intercept('POST', '/api/loan-requests/10/reject', {
        statusCode: 200,
        body: {},
      }).as('rejectRequest')

      cy.intercept('GET', '/api/loan-requests*', {
        body: { requests: [], total: 0 },
      }).as('getLoanRequestsUpdated')

      cy.wait('@getLoanRequests')
      cy.wait('@getClients')

      // Click "Reject"
      cy.contains('button', 'Reject').click()
      cy.wait('@rejectRequest')

      // List refreshes
      cy.wait('@getLoanRequestsUpdated')
    })
  })
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/loans.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/loans.cy.ts
git commit -m "test: add Cypress Scenarios 35–36 — approve and reject loan requests"
```

---

## Chunk 2: Employee Portal Tests (Task 3)

### Task 3: Scenarios 39–40 — client search and edit

**Files:**
- Create: `cypress/fixtures/clients-list.json`
- Create: `cypress/fixtures/client-detail.json`
- Create: `cypress/e2e/employee-portal.cy.ts`
- Reference: `src/pages/AdminClientsPage.tsx` (FilterBar with Name/Email, ClientTable)
- Reference: `src/pages/EditClientPage.tsx` (EditClientForm with Save button)
- Reference: `src/components/admin/ClientTable.tsx` (columns: First Name, Last Name, Email, Phone, Edit button)
- Reference: `src/components/admin/EditClientForm.tsx` (fields: `#first_name`, `#last_name`, `#email`, `#phone`, `#address`)

**Spec — Scenario 39:** Employee searches client by name/email → matching clients shown
**Spec — Scenario 40:** Employee opens client profile, changes phone/address, saves → data updated

- [ ] **Step 1: Create `clients-list.json`**

Response from `GET /api/clients`:

```json
{
  "clients": [
    {
      "id": 42,
      "first_name": "Marko",
      "last_name": "Jovanović",
      "email": "marko@example.com",
      "phone": "+381641234567",
      "address": "Knez Mihailova 10, Beograd",
      "gender": "MALE",
      "date_of_birth": "1990-05-15"
    },
    {
      "id": 43,
      "first_name": "Ana",
      "last_name": "Petrović",
      "email": "ana@example.com",
      "phone": "+381659876543",
      "address": "Bulevar Kralja Aleksandra 50, Niš",
      "gender": "FEMALE",
      "date_of_birth": "1988-11-20"
    }
  ],
  "total": 2
}
```

- [ ] **Step 2: Create `client-detail.json`**

Response from `GET /api/clients/42`:

```json
{
  "id": 42,
  "first_name": "Marko",
  "last_name": "Jovanović",
  "email": "marko@example.com",
  "phone": "+381641234567",
  "address": "Knez Mihailova 10, Beograd",
  "gender": "MALE",
  "date_of_birth": "1990-05-15"
}
```

- [ ] **Step 3: Write `employee-portal.cy.ts`**

```typescript
describe('Celina 8: Portal za zaposlene — Upravljanje klijentima', () => {
  // Scenario 39: Pretraga klijenta
  it('should search clients by name (Scenario 39)', () => {
    cy.intercept('GET', '/api/clients*', { fixture: 'clients-list.json' }).as('getClients')

    cy.loginAsEmployee('/admin/clients')
    cy.wait('@getClients')

    cy.contains('h1', 'Client Management').should('be.visible')

    // Both clients shown initially
    cy.contains('Marko').should('be.visible')
    cy.contains('Ana').should('be.visible')

    // Table columns
    cy.contains('th', 'First Name').should('be.visible')
    cy.contains('th', 'Last Name').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')

    // Filter by name — intercept the filtered request
    cy.intercept('GET', '/api/clients*', (req) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('name_filter')) {
        req.reply({
          body: {
            clients: [
              {
                id: 42,
                first_name: 'Marko',
                last_name: 'Jovanović',
                email: 'marko@example.com',
                phone: '+381641234567',
              },
            ],
            total: 1,
          },
        })
      }
    }).as('getFilteredClients')

    cy.get('input[placeholder="Name"]').type('Marko')
    cy.wait('@getFilteredClients')

    // Only Marko should be shown
    cy.contains('Marko').should('be.visible')

    // Verify the "Edit" button is available
    cy.contains('button', 'Edit').should('be.visible')
  })

  // Scenario 40: Izmena podataka klijenta
  it('should edit client phone and address (Scenario 40)', () => {
    cy.intercept('GET', '/api/clients*', { fixture: 'clients-list.json' }).as('getClients')
    cy.intercept('GET', '/api/clients/42', { fixture: 'client-detail.json' }).as('getClient')
    cy.intercept('PUT', '/api/clients/42', {
      statusCode: 200,
      body: {
        id: 42,
        first_name: 'Marko',
        last_name: 'Jovanović',
        email: 'marko@example.com',
        phone: '+381669999999',
        address: 'Nova adresa 15, Beograd',
        gender: 'MALE',
        date_of_birth: '1990-05-15',
      },
    }).as('updateClient')

    cy.loginAsEmployee('/admin/clients/42')
    cy.wait('@getClient')

    cy.contains('Edit Client').should('be.visible')

    // Form should be pre-filled with current data
    cy.get('#first_name').should('have.value', 'Marko')
    cy.get('#last_name').should('have.value', 'Jovanović')
    cy.get('#email').should('have.value', 'marko@example.com')
    cy.get('#phone').should('have.value', '+381641234567')

    // Change phone and address
    cy.get('#phone').clear().type('+381669999999')
    cy.get('#address').clear().type('Nova adresa 15, Beograd')

    // Save
    cy.contains('button', 'Save').click()
    cy.wait('@updateClient')

    // Verify request body
    cy.get('@updateClient')
      .its('request.body')
      .should((body) => {
        expect(body.phone).to.equal('+381669999999')
        expect(body.address).to.equal('Nova adresa 15, Beograd')
        expect(body.first_name).to.equal('Marko')
      })

    // After save, redirects to clients list
    cy.url().should('include', '/admin/clients')
  })
})
```

- [ ] **Step 4: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/employee-portal.cy.ts"
```
Expected: 2 tests pass

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/clients-list.json cypress/fixtures/client-detail.json cypress/e2e/employee-portal.cy.ts
git commit -m "test: add Cypress Scenarios 39–40 — employee client search and edit"
```

---

## Summary

| Task | Scenario(s) | File | What it tests |
|------|-------------|------|---------------|
| 1 | 33, 34 | `loans.cy.ts` | Loan application form + loan list display |
| 2 | 35, 36 | `loans.cy.ts` | Employee approve/reject loan requests |
| 3 | 39, 40 | `employee-portal.cy.ts` | Employee client search + edit client data |

**Total: 6 Cypress tests across 6 testable scenarios. 5 fixture files.**

**Untestable scenarios (backend cron):**
- **Scenario 37:** Automatic installment deduction — backend cron job, no frontend UI
- **Scenario 38:** Late payment due to insufficient funds — backend cron job, no frontend UI
