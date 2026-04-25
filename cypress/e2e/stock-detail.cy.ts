describe('Stock Detail Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/securities/stocks/1', { fixture: 'stock-detail.json' }).as(
      'getStock'
    )
    cy.intercept('GET', 'https://bytenity.com/api/securities/stocks/1/history*', {
      fixture: 'stock-history.json',
    }).as('getStockHistory')
    cy.intercept('GET', 'https://bytenity.com/api/securities/options*', { fixture: 'stock-options.json' }).as(
      'getOptions'
    )
  })

  it('should display stock info with ticker and name', () => {
    cy.loginAsEmployee('/securities/stocks/1')
    cy.wait('@getStock')

    cy.contains('h1', 'AAPL — Apple Inc.').should('be.visible')
  })

  it('should show the Buy button', () => {
    cy.loginAsEmployee('/securities/stocks/1')
    cy.wait('@getStock')

    cy.contains('button', 'Buy').should('be.visible')
  })

  it('should display the security info panel', () => {
    cy.loginAsEmployee('/securities/stocks/1')
    cy.wait('@getStock')

    cy.contains('Ticker').should('be.visible')
    cy.contains('AAPL').should('be.visible')
    cy.contains('Price').should('be.visible')
    cy.contains('178.50').should('be.visible')
    cy.contains('Exchange').should('be.visible')
    cy.contains('NASDAQ').should('be.visible')
    cy.contains('Market Cap').should('be.visible')
    cy.contains('Dividend Yield').should('be.visible')
  })

  it('should display options chain when options exist', () => {
    cy.loginAsEmployee('/securities/stocks/1')
    cy.wait('@getStock')
    cy.wait('@getOptions')

    cy.contains('h2', 'Options Chain').should('be.visible')
  })

  it('should show not found for invalid stock id', () => {
    cy.intercept('GET', 'https://bytenity.com/api/securities/stocks/999', { statusCode: 200, body: null }).as(
      'getStockNotFound'
    )
    cy.intercept('GET', 'https://bytenity.com/api/securities/stocks/999/history*', {
      body: { history: [], total_count: 0 },
    }).as('getEmptyHistory')
    cy.intercept('GET', 'https://bytenity.com/api/securities/options*', {
      body: { options: [], total_count: 0 },
    }).as('getEmptyOptions')

    cy.loginAsEmployee('/securities/stocks/999')
    cy.wait('@getStockNotFound')

    cy.contains('Stock not found.').should('be.visible')
  })
})
