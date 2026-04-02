# Cypress Authentication Tests (Celina 0) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cypress E2E tests for Scenarios 1–4 from `docs/cypress-scenariji/Testovi-autentifikacija.md`: successful employee login (1), failed login wrong password (2), failed login non-existent user (3), and password reset request (4). Scenario 5 (account lockout) has no frontend UI and is untestable in E2E.

**Architecture:** All tests in a single file `cypress/e2e/auth.cy.ts`. No new fixtures needed — reuses existing `employee-auth.json` as the login API response. Tests interact with the actual login and password-reset forms (no `cy.loginAsEmployee`/`cy.loginAsClient` bypass).

**Tech Stack:** Cypress 14+, TypeScript

---

## Scope Assessment

| Scenario | Testable? | Notes |
|----------|-----------|-------|
| 1 | Yes | Employee logs in successfully → redirect to `/admin/accounts` |
| 2 | Yes | Wrong password → "Invalid credentials" error shown |
| 3 | Yes | Non-existent user → "Invalid credentials" error shown |
| 4 | Yes | Password reset request → success message shown |
| 5 | **No** | No lockout UI implemented in frontend |

> **Scenario 5** describes account lockout after 5 failed attempts. The frontend has no UI for displaying lockout status or lockout timers — this requires backend integration testing, not Cypress E2E.

> **Note on error messages:** The scenario spec uses Serbian error messages ("Neispravni unos", "Korisnik ne postoji") but the actual `authSlice.ts` always shows `"Invalid credentials"` in English for any login failure (line 57 — the `catch` block discards the API error). Tests verify the actual implementation behavior.

---

## UI Reference

**LoginPage** (`/login` — public):
- Card title: `"Log In"` (via `AuthFormCard`)
- Form fields: `#email` (type email), `#password` (type password)
- Submit button: `"Log In"` / `"Logging in..."`
- Error display: red `text-destructive` div above the form (from `AuthFormCard`)
- Link: `"Forgot password?"` → navigates to `/password-reset-request`
- Client-side validation: email must be valid (`"Invalid email address"`), password required (`"Password is required"`)
- Redirect on success: client → `/home`, employee → `/admin/accounts` (based on JWT `system_type`)

**PasswordResetRequestPage** (`/password-reset-request` — public):
- Card title: `"Reset Password"`
- Form field: `#email` (type text)
- Submit button: `"Send Reset Link"` / `"Sending..."`
- Success: card flips to `"Reset link has been sent to your email."` + `"Back to login"` link
- Error: `"Something went wrong. Please try again."`
- Link: `"Back to login"` → `/login`

## API Endpoints

| Action | Method | URL | Request Body |
|--------|--------|-----|--------------|
| Login | POST | `/api/auth/login` | `{ email, password }` |
| Password reset request | POST | `/api/auth/password/reset-request` | `{ email }` |

## Auth Flow Details

1. `LoginPage` dispatches `loginThunk(credentials)` on form submit
2. `loginThunk` calls `POST /api/auth/login` → receives `{ access_token, refresh_token }`
3. JWT is decoded to extract `{ user_id, email, role, permissions, system_type }`
4. Tokens stored in `sessionStorage` (`access_token`, `refresh_token`)
5. Redux auth state set to `status: 'authenticated'`, `userType` from JWT
6. `LoginPage` detects `isAuthenticated` → renders `<Navigate to="/admin/accounts" />` or `"/home"` based on `userType`

On failure: `loginThunk` `rejectWithValue('Invalid credentials')` → Redux `status: 'error'`, `error: 'Invalid credentials'` → `LoginForm` renders error via `AuthFormCard`

---

## Task 1: Write `auth.cy.ts` with Scenarios 1–4

**Files:**
- Create: `cypress/e2e/auth.cy.ts`
- Reference: `cypress/fixtures/employee-auth.json` (reused as login response)
- Reference: `src/pages/LoginPage.tsx` (redirect logic)
- Reference: `src/components/auth/LoginForm.tsx` (form fields, submit, error display)
- Reference: `src/components/auth/PasswordResetRequestForm.tsx` (reset form)
- Reference: `src/store/slices/authSlice.ts` (loginThunk, error handling)

**No new fixtures required.** The `employee-auth.json` fixture has the same `{ access_token, refresh_token }` shape as the `POST /api/auth/login` response.

- [ ] **Step 1: Write `auth.cy.ts`**

```typescript
describe('Celina 0: Autentifikacija — Logovanje i reset lozinke', () => {
  // Scenario 1: Uspešno logovanje zaposlenog
  it('should log in an employee and redirect to admin dashboard (Scenario 1)', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      fixture: 'employee-auth.json',
    }).as('login')

    // Intercept destination page requests to prevent errors after redirect
    cy.intercept('GET', '/api/accounts?*', { body: { accounts: [], total: 0 } }).as('getAccounts')
    cy.intercept('GET', '/api/clients', { body: { clients: [], total: 0 } }).as('getClients')

    cy.visit('/login')
    cy.contains('Log In').should('be.visible')

    // Fill login form
    cy.get('#email').type('marko@banka.rs')
    cy.get('#password').type('marko123')

    // Submit
    cy.contains('button', 'Log In').click()
    cy.wait('@login')

    // Verify request body
    cy.get('@login')
      .its('request.body')
      .should((body) => {
        expect(body.email).to.equal('marko@banka.rs')
        expect(body.password).to.equal('marko123')
      })

    // Verify redirect to admin dashboard (employee system_type in JWT)
    cy.url().should('include', '/admin/accounts')
  })

  // Scenario 2: Neuspešno logovanje zbog pogrešne lozinke
  it('should show error on wrong password (Scenario 2)', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('login')

    cy.visit('/login')

    cy.get('#email').type('luka@banka.rs')
    cy.get('#password').type('pogresna123')

    cy.contains('button', 'Log In').click()
    cy.wait('@login')

    // Error message displayed (authSlice always shows "Invalid credentials")
    cy.contains('Invalid credentials').should('be.visible')

    // Should remain on login page
    cy.url().should('include', '/login')
  })

  // Scenario 3: Neuspešno logovanje zbog nepostojećeg korisnika
  it('should show error for non-existent user (Scenario 3)', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 404,
      body: { message: 'User not found' },
    }).as('login')

    cy.visit('/login')

    cy.get('#email').type('nepostojeci@banka.rs')
    cy.get('#password').type('Sifra123')

    cy.contains('button', 'Log In').click()
    cy.wait('@login')

    // Same error message regardless of failure reason (security best practice)
    cy.contains('Invalid credentials').should('be.visible')

    // Should remain on login page
    cy.url().should('include', '/login')
  })

  // Scenario 4: Reset lozinke putem email-a
  it('should send password reset email (Scenario 4)', () => {
    cy.intercept('POST', '/api/auth/password/reset-request', {
      statusCode: 200,
      body: {},
    }).as('resetRequest')

    cy.visit('/login')

    // Click "Forgot password?" link from login page
    cy.contains('Forgot password?').click()
    cy.url().should('include', '/password-reset-request')

    cy.contains('Reset Password').should('be.visible')

    // Enter email
    cy.get('#email').type('zaposleni@banka.rs')

    // Submit
    cy.contains('button', 'Send Reset Link').click()
    cy.wait('@resetRequest')

    // Verify request body
    cy.get('@resetRequest')
      .its('request.body')
      .should('have.property', 'email', 'zaposleni@banka.rs')

    // Success message shown
    cy.contains('Reset link has been sent to your email.').should('be.visible')

    // "Back to login" link available
    cy.contains('Back to login').should('be.visible')
  })
})
```

- [ ] **Step 2: Run Cypress**

```bash
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/auth.cy.ts
git commit -m "test: add Cypress Scenarios 1–4 — authentication and password reset"
```

---

## Summary

| Task | Scenario(s) | File | What it tests |
|------|-------------|------|---------------|
| 1 | 1, 2, 3, 4 | `auth.cy.ts` | Login success + redirect, login failures (wrong password, non-existent user), password reset request |

**Total: 4 Cypress tests across 4 testable scenarios. 0 new fixture files.**

**Untestable scenarios:**
- **Scenario 5:** Account lockout after multiple failed attempts — no frontend UI implemented for lockout state
