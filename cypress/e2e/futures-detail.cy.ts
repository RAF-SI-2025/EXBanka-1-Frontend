describe('Futures Detail Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/securities/futures/10', { fixture: 'future-detail.json' }).as(
      'getFuture'
    )
    cy.intercept('GET', '**/api/v3/securities/futures/10/history*', {
      fixture: 'future-history.json',
    }).as('getFutureHistory')
  })

  it('should display futures contract info with ticker and name', () => {
    cy.loginAsEmployee('/securities/futures/10')
    cy.wait('@getFuture')

    cy.contains('h1', 'ESM26 — E-mini S&P 500 Jun 2026').should('be.visible')
  })

  it('should show the Buy button', () => {
    cy.loginAsEmployee('/securities/futures/10')
    cy.wait('@getFuture')

    cy.contains('button', 'Buy').should('be.visible')
  })

  it('should display the security info panel', () => {
    cy.loginAsEmployee('/securities/futures/10')
    cy.wait('@getFuture')

    cy.contains('Ticker').should('be.visible')
    cy.contains('ESM26').should('be.visible')
    cy.contains('Price').should('be.visible')
    cy.contains('5250.00').should('be.visible')
    cy.contains('Exchange').should('be.visible')
    cy.contains('CME').should('be.visible')
    cy.contains('Contract Size').should('be.visible')
    cy.contains('Settlement Date').should('be.visible')
    cy.contains('2026-06-20').should('be.visible')
  })

  it('should show not found for invalid futures id', () => {
    cy.intercept('GET', '**/api/v3/securities/futures/999', { statusCode: 200, body: null }).as(
      'getFutureNotFound'
    )
    cy.intercept('GET', '**/api/v3/securities/futures/999/history*', {
      body: { history: [], total_count: 0 },
    }).as('getEmptyHistory')

    cy.loginAsEmployee('/securities/futures/999')
    cy.wait('@getFutureNotFound')

    cy.contains('Futures contract not found.').should('be.visible')
  })
})
