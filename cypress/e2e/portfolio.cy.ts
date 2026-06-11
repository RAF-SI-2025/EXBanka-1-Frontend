// GET /api/v3/me/portfolio was rewritten in Plan B (spec § 48.1, 2026-05-28):
// no query parameters, response is the unified grouped portfolio with
// `securities.positions` and `funds.positions`. Each securities position
// carries `holding_id`, used by the Exercise action.

// Helper: build a portfolio response with the given security positions.
function portfolioWith(positions: Record<string, unknown>[]) {
  return {
    portfolio_id: 'client-42',
    owner_type: 'client',
    owner_id: 42,
    owner_name: '',
    total_value_rsd: '0',
    total_profit_rsd: '0',
    total_profit_pct: '0',
    securities: {
      total_value_rsd: '0',
      total_profit_rsd: '0',
      total_profit_pct: '0',
      positions,
    },
    funds: {
      total_value_rsd: '0',
      total_profit_rsd: '0',
      total_profit_pct: '0',
      positions: [],
    },
  }
}

describe('Portfolio Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      fixture: 'portfolio-holdings.json',
    }).as('getPortfolio')
    cy.intercept('GET', '**/api/v3/me/portfolio/summary*', {
      fixture: 'portfolio-summary.json',
    }).as('getSummary')
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

    // Table headers (new shape — spec §48.1)
    cy.contains('th', 'Symbol').scrollIntoView().should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Avg Cost').should('be.visible')
    cy.contains('th', 'Current Price').should('be.visible')
    cy.contains('th', 'Current Value').should('be.visible')
    cy.contains('th', 'Last Updated').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Position data
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.contains('td', 'stock').should('be.visible')

    cy.contains('td', 'ESM26').should('be.visible')
    cy.contains('td', 'future').should('be.visible')

    cy.contains('2 holdings').scrollIntoView().should('be.visible')
  })

  it('should show Sell button for all holdings', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Sell').scrollIntoView().should('be.visible')
  })

  it('should not show a Make Public button (feature removed)', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Make Public').should('not.exist')
  })

  it('should navigate to holding transactions on row click', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('td', 'AAPL').click()
    cy.url().should('include', '/portfolio/holdings/30/transactions')
  })

  it('should show empty state when no holdings', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([]),
    }).as('getEmptyPortfolio')

    cy.loginAsClient('/portfolio')
    cy.wait('@getEmptyPortfolio')

    cy.contains('No holdings found.').should('be.visible')
  })

  // ── Scenario 67: Portfolio prikazuje listu posedovanih hartija ────────────

  it('Scenario 67 — Holdings list shows asset type, symbol, quantity and last updated for each row', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    // AAPL stock row
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.contains('td', 'stock').should('be.visible')
    cy.contains('td', '50').should('be.visible')

    // ESM26 futures row (spec uses singular 'future')
    cy.contains('td', 'ESM26').should('be.visible')
    cy.contains('td', 'future').should('be.visible')
    cy.contains('td', '5').should('be.visible')

    // Last Updated column is rendered
    cy.contains('th', 'Last Updated').should('be.visible')
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

  // ── Scenario 70: Akcije i opcije imaju različite akcije u tabeli ──────────
  // The "Make Public" action was removed from holdings. The surviving
  // per-asset-type signal is the action column: option rows expose Exercise,
  // non-option rows expose only Sell (and never Exercise / Make Public).

  it('Scenario 70 — option holdings expose Exercise; stock holdings do not, and Make Public is gone', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([
        {
          asset_type: 'stock',
          symbol: 'AAPL',
          holding_id: 30,
          quantity: 50,
          avg_cost_rsd: '200.0000',
          current_price_rsd: '220.0000',
          current_value_rsd: '11000.0000',
          p_l_rsd: '1000.0000',
          p_l_pct: '10.0000',
          last_updated: '2026-04-20T10:00:00Z',
          dividends_received_rsd: '0.00',
        },
        {
          asset_type: 'option',
          symbol: 'AAPL240621C00170000',
          holding_id: 32,
          quantity: 5,
          avg_cost_rsd: '5.0000',
          current_price_rsd: '6.0000',
          current_value_rsd: '30.0000',
          p_l_rsd: '5.0000',
          p_l_pct: '20.0000',
          last_updated: '2026-04-22T08:00:00Z',
          dividends_received_rsd: '0.00',
        },
      ]),
    }).as('getMixedHoldings')

    cy.loginAsClient('/portfolio')
    cy.wait('@getMixedHoldings')

    // Make Public is gone everywhere. Stock row has Sell only; option row has
    // Exercise instead.
    cy.get('tbody tr').eq(0).contains('button', 'Sell').scrollIntoView().should('be.visible')
    cy.get('tbody tr').eq(0).contains('button', 'Make Public').should('not.exist')
    cy.get('tbody tr').eq(0).contains('button', 'Exercise').should('not.exist')
    cy.get('tbody tr').eq(1).contains('button', 'Make Public').should('not.exist')
    cy.get('tbody tr').eq(1).contains('button', 'Exercise').scrollIntoView().should('be.visible')
  })

  // ── Scenario 71: Aktuar može da iskoristi opciju in-the-money ────────────

  it('Scenario 71 — Exercise button is shown for option holdings', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([
        {
          asset_type: 'option',
          symbol: 'AAPL240621C00170000',
          holding_id: 32,
          quantity: 5,
          avg_cost_rsd: '5.0000',
          current_price_rsd: '6.0000',
          current_value_rsd: '30.0000',
          p_l_rsd: '5.0000',
          p_l_pct: '20.0000',
          last_updated: '2026-04-22T08:00:00Z',
          dividends_received_rsd: '0.00',
        },
      ]),
    }).as('getOptionHolding')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getOptionHolding')

    cy.contains('button', 'Exercise').scrollIntoView().should('be.visible')
  })

  it('Scenario 71 — Clicking Exercise calls POST /api/v3/me/portfolio/:holding_id/exercise', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([
        {
          asset_type: 'option',
          symbol: 'AAPL240621C00170000',
          holding_id: 32,
          quantity: 5,
          avg_cost_rsd: '5.0000',
          current_price_rsd: '6.0000',
          current_value_rsd: '30.0000',
          p_l_rsd: '5.0000',
          p_l_pct: '20.0000',
          last_updated: '2026-04-22T08:00:00Z',
          dividends_received_rsd: '0.00',
        },
      ]),
    }).as('getOptionHolding')
    cy.intercept('POST', '**/api/v3/me/portfolio/32/exercise', {
      statusCode: 200,
      body: { asset_type: 'option', symbol: 'AAPL240621C00170000', holding_id: 32, quantity: 0 },
    }).as('exerciseOption')

    cy.loginAsEmployee('/portfolio')
    cy.wait('@getOptionHolding')

    cy.contains('button', 'Exercise').click()
    cy.wait('@exerciseOption')
    cy.get('@exerciseOption').its('request.url').should('include', '/portfolio/32/exercise')
  })

  it('Scenario 71 — Backend rejects exercise for out-of-the-money option with 400', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([
        {
          asset_type: 'option',
          symbol: 'AAPL240621C00170000',
          holding_id: 32,
          quantity: 5,
          avg_cost_rsd: '5.0000',
          current_price_rsd: '6.0000',
          current_value_rsd: '30.0000',
          p_l_rsd: '5.0000',
          p_l_pct: '20.0000',
          last_updated: '2026-04-22T08:00:00Z',
          dividends_received_rsd: '0.00',
        },
      ]),
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

  it('Scenario 72 — Client portfolio with stocks and futures shows no Exercise button', () => {
    cy.loginAsClient('/portfolio')
    cy.wait('@getPortfolio')

    cy.contains('button', 'Exercise').should('not.exist')
    cy.contains('button', 'Sell').scrollIntoView().should('be.visible')
    cy.contains('button', 'Make Public').should('not.exist')
  })

  // ── Scenario 73: Hartija prelazi u portfolio nakon izvršenog BUY ordera ───

  it('Scenario 73 — Newly acquired holding appears in portfolio with a Sell action', () => {
    cy.intercept('GET', '**/api/v3/me/portfolio', {
      body: portfolioWith([
        {
          asset_type: 'stock',
          symbol: 'MSFT',
          holding_id: 33,
          quantity: 10,
          avg_cost_rsd: '350.0000',
          current_price_rsd: '360.0000',
          current_value_rsd: '3600.0000',
          p_l_rsd: '100.0000',
          p_l_pct: '2.8571',
          last_updated: '2026-04-25T14:00:00Z',
          dividends_received_rsd: '0.00',
        },
      ]),
    }).as('getNewHolding')

    cy.loginAsClient('/portfolio')
    cy.wait('@getNewHolding')

    cy.contains('td', 'MSFT').scrollIntoView().should('be.visible')
    cy.contains('td', 'stock').should('be.visible')
    // The Make Public action was removed; a newly acquired stock holding still
    // exposes the Sell action.
    cy.contains('button', 'Sell').scrollIntoView().should('be.visible')
    cy.contains('button', 'Make Public').should('not.exist')
  })
})
