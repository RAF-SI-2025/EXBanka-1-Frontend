# Cypress Recipient Tests (Celina 4: Primaoci plaćanja) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 21–23 (recipient management) from `docs/cypress-scenariji/Testovi-primaoci.md`, covering add, edit, and delete of payment recipients.

**Architecture:** Tests live in `cypress/e2e/recipients.cy.ts`. The recipients page is a simple CRUD view — no multi-step flow, no Redux. All state is managed via TanStack Query mutations that hit `/api/me/payment-recipients`. Tests stub API responses with `cy.intercept()`.

**Tech Stack:** Cypress 14+, TypeScript

---

## UI Reference (from source code)

**Page:** `PaymentRecipientsPage` at `/payments/recipients`
- Title: `<h1>Saved Recipients</h1>`
- Toggle button: "Add Recipient" (shows form) / "Cancel" (hides form)
- Form card title: "New Recipient" (creating) / "Edit Recipient" (editing)
- Empty state: "No saved recipients."

**Form fields (`RecipientForm`):**

| Field | Selector | Type |
|-------|----------|------|
| Recipient Name | `#recipient_name` | Input |
| Account Number | `#account_number` | Input |
| Submit (create) | `button` containing "Add" | Button |
| Submit (edit) | `button` containing "Save" | Button |
| Cancel | `button` containing "Cancel" (inside form) | Button |

**List (`RecipientList`):**
- Columns: Name, Account Number, Actions
- Row action buttons: "Edit" (outline), "Delete" (destructive)

**Delete dialog:**
- Title: "Delete Recipient?"
- Text: "Are you sure?"
- Buttons: "Cancel", "Delete" (destructive)

## API Endpoints (from `src/lib/api/payments.ts`)

| Action | Method | URL |
|--------|--------|-----|
| List recipients | GET | `/api/me/payment-recipients` |
| Create recipient | POST | `/api/me/payment-recipients` |
| Update recipient | PUT | `/api/me/payment-recipients/:id` |
| Delete recipient | DELETE | `/api/me/payment-recipients/:id` |

---

## Task 1: Create fixture and scaffold `recipients.cy.ts` with all 3 scenarios

**Files:**
- Create: `cypress/fixtures/recipients-list.json`
- Create: `cypress/e2e/recipients.cy.ts`
- Reference: `src/pages/PaymentRecipientsPage.tsx` (page structure, dialog)
- Reference: `src/components/payments/RecipientForm.tsx` (field IDs, button labels)
- Reference: `src/components/payments/RecipientList.tsx` (table, action buttons)

- [ ] **Step 1: Create `recipients-list.json` fixture**

Response from `GET /api/me/payment-recipients` — 2 existing recipients:

```json
{
  "recipients": [
    {
      "id": 1,
      "client_id": 42,
      "recipient_name": "Jelena Marković",
      "account_number": "265000000000000088",
      "created_at": "2026-02-10T12:00:00Z"
    },
    {
      "id": 2,
      "client_id": 42,
      "recipient_name": "Petar Nikolić",
      "account_number": "265000000000000077",
      "created_at": "2026-03-01T09:00:00Z"
    }
  ]
}
```

- [ ] **Step 2: Write the full test file**

```typescript
describe('Celina 4: Primaoci plaćanja — Upravljanje primaocima', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me/payment-recipients', {
      fixture: 'recipients-list.json',
    }).as('getRecipients')
    cy.intercept('GET', '/api/me', {
      body: {
        id: 42,
        first_name: 'Marko',
        last_name: 'Jovanović',
        email: 'marko@example.com',
      },
    }).as('getMe')
    cy.loginAsClient('/payments/recipients')
  })

  // Scenario 21: Dodavanje novog primaoca plaćanja
  it('should add a new payment recipient (Scenario 21)', () => {
    cy.intercept('POST', '/api/me/payment-recipients', {
      statusCode: 201,
      body: {
        id: 3,
        client_id: 42,
        recipient_name: 'Ana Petrović',
        account_number: '265000000000000099',
        created_at: '2026-03-26T10:00:00Z',
      },
    }).as('createRecipient')

    // After create, refetch returns updated list with 3 recipients
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Marković',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
          {
            id: 2,
            client_id: 42,
            recipient_name: 'Petar Nikolić',
            account_number: '265000000000000077',
            created_at: '2026-03-01T09:00:00Z',
          },
          {
            id: 3,
            client_id: 42,
            recipient_name: 'Ana Petrović',
            account_number: '265000000000000099',
            created_at: '2026-03-26T10:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    cy.wait('@getRecipients')

    // Verify page title and existing recipients
    cy.contains('h1', 'Saved Recipients').should('be.visible')
    cy.contains('Jelena Marković').should('be.visible')
    cy.contains('Petar Nikolić').should('be.visible')

    // Click "Add Recipient" to show form
    cy.contains('button', 'Add Recipient').click()
    cy.contains('New Recipient').should('be.visible')

    // Fill form
    cy.get('#recipient_name').type('Ana Petrović')
    cy.get('#account_number').type('265000000000000099')

    // Click "Add" submit button
    cy.contains('button', 'Add').click()
    cy.wait('@createRecipient')

    // Verify request body
    cy.get('@createRecipient')
      .its('request.body')
      .should((body) => {
        expect(body.recipient_name).to.equal('Ana Petrović')
        expect(body.account_number).to.equal('265000000000000099')
      })

    // After success, form hides and new recipient appears in list
    cy.wait('@getRecipientsUpdated')
    cy.contains('New Recipient').should('not.exist')
    cy.contains('Ana Petrović').should('be.visible')
  })

  // Scenario 22: Izmena podataka primaoca plaćanja
  it('should edit an existing recipient (Scenario 22)', () => {
    cy.intercept('PUT', '/api/me/payment-recipients/1', {
      statusCode: 200,
      body: {
        id: 1,
        client_id: 42,
        recipient_name: 'Jelena Nikolić',
        account_number: '265000000000000088',
        created_at: '2026-02-10T12:00:00Z',
      },
    }).as('updateRecipient')

    // After update, refetch returns updated data
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Nikolić',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
          {
            id: 2,
            client_id: 42,
            recipient_name: 'Petar Nikolić',
            account_number: '265000000000000077',
            created_at: '2026-03-01T09:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    cy.wait('@getRecipients')

    // Click "Edit" on the first recipient (Jelena Marković)
    cy.contains('tr', 'Jelena Marković').within(() => {
      cy.contains('button', 'Edit').click()
    })

    // Edit form appears with pre-filled values
    cy.contains('Edit Recipient').should('be.visible')
    cy.get('#recipient_name').should('have.value', 'Jelena Marković')
    cy.get('#account_number').should('have.value', '265000000000000088')

    // Change the name
    cy.get('#recipient_name').clear().type('Jelena Nikolić')

    // Click "Save" (editing mode)
    cy.contains('button', 'Save').click()
    cy.wait('@updateRecipient')

    // Verify request body
    cy.get('@updateRecipient')
      .its('request.body')
      .should((body) => {
        expect(body.recipient_name).to.equal('Jelena Nikolić')
        expect(body.account_number).to.equal('265000000000000088')
      })

    // After success, form hides and updated name appears
    cy.wait('@getRecipientsUpdated')
    cy.contains('Edit Recipient').should('not.exist')
    cy.contains('Jelena Nikolić').should('be.visible')
  })

  // Scenario 23: Brisanje primaoca plaćanja
  it('should delete a recipient with confirmation dialog (Scenario 23)', () => {
    cy.intercept('DELETE', '/api/me/payment-recipients/2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteRecipient')

    // After delete, refetch returns list without deleted recipient
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Marković',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    cy.wait('@getRecipients')

    // Both recipients visible
    cy.contains('Jelena Marković').should('be.visible')
    cy.contains('Petar Nikolić').should('be.visible')

    // Click "Delete" on Petar Nikolić
    cy.contains('tr', 'Petar Nikolić').within(() => {
      cy.contains('button', 'Delete').click()
    })

    // Confirmation dialog appears
    cy.contains('Delete Recipient?').should('be.visible')
    cy.contains('Are you sure?').should('be.visible')

    // Confirm deletion
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.wait('@deleteRecipient')

    // After deletion, recipient is removed from list
    cy.wait('@getRecipientsUpdated')
    cy.contains('Petar Nikolić').should('not.exist')
    cy.contains('Jelena Marković').should('be.visible')
  })
})
```

- [ ] **Step 3: Verify fixture**

Run:
```bash
node -e "require('./cypress/fixtures/recipients-list.json'); console.log('OK')"
```

- [ ] **Step 4: Run Cypress**

Run:
```bash
npx cypress run --spec "cypress/e2e/recipients.cy.ts"
```
Expected: 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add cypress/fixtures/recipients-list.json cypress/e2e/recipients.cy.ts
git commit -m "test: add Cypress Scenarios 21–23 — recipient CRUD"
```

---

## Summary

| Scenario | What it tests |
|----------|---------------|
| 21 | Add recipient: click "Add Recipient" → fill form → click "Add" → verify POST request + new entry in list |
| 22 | Edit recipient: click "Edit" → form pre-filled → change name → click "Save" → verify PUT request + updated name |
| 23 | Delete recipient: click "Delete" → confirmation dialog → confirm → verify DELETE request + removed from list |

**Total: 3 Cypress tests across 3 scenarios. 1 fixture file.**

**Key implementation detail:** The `RecipientForm` submit button text changes based on context: "Add" for new, "Save" for editing, "Saving..." while pending. The delete flow uses a Radix `Dialog` with confirmation. Scoping button clicks with `cy.contains('tr', 'Name').within(...)` prevents ambiguity when multiple rows have Edit/Delete buttons. The delete dialog button is scoped with `cy.get('[role="dialog"]').within(...)` to avoid clicking the table's Delete button again.
