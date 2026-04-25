describe('Admin Orders Page — Order Approval', () => {
  it('should display orders list with approve/decline actions', () => {
    cy.intercept('GET', 'https://bytenity.com/api/orders*', { fixture: 'admin-orders-list.json' }).as('getOrders')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'Order Approval').should('be.visible')

    // Table headers
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Security').should('be.visible')
    cy.contains('th', 'Direction').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Order data
    cy.contains('AAPL').should('be.visible')
    cy.contains('Apple Inc.').should('be.visible')
    cy.contains('ESM26').should('be.visible')

    cy.contains('2 orders').should('be.visible')

    // Both orders are pending — each should have Approve and Decline
    cy.get('button').filter(':contains("Approve")').should('have.length', 2)
    cy.get('button').filter(':contains("Decline")').should('have.length', 2)
  })

  it('should approve an order', () => {
    cy.intercept('GET', 'https://bytenity.com/api/orders*', { fixture: 'admin-orders-list.json' }).as('getOrders')
    cy.intercept('POST', 'https://bytenity.com/api/orders/60/approve', {
      statusCode: 200,
      body: { id: 60, status: 'approved' },
    }).as('approveOrder')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getOrders')

    cy.contains('button', 'Approve').first().click()
    cy.wait('@approveOrder')
  })

  it('should decline an order', () => {
    cy.intercept('GET', 'https://bytenity.com/api/orders*', { fixture: 'admin-orders-list.json' }).as('getOrders')
    cy.intercept('POST', 'https://bytenity.com/api/orders/60/decline', {
      statusCode: 200,
      body: { id: 60, status: 'declined' },
    }).as('declineOrder')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getOrders')

    cy.contains('button', 'Decline').first().click()
    cy.wait('@declineOrder')
  })

  it('should show empty state when no orders', () => {
    cy.intercept('GET', 'https://bytenity.com/api/orders*', {
      body: { orders: [], total_count: 0 },
    }).as('getEmptyOrders')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getEmptyOrders')

    cy.contains('No orders found.').should('be.visible')
  })
})
