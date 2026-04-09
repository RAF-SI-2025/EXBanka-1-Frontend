describe('Admin Tax Management Page', () => {
  it('should display tax records table', () => {
    cy.intercept('GET', '/api/tax*', { fixture: 'tax-records.json' }).as('getTaxRecords')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('h1', 'Tax Management').should('be.visible')

    // Collect Taxes button
    cy.contains('button', 'Collect Taxes').should('be.visible')

    // Table headers
    cy.contains('th', 'User').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Taxable Amount').should('be.visible')
    cy.contains('th', 'Tax Amount').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')
    cy.contains('th', 'Date').should('be.visible')

    // Tax record data
    cy.contains('Marko Jovanović').should('be.visible')
    cy.contains('marko@example.com').should('be.visible')
    cy.contains('client').should('be.visible')
    cy.contains('925.00').should('be.visible')
    cy.contains('138.75').should('be.visible')

    cy.contains('Petar Nikolić').should('be.visible')
    cy.contains('petar@banka.rs').should('be.visible')
    cy.contains('actuary').should('be.visible')

    cy.contains('2 records').should('be.visible')
  })

  it('should trigger tax collection', () => {
    cy.intercept('GET', '/api/tax*', { fixture: 'tax-records.json' }).as('getTaxRecords')
    cy.intercept('POST', '/api/tax/collect', {
      statusCode: 200,
      body: { collected_count: 5, total_collected_rsd: '15000.00', failed_count: 0 },
    }).as('collectTaxes')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('button', 'Collect Taxes').click()
    cy.wait('@collectTaxes')
  })

  it('should show empty state when no tax records', () => {
    cy.intercept('GET', '/api/tax*', {
      body: { tax_records: [], total_count: 0 },
    }).as('getEmptyTax')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getEmptyTax')

    cy.contains('No tax records found.').should('be.visible')
  })
})
