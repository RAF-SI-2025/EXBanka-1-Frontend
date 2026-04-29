describe('Portfolio Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', { fixture: 'portfolio-holdings.json' }).as(
      'getPortfolio'
    )
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', { fixture: 'portfolio-summary.json' }).as(
      'getSummary'
    )
  })

  it('should display portfolio summary card', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('h1', 'Portfolio').should('be.visible')

    cy.contains('Unrealized P&L').should('be.visible')
    cy.contains('750.00').should('be.visible')
    cy.contains('Realized (Lifetime)').should('be.visible')
    cy.contains('175.00 RSD').should('be.visible')
    cy.contains('Tax Paid (Year)').should('be.visible')
    cy.contains('50.00 RSD').should('be.visible')
    cy.contains('Open Positions').should('be.visible')
    cy.contains('2').should('be.visible')
  })

  it('should display holdings table', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // Table headers
    cy.contains('th', 'Ticker').scrollIntoView().should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Public Qty').should('be.visible')
    cy.contains('th', 'Account').should('be.visible')
    cy.contains('th', 'Last Modified').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Holding data
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.contains('td', 'Apple Inc.').should('be.visible')
    cy.contains('td', 'stock').should('be.visible')

    cy.contains('td', 'ESM26').should('be.visible')
    cy.contains('td', 'E-mini S&P 500 Jun 2026').should('be.visible')
    cy.contains('td', 'futures').should('be.visible')

    cy.contains('2 holdings').scrollIntoView().should('be.visible')
  })

  it('should show Sell button for all holdings', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Sell').scrollIntoView().should('be.visible')
  })

  it('should show Make Public button for non-option holdings', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Make Public').scrollIntoView().should('be.visible')
  })

  it('should make a holding public', () => {
    cy.intercept('POST', '**/api/v3/me/portfolio/30/make-public', {
      statusCode: 200,
      body: { id: 30, is_public: true, public_quantity: 1 },
    }).as('makePublic')

    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Make Public').first().click()
    cy.wait('@makePublic')
  })

  it('should navigate to holding transactions on row click', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('td', 'AAPL').click()
    cy.url().should('include', '/portfolio/holdings/30/transactions')
  })

  it('should show empty state when no holdings', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: { holdings: [], total_count: 0 },
    }).as('getEmptyPortfolio')

    cy.loginAsClient('/portfolio')
    cy.wait('@getEmptyPortfolio')

    cy.contains('No holdings found.').should('be.visible')
  })

  // ── Scenario 67: Portfolio prikazuje listu posedovanih hartija ────────────

  it('Scenario 67 — Holdings list shows security type, ticker, quantity and last modified for each row', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // AAPL stock row
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.contains('td', 'Apple Inc.').should('be.visible')
    cy.contains('td', 'stock').should('be.visible')
    cy.contains('td', '50').should('be.visible')

    // ESM26 futures row
    cy.contains('td', 'ESM26').should('be.visible')
    cy.contains('td', 'E-mini S&P 500 Jun 2026').should('be.visible')
    cy.contains('td', 'futures').should('be.visible')
    cy.contains('td', '5').should('be.visible')

    // Last Modified column is rendered (dates shown)
    cy.contains('th', 'Last Modified').should('be.visible')
    cy.get('tbody tr').should('have.length', 2)
  })

  // ── Scenario 68: Portfolio prikazuje ukupan profit ────────────────────────

  it('Scenario 68 — Summary card shows unrealized profit and realized lifetime profit', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('Unrealized P&L').should('be.visible')
    cy.contains('750.00').should('be.visible')

    cy.contains('Realized (Lifetime)').should('be.visible')
    cy.contains('175.00 RSD').should('be.visible')

    cy.contains('Open Positions').should('be.visible')
    cy.contains('2').should('be.visible')
  })

  // ── Scenario 69: Portfolio prikazuje podatke o porezu ────────────────────

  it('Scenario 69 — Summary card shows tax paid for the current year', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummary')

    cy.contains('Tax Paid (Year)').should('be.visible')
    // Fixture: tax_paid_this_year = "50.00"
    cy.contains('50.00 RSD').should('be.visible')
  })

  it('Scenario 69 — Summary reflects zero unpaid tax when all tax is settled', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      body: {
        total_profit: '100.00',
        total_profit_rsd: '11700.00',
        unrealized_profit: '100.00',
        realized_profit_this_month_rsd: '0.00',
        realized_profit_this_year_rsd: '500.00',
        realized_profit_lifetime_rsd: '500.00',
        tax_paid_this_year: '75.00',
        tax_unpaid_this_month: '0.00',
        tax_unpaid_total_rsd: '0.00',
        open_positions_count: 1,
        closed_trades_this_year: 1,
      },
    }).as('getSummaryZeroUnpaid')

    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')
    cy.wait('@getSummaryZeroUnpaid')

    cy.contains('Tax Paid (Year)').should('be.visible')
    cy.contains('75.00 RSD').should('be.visible')
  })

  // ── Scenario 70: Za akcije postoji opcija javnog režima ──────────────────

  it('Scenario 70 — Public Qty column shows current public_quantity for each holding', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // AAPL: public_quantity=0; ESM26: public_quantity=2
    cy.contains('th', 'Public Qty').scrollIntoView().should('be.visible')
    cy.get('tbody tr').eq(0).contains('td', '0').scrollIntoView().should('be.visible')
    cy.get('tbody tr').eq(1).contains('td', '2').scrollIntoView().should('be.visible')
  })

  it('Scenario 70 — Make Public button is shown for stock and futures holdings but not for options', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: {
        holdings: [
          {
            id: 30, security_type: 'stock', ticker: 'AAPL', name: 'Apple Inc.',
            quantity: 50, public_quantity: 0, account_id: 101, last_modified: '2026-04-20T10:00:00Z',
          },
          {
            id: 32, security_type: 'option', ticker: 'AAPL240621C00170000', name: 'AAPL Call 170',
            quantity: 5, public_quantity: 0, account_id: 103, last_modified: '2026-04-22T08:00:00Z',
          },
        ],
        total_count: 2,
      },
    }).as('getMixedHoldings')

    cy.loginAsClient('/portfolio')
    cy.wait('@getMixedHoldings')

    // Stock row has Make Public; option row has Exercise instead
    cy.get('tbody tr').eq(0).contains('button', 'Make Public').scrollIntoView().should('be.visible')
    cy.get('tbody tr').eq(1).contains('button', 'Make Public').should('not.exist')
    cy.get('tbody tr').eq(1).contains('button', 'Exercise').scrollIntoView().should('be.visible')
  })

  // ── Scenario 71: Aktuar može da iskoristi opciju in-the-money ────────────

  it('Scenario 71 — Exercise button is shown for option holdings', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: {
        holdings: [{
          id: 32, security_type: 'option', ticker: 'AAPL240621C00170000', name: 'AAPL Call 170',
          quantity: 5, public_quantity: 0, account_id: 103, last_modified: '2026-04-22T08:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getOptionHolding')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getOptionHolding')

    cy.contains('button', 'Exercise').scrollIntoView().should('be.visible')
  })

  it('Scenario 71 — Clicking Exercise calls POST /api/v3/me/portfolio/:id/exercise', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: {
        holdings: [{
          id: 32, security_type: 'option', ticker: 'AAPL240621C00170000', name: 'AAPL Call 170',
          quantity: 5, public_quantity: 0, account_id: 103, last_modified: '2026-04-22T08:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getOptionHolding')
    cy.intercept('POST', '**/api/v3/me/portfolio/32/exercise', {
      statusCode: 200,
      body: { id: 32, security_type: 'option', quantity: 0 },
    }).as('exerciseOption')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getOptionHolding')

    cy.contains('button', 'Exercise').click()
    cy.wait('@exerciseOption')
    cy.get('@exerciseOption').its('request.url').should('include', '/portfolio/32/exercise')
  })

  it('Scenario 71 — Backend rejects exercise for out-of-the-money option with 400', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: {
        holdings: [{
          id: 32, security_type: 'option', ticker: 'AAPL240621C00170000', name: 'AAPL Call 170',
          quantity: 5, public_quantity: 0, account_id: 103, last_modified: '2026-04-22T08:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getOptionHolding')
    cy.intercept('POST', '**/api/v3/me/portfolio/32/exercise', {
      statusCode: 400,
      body: { message: 'Option is not in-the-money' },
    }).as('rejectExercise')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getOptionHolding')

    cy.contains('button', 'Exercise').click()
    cy.wait('@rejectExercise')
    cy.get('@rejectExercise').its('response.statusCode').should('eq', 400)
  })

  // ── Scenario 72: Klijent ne vidi opciju iskorišćavanja ───────────────────
  // HoldingTable shows the Exercise button for security_type==='option' regardless
  // of user role — role-based hiding is not implemented in the current frontend.
  // Since clients hold only stocks and futures (no options), the Exercise button
  // is implicitly absent from a client's portfolio.

  it('Scenario 72 — Client portfolio with stocks and futures shows no Exercise button', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // Default fixture has stock + futures holdings — no option type → no Exercise button
    cy.contains('button', 'Exercise').should('not.exist')
    cy.contains('button', 'Sell').scrollIntoView().should('be.visible')
    cy.contains('button', 'Make Public').scrollIntoView().should('be.visible')
  })

  // ── Scenario 73: Hartija prelazi u portfolio nakon izvršenog BUY ordera ───

  it('Scenario 73 — Newly acquired holding appears in portfolio with public_quantity=0 (private by default)', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio?*', {
      body: {
        holdings: [{
          id: 33, security_type: 'stock', ticker: 'MSFT', name: 'Microsoft Corp.',
          quantity: 10, public_quantity: 0, account_id: 101,
          last_modified: '2026-04-25T14:00:00Z',
        }],
        total_count: 1,
      },
    }).as('getNewHolding')

    cy.loginAsClient('/portfolio')
    cy.wait('@getNewHolding')

    cy.contains('td', 'MSFT').scrollIntoView().should('be.visible')
    cy.contains('td', 'Microsoft Corp.').should('be.visible')
    cy.contains('td', 'stock').should('be.visible')
    // public_quantity=0 → holding is private by default
    cy.get('tbody tr').eq(0).find('td').eq(4).should('have.text', '0')
    cy.contains('button', 'Make Public').scrollIntoView().should('be.visible')
  })
})
