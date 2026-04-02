# Cypress Activation & Employee Creation Tests (Feature 0.1) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 6–10 from `docs/cypress-scenariji/Testovi-aktivacija.md`: admin creates an employee (6), duplicate email rejection (7), account activation via link (8), expired token rejection (9), and weak password rejection (10).

**Architecture:** Two new test files: `cypress/e2e/employees.cy.ts` (Scenarios 6–7, employee creation form at `/employees/new`) and `cypress/e2e/activation.cy.ts` (Scenarios 8–10, activation page at `/activate?token=...`). One new fixture for the successful employee creation response. All intercepts are per-test (no `beforeEach`).

**Tech Stack:** Cypress 14+, TypeScript. Uses `cy.loginAsEmployee()` custom command (already defined in `cypress/support/commands.ts`).

---

## Scope Assessment

| Scenario | Testable? | Notes |
|----------|-----------|-------|
| 6 | Yes | Admin creates employee → POST /api/employees → 201 → redirect to `/employees` |
| 7 | Yes | Duplicate email → POST /api/employees → 409 → generic error shown |
| 8 | Yes | Valid activation → POST /api/auth/activate → 200 → success card shown |
| 9 | Yes | Expired token → POST /api/auth/activate → 400 → error message shown |
| 10 | Yes | Weak password → client-side Zod validation fires → no API call |

> **Scenario 7 — error message discrepancy:** The spec says `"Nalog sa ovom email adresom već postoji"` but the frontend shows the generic `"Failed to create employee."` (from `CreateEmployeePage` line 25 — `ErrorMessage` component, always the same string). Tests verify actual implementation behavior.

> **Scenario 9 — error message discrepancy:** The spec says `"Link za aktivaciju je istekao"` but the frontend shows `"Failed to activate account. The link may have expired."` (from `ActivationPage` line 22). Additionally, "omogućava slanje novog aktivacionog linka" is **not implemented** in the frontend — there is no resend link UI.

> **Scenario 8, 9 — public route:** `/activate?token=...` requires no authentication — do NOT use `cy.loginAsEmployee()` for these tests.

---

## UI Reference

### CreateEmployeePage (`/employees/new` — requires `employees.create` permission)
> The existing `cypress/fixtures/employee-auth.json` JWT already includes `"employees.create"` in its permissions array, so `cy.loginAsEmployee('/employees/new')` works without any fixture changes.

- Page heading: `"Create Employee"` (`h1`)
- Form fields (all rendered by `EmployeeCreateForm.tsx`):
  - `#first_name` — text input
  - `#last_name` — text input
  - `#date_of_birth` — date input
  - `#gender` — Shadcn `<Select>` with `aria-label="Gender"`
  - `#email` — email input
  - `input[placeholder="Phone number"]` — PhoneInput (no id)
  - `#address` — text input
  - `#username` — text input
  - `#position` — text input
  - `#department` — text input
  - `#jmbg` — text input, placeholder `"13-digit JMBG"`
  - `#status` — Shadcn `<Select>` (Active/Inactive), default Active
  - `#role` — Shadcn `<Select>` (EmployeeBasic/EmployeeAgent/EmployeeSupervisor/EmployeeAdmin)
- Submit button: `"Save"` / `"Saving..."` (disabled while loading)
- Error display: `<ErrorMessage>` rendered below the form — `cy.contains('Failed to create employee.')`
- On success: `useMutationWithRedirect` navigates to `/employees`

### ActivationPage (`/activate?token=<token>` — public)
- Card title: `"Activate Account"` (via `AuthFormCard`)
- Form fields:
  - `#password` — type password
  - `#confirm_password` — type password
- Submit button: `"Activate Account"` / `"Activating..."` (disabled while loading)
- On success (`isSuccess=true`): AuthFormCard flips to success view — `"Account activated successfully."` + `"Log in"` link
- On error (`error` prop set): red text — `"Failed to activate account. The link may have expired."` (`.text-destructive`)
- On validation error: inline field errors beneath each input (react-hook-form `errors.password?.message`)

### Password validation rules (from `passwordSchema` in `src/lib/utils/validation.ts`)
| Rule | Error message |
|------|---------------|
| min 8 chars | `"Password must be at least 8 characters"` |
| max 32 chars | `"Password must be at most 32 characters"` |
| 2+ digits | `"Password must contain at least 2 numbers"` |
| 1+ uppercase | `"Password must contain at least 1 uppercase letter"` |
| 1+ lowercase | `"Password must contain at least 1 lowercase letter"` |

---

## API Endpoints

| Action | Method | URL | Success | Failure |
|--------|--------|-----|---------|---------|
| Create employee | POST | `/api/employees` | 201 + Employee JSON | 409 |
| Activate account | POST | `/api/auth/activate` | 200 | 400 |

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `cypress/fixtures/employee-created.json` | **Create** | Response body for successful POST /api/employees |
| `cypress/e2e/employees.cy.ts` | **Create** | Scenarios 6–7: employee creation via admin form |
| `cypress/e2e/activation.cy.ts` | **Create** | Scenarios 8–10: account activation flow |

---

## Chunk 1: Fixture + Employee Creation Tests (Scenarios 6–7)

### Task 1: Create `employee-created.json` fixture

**Files:**
- Create: `cypress/fixtures/employee-created.json`

- [ ] **Step 1: Write the fixture**

```json
{
  "id": 99,
  "first_name": "Nikola",
  "last_name": "Petrović",
  "email": "nikola.petrovic@example.com",
  "phone": "",
  "address": "",
  "username": "npetrovic",
  "date_of_birth": 631152000,
  "gender": "",
  "jmbg": "1234567890123",
  "position": "",
  "department": "",
  "role": "EmployeeBasic",
  "active": true,
  "permissions": []
}
```

---

### Task 2: Write `employees.cy.ts` with Scenarios 6–7

**Files:**
- Create: `cypress/e2e/employees.cy.ts`
- Reference: `cypress/fixtures/employee-created.json` (Task 1)
- Reference: `cypress/fixtures/employee-auth.json` (loginAsEmployee)
- Reference: `src/components/employees/EmployeeCreateForm.tsx` (form field ids)
- Reference: `src/pages/CreateEmployeePage.tsx` (error handling, redirect)

- [ ] **Step 2: Write `employees.cy.ts`**

```typescript
describe('Celina 0.1: Kreiranje zaposlenog', () => {
  // Scenario 6: Admin kreira novog zaposlenog
  it('should create a new employee and redirect to employee list (Scenario 6)', () => {
    cy.intercept('POST', '/api/employees', {
      statusCode: 201,
      fixture: 'employee-created.json',
    }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')

    cy.contains('h1', 'Create Employee').should('be.visible')

    // Fill required fields
    cy.get('#first_name').type('Nikola')
    cy.get('#last_name').type('Petrović')
    cy.get('#date_of_birth').type('1990-01-01')
    cy.get('#email').type('nikola.petrovic@example.com')
    cy.get('#username').type('npetrovic')
    cy.get('#jmbg').type('1234567890123')

    // Select role (required)
    // formatRoleLabel('EmployeeBasic') → 'Employee Basic' (inserts space before each capital)
    cy.get('#role').click()
    cy.contains('[role="option"]', 'Employee Basic').click()

    // Submit
    cy.contains('button', 'Save').click()
    cy.wait('@createEmployee')

    // Verify request body contains required fields
    cy.get('@createEmployee')
      .its('request.body')
      .should((body) => {
        expect(body.first_name).to.equal('Nikola')
        expect(body.last_name).to.equal('Petrović')
        expect(body.email).to.equal('nikola.petrovic@example.com')
        expect(body.username).to.equal('npetrovic')
        expect(body.jmbg).to.equal('1234567890123')
      })

    // Redirect to employee list
    cy.url().should('include', '/employees')
  })

  // Scenario 7: Kreiranje zaposlenog sa već postojećim email-om
  it('should show error when creating employee with duplicate email (Scenario 7)', () => {
    cy.intercept('POST', '/api/employees', {
      statusCode: 409,
      body: { message: 'Email already exists' },
    }).as('createEmployeeDuplicate')

    cy.loginAsEmployee('/employees/new')

    cy.contains('h1', 'Create Employee').should('be.visible')

    // Fill form with a duplicate email
    cy.get('#first_name').type('Marko')
    cy.get('#last_name').type('Markovic')
    cy.get('#email').type('marko.markovic@example.com')
    cy.get('#username').type('mmarkovic')
    cy.get('#jmbg').type('9876543210123')

    // Select role
    cy.get('#role').click()
    cy.contains('[role="option"]', 'Employee Basic').click()

    // Submit
    cy.contains('button', 'Save').click()
    cy.wait('@createEmployeeDuplicate')

    // Frontend shows generic error (not the API message)
    // Note: spec says "Nalog sa ovom email adresom već postoji" but frontend renders
    // the hardcoded string from CreateEmployeePage.tsx: "Failed to create employee."
    cy.contains('Failed to create employee.').should('be.visible')

    // Admin stays on the form
    cy.url().should('include', '/employees/new')
  })
})
```

- [ ] **Step 3: Run Cypress for employees tests**

```bash
npx cypress run --spec "cypress/e2e/employees.cy.ts"
```
Expected: 2 tests pass

- [ ] **Step 4: Commit**

```bash
git add cypress/fixtures/employee-created.json cypress/e2e/employees.cy.ts
git commit -m "test: add Cypress Scenarios 6–7 — employee creation and duplicate email"
```

---

## Chunk 2: Activation Tests (Scenarios 8–10)

### Task 3: Write `activation.cy.ts` with Scenarios 8–10

**Files:**
- Create: `cypress/e2e/activation.cy.ts`
- Reference: `src/pages/ActivationPage.tsx` (token from URL, mutation, error prop)
- Reference: `src/components/auth/ActivationForm.tsx` (field ids, button text, success state)
- Reference: `src/components/auth/AuthFormCard.tsx` (error display, success display)
- Reference: `src/lib/utils/validation.ts` → `passwordSchema` (validation rules and messages)

No new fixtures required — activation success is a void response (200 with empty body).

- [ ] **Step 5: Write `activation.cy.ts`**

```typescript
describe('Celina 0.1: Aktivacija naloga', () => {
  // Scenario 8: Zaposleni aktivira nalog putem email linka
  it('should activate account with valid token and matching passwords (Scenario 8)', () => {
    cy.intercept('POST', '/api/auth/activate', {
      statusCode: 200,
      body: {},
    }).as('activate')

    cy.visit('/activate?token=valid-activation-token-abc')

    cy.contains('Activate Account').should('be.visible')

    // Enter a valid password (meets all passwordSchema rules)
    cy.get('#password').type('Password12')
    cy.get('#confirm_password').type('Password12')

    cy.contains('button', 'Activate Account').click()
    cy.wait('@activate')

    // Verify request body includes token from URL and passwords
    cy.get('@activate')
      .its('request.body')
      .should((body) => {
        expect(body.token).to.equal('valid-activation-token-abc')
        expect(body.password).to.equal('Password12')
        expect(body.confirm_password).to.equal('Password12')
      })

    // Success state: card flips to success message
    cy.contains('Account activated successfully.').should('be.visible')
    cy.contains('Log in').should('be.visible')
  })

  // Scenario 9: Aktivacija naloga sa isteklim tokenom
  it('should show expiry error when activation token is expired (Scenario 9)', () => {
    cy.intercept('POST', '/api/auth/activate', {
      statusCode: 400,
      body: { message: 'Token expired' },
    }).as('activateExpired')

    // Note: spec says "Link za aktivaciju je istekao" but frontend shows:
    // "Failed to activate account. The link may have expired."
    // Note: spec says UI enables resending activation link — this is NOT implemented
    // in the frontend. Only the error message is displayed.

    cy.visit('/activate?token=expired-token-xyz')

    cy.contains('Activate Account').should('be.visible')

    cy.get('#password').type('Password12')
    cy.get('#confirm_password').type('Password12')

    cy.contains('button', 'Activate Account').click()
    cy.wait('@activateExpired')

    // Frontend error message (from ActivationPage.tsx line 22)
    cy.contains('Failed to activate account. The link may have expired.').should('be.visible')

    // User remains on the activation page
    cy.url().should('include', '/activate')
  })

  // Scenario 10: Postavljanje lozinke koja ne ispunjava bezbednosne zahteve
  it('should reject weak password and show validation errors (Scenario 10)', () => {
    // No API intercept — validation is client-side (Zod passwordSchema)
    // Track whether activate was called (it should NOT be)
    cy.intercept('POST', '/api/auth/activate').as('activate')

    cy.visit('/activate?token=some-token')

    cy.contains('Activate Account').should('be.visible')

    // Enter a weak password: 8 chars but no digits and no uppercase
    // Fails: "Password must contain at least 2 numbers"
    //        "Password must contain at least 1 uppercase letter"
    cy.get('#password').type('weakpass')
    cy.get('#confirm_password').type('weakpass')

    cy.contains('button', 'Activate Account').click()

    // Client-side validation fires — first error from passwordSchema refine chain
    cy.contains('Password must contain at least 2 numbers').should('be.visible')

    // Activate API must NOT have been called
    // `.all` gives the array of all matched requests — length 0 means never fired
    cy.get('@activate.all').should('have.length', 0)

    // Account remains on the activation page (form not submitted)
    cy.url().should('include', '/activate')
  })
})
```

- [ ] **Step 6: Run Cypress for activation tests**

```bash
npx cypress run --spec "cypress/e2e/activation.cy.ts"
```
Expected: 3 tests pass

- [ ] **Step 7: Run all Cypress tests to confirm no regressions**

```bash
npx cypress run
```
Expected: all existing tests + 5 new tests pass

- [ ] **Step 8: Commit**

```bash
git add cypress/e2e/activation.cy.ts
git commit -m "test: add Cypress Scenarios 8–10 — account activation, expired token, weak password"
```
