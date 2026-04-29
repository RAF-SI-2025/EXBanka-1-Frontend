/**
 * Hartije od vrednosti — Securities
 * Scenarios 10-25 from docs/Hartije.md
 */

describe('Hartije od vrednosti — Securities', () => {
  // ── Shared helpers ───────────────────────────────────────────────────────

  const stubAllSecurities = () => {
    cy.intercept('GET', '**/api/v3/securities/stocks*', { fixture: 'stocks-list.json' }).as('getStocks')
    cy.intercept('GET', '**/api/v3/securities/futures*', { fixture: 'futures-list.json' }).as('getFutures')
    cy.intercept('GET', '**/api/v3/securities/forex*', { fixture: 'forex-list.json' }).as('getForex')
  }

  // ── Securities List ──────────────────────────────────────────────────────

  describe('Securities List', () => {

    // Scenario 10: Client sees only stocks and futures
    it('Scenario 10 — Client sees Stocks, Futures and Options tabs; Forex is hidden', () => {
      stubAllSecurities()
      cy.loginAsClient('/securities')
      cy.wait('@getStocks')

      cy.contains('button', 'Stocks').should('be.visible')
      cy.contains('button', 'Futures').should('be.visible')
      cy.contains('button', 'Options').should('be.visible')
      cy.contains('button', 'Forex').should('not.exist')
    })

    // Scenario 11: Actuary sees all types
    it('Scenario 11 — Actuary sees Stocks, Futures, Forex and Options tabs', () => {
      stubAllSecurities()
      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      cy.contains('button', 'Stocks').should('be.visible')
      cy.contains('button', 'Futures').should('be.visible')
      cy.contains('button', 'Forex').should('be.visible')
      cy.contains('button', 'Options').should('be.visible')
    })

    // Scenario 12: Filter by ticker
    it('Scenario 12 — Searching by ticker MSFT filters the list to matching results', () => {
      stubAllSecurities()
      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      // Register filtered intercept AFTER initial load (LIFO)
      cy.intercept('GET', '**/api/v3/securities/stocks*', {
        body: {
          stocks: [{
            id: 2, listing_id: 2, ticker: 'MSFT', name: 'Microsoft Corp',
            exchange_acronym: 'NASDAQ', price: '415.20', change: '-1.50',
            volume: 28000000, market_cap: '3.1T',
            dividend_yield: 0.008, outstanding_shares: 7500000000,
            maintenance_margin: '25%', initial_margin_cost: '50%',
          }],
          total_count: 1,
        },
      }).as('getFilteredStocks')

      cy.get('input[placeholder="Search"]').type('MSFT')
      cy.wait('@getFilteredStocks')

      cy.contains('MSFT').should('be.visible')
      cy.contains('Microsoft Corp').should('be.visible')
      cy.contains('1 stocks').should('be.visible')
    })

    // Scenario 13: Search with no results
    it('Scenario 13 — Searching non-existent ticker shows empty state', () => {
      stubAllSecurities()
      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      cy.intercept('GET', '**/api/v3/securities/stocks*', {
        body: { stocks: [], total_count: 0 },
      }).as('getEmptyStocks')

      cy.get('input[placeholder="Search"]').type('XYZQQ')
      cy.wait('@getEmptyStocks')

      cy.contains('No stocks found.').should('be.visible')
    })

    // Scenario 14: Filter by exchange prefix
    it('Scenario 14 — Filtering by exchange prefix "NYSE" shows only matching stocks', () => {
      stubAllSecurities()
      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      cy.intercept('GET', '**/api/v3/securities/stocks*', {
        body: {
          stocks: [{
            id: 3, listing_id: 3, ticker: 'GS', name: 'Goldman Sachs',
            exchange_acronym: 'NYSE', price: '500.00', change: '+2.00',
            volume: 5000000, market_cap: '0.17T',
            dividend_yield: 0.002, outstanding_shares: 340000000,
            maintenance_margin: '25%', initial_margin_cost: '50%',
          }],
          total_count: 1,
        },
      }).as('getNYSEStocks')

      cy.get('input[placeholder="Exchange"]').type('NYSE')
      cy.wait('@getNYSEStocks')

      cy.get('@getNYSEStocks').its('request.url').should('include', 'exchange_acronym=NYSE')
      cy.contains('GS').should('be.visible')
      cy.contains('Goldman Sachs').should('be.visible')
    })

    // Scenario 15: Invalid price range (min > max)
    // Note: no frontend validation — both values are forwarded to the API.
    it('Scenario 15 — Min price greater than max price is sent to API without frontend error', () => {
      stubAllSecurities()
      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      cy.intercept('GET', '**/api/v3/securities/stocks*', {
        body: { stocks: [], total_count: 0 },
      }).as('getInvalidRangeStocks')

      cy.get('input[placeholder="Min Price"]').type('5000')
      cy.get('input[placeholder="Max Price"]').type('100')
      cy.wait('@getInvalidRangeStocks')

      // No validation error message shown — filter values are passed as-is to the API
      cy.get('@getInvalidRangeStocks')
        .its('request.url')
        .should('include', 'min_price=5000')
        .and('include', 'max_price=100')
    })

    // Scenarios 16-17: Manual/auto data refresh
    // SecuritiesPage has no explicit refresh button. Data freshness is managed
    // by TanStack Query stale/refetch policies — not directly testable in E2E.

    // Scenario 18: Clicking a stock row opens the detail page
    it('Scenario 18 — Clicking a stock row navigates to detail page with chart and info table', () => {
      stubAllSecurities()
      cy.intercept('GET', '**/api/v3/securities/stocks/1', { fixture: 'stock-detail.json' }).as('getStockDetail')
      cy.intercept('GET', '**/api/v3/securities/stocks/1/history*', { fixture: 'stock-history.json' }).as('getHistory')
      cy.intercept('GET', '**/api/v3/securities/options*', { body: { options: [], total_count: 0 } })

      cy.loginAsEmployee('/securities')
      cy.wait('@getStocks')

      // Click the AAPL row to navigate to its detail page
      cy.contains('td', 'AAPL').click()
      cy.wait('@getStockDetail')

      // Chart period buttons present
      cy.contains('button', '1D').should('be.visible')
      cy.contains('button', '1W').should('be.visible')
      cy.contains('button', '1M').should('be.visible')
      cy.contains('button', '1Y').should('be.visible')
      cy.contains('button', '5Y').should('be.visible')
      cy.contains('button', 'All').should('be.visible')

      // Security info table entries
      cy.contains('Ticker').should('be.visible')
      cy.contains('AAPL').should('be.visible')
      cy.contains('Price').should('be.visible')
      cy.contains('178.50').should('be.visible')
      cy.contains('Exchange').should('be.visible')
      cy.contains('NASDAQ').should('be.visible')
    })
  })

  // ── Stock Detail ─────────────────────────────────────────────────────────

  describe('Stock Detail', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/v3/securities/stocks/1', { fixture: 'stock-detail.json' }).as('getStock')
      cy.intercept('GET', '**/api/v3/securities/stocks/1/history*', { fixture: 'stock-history.json' }).as('getHistory')
      cy.intercept('GET', '**/api/v3/securities/options*', { fixture: 'stock-options.json' }).as('getOptions')
    })

    // Scenario 19: Period change triggers new history fetch
    it('Scenario 19 — All period buttons are rendered (1D, 1W, 1M, 1Y, 5Y, All)', () => {
      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')

      cy.contains('button', '1D').should('be.visible')
      cy.contains('button', '1W').should('be.visible')
      cy.contains('button', '1M').should('be.visible')
      cy.contains('button', '1Y').should('be.visible')
      cy.contains('button', '5Y').should('be.visible')
      cy.contains('button', 'All').should('be.visible')
    })

    it('Scenario 19 — Clicking 1W period button fetches history with period=week', () => {
      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getHistory')

      // Register override intercept AFTER initial load (LIFO)
      cy.intercept('GET', '**/api/v3/securities/stocks/1/history*', {
        fixture: 'stock-history.json',
      }).as('getWeekHistory')

      cy.contains('button', '1W').click()
      cy.wait('@getWeekHistory')
      cy.get('@getWeekHistory').its('request.url').should('include', 'period=week')
    })

    it('Scenario 19 — Clicking 1Y period button fetches history with period=year', () => {
      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getHistory')

      cy.intercept('GET', '**/api/v3/securities/stocks/1/history*', {
        fixture: 'stock-history.json',
      }).as('getYearHistory')

      cy.contains('button', '1Y').click()
      cy.wait('@getYearHistory')
      cy.get('@getYearHistory').its('request.url').should('include', 'period=year')
    })

    // Scenario 20: Options chain columns
    it('Scenario 20 — Options chain shows CALLS/PUTS sections with Strike, Bid, Ask, Vol, OI, Premium', () => {
      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getOptions')

      // Options chain renders below the chart and info table — scroll into view
      cy.contains('h2', 'Options Chain').scrollIntoView().should('be.visible')
      cy.contains('th', 'CALLS').scrollIntoView().should('be.visible')
      cy.contains('th', 'PUTS').should('be.visible')
      cy.contains('th', 'Strike').should('be.visible')
      cy.contains('th', 'Bid').should('be.visible')
      cy.contains('th', 'Ask').should('be.visible')
      cy.contains('th', 'Vol').should('be.visible')
      cy.contains('th', 'OI').should('be.visible')
      cy.contains('th', 'Premium').should('be.visible')
      cy.contains('Market Price: $178.50').scrollIntoView().should('be.visible')
      // Settlement date selector
      cy.contains('Settlement Date').should('be.visible')
      cy.contains('Strikes shown').should('be.visible')
    })

    // Scenario 21: ITM/OTM color coding
    it('Scenario 21 — ITM calls (strike < market price) have green background; OTM calls do not', () => {
      // AAPL market price = 178.50
      // Call 170.00 (< 178.50) → ITM → bg-green-50
      // Call 185.00 (> 178.50) → OTM → no green bg
      cy.intercept('GET', '**/api/v3/securities/options*', {
        body: {
          options: [
            {
              id: 300, ticker: 'AAPL240621C00170000', name: 'AAPL Call 170',
              stock_listing_id: 1, option_type: 'call', strike_price: '170.00',
              implied_volatility: '0.30', premium: '10.00', open_interest: 3000,
              settlement_date: '2026-06-21', price: '10.00', ask: '10.20', bid: '9.80', volume: 500,
            },
            {
              id: 301, ticker: 'AAPL240621C00185000', name: 'AAPL Call 185',
              stock_listing_id: 1, option_type: 'call', strike_price: '185.00',
              implied_volatility: '0.22', premium: '3.00', open_interest: 1500,
              settlement_date: '2026-06-21', price: '3.00', ask: '3.20', bid: '2.80', volume: 200,
            },
          ],
          total_count: 2,
        },
      }).as('getITMOptions')

      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getITMOptions')

      // ITM call row (strike $170.00): first td in that row has bg-green-50
      cy.contains('td', '$170.00')
        .parent()
        .find('td')
        .first()
        .should('have.class', 'bg-green-50')

      // OTM call row (strike $185.00): first td does NOT have bg-green-50
      cy.contains('td', '$185.00')
        .parent()
        .find('td')
        .first()
        .should('not.have.class', 'bg-green-50')
    })

    it('Scenario 21 — Shared Price (Market Price) is clearly displayed in the options chain header', () => {
      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getOptions')

      // Header is below the chart + info table on stock detail; scroll to it first
      cy.contains('Market Price: $178.50').scrollIntoView().should('be.visible')
    })

    // Scenario 22: Strike count filter limits displayed rows
    it('Scenario 22 — Setting Strikes shown to 1 limits visible option rows to 3 (1 below + pivot + 1 above)', () => {
      // 7 options across strikes 160-190; AAPL at 178.50
      // sharedIdx = index of first strike >= 178.50 = index of 180 = 4
      // strikeCount=1: start=max(0,4-1)=3, end=min(7,4+1+1)=6 → [175,180,185] = 3 rows
      cy.intercept('GET', '**/api/v3/securities/options*', {
        body: {
          options: [
            { id: 310, ticker: 'C160', name: 'Call 160', stock_listing_id: 1, option_type: 'call', strike_price: '160.00', implied_volatility: '0.35', premium: '20.00', open_interest: 1000, settlement_date: '2026-06-21', price: '20.00', ask: '20.20', bid: '19.80', volume: 100 },
            { id: 311, ticker: 'C165', name: 'Call 165', stock_listing_id: 1, option_type: 'call', strike_price: '165.00', implied_volatility: '0.33', premium: '15.00', open_interest: 1200, settlement_date: '2026-06-21', price: '15.00', ask: '15.20', bid: '14.80', volume: 150 },
            { id: 312, ticker: 'C170', name: 'Call 170', stock_listing_id: 1, option_type: 'call', strike_price: '170.00', implied_volatility: '0.30', premium: '10.00', open_interest: 1500, settlement_date: '2026-06-21', price: '10.00', ask: '10.20', bid: '9.80', volume: 200 },
            { id: 313, ticker: 'C175', name: 'Call 175', stock_listing_id: 1, option_type: 'call', strike_price: '175.00', implied_volatility: '0.28', premium: '6.00', open_interest: 2000, settlement_date: '2026-06-21', price: '6.00', ask: '6.20', bid: '5.80', volume: 300 },
            { id: 314, ticker: 'C180', name: 'Call 180', stock_listing_id: 1, option_type: 'call', strike_price: '180.00', implied_volatility: '0.25', premium: '3.50', open_interest: 2500, settlement_date: '2026-06-21', price: '3.50', ask: '3.70', bid: '3.30', volume: 400 },
            { id: 315, ticker: 'C185', name: 'Call 185', stock_listing_id: 1, option_type: 'call', strike_price: '185.00', implied_volatility: '0.22', premium: '2.00', open_interest: 1800, settlement_date: '2026-06-21', price: '2.00', ask: '2.20', bid: '1.80', volume: 250 },
            { id: 316, ticker: 'C190', name: 'Call 190', stock_listing_id: 1, option_type: 'call', strike_price: '190.00', implied_volatility: '0.20', premium: '1.00', open_interest: 1000, settlement_date: '2026-06-21', price: '1.00', ask: '1.20', bid: '0.80', volume: 100 },
          ],
          total_count: 7,
        },
      }).as('getManyOptions')

      cy.loginAsEmployee('/securities/stocks/1')
      cy.wait('@getStock')
      cy.wait('@getManyOptions')

      // Default strikeCount=5 shows all 7 rows
      cy.get('tbody tr').should('have.length', 7)

      // Set strike count to 1 → 3 visible rows: $175.00, $180.00, $185.00
      cy.get('#strike-count').click().type('{selectall}1')
      cy.get('tbody tr').should('have.length', 3)
      cy.contains('$175.00').should('be.visible')
      cy.contains('$180.00').should('be.visible')
      cy.contains('$185.00').should('be.visible')
      cy.contains('$160.00').should('not.exist')
      cy.contains('$190.00').should('not.exist')
    })
  })

  // ── Futures — Settlement Date Filter (Scenario 23) ───────────────────────

  describe('Futures', () => {

    it('Scenario 23 — Settlement date range filter sends correct params and narrows futures results', () => {
      cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
      cy.intercept('GET', '**/api/v3/securities/futures*', { fixture: 'futures-list.json' }).as('getFutures')
      cy.intercept('GET', '**/api/v3/securities/forex*', { body: { forex_pairs: [], total: 0 } })

      cy.loginAsEmployee('/securities')
      cy.wait('@getFutures')

      cy.contains('button', 'Futures').click()

      // Register filtered intercept AFTER switching tab (LIFO)
      cy.intercept('GET', '**/api/v3/securities/futures*', {
        body: { futures: [], total: 0 },
      }).as('getFilteredFutures')

      cy.get('input[placeholder="Settle From"]').type('2026-06-01')
      cy.get('input[placeholder="Settle To"]').type('2026-06-30')

      cy.wait('@getFilteredFutures')
      cy.get('@getFilteredFutures')
        .its('request.url')
        .should('include', 'settlement_date_from=2026-06-01')
        .and('include', 'settlement_date_to=2026-06-30')
    })
  })

  // ── Create Order — Quantity Validation (Scenario 24) ────────────────────

  describe('Create Order', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' })
      cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
      cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
      cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total: 0 } })
    })

    it('Scenario 24 — Quantity input has min=1 constraint and type=number', () => {
      cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')

      cy.get('#quantity')
        .should('have.attr', 'type', 'number')
        .and('have.attr', 'min', '1')
    })

    it('Scenario 24 — Entering quantity 0 makes the input invalid (HTML5 min constraint)', () => {
      cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')

      cy.get('#quantity').type('0')
      cy.get('#quantity').then(($input) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(($input[0] as HTMLInputElement).validity.valid).to.be.false
      })
    })

    it('Scenario 24 — Entering negative quantity makes the input invalid (HTML5 min constraint)', () => {
      cy.loginAsClient('/securities/order/new?listingId=1&direction=buy')

      cy.get('#quantity').type('-5')
      cy.get('#quantity').then(($input) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(($input[0] as HTMLInputElement).validity.valid).to.be.false
      })
    })
  })

  // ── Scenario 25: Securities from unknown exchange ─────────────────────────
  // SecuritiesPage renders all stocks returned by the API without client-side
  // exchange filtering. Exclusion of securities with unknown exchanges is
  // enforced by the backend — not testable at the frontend layer.
})
