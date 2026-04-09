describe('Securities Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/securities/stocks*', { fixture: 'stocks-list.json' }).as('getStocks')
    cy.intercept('GET', '/api/securities/futures*', { fixture: 'futures-list.json' }).as(
      'getFutures'
    )
    cy.intercept('GET', '/api/securities/forex*', { fixture: 'forex-list.json' }).as('getForex')
  })

  it('should display the securities page with stocks tab by default', () => {
    cy.loginAsEmployee('/securities')
    cy.wait('@getStocks')

    cy.contains('h1', 'Securities').should('be.visible')

    // Tab list
    cy.contains('button', 'Stocks').should('be.visible')
    cy.contains('button', 'Futures').should('be.visible')

    // Stock table headers
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Price').should('be.visible')
    cy.contains('th', 'Change').should('be.visible')
    cy.contains('th', 'Volume').should('be.visible')
    cy.contains('th', 'Exchange').should('be.visible')

    // Stock data
    cy.contains('AAPL').should('be.visible')
    cy.contains('Apple Inc.').should('be.visible')
    cy.contains('MSFT').should('be.visible')
    cy.contains('Microsoft Corp').should('be.visible')
    cy.contains('2 stocks').should('be.visible')
  })

  it('should switch to futures tab', () => {
    cy.loginAsEmployee('/securities')
    cy.wait('@getStocks')

    cy.contains('button', 'Futures').click()
    cy.wait('@getFutures')

    cy.contains('ESM26').should('be.visible')
    cy.contains('E-mini S&P 500 Jun 2026').should('be.visible')
    cy.contains('1 futures').should('be.visible')
  })

  it('should show forex tab for employee users', () => {
    cy.loginAsEmployee('/securities')
    cy.wait('@getStocks')

    cy.contains('button', 'Forex').should('be.visible')
    cy.contains('button', 'Forex').click()
    cy.wait('@getForex')

    cy.contains('EUR/USD').should('be.visible')
    cy.contains('Euro / US Dollar').should('be.visible')
    cy.contains('1 forex pairs').should('be.visible')
  })

  it('should show empty state for stocks', () => {
    cy.intercept('GET', '/api/securities/stocks*', {
      body: { stocks: [], total_count: 0 },
    }).as('getEmptyStocks')

    cy.loginAsEmployee('/securities')
    cy.wait('@getEmptyStocks')

    cy.contains('No stocks found.').should('be.visible')
  })

  it('should have Buy buttons on stock rows', () => {
    cy.loginAsEmployee('/securities')
    cy.wait('@getStocks')

    cy.contains('button', 'Buy').should('be.visible')
  })
})
