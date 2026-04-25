describe('Forex Detail Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/securities/forex/20', { fixture: 'forex-detail.json' }).as(
      'getForex'
    )
    cy.intercept('GET', 'https://bytenity.com/api/securities/forex/20/history*', {
      fixture: 'forex-history.json',
    }).as('getForexHistory')
  })

  it('should display forex pair info with ticker and name', () => {
    cy.loginAsEmployee('/securities/forex/20')
    cy.wait('@getForex')

    cy.contains('h1', 'EUR/USD — Euro / US Dollar').should('be.visible')
  })

  it('should show the Buy button', () => {
    cy.loginAsEmployee('/securities/forex/20')
    cy.wait('@getForex')

    cy.contains('button', 'Buy').should('be.visible')
  })

  it('should display the security info panel', () => {
    cy.loginAsEmployee('/securities/forex/20')
    cy.wait('@getForex')

    cy.contains('Ticker').should('be.visible')
    cy.contains('EUR/USD').should('be.visible')
    cy.contains('Exchange Rate').should('be.visible')
    cy.contains('1.0850').should('be.visible')
    cy.contains('Base Currency').should('be.visible')
    cy.contains('EUR').should('be.visible')
    cy.contains('Quote Currency').should('be.visible')
    cy.contains('USD').should('be.visible')
    cy.contains('Liquidity').should('be.visible')
    cy.contains('high').should('be.visible')
  })

  it('should show not found for invalid forex id', () => {
    cy.intercept('GET', 'https://bytenity.com/api/securities/forex/999', { statusCode: 200, body: null }).as(
      'getForexNotFound'
    )
    cy.intercept('GET', 'https://bytenity.com/api/securities/forex/999/history*', {
      body: { history: [], total_count: 0 },
    }).as('getEmptyHistory')

    cy.loginAsEmployee('/securities/forex/999')
    cy.wait('@getForexNotFound')

    cy.contains('Forex pair not found.').should('be.visible')
  })
})
