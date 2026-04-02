# Cypress Employee Management Tests (Feature 0.2) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 11–16 from `docs/cypress-scenariji/Testovi-zaposleni.md`: employee list (11), employee search (12), edit employee (13), deactivate employee (14), read-only admin view (15), and client access denial (16).

**Architecture:** One new test file `cypress/e2e/employee-management.cy.ts` covering all testable scenarios. Three new fixture files for the employee list, a single non-admin employee, and a single admin employee. Scenarios 17–18 are not testable (no permissions UI exists in the frontend) and are documented in the scope table.

**Tech Stack:** Cypress 14+, TypeScript. Uses `cy.loginAsEmployee()` and `cy.loginAsClient()` custom commands.

---

## Scope Assessment

| Scenario | Testable? | Notes |
|----------|-----------|-------|
| 11 | Yes | Employee list at `/employees` — table with Name, Email, Position, Phone, Status columns |
| 12 | Yes | Filter input `placeholder="Name"` triggers GET /api/employees with `name` query param |
| 13 | Yes | Edit phone digits + department → PUT /api/employees/7 → redirect to `/employees` |
| 14 | Yes | Status Select: "Active" → "Inactive" → PUT /api/employees/7 with `active: false` |
| 15 | Yes | Employee `role: "EmployeeAdmin"` with different ID → readOnly form, no Save button |
| 16 | Yes | Client visits `/employees` → redirected to `/home` (full chain: `/` → `/login` → `/home`) |
| 17 | **No** | No permissions UI — `setEmployeePermissions` API exists in `lib/api/roles.ts` but no component calls it |
| 18 | **No** | No permissions display UI — verifying `permissions: []` requires a tab/page that is not implemented |

> **Scenario 13 — confirmation discrepancy:** The spec says "prikazuje potvrdu o uspešnoj izmeni podataka" but `EditEmployeePage` has no success toast or message — it only calls `useMutationWithRedirect` which navigates to `/employees` on success. The test verifies the redirect only.

> **Scenario 14 — deactivate button discrepancy:** The spec says "klikne na opciju 'Deaktiviraj'" implying a dedicated deactivate button. The frontend has no such button. Deactivation is done by changing the Status Select from "Active" to "Inactive" and clicking Save.

> **Scenario 16 — error message discrepancy:** The spec says "Nemate dozvolu za pristup ovoj stranici" but `ProtectedRoute` silently redirects to `/` with no message. Full redirect chain: `/employees` → `<Navigate to="/" />` → `path="*"` → `/login` → `LoginPage` (authenticated client) → `/home`. The test asserts the final URL is `/home`.

> **Current user ID note:** `cypress/fixtures/employee-auth.json` JWT decodes to `user_id: 5`. Use employee ID 7 for Scenarios 13–14 (editable, non-admin) and ID 10 for Scenario 15 (another admin). This ensures `isOtherAdmin = (role === "EmployeeAdmin" && id !== currentUser.id) = true` for Scenario 15.

---

## UI Reference

### EmployeeListPage (`/employees` — requires `employees.read`)
- Page heading: `"Employees"` (h1)
- Table headers: `Name`, `Email`, `Position`, `Phone`, `Status`
- Filter inputs from `FilterBar` — `input[placeholder="Name"]`, `input[placeholder="Email"]`, `input[placeholder="Position"]`
- Row click → navigate to `/employees/:id`
- Status badge text: `"Active"` or `"Inactive"` (from `EmployeeStatusBadge`)
- Empty state: `"No employees found."`

### EditEmployeePage (`/employees/:id` — requires `employees.update`)
Title logic:
- `isOtherAdmin` → `"Administrator Details"`
- `isOwnProfile` (currentUser.id === employeeId) → `"My Profile"`
- otherwise → `"Edit Employee"`

Read-only state (when `isOtherAdmin = true`):
- Read-only notice: `"View only — administrator profiles cannot be edited."` (above form)
- All inputs disabled
- **No Save button** (conditionally rendered only when `!readOnly`)

Editable form fields:
- `#last_name` — text
- `#address` — text
- `#position` — text
- `#department` — text
- `#jmbg` — text
- `#status` — Shadcn Select on `<SelectTrigger id="status">` (renders as `<button>`) — values: "Active" / "Inactive"
- `#role` — Shadcn Select
- Phone: **two-part input** — country code `<Select>` (no id) + digit input `input[placeholder="Phone number"]`
  - The digit input holds only the digits portion (e.g. for "+381641234567", the field shows "641234567")
  - `handleNumberChange` strips all non-digits via `.replace(/\D/g, '')`
  - **Always type digits only** into `input[placeholder="Phone number"]`, never the full E.164 string

Always-disabled fields: `#first_name`, `#date_of_birth`, `#email`, `#username`

Submit button: `"Save"` / `"Saving..."` — only rendered when `!readOnly`
On success: redirect to `/employees`
On error: `cy.contains('Failed to update employee.')`

---

## API Endpoints

| Action | Method | URL | Notes |
|--------|--------|-----|-------|
| List employees | GET | `/api/employees*` | Supports `name`, `email`, `position`, `page`, `page_size` |
| Get employee | GET | `/api/employees/7` | Single employee |
| Update employee | PUT | `/api/employees/7` | `UpdateEmployeeRequest` body |

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `cypress/fixtures/employees-list.json` | **Create** | `{ employees: [...], total_count: N }` — Scenarios 11, 12 |
| `cypress/fixtures/employee-detail.json` | **Create** | Non-admin employee id 7 — Scenarios 13, 14 |
| `cypress/fixtures/employee-admin-detail.json` | **Create** | Admin employee id 10 — Scenario 15 |
| `cypress/e2e/employee-management.cy.ts` | **Create** | All Scenarios 11–16 |

---

## Chunk 1: Fixtures

### Task 1: Create fixture files

**Files:**
- Create: `cypress/fixtures/employees-list.json`
- Create: `cypress/fixtures/employee-detail.json`
- Create: `cypress/fixtures/employee-admin-detail.json`

- [ ] **Step 1: Write `employees-list.json`**

```json
{
  "employees": [
    {
      "id": 7,
      "first_name": "Marko",
      "last_name": "Marković",
      "email": "marko.markovic@banka.rs",
      "phone": "+381641234567",
      "address": "Knez Mihailova 10, Beograd",
      "username": "mmarkovic",
      "date_of_birth": 631152000,
      "gender": "MALE",
      "jmbg": "0101990710123",
      "position": "Analyst",
      "department": "Retail",
      "role": "EmployeeBasic",
      "active": true,
      "permissions": []
    },
    {
      "id": 8,
      "first_name": "Ana",
      "last_name": "Petrović",
      "email": "ana.petrovic@banka.rs",
      "phone": "+381659876543",
      "address": "Bulevar Kralja Aleksandra 50, Niš",
      "username": "apetrovic",
      "date_of_birth": 594086400,
      "gender": "FEMALE",
      "jmbg": "2011988715321",
      "position": "Agent",
      "department": "Operations",
      "role": "EmployeeAgent",
      "active": true,
      "permissions": ["clients.read"]
    }
  ],
  "total_count": 2
}
```

- [ ] **Step 2: Write `employee-detail.json`**

```json
{
  "id": 7,
  "first_name": "Marko",
  "last_name": "Marković",
  "email": "marko.markovic@banka.rs",
  "phone": "+381641234567",
  "address": "Knez Mihailova 10, Beograd",
  "username": "mmarkovic",
  "date_of_birth": 631152000,
  "gender": "MALE",
  "jmbg": "0101990710123",
  "position": "Analyst",
  "department": "Retail",
  "role": "EmployeeBasic",
  "active": true,
  "permissions": []
}
```

- [ ] **Step 3: Write `employee-admin-detail.json`**

```json
{
  "id": 10,
  "first_name": "Nikola",
  "last_name": "Nikolić",
  "email": "nikola.nikolic@banka.rs",
  "phone": "+381611111111",
  "address": "Terazije 1, Beograd",
  "username": "nnikolic",
  "date_of_birth": 599616000,
  "gender": "MALE",
  "jmbg": "1901989710005",
  "position": "Director",
  "department": "Management",
  "role": "EmployeeAdmin",
  "active": true,
  "permissions": [
    "employees.read", "employees.create", "employees.update",
    "accounts.read", "accounts.create", "accounts.update",
    "clients.read", "clients.create", "clients.update"
  ]
}
```

- [ ] **Step 4: Commit fixtures**

```bash
git add cypress/fixtures/employees-list.json cypress/fixtures/employee-detail.json cypress/fixtures/employee-admin-detail.json
git commit -m "test: add employee management fixtures for Cypress Scenarios 11–15"
```

---

## Chunk 2: Employee Management Tests (Scenarios 11–16)

### Task 2: Write `employee-management.cy.ts`

**Files:**
- Create: `cypress/e2e/employee-management.cy.ts`
- Reference: `cypress/fixtures/employees-list.json`
- Reference: `cypress/fixtures/employee-detail.json`
- Reference: `cypress/fixtures/employee-admin-detail.json`
- Reference: `src/pages/EmployeeListPage.tsx` (filter fields, table)
- Reference: `src/components/employees/EmployeeEditForm.tsx` (field ids, readOnly)
- Reference: `src/components/employees/PhoneInput.tsx` (two-part structure)
- Reference: `src/pages/EditEmployeePage.tsx` (title logic, isOtherAdmin)
- Reference: `src/components/shared/ProtectedRoute.tsx` (redirect chain)

- [ ] **Step 5: Write `employee-management.cy.ts`**

```typescript
describe('Celina 0.2: Upravljanje zaposlenima', () => {
  // Scenario 11: Admin vidi listu svih zaposlenih
  it('should display employee list with all columns (Scenario 11)', () => {
    cy.intercept('GET', '/api/employees*', { fixture: 'employees-list.json' }).as('getEmployees')

    cy.loginAsEmployee('/employees')
    cy.wait('@getEmployees')

    cy.contains('h1', 'Employees').should('be.visible')

    // Table headers
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')
    cy.contains('th', 'Position').should('be.visible')
    cy.contains('th', 'Phone').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')

    // Both employees shown with their data
    cy.contains('Marko Marković').should('be.visible')
    cy.contains('marko.markovic@banka.rs').should('be.visible')
    cy.contains('Ana Petrović').should('be.visible')

    // Status badge visible
    cy.contains('Active').should('be.visible')
  })

  // Scenario 12: Admin pretražuje zaposlene
  it('should filter employee list by name (Scenario 12)', () => {
    cy.intercept('GET', '/api/employees*', { fixture: 'employees-list.json' }).as('getEmployees')

    cy.loginAsEmployee('/employees')
    cy.wait('@getEmployees')

    // Register filtered intercept AFTER initial load
    cy.intercept('GET', '/api/employees*', (req) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('name')) {
        req.reply({
          body: {
            employees: [
              {
                id: 7,
                first_name: 'Marko',
                last_name: 'Marković',
                email: 'marko.markovic@banka.rs',
                phone: '+381641234567',
                address: 'Knez Mihailova 10, Beograd',
                username: 'mmarkovic',
                date_of_birth: 631152000,
                gender: 'MALE',
                jmbg: '0101990710123',
                position: 'Analyst',
                department: 'Retail',
                role: 'EmployeeBasic',
                active: true,
                permissions: [],
              },
            ],
            total_count: 1,
          },
        })
      }
    }).as('getFilteredEmployees')

    cy.get('input[placeholder="Name"]').type('Marko')
    cy.wait('@getFilteredEmployees')

    // Only Marko visible after filtering
    cy.contains('Marko Marković').should('be.visible')
    cy.contains('Ana Petrović').should('not.exist')
  })

  // Scenario 13: Admin menja podatke zaposlenog
  // Note: spec says "prikazuje potvrdu o uspešnoj izmeni" but EditEmployeePage has no
  // success message — it redirects to /employees on success (useMutationWithRedirect).
  it('should edit employee phone and department (Scenario 13)', () => {
    cy.intercept('GET', '/api/employees/7', { fixture: 'employee-detail.json' }).as('getEmployee')
    cy.intercept('PUT', '/api/employees/7', {
      statusCode: 200,
      body: {
        id: 7,
        first_name: 'Marko',
        last_name: 'Marković',
        email: 'marko.markovic@banka.rs',
        phone: '+381669999999',
        address: 'Knez Mihailova 10, Beograd',
        username: 'mmarkovic',
        date_of_birth: 631152000,
        gender: 'MALE',
        jmbg: '0101990710123',
        position: 'Analyst',
        department: 'Corporate',
        role: 'EmployeeBasic',
        active: true,
        permissions: [],
      },
    }).as('updateEmployee')

    cy.loginAsEmployee('/employees/7')
    cy.wait('@getEmployee')

    cy.contains('h1', 'Edit Employee').should('be.visible')

    // Disabled read-only fields are pre-filled
    cy.get('#first_name').should('have.value', 'Marko')
    cy.get('#email').should('have.value', 'marko.markovic@banka.rs')

    // Edit phone — PhoneInput splits into country-code Select + digit Input.
    // The digit input (placeholder="Phone number") holds only the digit portion.
    // employee.phone is "+381641234567" → parsePhone gives countryCode="+381", number="641234567"
    // To change to "+381669999999": clear and type only the digit portion "669999999"
    cy.get('input[placeholder="Phone number"]').clear().type('669999999')

    // Edit department
    cy.get('#department').clear().type('Corporate')

    // Submit
    cy.contains('button', 'Save').click()
    cy.wait('@updateEmployee')

    // Verify composed phone value in request body
    cy.get('@updateEmployee')
      .its('request.body')
      .should((body) => {
        expect(body.phone).to.equal('+381669999999')
        expect(body.department).to.equal('Corporate')
      })

    // Redirect to employee list (no success message — redirect is the confirmation)
    cy.url().should('include', '/employees')
    cy.url().should('not.include', '/employees/7')
  })

  // Scenario 14: Admin deaktivira zaposlenog
  // Note: spec says "klikne na opciju 'Deaktiviraj'" but there is no Deactivate button.
  // Deactivation is done by changing the Status Select from Active to Inactive and clicking Save.
  it('should deactivate employee by changing Status to Inactive (Scenario 14)', () => {
    cy.intercept('GET', '/api/employees/7', { fixture: 'employee-detail.json' }).as('getEmployee')
    cy.intercept('PUT', '/api/employees/7', {
      statusCode: 200,
      body: {
        id: 7,
        first_name: 'Marko',
        last_name: 'Marković',
        email: 'marko.markovic@banka.rs',
        phone: '+381641234567',
        address: 'Knez Mihailova 10, Beograd',
        username: 'mmarkovic',
        date_of_birth: 631152000,
        gender: 'MALE',
        jmbg: '0101990710123',
        position: 'Analyst',
        department: 'Retail',
        role: 'EmployeeBasic',
        active: false,
        permissions: [],
      },
    }).as('deactivateEmployee')

    cy.loginAsEmployee('/employees/7')
    cy.wait('@getEmployee')

    cy.contains('h1', 'Edit Employee').should('be.visible')

    // Change Status from Active to Inactive.
    // #status is on the <SelectTrigger> which renders as <button> — direct click works.
    cy.get('#status').click()
    cy.contains('[role="option"]', 'Inactive').click()

    cy.contains('button', 'Save').click()
    cy.wait('@deactivateEmployee')

    // Verify active: false in request body
    cy.get('@deactivateEmployee')
      .its('request.body')
      .should('have.property', 'active', false)

    // Redirect to employee list
    cy.url().should('include', '/employees')
    cy.url().should('not.include', '/employees/7')
  })

  // Scenario 15: Admin pokušava da izmeni drugog admina
  it('should show read-only view when admin tries to edit another admin (Scenario 15)', () => {
    // employee-auth.json JWT has user_id: 5
    // employee 10 has role: "EmployeeAdmin" and id: 10 ≠ 5
    // → isOtherAdmin = true → readOnly prop passed to EmployeeEditForm
    cy.intercept('GET', '/api/employees/10', {
      fixture: 'employee-admin-detail.json',
    }).as('getAdminEmployee')

    cy.loginAsEmployee('/employees/10')
    cy.wait('@getAdminEmployee')

    // Title is "Administrator Details", not "Edit Employee"
    cy.contains('h1', 'Administrator Details').should('be.visible')

    // Read-only notice displayed above the form
    cy.contains('View only — administrator profiles cannot be edited.').should('be.visible')

    // Save button is NOT rendered when readOnly
    cy.contains('button', 'Save').should('not.exist')

    // Inputs are disabled
    cy.get('#last_name').should('be.disabled')
    cy.get('#department').should('be.disabled')
  })
})

describe('Celina 0.2: Autorizacija i permisije', () => {
  // Scenario 16: Korisnik bez admin permisija pokušava pristup admin portalu
  // Note: spec says "Nemate dozvolu za pristup ovoj stranici" but ProtectedRoute
  // silently redirects with no message. Full chain:
  //   /employees → ProtectedRoute <Navigate to="/" /> (missing employees.read)
  //   /          → App.tsx path="*" → <Navigate to="/login" />
  //   /login     → LoginPage (authenticated client) → <Navigate to="/home" />
  // Final URL: /home
  it('should redirect client user to /home when accessing employee management (Scenario 16)', () => {
    // client-auth.json has permissions: [] — no employees.read
    cy.loginAsClient('/employees')

    // Full redirect chain ends at /home (client default page)
    cy.url().should('include', '/home')
  })
})
```

- [ ] **Step 6: Run Cypress for employee management tests**

```bash
npx cypress run --spec "cypress/e2e/employee-management.cy.ts"
```
Expected: 6 tests pass

- [ ] **Step 7: Run full suite to confirm no regressions**

```bash
npx cypress run
```
Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add cypress/e2e/employee-management.cy.ts
git commit -m "test: add Cypress Scenarios 11–16 — employee list, search, edit, deactivate, admin read-only, access denial"
```
