/**
 * Celina3 - Orderi-Execution
 * Scenarios 59-66 from docs/Orderi-Execution.md
 */

describe('Celina3 - Orderi-Execution', () => {
  // ── Shared helpers ───────────────────────────────────────────────────────

  /**
   * All endpoints CreateOrderPage fires on mount + the listing-map + me/orders
   * endpoints needed when the app navigates to /orders on success.
   */
  const stubCreateOrderPageForClient = () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      fixture: 'home-accounts.json',
    }).as('getClientAccounts')
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/me/orders*', { body: { orders: [], total_count: 0 } })
  }

  const stubCreateOrderPageForEmployee = () => {
    cy.intercept('GET', '**/api/v3/bank-accounts*', {
      fixture: 'home-accounts.json',
    }).as('getBankAccounts')
    cy.intercept('GET', '**/api/v3/me/accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/me/orders*', { body: { orders: [], total_count: 0 } })
  }

  /** All endpoints MyOrdersPage fires on mount (orders + listing-map). */
  const stubMyOrdersPage = () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
  }

  // ── Scenario 59: Market order executes in partial fills ───────────────────

  it('Scenario 59 — Partially filled order shows filled_quantity/quantity in the Filled column', () => {
    stubMyOrdersPage()
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: {
        orders: [
          {
            id: 80, listing_id: 1, holding_id: null, direction: 'buy',
            order_type: 'market', status: 'partial', state: 'filling',
            filled_quantity: 3, is_done: false, quantity: 10,
            limit_value: null, stop_value: null, all_or_none: false, margin: false,
            account_id: 1, ticker: 'AAPL', security_name: 'Apple Inc.',
            created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-25T10:01:00Z',
          },
        ],
        total_count: 1,
      },
    }).as('getPartialOrder')

    cy.loginAsClient('/orders')
    cy.wait('@getPartialOrder')

    // "Filled" column renders "filled_quantity / quantity"
    cy.contains('td', '3 / 10').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
  })

  it('Scenario 59 — Fully filled order (isDone=true) shows 10/10 in Filled column and no Cancel button', () => {
    stubMyOrdersPage()
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: {
        orders: [
          {
            id: 81, listing_id: 1, holding_id: null, direction: 'buy',
            order_type: 'market', status: 'filled', state: 'filled',
            filled_quantity: 10, is_done: true, quantity: 10,
            limit_value: null, stop_value: null, all_or_none: false, margin: false,
            account_id: 1, ticker: 'AAPL', security_name: 'Apple Inc.',
            created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-25T10:05:00Z',
          },
        ],
        total_count: 1,
      },
    }).as('getFilledOrder')

    cy.loginAsClient('/orders')
    cy.wait('@getFilledOrder')

    cy.contains('td', '10 / 10').should('be.visible')
    // is_done=true → Cancel button is not rendered
    cy.contains('button', 'Cancel').should('not.exist')
  })

  // ── Scenario 60: AON order stays Pending when full quantity unavailable ────

  it('Scenario 60 — AON BUY order is submitted with all_or_none=true', () => {
    stubCreateOrderPageForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 82, status: 'pending', state: 'pending', direction: 'buy', order_type: 'market', quantity: 20, all_or_none: true },
    }).as('aonOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('20')
    cy.contains('label', 'All or None').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@aonOrder')
    cy.get('@aonOrder').its('request.body').should('deep.include', {
      all_or_none: true,
      quantity: 20,
      order_type: 'market',
    })
  })

  it('Scenario 60 — Backend returns Pending when full AON quantity is not yet available', () => {
    stubCreateOrderPageForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      // Only 15 of 20 available — backend keeps order pending
      body: { id: 82, status: 'pending', state: 'pending', all_or_none: true, quantity: 20, filled_quantity: 0 },
    }).as('aonPendingOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('20')
    cy.contains('label', 'All or None').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@aonPendingOrder')
    cy.get('@aonPendingOrder').its('response.body').should('have.property', 'status', 'pending')
  })

  it('Scenario 60 — Pending AON order is visible in order list without Cancel restrictions', () => {
    stubMyOrdersPage()
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: {
        orders: [{
          id: 82, listing_id: 1, holding_id: null, direction: 'buy',
          order_type: 'market', status: 'pending', state: 'pending',
          filled_quantity: 0, is_done: false, quantity: 20,
          limit_value: null, stop_value: null, all_or_none: true, margin: false,
          account_id: 1, ticker: 'AAPL', security_name: 'Apple Inc.',
          created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-25T10:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getPendingAON')

    cy.loginAsClient('/orders')
    cy.wait('@getPendingAON')

    cy.contains('td', '0 / 20').should('be.visible')
    cy.contains('td', 'Pending').should('be.visible')
    // Unfilled order → Cancel button is available
    cy.contains('button', 'Cancel').should('be.visible')
  })

  // ── Scenario 61: AON order fills completely when full quantity is available ─

  it('Scenario 61 — AON order is approved when full quantity is available on the market', () => {
    stubCreateOrderPageForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 83, status: 'approved', state: 'approved', all_or_none: true, quantity: 10, filled_quantity: 0 },
    }).as('aonApprovedOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('10')
    cy.contains('label', 'All or None').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@aonApprovedOrder')
    cy.get('@aonApprovedOrder').its('request.body').should('deep.include', { all_or_none: true, quantity: 10 })
    cy.get('@aonApprovedOrder').its('response.body').should('have.property', 'status', 'approved')
  })

  // ── Scenario 62: Stop-Limit order converts to Limit at stop price ──────────
  // The conversion is handled entirely by the backend when the ask price
  // reaches the stop value. Frontend responsibility is to send both values.

  it('Scenario 62 — Stop-Limit order is submitted with stop_value=120 and limit_value=125', () => {
    stubCreateOrderPageForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 84, status: 'pending', order_type: 'stop_limit', stop_value: '120', limit_value: '125', quantity: 5 },
    }).as('stopLimitOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#order-type').select('stop_limit')
    cy.get('#quantity').type('5')
    cy.get('#stop-value').type('120')
    cy.get('#limit-value').type('125')
    cy.contains('button', 'Place Order').click()

    cy.wait('@stopLimitOrder')
    cy.get('@stopLimitOrder').its('request.body').should('deep.include', {
      order_type: 'stop_limit',
      stop_value: '120',
      limit_value: '125',
      quantity: 5,
      direction: 'buy',
    })
  })

  it('Scenario 62 — Stop-Limit order appears in order list with order_type=stop_limit until stop is triggered', () => {
    stubMyOrdersPage()
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: {
        orders: [{
          id: 84, listing_id: 1, holding_id: null, direction: 'buy',
          order_type: 'stop_limit', status: 'pending', state: 'pending',
          filled_quantity: 0, is_done: false, quantity: 5,
          limit_value: '125.00', stop_value: '120.00', all_or_none: false, margin: false,
          account_id: 1, ticker: 'AAPL', security_name: 'Apple Inc.',
          created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-25T10:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getStopLimitOrder')

    cy.loginAsClient('/orders')
    cy.wait('@getStopLimitOrder')

    cy.contains('td', 'stop_limit').should('be.visible')
    cy.contains('td', 'Pending').should('be.visible')
  })

  // ── Scenario 63: Margin order rejected without margin permission ───────────

  it('Scenario 63 — Margin checkbox is present on the order form', () => {
    stubCreateOrderPageForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.contains('label', 'Margin').find('input[type="checkbox"]').should('exist')
  })

  it('Scenario 63 — Submitting with Margin checked sends margin=true; backend rejects without permission', () => {
    stubCreateOrderPageForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 403,
      body: { message: 'Margin trading is not permitted for this account' },
    }).as('rejectMarginOrder')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('5')
    cy.contains('label', 'Margin').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectMarginOrder')
    cy.get('@rejectMarginOrder').its('request.body').should('have.property', 'margin', true)
    cy.get('@rejectMarginOrder').its('response.statusCode').should('eq', 403)
    // User stays on form — no navigation on error
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 64: Margin order accepted — client has active credit ──────────

  it('Scenario 64 — Margin BUY order with client credit is accepted; margin=true in request body', () => {
    stubCreateOrderPageForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 85, status: 'approved', margin: true, direction: 'buy', order_type: 'market', quantity: 5 },
    }).as('marginApprovedOrder')
    cy.intercept('GET', '**/api/v3/me/orders*', { body: { orders: [], total_count: 0 } })

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('5')
    cy.contains('label', 'Margin').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@marginApprovedOrder')
    cy.get('@marginApprovedOrder').its('request.body').should('deep.include', {
      margin: true,
      quantity: 5,
      direction: 'buy',
    })
    cy.get('@marginApprovedOrder').its('response.body').should('have.property', 'status', 'approved')
  })

  // ── Scenario 65: Margin order accepted — sufficient account balance ────────

  it('Scenario 65 — Margin BUY order with sufficient account funds is accepted by backend', () => {
    stubCreateOrderPageForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 86, status: 'approved', margin: true, direction: 'buy', order_type: 'market', quantity: 3 },
    }).as('marginFundsOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('3')
    cy.contains('label', 'Margin').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@marginFundsOrder')
    cy.get('@marginFundsOrder').its('request.body').should('deep.include', { margin: true, quantity: 3 })
    cy.get('@marginFundsOrder').its('response.body').should('have.property', 'status', 'approved')
  })

  // ── Scenario 66: AON flag is saved with the order ─────────────────────────

  it('Scenario 66 — Checking All or None sends all_or_none=true in the order request body', () => {
    stubCreateOrderPageForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 87, status: 'pending', all_or_none: true, quantity: 8, direction: 'buy' },
    }).as('aonFlagOrder')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('8')
    cy.contains('label', 'All or None').find('input[type="checkbox"]').check()
    cy.contains('button', 'Place Order').click()

    cy.wait('@aonFlagOrder')
    cy.get('@aonFlagOrder').its('request.body').should('deep.include', {
      all_or_none: true,
      quantity: 8,
    })
    cy.get('@aonFlagOrder').its('response.body').should('have.property', 'all_or_none', true)
  })

  it('Scenario 66 — All or None checkbox is unchecked by default (all_or_none=false when not selected)', () => {
    stubCreateOrderPageForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 88, status: 'pending', all_or_none: false, quantity: 4, direction: 'buy' },
    }).as('noAonOrder')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    // Do not check All or None — default state
    cy.contains('label', 'All or None').find('input[type="checkbox"]').should('not.be.checked')
    cy.get('#quantity').type('4')
    cy.contains('button', 'Place Order').click()

    cy.wait('@noAonOrder')
    cy.get('@noAonOrder').its('request.body').should('deep.include', { all_or_none: false })
  })
})
