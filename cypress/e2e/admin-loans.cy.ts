describe('Admin Loans Page', () => {
  it('should display loans table with all columns', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v1/loans*', { fixture: 'admin-loans-list.json' }).as('getLoans')

    cy.loginAsEmployee('/admin/loans')
    cy.wait('@getLoans')

    cy.contains('h1', 'All Loans').should('be.visible')

    // Table headers
    cy.contains('th', 'Loan Number').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Interest Type').should('be.visible')
    cy.contains('th', 'Amount').should('be.visible')
    cy.contains('th', 'Period').should('be.visible')
    cy.contains('th', 'Installment').should('be.visible')
    cy.contains('th', 'Remaining Debt').should('be.visible')
    cy.contains('th', 'Currency').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')

    // Loan data
    cy.contains('LN-2026-001').should('be.visible')
    cy.contains('LN-2026-002').should('be.visible')
    cy.contains('LN-2026-003').should('be.visible')

    // Status badges
    cy.contains('Active').should('be.visible')
    cy.contains('Paid Off').should('be.visible')
  })

  it('should show empty state when no loans', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v1/loans*', { body: { loans: [], total: 0 } }).as('getEmptyLoans')

    cy.loginAsEmployee('/admin/loans')
    cy.wait('@getEmptyLoans')

    cy.contains('No loans.').should('be.visible')
  })

  it('should show interest type labels correctly', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v1/loans*', { fixture: 'admin-loans-list.json' }).as('getLoans')

    cy.loginAsEmployee('/admin/loans')
    cy.wait('@getLoans')

    cy.contains('Fixed').should('be.visible')
    cy.contains('Variable').should('be.visible')
  })
})
