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
