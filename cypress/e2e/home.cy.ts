describe('Home Page — Client Dashboard', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
    cy.intercept('GET', '/api/me/payments*', { fixture: 'home-payments.json' }).as('getPayments')
    cy.intercept('GET', '/api/me/payment-recipients*', {
      fixture: 'home-recipients.json',
    }).as('getRecipients')
  })

  it('should display welcome message and account cards', () => {
    cy.loginAsClient('/home')
    cy.wait('@getAccounts')

    cy.contains('h1', 'Welcome').should('be.visible')
    cy.contains('Your Accounts Overview').should('be.visible')
    cy.contains('h2', 'My Accounts').should('be.visible')

    // Account cards
    cy.contains('Moj tekući račun').should('be.visible')
    cy.contains('Devizni EUR').should('be.visible')
  })

  it('should show Quick Actions card with saved recipients', () => {
    cy.loginAsClient('/home')
    cy.wait('@getAccounts')
    cy.wait('@getRecipients')

    cy.contains('Quick Actions').should('be.visible')
    cy.contains('Saved Recipients').should('be.visible')
    cy.contains('Ana Petrović').should('be.visible')
    cy.contains('Jelena Marković').should('be.visible')
    cy.contains('Manage').should('be.visible')
  })

  it('should show Currency Exchange card', () => {
    cy.loginAsClient('/home')
    cy.wait('@getAccounts')

    cy.contains('Currency Exchange').should('be.visible')
    cy.contains('Quick Conversion').should('be.visible')
  })

  it('should show Recent Transactions when an account is selected', () => {
    cy.loginAsClient('/home')
    cy.wait('@getAccounts')
    cy.wait('@getPayments')

    // The first account is selected by default
    cy.contains('Recent Transactions').should('be.visible')
  })

  it('should show empty state when no accounts', () => {
    cy.intercept('GET', '/api/me/accounts*', { body: { accounts: [], total: 0 } }).as(
      'getEmptyAccounts'
    )
    cy.loginAsClient('/home')
    cy.wait('@getEmptyAccounts')

    cy.contains('You have no active accounts.').should('be.visible')
  })
})
