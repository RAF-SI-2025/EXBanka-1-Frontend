describe('Create Order Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
  })

  it('should display the create order form with query params', () => {
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getAccounts')

    cy.contains('h1', 'Create Order').should('be.visible')

    // Form elements
    cy.contains('label', 'Order Type').should('be.visible')
    cy.get('#order-type').should('have.value', 'market')

    cy.contains('label', 'Quantity').should('be.visible')
    cy.get('#quantity').should('be.visible')

    // Account selector
    cy.contains('label', 'Account').should('be.visible')
    cy.get('#account').should('be.visible')

    // Checkboxes
    cy.contains('All or None').should('be.visible')
    cy.contains('Margin').should('be.visible')

    // Submit button
    cy.contains('button', 'Place Order').should('be.visible')
  })

  it('should show sell order page when query param is sell', () => {
    cy.loginAsClient('/securities/order/new?listingId=1&direction=sell')
    cy.wait('@getAccounts')

    cy.contains('h1', 'Sell Order').should('be.visible')
  })

  it('should show limit value field when limit order type is selected', () => {
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getAccounts')

    // Initially no limit field
    cy.get('#limit-value').should('not.exist')

    // Change to limit order
    cy.get('#order-type').select('limit')
    cy.contains('label', 'Limit Value').should('be.visible')
    cy.get('#limit-value').should('be.visible')
  })

  it('should show stop value field when stop order type is selected', () => {
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getAccounts')

    cy.get('#order-type').select('stop')
    cy.contains('label', 'Stop Value').should('be.visible')
    cy.get('#stop-value').should('be.visible')
  })

  it('should submit an order', () => {
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 200,
      body: {
        id: 100,
        listing_id: 1,
        direction: 'buy',
        order_type: 'market',
        status: 'pending',
        quantity: 10,
        limit_value: null,
        stop_value: null,
        all_or_none: false,
        margin: false,
        account_id: 1,
        ticker: 'AAPL',
        security_name: 'Apple Inc.',
        created_at: '2026-04-04T10:00:00Z',
        updated_at: '2026-04-04T10:00:00Z',
      },
    }).as('createOrder')
    // Mock the orders page that we redirect to
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: { orders: [], total_count: 0 },
    }).as('getOrders')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getAccounts')

    cy.get('#quantity').type('10')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createOrder')
    cy.get('@createOrder')
      .its('request.body')
      .should((body) => {
        expect(body.direction).to.equal('buy')
        expect(body.order_type).to.equal('market')
        expect(body.quantity).to.equal(10)
        expect(body.listing_id).to.equal(1)
      })
  })
})
