/**
 * E2E Scenario: Kompletan radni dan na berzi
 *
 * Covers the full trading-day workflow:
 * DEO 1  — Supervisor sets agent limit
 * DEO 2  — Agent browses securities and views MSFT detail
 * DEO 3  — Agent creates BUY market order for 10 MSFT
 * DEO 4  — Supervisor approves BUY order
 * DEO 5-6 — Order fills; agent views portfolio (10 MSFT)
 * DEO 7  — Agent places SELL market order for 5 MSFT
 * DEO 8  — Supervisor approves SELL order
 * DEO 9  — Agent views portfolio after sale (5 MSFT, profit visible)
 * DEO 10 — Supervisor views tax tracking and triggers collection
 * DEO 11 — Agent verifies final state (tax paid, 5 MSFT remaining)
 */

describe('E2E Scenario: Kompletan radni dan na berzi', () => {
  // ── Shared data ───────────────────────────────────────────────────────────

  const MARKO_ACTUARY = {
    id: 10,
    employee_id: 10,
    first_name: 'Marko',
    last_name: 'Markovic',
    email: 'marko@banka.rs',
    phone: '+381641234567',
    position: 'Agent',
    department: 'Trading',
    active: true,
    limit: '0',
    used_limit: '0',
    need_approval: true,
  }

  const MSFT_STOCK = {
    id: 5,
    listing_id: 5,
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    price: '400.00',
    ask: '401.00',
    bid: '399.00',
    change: '+5.00',
    volume: 25000000,
    exchange_acronym: 'NYSE',
    market_cap: '2.97T',
    dividend_yield: 0.0085,
    maintenance_margin: '25%',
    initial_margin_cost: '50%',
  }

  const USD_BANK_ACCOUNT = {
    id: 3,
    account_number: '265000000000000044',
    account_name: 'USD Trading Account',
    currency_code: 'USD',
    balance: 5000,
    available_balance: 5000,
    status: 'ACTIVE',
    owner_id: 10,
    daily_limit: 100000,
    monthly_limit: 1000000,
    created_at: '2026-01-01T00:00:00Z',
  }

  const PENDING_BUY_ORDER = {
    id: 70,
    listing_id: 5,
    direction: 'buy',
    order_type: 'market',
    status: 'pending',
    state: 'pending',
    filled_quantity: 0,
    is_done: false,
    quantity: 10,
    limit_value: null,
    stop_value: null,
    all_or_none: false,
    margin: false,
    account_id: 3,
    ticker: 'MSFT',
    security_name: 'Microsoft Corp',
    created_at: '2026-04-25T09:00:00Z',
    updated_at: '2026-04-25T09:00:00Z',
  }

  const PENDING_SELL_ORDER = {
    id: 71,
    listing_id: 5,
    direction: 'sell',
    order_type: 'market',
    status: 'pending',
    state: 'pending',
    filled_quantity: 0,
    is_done: false,
    quantity: 5,
    limit_value: null,
    stop_value: null,
    all_or_none: false,
    margin: false,
    account_id: 3,
    ticker: 'MSFT',
    security_name: 'Microsoft Corp',
    created_at: '2026-04-25T14:00:00Z',
    updated_at: '2026-04-25T14:00:00Z',
  }

  const MSFT_HOLDING_10 = {
    id: 40,
    security_type: 'stock',
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    quantity: 10,
    public_quantity: 0,
    account_id: 3,
    last_modified: '2026-04-25T10:00:00Z',
  }

  const MSFT_HOLDING_5 = { ...MSFT_HOLDING_10, quantity: 5, last_modified: '2026-04-25T15:00:00Z' }

  // ── DEO 1: Supervisor sets agent limit ────────────────────────────────────

  it('DEO 1 — Supervisor sets Marko Markovic agent limit to 200,000 RSD', () => {
    cy.intercept('GET', '**/api/v3/actuaries*', {
      body: { actuaries: [MARKO_ACTUARY], total_count: 1 },
    }).as('getActuaries')

    cy.intercept('PUT', '**/api/v3/actuaries/10/limit', {
      statusCode: 200,
      body: { id: 10, employee_id: 10, limit: '200000' },
    }).as('setLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('h1', 'Actuaries').should('be.visible')
    cy.contains('Marko Markovic').should('be.visible')

    cy.contains('button', 'Edit Limit').click()

    cy.get('[role="dialog"]').within(() => {
      cy.contains('Edit Limit — Marko Markovic').should('be.visible')
      cy.get('#limit-input').clear().type('200000')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setLimit')
    cy.get('@setLimit').its('request.body').should('have.property', 'limit', '200000')
  })

  // ── DEO 2: Agent browses securities and views MSFT detail ─────────────────

  it('DEO 2 — Agent finds MSFT in securities list and views stock detail with options chain', () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: { stocks: [MSFT_STOCK], total_count: 1 },
    }).as('getStocks')
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })

    cy.loginAsEmployee('/securities')
    cy.wait('@getStocks')

    cy.contains('h1', 'Securities').should('be.visible')
    cy.contains('MSFT').should('be.visible')
    cy.contains('Microsoft Corp').should('be.visible')
    cy.contains('400.00').should('be.visible')

    // Navigate to MSFT detail (simulating row/button click)
    cy.intercept('GET', '**/api/v3/securities/stocks/5', { body: MSFT_STOCK }).as('getMsft')
    cy.intercept('GET', '**/api/v3/securities/stocks/5/history*', {
      body: { history: [], total_count: 0 },
    }).as('getMsftHistory')
    cy.intercept('GET', '**/api/v3/securities/options*', {
      body: {
        options: [
          {
            id: 200,
            ticker: 'MSFT240621C00410000',
            name: 'MSFT Call 410',
            stock_listing_id: 5,
            option_type: 'call',
            strike_price: '410.00',
            implied_volatility: '0.28',
            premium: '8.50',
            open_interest: 5000,
            settlement_date: '2026-06-21',
            price: '8.50',
            ask: '8.60',
            bid: '8.40',
            volume: 1200,
          },
        ],
        total_count: 1,
      },
    }).as('getMsftOptions')

    cy.visit('/securities/stocks/5')
    cy.wait('@getMsft')

    cy.contains('h1', 'MSFT — Microsoft Corp').should('be.visible')
    cy.contains('400.00').should('be.visible')
    cy.contains('NYSE').should('be.visible')
    cy.contains('Market Cap').should('be.visible')

    cy.wait('@getMsftOptions')
    cy.contains('h2', 'Options Chain').should('be.visible')

    cy.contains('button', 'Buy').should('be.visible')
  })

  // ── DEO 3: Agent creates BUY market order for 10 MSFT ────────────────────

  it('DEO 3 — Agent places BUY market order for 10 MSFT shares using USD account', () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      body: { accounts: [USD_BANK_ACCOUNT], total: 1 },
    })
    cy.intercept('GET', '**/api/v3/bank-accounts*', {
      body: { accounts: [USD_BANK_ACCOUNT] },
    }).as('getBankAccounts')
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/me/orders*', { body: { orders: [], total_count: 0 } })

    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 200,
      body: PENDING_BUY_ORDER,
    }).as('createBuyOrder')

    cy.loginAsEmployee('/securities/order/new?listingId=5&direction=buy')
    cy.wait('@getBankAccounts')

    cy.contains('h1', 'Create Order').should('be.visible')
    cy.get('#order-type').should('have.value', 'market')

    cy.get('#quantity').type('10')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createBuyOrder')
    cy.get('@createBuyOrder')
      .its('request.body')
      .should((body) => {
        expect(body.direction).to.equal('buy')
        expect(body.order_type).to.equal('market')
        expect(body.quantity).to.equal(10)
        expect(body.listing_id).to.equal(5)
      })
  })

  // ── DEO 4: Supervisor approves BUY order ─────────────────────────────────

  it('DEO 4 — Supervisor approves pending BUY order for 10 MSFT (status: pending → approved)', () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/orders*', {
      body: { orders: [PENDING_BUY_ORDER], total_count: 1 },
    }).as('getOrders')
    cy.intercept('POST', '**/api/v3/orders/70/approve', {
      statusCode: 200,
      body: { id: 70, status: 'approved', state: 'approved' },
    }).as('approveBuyOrder')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'Order Approval').should('be.visible')
    cy.contains('MSFT').should('be.visible')
    cy.contains('Microsoft Corp').should('be.visible')
    cy.contains('buy').should('be.visible')
    cy.contains('market').should('be.visible')

    cy.contains('button', 'Approve').click()
    cy.wait('@approveBuyOrder')
  })

  // ── DEO 5-6: Portfolio shows 10 MSFT after order fills ───────────────────

  it('DEO 5-6 — Agent views portfolio: 10 MSFT shares with unrealized profit, marked private', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: { holdings: [MSFT_HOLDING_10], total_count: 1 },
    }).as('getPortfolio')
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      body: {
        total_profit: '250.00',
        total_profit_rsd: '29250.00',
        unrealized_profit: '250.00',
        realized_profit_this_month_rsd: '0.00',
        realized_profit_this_year_rsd: '0.00',
        realized_profit_lifetime_rsd: '0.00',
        tax_paid_this_year: '0.00',
        tax_unpaid_this_month: '0.00',
        tax_unpaid_total_rsd: '0.00',
        open_positions_count: 1,
        closed_trades_this_year: 0,
      },
    }).as('getSummary')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('h1', 'Portfolio').should('be.visible')

    // Holdings table
    cy.contains('MSFT').should('be.visible')
    cy.contains('Microsoft Corp').should('be.visible')
    cy.contains('stock').should('be.visible')
    cy.contains('1 holdings').should('be.visible')

    // Summary card
    cy.contains('Unrealized P&L').should('be.visible')
    cy.contains('250.00').should('be.visible')
    cy.contains('Open Positions').should('be.visible')
    cy.contains('Tax Paid (Year)').should('be.visible')
    cy.contains('0.00 RSD').should('be.visible')

    // Holding is private — Make Public button visible
    cy.contains('button', 'Make Public').should('be.visible')
    // Sell button also present
    cy.contains('button', 'Sell').should('be.visible')
  })

  // ── DEO 7: Agent sells 5 MSFT ────────────────────────────────────────────

  it('DEO 7 — Agent places SELL market order for 5 MSFT shares (via sell order page)', () => {
    cy.intercept('GET', '**/api/v3/me/accounts*', {
      body: { accounts: [USD_BANK_ACCOUNT], total: 1 },
    })
    cy.intercept('GET', '**/api/v3/bank-accounts*', {
      body: { accounts: [USD_BANK_ACCOUNT] },
    }).as('getBankAccounts')
    cy.intercept('GET', '**/api/v3/securities/stocks*', {
      body: { stocks: [MSFT_STOCK], total_count: 1 },
    }).as('getStocksForListing')
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/me/orders*', { body: { orders: [], total_count: 0 } })

    cy.intercept('POST', '**/api/v3/me/orders', {
      statusCode: 200,
      body: PENDING_SELL_ORDER,
    }).as('createSellOrder')

    cy.loginAsEmployee('/securities/order/new?direction=sell&securityType=stock&ticker=MSFT')
    cy.wait('@getBankAccounts')
    cy.wait('@getStocksForListing')

    cy.contains('h1', 'Sell Order').should('be.visible')

    // Select listing from the dropdown (populated by useListingsForSell)
    cy.get('[aria-label="Listing"]').select('NYSE — MSFT')

    cy.get('#quantity').type('5')
    cy.contains('button', 'Place Order').click()

    cy.wait('@createSellOrder')
    cy.get('@createSellOrder')
      .its('request.body')
      .should((body) => {
        expect(body.direction).to.equal('sell')
        expect(body.order_type).to.equal('market')
        expect(body.quantity).to.equal(5)
        expect(body.listing_id).to.equal(5)
      })
  })

  // ── DEO 8: Supervisor approves SELL order ────────────────────────────────

  it('DEO 8 — Supervisor approves pending SELL order for 5 MSFT (status: pending → approved)', () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })
    cy.intercept('GET', '**/api/v3/orders*', {
      body: { orders: [PENDING_SELL_ORDER], total_count: 1 },
    }).as('getOrders')
    cy.intercept('POST', '**/api/v3/orders/71/approve', {
      statusCode: 200,
      body: { id: 71, status: 'approved', state: 'approved' },
    }).as('approveSellOrder')

    cy.loginAsEmployee('/admin/orders')
    cy.wait('@getOrders')

    cy.contains('h1', 'Order Approval').should('be.visible')
    cy.contains('MSFT').should('be.visible')
    cy.contains('sell').should('be.visible')

    cy.contains('button', 'Approve').click()
    cy.wait('@approveSellOrder')
  })

  // ── DEO 9: Portfolio shows 5 MSFT with realized profit ───────────────────

  it('DEO 9 — Agent views portfolio after sale: 5 MSFT remaining, realized profit visible, unpaid tax > 0', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: { holdings: [MSFT_HOLDING_5], total_count: 1 },
    }).as('getPortfolio')
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      body: {
        total_profit: '375.00',
        total_profit_rsd: '43875.00',
        unrealized_profit: '125.00',
        realized_profit_this_month_rsd: '29250.00',
        realized_profit_this_year_rsd: '29250.00',
        realized_profit_lifetime_rsd: '29250.00',
        tax_paid_this_year: '0.00',
        tax_unpaid_this_month: '3937.50',
        tax_unpaid_total_rsd: '3937.50',
        open_positions_count: 1,
        closed_trades_this_year: 1,
      },
    }).as('getSummary')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('h1', 'Portfolio').should('be.visible')
    cy.contains('MSFT').should('be.visible')
    cy.contains('1 holdings').should('be.visible')

    // Unrealized profit still positive (remaining 5 shares)
    cy.contains('Unrealized P&L').should('be.visible')
    cy.contains('125.00').should('be.visible')

    // Realized (Lifetime) shows profit from the 5-share sale
    cy.contains('Realized (Lifetime)').should('be.visible')
    cy.contains('29250.00 RSD').should('be.visible')

    // Tax is not yet paid
    cy.contains('Tax Paid (Year)').should('be.visible')
    cy.contains('0.00 RSD').should('be.visible')
  })

  // ── DEO 10: Supervisor triggers tax collection ────────────────────────────

  it('DEO 10 — Supervisor views tax tracking: Marko has debt of 3937.50 RSD, triggers collection', () => {
    cy.intercept('GET', '**/api/v3/tax*', {
      body: {
        tax_records: [
          {
            id: 10,
            user_type: 'actuary',
            first_name: 'Marko',
            last_name: 'Markovic',
            unpaid_tax: '3937.50',
            last_collection: null,
          },
        ],
        total_count: 1,
      },
    }).as('getTaxRecords')
    cy.intercept('POST', '**/api/v3/tax/collect', {
      statusCode: 200,
      body: { collected_count: 1, total_collected_rsd: '3937.50', failed_count: 0 },
    }).as('collectTaxes')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('h1', 'Tax Management').should('be.visible')
    cy.contains('Marko Markovic').should('be.visible')
    cy.contains('3937.50').should('be.visible')
    cy.contains('Actuary').should('be.visible')

    cy.contains('button', 'Collect Taxes').click()
    cy.wait('@collectTaxes')
  })

  // ── DEO 11: Agent verifies final state ───────────────────────────────────

  it('DEO 11 — Agent verifies final state: 5 MSFT remain, tax_paid_this_year updated to 3937.50 RSD', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: { holdings: [MSFT_HOLDING_5], total_count: 1 },
    }).as('getPortfolio')
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      body: {
        total_profit: '125.00',
        total_profit_rsd: '14625.00',
        unrealized_profit: '125.00',
        realized_profit_this_month_rsd: '29250.00',
        realized_profit_this_year_rsd: '29250.00',
        realized_profit_lifetime_rsd: '29250.00',
        tax_paid_this_year: '3937.50',
        tax_unpaid_this_month: '0.00',
        tax_unpaid_total_rsd: '0.00',
        open_positions_count: 1,
        closed_trades_this_year: 1,
      },
    }).as('getSummary')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('h1', 'Portfolio').should('be.visible')

    // 5 MSFT shares remain
    cy.contains('MSFT').should('be.visible')
    cy.contains('1 holdings').should('be.visible')

    // Realized (Lifetime) profit persists
    cy.contains('Realized (Lifetime)').should('be.visible')
    cy.contains('29250.00 RSD').should('be.visible')

    // Tax paid is now updated — tax collection succeeded
    cy.contains('Tax Paid (Year)').should('be.visible')
    cy.contains('3937.50 RSD').should('be.visible')
  })
})
