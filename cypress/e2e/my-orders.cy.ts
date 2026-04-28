describe('My Orders Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
  })

  it('should display orders list with table', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'My Orders').should('be.visible')

    // Table headers
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Security').should('be.visible')
    cy.contains('th', 'Direction').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Filled').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Order data
    cy.contains('AAPL').should('be.visible')
    cy.contains('Apple Inc.').should('be.visible')
    cy.contains('buy').should('be.visible')
    cy.contains('market').should('be.visible')

    cy.contains('MSFT').should('be.visible')
    cy.contains('Microsoft Corp').should('be.visible')

    cy.contains('2 orders').should('be.visible')
  })

  it('should show Cancel button only for pending orders', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    // Only one Cancel button (for the pending order; filled order has is_done=true)
    cy.contains('button', 'Cancel').should('have.length', 1)
  })

  it('should cancel a pending order', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', { fixture: 'my-orders-list.json' }).as('getOrders')
    cy.intercept('POST', '**/api/v3/me/orders/50/cancel', {
      statusCode: 200,
      body: { id: 50, status: 'cancelled', state: 'cancelled', is_done: true },
    }).as('cancelOrder')

    cy.loginAsClient('/orders')
    cy.wait('@getOrders')

    cy.contains('button', 'Cancel').click()
    cy.wait('@cancelOrder')
  })

  it('should show empty state when no orders', () => {
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: { orders: [], total_count: 0 },
    }).as('getEmptyOrders')

    cy.loginAsClient('/orders')
    cy.wait('@getEmptyOrders')

    cy.contains('No orders found.').should('be.visible')
  })
})
