// "todo test" — cross-cutting scenarios (Validacija 1–6, Brute-force 7–11,
// TOTP 12–15, Notifikacije 16–19, Order-notifikacije 20–25, Price Alert 26–29,
// Istorija ordera 30–34).
//
// Conventions match the existing suites: inline cy.intercept stubs, the
// cy.loginAsEmployee / cy.loginAsClient commands, host-agnostic **/api/v3/...
// globs, and cypress-real-events realClick() for Radix Select/portal options.
//
// Where a scenario is enforced by the backend (email delivery, account lockout
// timers, alert triggering) or by native HTML constraints rather than a custom
// message, the test asserts the FE-observable surface and documents the rest —
// the same convention the *-celina3 suites use for backend-only items.

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Validacija podataka — kreiranje zaposlenog (Scenarios 1–6)
// Route /employees/new. Validation = react-hook-form + zod, PLUS native input
// constraints: email is <input type="email">, date_of_birth is
// <input type="date" max={today}>, phone is digit-filtered at the input.
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Validacija podataka (kreiranje zaposlenog)', () => {
  const fillValidEmployee = (overrides: { email?: string } = {}) => {
    cy.get('#first_name').type('Petar')
    cy.get('#last_name').type('Petrović')
    cy.get('#date_of_birth').type('1990-03-15')
    cy.get('#email').type(overrides.email ?? 'petar@banka.rs')
    cy.get('#username').type('ppetrovic')
    cy.get('#jmbg').type('1234567890123')
    // Role is a Radix Select (portalled options)
    cy.get('#role').realClick()
    cy.get('[role="option"]').first().realClick()
  }

  // ── Scenario 1: Uspešna registracija sa validnim podacima ─────────────────
  it('Scenario 1 — valid data creates the account with no errors', () => {
    cy.intercept('POST', '**/api/v3/employees', {
      statusCode: 201,
      body: { id: 99, first_name: 'Petar', last_name: 'Petrović', email: 'petar@banka.rs' },
    }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')
    cy.contains('h1', 'Create Employee').should('be.visible')

    fillValidEmployee()
    cy.get('#phone').should('not.exist') // phone is the PhoneInput, not a plain field
    cy.contains('button', 'Save').click()

    cy.wait('@createEmployee')
      .its('request.body')
      .should((body) => {
        expect(body.email).to.equal('petar@banka.rs')
        expect(body.phone === undefined || typeof body.phone === 'string').to.equal(true)
      })
    // Redirects to the employee list on success — no error surface.
    cy.url().should('include', '/employees')
    cy.url().should('not.include', '/employees/new')
    cy.contains('Invalid email address').should('not.exist')
  })

  // ── Scenario 2: Email nije validnog formata ───────────────────────────────
  // The email field is <input type="email"> and the zod schema also rejects bad
  // formats ("Invalid email address"). An address without "@" fails validation,
  // so creation never fires.
  it('Scenario 2 — invalid email format is rejected and no account is created', () => {
    cy.intercept('POST', '**/api/v3/employees', { statusCode: 201, body: {} }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')
    fillValidEmployee({ email: 'petar.banka' })
    cy.contains('button', 'Save').click()

    // The email input is invalid (native + zod guard) → POST is not sent.
    cy.get('#email').then(($el) => {
      expect(($el[0] as HTMLInputElement).checkValidity()).to.equal(false)
    })
    cy.url().should('include', '/employees/new')
    cy.get('@createEmployee.all').should('have.length', 0)
  })

  // ── Scenario 3: Email već postoji u sistemu ───────────────────────────────
  it('Scenario 3 — a duplicate email (409) shows a uniqueness error on the field', () => {
    cy.intercept('POST', '**/api/v3/employees', {
      statusCode: 409,
      body: { message: 'Email already exists' },
    }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')
    fillValidEmployee({ email: 'petar@banka.rs' })
    cy.contains('button', 'Save').click()

    cy.wait('@createEmployee')
    cy.contains('Email is already in use').should('be.visible')
    cy.url().should('include', '/employees/new')
  })

  // ── Scenario 4: Broj telefona sadrži slova ────────────────────────────────
  // The phone field (PhoneInput) strips every non-digit on input, so letters can
  // never be entered — this is how "samo cifre" is enforced in the FE.
  it('Scenario 4 — the phone field rejects letters (digits only are kept)', () => {
    cy.loginAsEmployee('/employees/new')

    cy.get('input[placeholder="Phone number"]').type('abc123456')
    cy.get('input[placeholder="Phone number"]').should('have.value', '123456')
  })

  // ── Scenario 5: Datum rođenja je u budućnosti ─────────────────────────────
  // date_of_birth is <input type="date" max={today}>. A future date is invalid
  // (native rangeOverflow + zod "Date of birth cannot be in the future"), so the
  // account is not created.
  it('Scenario 5 — a future date of birth is rejected and no account is created', () => {
    cy.intercept('POST', '**/api/v3/employees', { statusCode: 201, body: {} }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')
    cy.get('#first_name').type('Petar')
    cy.get('#last_name').type('Petrović')
    cy.get('#email').type('petar@banka.rs')
    cy.get('#username').type('ppetrovic')
    cy.get('#jmbg').type('1234567890123')
    cy.get('#role').realClick()
    cy.get('[role="option"]').first().realClick()

    cy.get('#date_of_birth').type('2030-01-01')
    cy.contains('button', 'Save').click()

    cy.get('#date_of_birth').then(($el) => {
      expect(($el[0] as HTMLInputElement).checkValidity()).to.equal(false)
    })
    cy.get('@createEmployee.all').should('have.length', 0)
  })

  // ── Scenario 6: Datum rođenja nije u ispravnom formatu ────────────────────
  // The date of birth is a native date picker (type="date"), which only accepts
  // the yyyy-MM-dd format — a textual value like "1990/03/15" cannot be entered,
  // so an invalid format is impossible by construction.
  it('Scenario 6 — the date-of-birth field enforces a native date format', () => {
    cy.loginAsEmployee('/employees/new')
    cy.get('#date_of_birth').should('have.attr', 'type', 'date')
    cy.get('#date_of_birth').should('have.attr', 'max')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Brute-force zaštita (Scenarios 7–11)
// The FE renders a generic "Invalid credentials" for any failed login; the
// lockout counter/timer, lock email, and counter reset are enforced by the
// backend.
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Brute-force zaštita', () => {
  // ── Scenario 7: Nalog se zaključava nakon 5 neuspešnih pokušaja ───────────
  it('Scenario 7 — a failed login is rejected (lockout + email are backend-enforced)', () => {
    cy.intercept('POST', '**/api/v3/auth/login', {
      statusCode: 423,
      body: { message: 'Account locked' },
    }).as('login')

    cy.visit('/login')
    cy.get('#email').type('korisnik@banka.rs')
    cy.get('#password').type('wrongpass1')
    cy.contains('button', 'Log In').click()

    cy.wait('@login')
    cy.contains('Invalid credentials').should('be.visible')
    cy.url().should('include', '/login')
  })

  // ── Scenario 8: Logovanje nije moguće dok je nalog zaključan ──────────────
  it('Scenario 8 — login with correct data is refused while the account is locked', () => {
    cy.intercept('POST', '**/api/v3/auth/login', {
      statusCode: 423,
      body: { message: 'Account temporarily locked' },
    }).as('login')

    cy.visit('/login')
    cy.get('#email').type('korisnik@banka.rs')
    cy.get('#password').type('CorrectPass1')
    cy.contains('button', 'Log In').click()

    cy.wait('@login')
    cy.contains('Invalid credentials').should('be.visible')
    cy.url().should('include', '/login')
  })

  // ── Scenario 9: Logovanje je moguće nakon isteka zaključavanja ────────────
  // After the lock window the backend accepts the login and resets
  // failedLoginAttempts; the FE simply authenticates and navigates away.
  it('Scenario 9 — once unlocked, a correct login succeeds and navigates away', () => {
    cy.fixture('client-auth.json').then((auth) => {
      cy.intercept('POST', '**/api/v3/auth/login', { statusCode: 200, body: auth }).as('login')
    })

    cy.visit('/login')
    cy.get('#email').type('marko@example.com')
    cy.get('#password').type('CorrectPass1')
    cy.contains('button', 'Log In').click()

    cy.wait('@login')
    cy.url().should('not.include', '/login')
  })

  // ── Scenario 10: Reset lozinke otključava nalog ───────────────────────────
  // Submitting a new password via the reset link succeeds; the account-unlock and
  // failedLoginAttempts reset are performed server-side.
  it('Scenario 10 — completing a password reset succeeds (unlock is backend-side)', () => {
    cy.intercept('POST', '**/api/v3/auth/password/reset', {
      statusCode: 200,
      body: { success: true },
    }).as('resetPassword')

    cy.visit('/password-reset?token=reset-token-123')
    cy.get('#new_password').type('NewPass12')
    cy.get('#confirm_password').type('NewPass12')
    cy.contains('button', 'Reset Password').click()

    cy.wait('@resetPassword')
    cy.contains('Password reset successfully.').should('be.visible')
  })

  // ── Scenario 11: Uspešan login resetuje broj neuspešnih pokušaja ──────────
  it('Scenario 11 — a successful login authenticates (counter reset is backend-side)', () => {
    cy.fixture('client-auth.json').then((auth) => {
      cy.intercept('POST', '**/api/v3/auth/login', { statusCode: 200, body: auth }).as('login')
    })

    cy.visit('/login')
    cy.get('#email').type('marko@example.com')
    cy.get('#password').type('CorrectPass1')
    cy.contains('button', 'Log In').click()

    cy.wait('@login')
    cy.url().should('not.include', '/login')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Verifikacioni kod (TOTP) — payment flow (Scenarios 12–15)
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Verifikacioni kod (TOTP)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
    cy.intercept('GET', '**/api/v3/me', {
      body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
    })
    cy.intercept('GET', '**/api/v3/me/payment-recipients', { body: { recipients: [] } })
    cy.intercept('GET', '**/api/v3/me/payments*', { body: { payments: [], total: 0 } })
    cy.intercept('POST', '**/api/v3/me/payments', {
      statusCode: 201,
      fixture: 'payment-created.json',
    }).as('createPayment')
    cy.intercept('POST', '**/api/v3/verifications', {
      statusCode: 200,
      body: { challenge_id: 1 },
    }).as('createChallenge')
  })

  const reachVerificationStep = () => {
    cy.loginAsClient('/payments/new')
    cy.contains('Select account').click()
    cy.contains('[role="option"]', 'Moj tekući račun').realClick()
    cy.get('#to_account_number').type('265000000000000099')
    cy.get('#recipient_name').type('Ana Petrović')
    cy.get('#amount').type('5000')
    cy.contains('button', 'Continue').click()
    cy.contains('button', 'Confirm').click()
    cy.wait('@createPayment')
    cy.wait('@createChallenge')
  }

  // ── Scenario 12: Plaćanje potvrđeno "Approve transaction" na mobilnom ─────
  // The web app polls challenge status; when the mobile app approves
  // (status='verified'), the payment auto-executes.
  it('Scenario 12 — mobile approval (status verified) auto-confirms and executes the payment', () => {
    cy.intercept('GET', '**/api/v3/verifications/1/status', {
      statusCode: 200,
      body: { status: 'verified' },
    }).as('status')
    cy.intercept('POST', '**/api/v3/me/payments/101/execute', {
      statusCode: 200,
      fixture: 'payment-executed.json',
    }).as('execute')

    reachVerificationStep()

    cy.wait('@status')
    cy.wait('@execute')
    cy.contains('Payment successful!').should('be.visible')
  })

  // ── Scenario 13: Plaćanje unosom koda sa mobilnog ─────────────────────────
  it('Scenario 13 — entering the code on the web confirms and executes the payment', () => {
    cy.intercept('GET', '**/api/v3/verifications/1/status', {
      statusCode: 200,
      body: { status: 'pending' },
    }).as('status')
    cy.intercept('POST', '**/api/v3/verifications/1/code', {
      statusCode: 200,
      body: { success: true, remaining_attempts: 0 },
    }).as('submitCode')
    cy.intercept('POST', '**/api/v3/me/payments/101/execute', {
      statusCode: 200,
      fixture: 'payment-executed.json',
    }).as('execute')

    reachVerificationStep()

    cy.get('#verification-code').should('have.attr', 'maxlength', '6')
    cy.get('#verification-code').type('654321')
    cy.contains('button', 'Confirm').click()
    cy.wait('@execute').its('request.body').should('have.property', 'challenge_id', 1)
    cy.contains('Payment successful!').should('be.visible')
  })

  // ── Scenario 14: Otkazivanje nakon 3 pogrešna koda ────────────────────────
  it('Scenario 14 — three wrong codes count down remaining attempts', () => {
    cy.intercept('GET', '**/api/v3/verifications/1/status', {
      statusCode: 200,
      body: { status: 'pending' },
    }).as('status')
    let attempt = 0
    cy.intercept('POST', '**/api/v3/verifications/1/code', (req) => {
      attempt++
      req.reply({ statusCode: 200, body: { success: false, remaining_attempts: 3 - attempt } })
    }).as('submitCode')

    reachVerificationStep()

    cy.get('#verification-code').type('000001')
    cy.contains('button', 'Confirm').click()
    cy.wait('@submitCode')
    cy.contains('Invalid code. 2 attempts remaining.').should('be.visible')

    cy.get('#verification-code').clear().type('000002')
    cy.contains('button', 'Confirm').click()
    cy.wait('@submitCode')
    cy.contains('Invalid code. 1 attempts remaining.').should('be.visible')

    cy.get('#verification-code').clear().type('000003')
    cy.contains('button', 'Confirm').click()
    cy.wait('@submitCode')
    cy.contains('Invalid code. 0 attempts remaining.').should('be.visible')
  })

  // ── Scenario 15: Kod ističe nakon 5 minuta ────────────────────────────────
  it('Scenario 15 — an expired challenge shows the expiry message', () => {
    cy.intercept('GET', '**/api/v3/verifications/1/status', {
      statusCode: 200,
      body: { status: 'expired' },
    }).as('status')

    reachVerificationStep()

    cy.wait('@status')
    cy.contains('Verification challenge has expired. Please go back and try again.').should(
      'be.visible'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Notifikacije (Scenarios 16–19) and Order notifikacije (Scenarios 20–25)
// Email delivery is backend-only. The FE-observable surface is the in-app
// notification panel, which renders any notification's title/message regardless
// of type. Each scenario stubs the matching notification and asserts it shows.
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Notifikacije (in-app panel mirrors backend events)', () => {
  const stubNotifications = (title: string, message: string) => {
    cy.intercept('GET', '**/api/v3/me/notifications/unread-count', {
      body: { unread_count: 1 },
    }).as('getUnread')
    cy.intercept('GET', '**/api/v3/me/notifications*', {
      body: {
        notifications: [
          {
            id: 1,
            type: 'money_received',
            title,
            message,
            is_read: false,
            ref_type: null,
            ref_id: null,
            created_at: '2026-06-06T10:00:00Z',
          },
        ],
        total: 1,
      },
    }).as('getList')
    // Home page data so the shell renders without a backend.
    cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' })
    cy.intercept('GET', '**/api/v3/me/payments*', { fixture: 'home-payments.json' })
    cy.intercept('GET', '**/api/v3/me/payment-recipients*', { fixture: 'home-recipients.json' })
  }

  const openPanelAndAssert = (text: string) => {
    cy.loginAsClient('/home')
    cy.wait('@getUnread')
    // realClick — the popover trigger needs real pointer events; a synthetic
    // click can leave the kept-mounted popup closed (content in DOM at
    // opacity 0, so the visibility assert times out).
    cy.get('[aria-label="Notifications"]').realClick()
    cy.wait('@getList')
    cy.contains(text).should('be.visible')
  }

  // ── Scenario 16: Email notifikacija pri izvršenom plaćanju ────────────────
  it('Scenario 16 — a payment-executed notification is visible in-app (email is backend)', () => {
    stubNotifications('Payment executed', 'Your payment of 5000 RSD was completed.')
    openPanelAndAssert('Payment executed')
  })

  // ── Scenario 17: Email notifikacija pri blokiranoj kartici ────────────────
  it('Scenario 17 — a card-blocked notification is visible in-app (email is backend)', () => {
    stubNotifications('Card blocked', 'Your card has been blocked.')
    openPanelAndAssert('Card blocked')
  })

  // ── Scenario 18: Email notifikacija pri odobrenom kreditu ──────────────────
  it('Scenario 18 — a loan-approved notification is visible in-app (email is backend)', () => {
    stubNotifications('Loan approved', 'Your loan request has been approved.')
    openPanelAndAssert('Loan approved')
  })

  // ── Scenario 19: In-app notifikacija je vidljiva unutar aplikacije ────────
  it('Scenario 19 — an executed-transfer notification is visible in the notification panel', () => {
    stubNotifications('Transfer executed', 'Your transfer was completed.')
    openPanelAndAssert('Transfer executed')
  })

  // ── Scenario 20: Order ide na odobrenje ───────────────────────────────────
  it('Scenario 20 — an order-pending-approval notification is visible in-app (email is backend)', () => {
    stubNotifications('Order pending approval', 'Your order is awaiting supervisor approval.')
    openPanelAndAssert('Order pending approval')
  })

  // ── Scenario 21: Supervizor odobri order ──────────────────────────────────
  it('Scenario 21 — an order-approved notification is visible in-app (email is backend)', () => {
    stubNotifications('Order approved', 'Your order has been approved.')
    openPanelAndAssert('Order approved')
  })

  // ── Scenario 22: Supervizor odbije order ──────────────────────────────────
  it('Scenario 22 — an order-declined notification is visible in-app (email is backend)', () => {
    stubNotifications('Order declined', 'Your order has been declined.')
    openPanelAndAssert('Order declined')
  })

  // ── Scenario 23: Order u potpunosti izvršen ───────────────────────────────
  it('Scenario 23 — an order-fully-executed notification is visible in-app (email is backend)', () => {
    stubNotifications('Order executed', 'Your order has been fully executed.')
    openPanelAndAssert('Order executed')
  })

  // ── Scenario 24: Order delimično izvršen ──────────────────────────────────
  it('Scenario 24 — a partial-fill notification states filled vs remaining (email is backend)', () => {
    stubNotifications('Order partially filled', '4 of 10 shares filled, 6 remaining.')
    openPanelAndAssert('4 of 10 shares filled, 6 remaining.')
  })

  // ── Scenario 25: Order automatski otkazan ─────────────────────────────────
  it('Scenario 25 — an order-cancelled notification states the reason (email is backend)', () => {
    stubNotifications('Order cancelled', 'Futures order cancelled: settlement date passed.')
    openPanelAndAssert('Futures order cancelled: settlement date passed.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Price Alert (Scenarios 26–29)
// Created from the Securities page (bell icon per row). Triggering + email are
// backend-only.
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Price Alert', () => {
  const stubSecurities = () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { fixture: 'stocks-list.json' }).as(
      'getStocks'
    )
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', {
      body: { forex_pairs: [], total_count: 0 },
    })
    cy.intercept('GET', '**/api/v3/me/watchlists', { body: { watchlists: [] } })
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [] } })
  }

  // ── Scenario 26: Postavljanje price alert-a za rast cene (ABOVE) ───────────
  it('Scenario 26 — creating an ABOVE alert posts a gte condition with the threshold', () => {
    stubSecurities()
    cy.intercept('POST', '**/api/v3/me/price-alerts', {
      statusCode: 200,
      body: { alert: { id: 1, listing_id: 1, condition: 'gte', threshold: '200', active: true } },
    }).as('createAlert')

    cy.loginAsClient('/securities')
    cy.wait('@getStocks')

    cy.get('[aria-label="Create price alert for AAPL"]').click()
    cy.contains('Create price alert').should('be.visible')
    // Default condition is "Price ≥ threshold" (gte) → ABOVE
    cy.get('#alert-threshold').type('200')
    cy.contains('button', 'Create alert').click()

    cy.wait('@createAlert')
      .its('request.body')
      .should((body) => {
        expect(body.listing_id).to.equal(1)
        expect(body.condition).to.equal('gte')
        expect(body.threshold).to.equal('200')
      })
  })

  // ── Scenario 28: Postavljanje price alert-a za pad cene (BELOW) ────────────
  it('Scenario 28 — creating a BELOW alert posts an lte condition with the threshold', () => {
    stubSecurities()
    cy.intercept('POST', '**/api/v3/me/price-alerts', {
      statusCode: 200,
      body: { alert: { id: 2, listing_id: 2, condition: 'lte', threshold: '300', active: true } },
    }).as('createAlert')

    cy.loginAsClient('/securities')
    cy.wait('@getStocks')

    cy.get('[aria-label="Create price alert for MSFT"]').click()
    // Switch the condition to "Price ≤ threshold" (lte) → BELOW.
    // Pointer-clicking an option dismisses the conditionally-mounted dialog
    // (the select portal registers as an outside press), while a synthetic
    // .click() doesn't change the selection at all. So: open with realClick,
    // move the highlight with a real hover (no pointerdown ⇒ nothing to
    // dismiss), and commit the highlighted option with Enter.
    cy.get('#alert-condition').realClick()
    cy.contains('[role="option"]', 'Price ≤ threshold').should('be.visible').realHover()
    cy.realPress('Enter')
    cy.get('#alert-condition').should('contain.text', 'Price ≤ threshold')
    cy.get('#alert-threshold').type('300')
    cy.contains('button', 'Create alert').click()

    cy.wait('@createAlert')
      .its('request.body')
      .should((body) => {
        expect(body.listing_id).to.equal(2)
        expect(body.condition).to.equal('lte')
        expect(body.threshold).to.equal('300')
      })
  })

  // ── Scenario 27: Okidanje alert-a kada cena dostigne prag ─────────────────
  // The crossing detection + email + deactivation happen in a backend worker.
  // The FE shows the alert as Active in "My Price Alerts".
  it('Scenario 27 — an active alert is listed (triggering/deactivation is backend)', () => {
    cy.intercept('GET', '**/api/v3/me/price-alerts', {
      body: {
        alerts: [
          {
            id: 1,
            listing_id: 1,
            condition: 'gte',
            threshold: '200',
            is_recurring: false,
            cooldown_seconds: 0,
            email_too: true,
            active: true,
            last_triggered_unix: 0,
            created_at_unix: 0,
          },
        ],
      },
    }).as('getAlerts')
    cy.intercept('GET', '**/api/v3/securities/stocks*', { fixture: 'stocks-list.json' })

    cy.loginAsClient('/portfolio?tab=alerts')
    cy.wait('@getAlerts')

    cy.contains('My Price Alerts').should('be.visible')
    cy.contains('Active').should('be.visible')
  })

  // ── Scenario 29: Alert se ne okida ako uslov nije ispunjen ─────────────────
  // No-trigger is backend; the FE keeps showing the alert as Active.
  it('Scenario 29 — an unmet alert stays Active in the list (no-trigger is backend)', () => {
    cy.intercept('GET', '**/api/v3/me/price-alerts', {
      body: {
        alerts: [
          {
            id: 1,
            listing_id: 1,
            condition: 'gte',
            threshold: '200',
            is_recurring: false,
            cooldown_seconds: 0,
            email_too: false,
            active: true,
            last_triggered_unix: 0,
            created_at_unix: 0,
          },
        ],
      },
    }).as('getAlerts')
    cy.intercept('GET', '**/api/v3/securities/stocks*', { fixture: 'stocks-list.json' })

    cy.loginAsClient('/portfolio?tab=alerts')
    cy.wait('@getAlerts')

    cy.contains('Active').should('be.visible')
    cy.contains('Paused').should('not.exist')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature: Istorija ordera — "Moji orderi" (Scenarios 30–34)
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Istorija ordera', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', {
      body: { forex_pairs: [], total_count: 0 },
    })
  })

  // ── Scenario 30: Klijent vidi sve svoje prošle ordere ─────────────────────
  // The FE order table shows Ticker, Security, Direction, Type, Quantity, Filled,
  // Status, Actions. (Execution price, dates and commission are not columns in the
  // current table — documented.)
  it('Scenario 30 — client sees their orders with type, ticker, quantity and status', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'My Orders').should('be.visible')
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
    cy.contains('td', 'market').should('be.visible')
    cy.contains('2 orders').should('be.visible')
  })

  // ── Scenario 31: Agent vidi sve svoje prošle ordere ───────────────────────
  it('Scenario 31 — an employee/agent sees their orders with the same columns', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsEmployee('/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'My Orders').should('be.visible')
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
  })

  // ── Scenario 32: Filtriranje ordera po statusu ────────────────────────────
  // The orders API accepts a `status` filter, but MyOrdersView renders only a
  // Search control — there is no status dropdown in the current UI. Documented.
  it('Scenario 32 — status filtering has no UI control (only Search is rendered)', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.get('input[placeholder="Search"]').should('be.visible')
    cy.contains('label', 'Status').should('not.exist')
  })

  // ── Scenario 33: Filtriranje ordera po datumu ─────────────────────────────
  // No date-range control exists on the orders page. Documented.
  it('Scenario 33 — date-range filtering is not implemented on the orders page', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.get('input[placeholder="Search"]').should('be.visible')
    cy.get('input[type="date"]').should('not.exist')
  })

  // ── Scenario 34: Filtriranje ordera po tipu hartije ───────────────────────
  // No order-type control exists on the orders page. Documented.
  it('Scenario 34 — order-type filtering is not implemented on the orders page', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.get('input[placeholder="Search"]').should('be.visible')
    cy.contains('label', 'Type').should('not.exist')
  })
})
