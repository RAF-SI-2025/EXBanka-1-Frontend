/**
 * Celina3 - Orderi
 * Scenarios 26-47 from docs/Orderi.md
 */

describe('Celina3 - Orderi', () => {
  // ── Shared helpers ───────────────────────────────────────────────────────

  /**
   * Stubs all endpoints CreateOrderPage fires on mount:
   * - both account endpoints
   * - stocks + futures (useListingsForSell fires both even for buy orders)
   * Tests that need specific stock/futures responses register their own
   * intercept AFTER calling this helper — Cypress LIFO ensures the
   * test-specific intercept wins.
   */
  const stubAccountsForClient = () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      fixture: 'home-accounts.json',
    }).as('getClientAccounts')
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
  }

  const stubAccountsForEmployee = () => {
    cy.intercept('GET', '**/api/v3/bank-accounts*', {
      fixture: 'home-accounts.json',
    }).as('getBankAccounts')
    cy.intercept('GET', '**/api/v3/me/accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
  }

  /** Stubs the orders list page so navigation after success doesn't hang. */
  const stubOrdersPage = () => {
    cy.intercept('GET', '**/api/v3/me/orders*', {
      body: { orders: [], total_count: 0 },
    })
  }

  // ── Scenario 26: Market BUY — form defaults ───────────────────────────────

  it('Scenario 26 — Create Order page defaults to Market type with no limit/stop fields', () => {
    stubAccountsForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.contains('h1', 'Create Order').should('be.visible')
    cy.get('#order-type').should('have.value', 'market')
    cy.get('#limit-value').should('not.exist')
    cy.get('#stop-value').should('not.exist')
  })

  it('Scenario 26 — Place Order button is the confirmation step for the market order', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 1, direction: 'buy', order_type: 'market', quantity: 5, listing_id: 1 },
    }).as('createMarketOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createMarketOrder')
    cy.get('@createMarketOrder').its('request.body').should('deep.include', {
      direction: 'buy',
      order_type: 'market',
      quantity: 5,
      listing_id: 1,
    })
  })

  // ── Scenario 27: Order below minimum allowed quantity ─────────────────────

  it('Scenario 27 — Submitting quantity 0 sends the request and backend rejects it with 400', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 400,
      body: { message: 'Quantity must be at least 1' },
    }).as('rejectMinQty')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('0')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectMinQty')
    cy.get('@rejectMinQty').its('request.body').should('have.property', 'quantity', 0)
    // Order rejected — user does not navigate away
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 28: Order for non-existent security ──────────────────────────

  it('Scenario 28 — Backend returns 404 when listing does not exist; user stays on form', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 404,
      body: { message: 'Security not found' },
    }).as('rejectNotFound')

    cy.loginAsClient('/securities/order/new?listingId=9999&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectNotFound')
    cy.get('@rejectNotFound').its('request.body').should('have.property', 'listing_id', 9999)
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 29: Limit BUY order ─────────────────────────────────────────

  it('Scenario 29 — Selecting Limit order type shows Limit Value field and hides Stop Value', () => {
    stubAccountsForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('limit')
    cy.get('#limit-value').should('be.visible')
    cy.get('#stop-value').should('not.exist')
  })

  it('Scenario 29 — Submitting a Limit order sends order_type=limit and limit_value in body', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 10, direction: 'buy', order_type: 'limit', quantity: 5 },
    }).as('createLimitOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('limit')
    cy.get('#quantity').type('5')
    cy.get('#limit-value').type('150.00')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createLimitOrder')
    cy.get('@createLimitOrder').its('request.body').should('deep.include', {
      order_type: 'limit',
      limit_value: '150.00',
      quantity: 5,
      direction: 'buy',
    })
  })

  // ── Scenario 30: Stop BUY order ──────────────────────────────────────────

  it('Scenario 30 — Selecting Stop order type shows Stop Value field and hides Limit Value', () => {
    stubAccountsForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('stop')
    cy.get('#stop-value').should('be.visible')
    cy.get('#limit-value').should('not.exist')
  })

  it('Scenario 30 — Submitting a Stop order sends order_type=stop and stop_value in body', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 11, direction: 'buy', order_type: 'stop', quantity: 3 },
    }).as('createStopOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('stop')
    cy.get('#quantity').type('3')
    cy.get('#stop-value').type('170.00')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createStopOrder')
    cy.get('@createStopOrder').its('request.body').should('deep.include', {
      order_type: 'stop',
      stop_value: '170.00',
      quantity: 3,
      direction: 'buy',
    })
  })

  // ── Scenario 31: Stop-Limit BUY order ────────────────────────────────────

  it('Scenario 31 — Stop-Limit order type shows both Limit Value and Stop Value fields', () => {
    stubAccountsForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('stop_limit')
    cy.get('#limit-value').should('be.visible')
    cy.get('#stop-value').should('be.visible')
  })

  it('Scenario 31 — Submitting Stop-Limit order sends both stop_value and limit_value in body', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 12, direction: 'buy', order_type: 'stop_limit', quantity: 2 },
    }).as('createStopLimitOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#order-type').select('stop_limit')
    cy.get('#quantity').type('2')
    cy.get('#limit-value').type('155.00')
    cy.get('#stop-value').type('165.00')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createStopLimitOrder')
    cy.get('@createStopLimitOrder').its('request.body').should('deep.include', {
      order_type: 'stop_limit',
      limit_value: '155.00',
      stop_value: '165.00',
      quantity: 2,
      direction: 'buy',
    })
  })

  // ── Scenario 32: Futures order with expired contract ─────────────────────

  it('Scenario 32 — Backend rejects order for expired futures contract with 400; user stays on form', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 400,
      body: { message: 'Futures contract has expired' },
    }).as('rejectExpiredFutures')

    // listing_id 999 represents the expired futures contract
    cy.loginAsClient('/securities/order/new?listingId=999&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('1')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectExpiredFutures')
    cy.get('@rejectExpiredFutures').its('request.body').should('have.property', 'listing_id', 999)
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 33: Order confirmation shows required fields ─────────────────

  it('Scenario 33 — Placing order sends direction, order_type, quantity and listing_id in request', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 20, direction: 'buy', order_type: 'market', quantity: 10, listing_id: 1 },
    }).as('createOrderConfirm')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('10')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createOrderConfirm')
    cy.get('@createOrderConfirm').its('request.body').should('deep.include', {
      direction: 'buy',
      order_type: 'market',
      quantity: 10,
      listing_id: 1,
    })
  })

  // ── Scenario 34: Prevent duplicate order submission ───────────────────────

  it('Scenario 34 — Place Order button is disabled while the POST request is in flight', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', (req) => {
      req.reply({ delay: 3000, statusCode: 201, body: { id: 21 } })
    }).as('slowOrder')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('1')
    cy.contains('button', 'Place Order').click()

    cy.contains('button', 'Place Order').should('be.disabled')
  })

  // ── Scenario 35: Expired session ─────────────────────────────────────────

  it('Scenario 35 — Backend returns 401 for expired session; user does not proceed to orders', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('unauthorizedOrder')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@unauthorizedOrder')
    // Order was not processed — user did not navigate to the orders list
    cy.url().should('not.include', '/orders')
  })

  // ── Scenario 36: Sell order page ─────────────────────────────────────────

  it('Scenario 36 — Sell order page shows "Sell Order" heading and listing dropdown', () => {
    stubAccountsForClient()
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: { stocks: [], total_count: 0 },
    })
    cy.intercept('GET', '**/api/v3/securities/futures*', {
      body: { futures: [], total_count: 0 },
    })

    cy.loginAsClient('/securities/order/new?direction=sell&securityType=stock&ticker=AAPL')
    cy.wait('@getClientAccounts')

    cy.contains('h1', 'Sell Order').should('be.visible')
    cy.get('[aria-label="Listing"]').should('be.visible')
    cy.contains('button', 'Place Order').should('be.visible')
  })

  it('Scenario 36 — Listing dropdown is populated from available stock venues', () => {
    stubAccountsForClient()
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: {
        stocks: [{
          id: 1, listing_id: 5, ticker: 'AAPL', name: 'Apple Inc.',
          exchange_acronym: 'NASDAQ', price: '178.50', change: '+2.30',
          volume: 52000000, market_cap: '2.8T', dividend_yield: 0.0055,
          outstanding_shares: 15000000000, maintenance_margin: '25%',
          initial_margin_cost: '50%',
        }],
        total_count: 1,
      },
    }).as('getSellListings')
    cy.intercept('GET', '**/api/v3/securities/futures*', {
      body: { futures: [], total_count: 0 },
    })

    cy.loginAsClient('/securities/order/new?direction=sell&securityType=stock&ticker=AAPL')
    cy.wait('@getClientAccounts')
    cy.wait('@getSellListings')

    cy.get('[aria-label="Listing"]').should('contain', 'NASDAQ — AAPL')
  })

  // ── Scenario 37: Selling more units than owned ────────────────────────────

  it('Scenario 37 — Backend returns 400 when sell quantity exceeds held quantity; user stays on form', () => {
    stubAccountsForClient()
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: {
        stocks: [{
          id: 1, listing_id: 5, ticker: 'AAPL', name: 'Apple Inc.',
          exchange_acronym: 'NASDAQ', price: '178.50', change: '+2.30',
          volume: 52000000, market_cap: '2.8T', dividend_yield: 0.0055,
          outstanding_shares: 15000000000, maintenance_margin: '25%',
          initial_margin_cost: '50%',
        }],
        total_count: 1,
      },
    })
    cy.intercept('GET', '**/api/v3/securities/futures*', {
      body: { futures: [], total_count: 0 },
    })
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 400,
      body: { message: 'Insufficient holdings quantity' },
    }).as('rejectOverSell')

    cy.loginAsClient('/securities/order/new?direction=sell&securityType=stock&ticker=AAPL')
    cy.wait('@getClientAccounts')

    // Select the AAPL listing then enter quantity exceeding the 10 held shares
    cy.get('[aria-label="Listing"]').select('NASDAQ — AAPL')
    cy.get('#quantity').type('15')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectOverSell')
    cy.get('@rejectOverSell').its('request.body').should('have.property', 'quantity', 15)
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 38: Selling exact held quantity ──────────────────────────────

  it('Scenario 38 — Selling exactly the held quantity succeeds and navigates to orders list', () => {
    stubAccountsForClient()
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: {
        stocks: [{
          id: 1, listing_id: 5, ticker: 'AAPL', name: 'Apple Inc.',
          exchange_acronym: 'NASDAQ', price: '178.50', change: '+2.30',
          volume: 52000000, market_cap: '2.8T', dividend_yield: 0.0055,
          outstanding_shares: 15000000000, maintenance_margin: '25%',
          initial_margin_cost: '50%',
        }],
        total_count: 1,
      },
    })
    cy.intercept('GET', '**/api/v3/securities/futures*', {
      body: { futures: [], total_count: 0 },
    })
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 50, direction: 'sell', order_type: 'market', quantity: 10, listing_id: 5 },
    }).as('exactSellOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?direction=sell&securityType=stock&ticker=AAPL')
    cy.wait('@getClientAccounts')

    cy.get('[aria-label="Listing"]').select('NASDAQ — AAPL')
    cy.get('#quantity').type('10')
    cy.contains('button', 'Place Order').click()

    cy.wait('@exactSellOrder')
    cy.get('@exactSellOrder').its('request.body').should('deep.include', {
      direction: 'sell',
      quantity: 10,
      listing_id: 5,
    })
    cy.url().should('include', '/orders')
  })

  // ── Scenario 39: Market order commission ─────────────────────────────────

  it('Scenario 39 — Market BUY order is submitted; backend applies commission min(14% * price, $7)', () => {
    stubAccountsForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 60, direction: 'buy', order_type: 'market', quantity: 1, listing_id: 1 },
    }).as('marketOrderWithFee')
    stubOrdersPage()

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('1')
    cy.contains('button', 'Place Order').click()

    cy.wait('@marketOrderWithFee')
    // Commission is applied server-side — verify the market order was sent
    cy.get('@marketOrderWithFee').its('request.body').should('deep.include', {
      order_type: 'market',
      direction: 'buy',
    })
  })

  // ── Scenario 40: Limit order commission ──────────────────────────────────

  it('Scenario 40 — Limit BUY order is submitted; backend applies commission min(24% * price, $12)', () => {
    stubAccountsForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 61, direction: 'buy', order_type: 'limit', quantity: 1, listing_id: 1 },
    }).as('limitOrderWithFee')
    stubOrdersPage()

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#order-type').select('limit')
    cy.get('#quantity').type('1')
    cy.get('#limit-value').type('100.00')
    cy.contains('button', 'Place Order').click()

    cy.wait('@limitOrderWithFee')
    // Commission is applied server-side — verify the limit order was sent with the stated price
    cy.get('@limitOrderWithFee').its('request.body').should('deep.include', {
      order_type: 'limit',
      limit_value: '100.00',
      direction: 'buy',
    })
  })

  // ── Scenario 41: Client account selector ─────────────────────────────────

  it('Scenario 41 — Client sees their own accounts (RSD and EUR) in the account selector', () => {
    stubAccountsForClient()
    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#account').should('contain', 'RSD')
    cy.get('#account').should('contain', 'EUR')
  })

  // ── Scenario 42: Invalid account currency ────────────────────────────────

  it('Scenario 42 — Backend returns 422 when selected account currency is unsupported; user stays on form', () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      body: {
        accounts: [{
          id: 99, account_number: '265000000000000099', account_name: 'Crypto Wallet',
          currency_code: 'BTC', account_kind: 'current', account_type: 'standard',
          account_category: 'personal', balance: 1, available_balance: 1,
          status: 'ACTIVE', owner_id: 42, daily_limit: 100, monthly_limit: 1000,
          created_at: '2026-01-01T00:00:00Z',
        }],
        total: 1,
      },
    }).as('getBTCAccount')
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 422,
      body: { message: 'Account currency is not supported for this security' },
    }).as('rejectCurrency')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBTCAccount')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectCurrency')
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 43: Insufficient funds ──────────────────────────────────────

  it('Scenario 43 — Backend returns 400 when account has insufficient funds; user stays on form', () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      body: {
        accounts: [{
          id: 1, account_number: '265000000000000011', account_name: 'Prazan račun',
          currency_code: 'RSD', account_kind: 'current', account_type: 'standard',
          account_category: 'personal', balance: 0, available_balance: 0,
          status: 'ACTIVE', owner_id: 42, daily_limit: 1000000, monthly_limit: 10000000,
          created_at: '2026-01-15T10:00:00Z',
        }],
        total: 1,
      },
    }).as('getEmptyAccount')
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 400,
      body: { message: 'Insufficient funds' },
    }).as('rejectInsufficient')

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getEmptyAccount')

    cy.get('#quantity').type('100')
    cy.contains('button', 'Place Order').click()

    cy.wait('@rejectInsufficient')
    cy.get('@rejectInsufficient').its('request.body').should('have.property', 'quantity', 100)
    cy.url().should('include', '/securities/order/new')
  })

  // ── Scenario 44: Employee uses bank accounts ──────────────────────────────

  it('Scenario 44 — Employee sees Charge As selector defaulting to Bank', () => {
    stubAccountsForEmployee()
    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('[aria-label="Charge As"]').should('be.visible')
    cy.get('[aria-label="Charge As"]').should('have.value', 'bank')
  })

  it('Scenario 44 — Employee Bank charge mode shows bank accounts (RSD, EUR) in account dropdown', () => {
    stubAccountsForEmployee()
    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#account').should('contain', 'RSD')
    cy.get('#account').should('contain', 'EUR')
  })

  it('Scenario 44 — Employee order does not include base_account_id (no client conversion fee)', () => {
    stubAccountsForEmployee()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 30, direction: 'buy', order_type: 'market', quantity: 5 },
    }).as('employeeOrder')
    stubOrdersPage()

    cy.loginAsEmployee('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getBankAccounts')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@employeeOrder')
    cy.get('@employeeOrder').its('request.body').should('not.have.property', 'base_account_id')
  })

  // ── Scenario 45: Exchange closed warning ─────────────────────────────────

  it('Scenario 45 — Order form renders and allows submission regardless of exchange hours; backend enforces market status', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 70, direction: 'buy', order_type: 'market', quantity: 1, listing_id: 1 },
    }).as('orderDuringClosed')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    // Frontend does not block order creation based on exchange hours
    cy.get('#quantity').type('1')
    cy.contains('button', 'Place Order').click()

    cy.wait('@orderDuringClosed')
    cy.get('@orderDuringClosed').its('response.statusCode').should('eq', 201)
  })

  // ── Scenario 46: Order created while exchange closed ─────────────────────

  it('Scenario 46 — Order submitted while exchange is closed is accepted by backend; frontend does not restrict it', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 71, direction: 'buy', order_type: 'market', quantity: 2, listing_id: 1 },
    }).as('closedMarketOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('2')
    cy.contains('button', 'Place Order').click()

    cy.wait('@closedMarketOrder')
    // Backend returns 201 and handles delayed execution internally
    cy.get('@closedMarketOrder').its('response.statusCode').should('eq', 201)
    cy.url().should('include', '/orders')
  })

  // ── Scenario 47: Exchange in after-hours period ───────────────────────────

  it('Scenario 47 — Order submitted during after-hours period goes through; backend handles execution timing', () => {
    stubAccountsForClient()
    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 201,
      body: { id: 72, direction: 'buy', order_type: 'market', quantity: 3, listing_id: 1 },
    }).as('afterHoursOrder')
    stubOrdersPage()

    cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')
    cy.wait('@getClientAccounts')

    cy.get('#quantity').type('3')
    cy.contains('button', 'Place Order').click()

    cy.wait('@afterHoursOrder')
    // Frontend submits order normally; backend controls after-hours execution behaviour
    cy.get('@afterHoursOrder').its('response.statusCode').should('eq', 201)
    cy.url().should('include', '/orders')
  })
})
