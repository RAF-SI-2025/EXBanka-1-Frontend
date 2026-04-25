describe('Admin Tax Management Page', () => {
  it('should display tax records table', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/tax*', { fixture: 'tax-records.json' }).as('getTaxRecords')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('h1', 'Tax Management').should('be.visible')

    // Collect Taxes button
    cy.contains('button', 'Collect Taxes').should('be.visible')

    // Table headers (new format)
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Total Debt (RSD)').should('be.visible')
    cy.contains('th', 'Last Collection').should('be.visible')

    // Tax record data (new field names)
    cy.contains('Marko Jovanović').should('be.visible')
    cy.contains('138.75').should('be.visible')

    cy.contains('Petar Nikolić').should('be.visible')
    cy.contains('780.00').should('be.visible')

    cy.contains('2 records').should('be.visible')
  })

  it('should trigger tax collection', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/tax*', { fixture: 'tax-records.json' }).as('getTaxRecords')
    cy.intercept('POST', 'https://bytenity.com/api/v2/tax/collect', {
      statusCode: 200,
      body: { collected_count: 5, total_collected_rsd: '15000.00', failed_count: 0 },
    }).as('collectTaxes')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('button', 'Collect Taxes').click()
    cy.wait('@collectTaxes')
  })

  it('should show empty state when no tax records', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/tax*', {
      body: { tax_records: [], total_count: 0 },
    }).as('getEmptyTax')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getEmptyTax')

    cy.contains('No tax records found.').should('be.visible')
  })
})
