describe('Internal Transfer Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
  })

  it('should display the transfer form with account selectors', () => {
    cy.loginAsClient('/payments/transfer')
    cy.wait('@getAccounts')

    cy.contains('Transfer Funds').should('be.visible')
    cy.contains('From Account').should('be.visible')
    cy.contains('To Account').should('be.visible')
    cy.contains('label', 'Amount').should('be.visible')
    cy.contains('button', 'Continue').should('be.visible')
  })

  it('should show description field', () => {
    cy.loginAsClient('/payments/transfer')
    cy.wait('@getAccounts')

    cy.contains('Description (optional)').should('be.visible')
    cy.get('#payment_purpose').should('be.visible')
  })

  it('should have amount input field', () => {
    cy.loginAsClient('/payments/transfer')
    cy.wait('@getAccounts')

    cy.get('#amount').should('be.visible')
  })
})
