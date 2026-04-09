describe('Portfolio Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me/portfolio?*', { fixture: 'portfolio-holdings.json' }).as(
      'getPortfolio'
    )
    cy.intercept('GET', '/api/me/portfolio/summary*', { fixture: 'portfolio-summary.json' }).as(
      'getSummary'
    )
  })

  it('should display portfolio summary card', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('h1', 'Portfolio').should('be.visible')

    // Summary card values
    cy.contains('Total Value').should('be.visible')
    cy.contains('35175.00').should('be.visible')
    cy.contains('Total Cost').should('be.visible')
    cy.contains('34250.00').should('be.visible')
    cy.contains('Profit/Loss').should('be.visible')
    cy.contains('925.00').should('be.visible')
    cy.contains('Holdings').should('be.visible')
    cy.contains('2').should('be.visible')
  })

  it('should display holdings table', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // Table headers
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Avg Price').should('be.visible')
    cy.contains('th', 'Current').should('be.visible')
    cy.contains('th', 'Public').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Holding data
    cy.contains('AAPL').should('be.visible')
    cy.contains('Apple Inc.').should('be.visible')
    cy.contains('stock').should('be.visible')

    cy.contains('ESM26').should('be.visible')
    cy.contains('E-mini S&P 500 Jun 2026').should('be.visible')
    cy.contains('futures').should('be.visible')

    cy.contains('2 holdings').should('be.visible')
  })

  it('should show Make Public button for non-public holdings', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // AAPL is not public, so Make Public button exists
    cy.contains('button', 'Make Public').should('be.visible')
  })

  it('should make a holding public', () => {
    cy.intercept('POST', '/api/me/portfolio/30/make-public', {
      statusCode: 200,
      body: { id: 30, is_public: true, public_quantity: 1 },
    }).as('makePublic')

    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Make Public').click()
    cy.wait('@makePublic')
  })

  it('should show empty state when no holdings', () => {
    cy.intercept('GET', '/api/me/portfolio?*', {
      body: { holdings: [], total_count: 0 },
    }).as('getEmptyPortfolio')

    cy.loginAsClient('/portfolio')
    cy.wait('@getEmptyPortfolio')

    cy.contains('No holdings found.').should('be.visible')
  })
})
