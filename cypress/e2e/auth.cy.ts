describe('Celina 0: Autentifikacija — Logovanje i reset lozinke', () => {
  // Scenario 1: Uspešno logovanje zaposlenog
  it('should log in an employee and redirect to admin dashboard (Scenario 1)', () => {
    cy.intercept('POST', 'https://bytenity.com/api/v1/auth/login', {
      statusCode: 200,
      fixture: 'employee-auth.json',
    }).as('login')

    // Intercept destination page requests to prevent errors after redirect
    cy.intercept('GET', 'https://bytenity.com/api/v2/accounts*', { body: { accounts: [], total: 0 } })
    cy.intercept('GET', 'https://bytenity.com/api/v1/clients*', { body: { clients: [], total: 0 } })

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
    cy.intercept('POST', 'https://bytenity.com/api/v1/auth/login', {
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
    cy.intercept('POST', 'https://bytenity.com/api/v1/auth/login', {
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
    cy.intercept('POST', 'https://bytenity.com/api/v1/auth/password/reset-request', {
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
