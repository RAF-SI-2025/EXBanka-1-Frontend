// Celina 4 — Portal Profit Banke (Scenarios 47–50)
//
// FE routes:
//   /admin/profit/actuaries → ActuaryPerformanceView  (gated by actuaries.read.all)
//   /admin/profit/funds     → BankFundPositionsView    (gated by funds.bank-position-read)

describe('Celina 4 — Portal Profit Banke', () => {
  // ── Scenario 47: Supervizor vidi spisak aktuara sa profitom ───────────────
  it('Scenario 47 — supervisor sees the actuary performance list with realised profit in RSD', () => {
    cy.intercept('GET', '**/api/v3/actuaries/performance', {
      body: {
        actuaries: [
          {
            employee_id: 3,
            first_name: 'Jovan',
            last_name: 'Jovanović',
            position: 'supervisor',
            trade_count: 12,
            realised_profit_rsd: '125000.00',
          },
          {
            employee_id: 5,
            first_name: 'Ana',
            last_name: 'Anić',
            position: 'agent',
            trade_count: 4,
            realised_profit_rsd: '30000.00',
          },
        ],
      },
    }).as('getActuaries')

    cy.loginAsEmployee('/admin/profit/actuaries')
    cy.wait('@getActuaries')

    cy.contains('h1', 'Actuary Performance').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Position').should('be.visible')
    cy.contains('th', 'Trades').should('be.visible')
    cy.contains('th', 'Realised profit (RSD)').should('be.visible')

    cy.contains('Jovan Jovanović').should('be.visible')
    cy.contains('125000.00').should('be.visible')
    cy.contains('Ana Anić').should('be.visible')
  })

  // ── Scenario 48: Agent nema pristup portalu Profit Banke ──────────────────
  // The portal is gated by the actuaries.read.all permission. A user without it
  // is redirected away. (A client stands in for a non-permitted actor.)
  it('Scenario 48 — a user without actuaries.read.all is denied the profit portal', () => {
    cy.loginAsClient('/admin/profit/actuaries')
    cy.contains('h1', 'Actuary Performance').should('not.exist')
    cy.url().should('not.include', '/admin/profit/actuaries')
  })

  // ── Scenario 40 (Pozicije u fondovima): Supervizor vidi pozicije banke ─────
  it('Scenario 40 (fund positions) — supervisor sees the bank fund positions with stake and profit', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/positions', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            percentage_fund: '15.00',
            total_contributed_rsd: '1000000.00',
            current_value_rsd: '1100000.00',
            profit_rsd: '100000.00',
          },
        ],
      },
    }).as('getPositions')
    cy.intercept('GET', '**/api/v3/bank-accounts', { body: { accounts: [] } })

    cy.loginAsEmployee('/admin/profit/funds')
    cy.wait('@getPositions')

    cy.contains('h1', 'Bank Fund Positions').should('be.visible')
    cy.contains('th', 'Fund').should('be.visible')
    cy.contains('th', '% Fund').should('be.visible')
    cy.contains('th', 'Contributed').should('be.visible')
    cy.contains('th', 'Current value').should('be.visible')
    cy.contains('th', 'Profit').should('be.visible')

    cy.contains('a', 'Alpha Growth').should('be.visible')
    cy.contains('15.00%').should('be.visible')
    cy.contains('button', 'Invest').should('be.visible')
    cy.contains('button', 'Redeem').should('be.visible')
  })

  // ── Scenario 49: Supervizor uplaćuje novac u fond u ime banke ─────────────
  it('Scenario 49 — supervisor opens the bank deposit (Invest) dialog for a fund', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/positions', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            percentage_fund: '15.00',
            total_contributed_rsd: '1000000.00',
            current_value_rsd: '1100000.00',
            profit_rsd: '100000.00',
          },
        ],
      },
    }).as('getPositions')
    // Invest dialog needs the fund detail (useFund) and bank accounts.
    cy.intercept('GET', '**/api/v3/investment-funds/7', {
      body: {
        fund: {
          id: 7,
          name: 'Alpha Growth',
          description: 'IT-sector focus',
          minimum_contribution_rsd: '1000.00',
          manager_employee_id: 3,
          rsd_account_id: 500,
          active: true,
          created_at: '2026-04-28T15:00:00Z',
        },
        holdings: [],
        investor_count: 1,
        total_contributed_rsd: '1000000.00',
        liquid_rsd_balance: '500000.00',
        total_holdings_value_rsd: '600000.00',
        total_value_rsd: '1100000.00',
        total_dividends_paid_rsd: '0.00',
        profit_rsd: '100000.00',
        profit_pct: '10.0000',
      },
    }).as('getFund')
    cy.intercept('GET', '**/api/v3/bank-accounts', {
      body: {
        accounts: [
          {
            id: 600,
            account_number: '900000000000000600',
            account_name: 'Bank RSD',
            currency_code: 'RSD',
            available_balance: 5_000_000,
          },
        ],
      },
    })
    cy.intercept('GET', '**/api/v3/employees/3', { statusCode: 404, body: {} })

    cy.loginAsEmployee('/admin/profit/funds')
    cy.wait('@getPositions')

    cy.contains('button', 'Invest').click()
    cy.wait('@getFund')
    cy.get('[role="dialog"]').contains('Invest in Alpha Growth').should('be.visible')
  })

  // ── Scenario 50: Supervizor povlači novac iz fonda za banku — bez provizije
  it('Scenario 50 — supervisor opens the bank withdraw (Redeem) dialog (fee-free for the bank)', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/positions', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            percentage_fund: '15.00',
            total_contributed_rsd: '1000000.00',
            current_value_rsd: '1100000.00',
            profit_rsd: '100000.00',
          },
        ],
      },
    }).as('getPositions')
    cy.intercept('GET', '**/api/v3/investment-funds/7', { statusCode: 404, body: {} })
    cy.intercept('GET', '**/api/v3/bank-accounts', {
      body: {
        accounts: [
          {
            id: 600,
            account_number: '900000000000000600',
            account_name: 'Bank RSD',
            currency_code: 'RSD',
            available_balance: 5_000_000,
          },
        ],
      },
    })

    cy.loginAsEmployee('/admin/profit/funds')
    cy.wait('@getPositions')

    cy.contains('button', 'Redeem').click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Redeem from Alpha Growth').should('be.visible')
      cy.contains('Bank redemptions are fee-free.').should('be.visible')
    })
  })
})
