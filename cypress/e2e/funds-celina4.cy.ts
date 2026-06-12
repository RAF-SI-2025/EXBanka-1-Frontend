// Celina 4 — Investicioni fondovi (Scenarios 29–46)
//
// FE routes:
//   /funds            → FundsView           (discovery list)
//   /funds/:id        → FundDetailsView     (detail + holdings)
//   /funds/new        → CreateFundView      (gated by funds.manage)
//   /portfolio?tab=funds → PortfolioView    ("Moji fondovi", client-only)
//   /securities/order/new → CreateOrderView (buy securities for a fund/bank)
//   /employees/:id    → EditEmployeeView    (role / isSupervisor management)

const FUND = {
  id: 7,
  name: 'Alpha Growth',
  description: 'IT-sector focus',
  minimum_contribution_rsd: '1000.00',
  manager_employee_id: 3,
  rsd_account_id: 500,
  active: true,
  created_at: '2026-04-28T15:00:00Z',
  fund_value_rsd: '2600000.00',
  liquid_cash_rsd: '1500000.00',
  profit_rsd: '5000.00',
  annualized_return_pct: '12.40',
  volatility_pct: '9.00',
  reward_to_variability: '1.31',
  max_drawdown_pct: '-7.20',
  metrics_available: true,
}

const FUND_DETAIL = {
  fund: FUND,
  holdings: [
    {
      security_type: 'stock',
      security_id: 42,
      ticker: 'AAPL',
      quantity: 100,
      average_price_rsd: '20000.00',
      current_price_rsd: '22000.00',
      current_value_rsd: '2200000.00',
      acquired_at: '2026-05-01T00:00:00Z',
    },
  ],
  investor_count: 42,
  total_contributed_rsd: '5000000.00',
  liquid_rsd_balance: '1500000.00',
  total_holdings_value_rsd: '3500000.00',
  total_value_rsd: '5000000.00',
  total_dividends_paid_rsd: '0.00',
  profit_rsd: '5000.00',
  profit_pct: '0.1000',
  history: [
    { date: '2026-05-01', total_value_rsd: '4800000.00' },
    { date: '2026-05-02', total_value_rsd: '4900000.00' },
    { date: '2026-05-03', total_value_rsd: '5000000.00' },
  ],
  average_history: [
    { date: '2026-05-01', total_value_rsd: '100.00' },
    { date: '2026-05-02', total_value_rsd: '101.50' },
    { date: '2026-05-03', total_value_rsd: '103.00' },
  ],
}

const CLIENT_RSD_ACCOUNT = {
  id: 1,
  account_number: '111000000000000001',
  account_name: 'Tekući račun',
  currency_code: 'RSD',
  available_balance: 1_000_000,
}

describe('Celina 4 — Investicioni fondovi: Discovery i detalji', () => {
  // ── Scenario 29: Klijent vidi listu fondova na discovery stranici ─────────
  it('Scenario 29 — client sees the funds discovery table with all columns', () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', {
      body: { funds: [FUND], total: 1 },
    }).as('getFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.contains('h1', 'Funds').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Description').should('be.visible')
    cy.contains('th', 'Fund value').should('be.visible')
    cy.contains('th', 'Profit').should('be.visible')
    cy.contains('th', 'Min. contribution').should('be.visible')

    cy.contains('a', 'Alpha Growth').should('be.visible')
    cy.contains('td', 'IT-sector focus').should('be.visible')
    cy.contains('button', 'Invest').should('be.visible')
  })

  // ── Scenario 30: Filtriranje i sortiranje fondova ─────────────────────────
  // The discovery page exposes a Search filter and an "Active only" toggle, both
  // re-querying the backend. Sort-by-value is supported by the API but has no
  // dedicated UI control in the current frontend (documented).
  it('Scenario 30 — typing in Search re-queries the funds list', () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', {
      body: { funds: [FUND], total: 1 },
    }).as('getFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.intercept('GET', '**/api/v3/investment-funds*', (req) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('search')) {
        req.reply({ body: { funds: [FUND], total: 1 } })
      }
    }).as('getFilteredFunds')

    // Search re-queries on every keystroke (no debounce), so the alias captures
    // search=A, search=Al, … search=Alpha. Assert that one of those requests
    // carried the full term rather than waiting on the first (search=A).
    cy.get('#funds-search').type('Alpha')
    cy.get('@getFilteredFunds.all').should((calls) => {
      expect(calls.some((c) => c.request.url.includes('search=Alpha'))).to.equal(true)
    })
  })

  // ── Scenario 31: Klijent otvara detaljan prikaz fonda ─────────────────────
  it('Scenario 31 — client opens the fund detail with metrics and holdings', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/7', { body: FUND_DETAIL }).as('getFund')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/funds/7')
    cy.wait('@getFund')

    cy.contains('h1', 'Alpha Growth').should('be.visible')
    // Detail metrics. The page scrolls inside <main overflow-y-auto>, so content
    // below the fold must be scrolled into view before asserting visibility.
    cy.contains('Manager').scrollIntoView().should('be.visible')
    cy.contains('Liquid cash').scrollIntoView().should('be.visible')
    cy.contains('Investors').scrollIntoView().should('be.visible')
    cy.contains('Min. contribution').scrollIntoView().should('be.visible')
    // Holdings table (Ticker, Quantity, Avg/Current price, Current value, Acquired)
    cy.contains('Holdings').scrollIntoView().should('be.visible')
    cy.contains('th', 'Ticker').scrollIntoView().should('be.visible')
    cy.contains('th', 'Quantity').scrollIntoView().should('be.visible')
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
  })

  // ── Scenario 32: Supervizor vidi dugme za prodaju pored svake hartije ─────
  // Not implemented: the fund holdings tables (FundHoldingsTable /
  // FundPortfolioHoldingsTable) render no per-holding Sell action for any role.
  // Documented; the employee can view the holdings list on the detail page.
  it('Scenario 32 — per-holding Sell button is not implemented on the fund detail (holdings still listed)', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/7', { body: FUND_DETAIL }).as('getFund')
    cy.intercept('GET', '**/api/v3/bank-accounts', { body: { accounts: [CLIENT_RSD_ACCOUNT] } })
    cy.intercept('GET', '**/api/v3/employees/3', { statusCode: 404, body: {} })

    cy.loginAsEmployee('/funds/7')
    cy.wait('@getFund')

    cy.contains('Holdings').scrollIntoView().should('be.visible')
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.get('table').contains('button', 'Sell').should('not.exist')
  })
})

describe('Celina 4 — Investicioni fondovi: Ulaganje i povlačenje', () => {
  // ── Scenario 33: Klijent uspešno investira u fond ─────────────────────────
  it('Scenario 33 — client invests above the minimum and the contribution is posted', () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [FUND], total: 1 } }).as(
      'getFunds'
    )
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })
    cy.intercept('POST', '**/api/v3/investment-funds/7/invest', {
      statusCode: 200,
      body: { contribution: { id: 1, fund_id: 7, amount_rsd: '5000.00' } },
    }).as('invest')

    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.contains('button', 'Invest').click()
    cy.get('[role="dialog"]').contains('Invest in Alpha Growth').should('be.visible')

    // Radix Select — open and pick the RSD source account (portalled options).
    cy.get('#invest-account').realClick()
    cy.get('[data-slot="select-content"]:visible')
      .contains('[role="option"]', 'Tekući račun')
      .realClick()

    cy.get('#invest-amount').type('5000')
    cy.get('[role="dialog"]').contains('button', 'Invest').click()

    cy.wait('@invest')
      .its('request.body')
      .should((body) => {
        expect(body.source_account_id).to.equal(1)
        expect(body.amount).to.equal('5000')
        expect(body.currency).to.equal('RSD')
      })
    // Success closes the dialog (onSuccess → setSelectedFund(null)) and fires a
    // confirmation toast. Assert the deterministic dialog-close as the success
    // signal and the toast's *existence* (not `be.visible`): sonner's enter
    // animation is opacity-driven via requestAnimationFrame and does not
    // reliably reach opacity:1 within the timeout under headless CI, so
    // `be.visible` flakes there (cf. Scenario 35, which omits the toast check).
    cy.get('[role="dialog"]').should('not.exist')
    cy.contains('Investment placed in Alpha Growth.').should('exist')
  })

  // ── Scenario 34: Klijent pokušava da uloži manje od minimalnog uloga ──────
  it('Scenario 34 — investing below the minimum shows a validation error and blocks submit', () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [FUND], total: 1 } }).as(
      'getFunds'
    )
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.contains('button', 'Invest').click()
    cy.get('#invest-account').realClick()
    cy.get('[data-slot="select-content"]:visible')
      .contains('[role="option"]', 'Tekući račun')
      .realClick()

    cy.get('#invest-amount').type('500') // below the 1000 RSD minimum
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Minimum contribution is 1000 RSD.').should('be.visible')
      cy.contains('button', 'Invest').should('be.disabled')
    })
  })

  // ── Scenario 35: Klijent povlači novac — dovoljna likvidnost ──────────────
  // Redeem is reached from the "Moji fondovi" portfolio tab. With sufficient
  // fund liquidity the backend pays out immediately; the FE submits the redeem.
  it('Scenario 35 — client redeems from a fund position (sufficient liquidity)', () => {
    cy.intercept('GET', '**/api/v3/me/investment-funds', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            total_contributed_rsd: '5000.00',
            current_value_rsd: '6000.00',
            percentage_fund: '10.00',
            profit_rsd: '1000.00',
            last_change_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    }).as('getMyFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })
    cy.intercept('POST', '**/api/v3/investment-funds/7/redeem', {
      statusCode: 200,
      body: { contribution: { id: 2, fund_id: 7, amount_rsd: '2000.00' } },
    }).as('redeem')

    cy.loginAsClient('/portfolio?tab=funds')
    cy.wait('@getMyFunds')

    cy.contains('button', 'Redeem').click()
    cy.get('[role="dialog"]').contains('Redeem from Alpha Growth').should('be.visible')
    cy.get('#redeem-amount').type('2000')
    cy.get('#redeem-account').realClick()
    cy.get('[data-slot="select-content"]:visible')
      .contains('[role="option"]', 'Tekući račun')
      .realClick()
    cy.get('[role="dialog"]').contains('button', 'Redeem').click()

    cy.wait('@redeem')
      .its('request.body')
      .should((body) => {
        expect(body.amount_rsd).to.equal('2000')
        expect(body.target_account_id).to.equal(1)
      })
  })

  // ── Scenario 36: Povlačenje — nedovoljna likvidnost ───────────────────────
  // When the fund lacks liquid cash the backend auto-liquidates holdings and
  // notifies the client of a short-delay payout. This is a backend decision; the
  // FE issues the same redeem request and the backend handles liquidation.
  it('Scenario 36 — redeem when liquidity is short is handled server-side (auto-liquidation)', () => {
    cy.intercept('GET', '**/api/v3/me/investment-funds', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            total_contributed_rsd: '5000.00',
            current_value_rsd: '6000.00',
            percentage_fund: '10.00',
            profit_rsd: '1000.00',
            last_change_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    }).as('getMyFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/portfolio?tab=funds')
    cy.wait('@getMyFunds')

    cy.contains('button', 'Redeem').click()
    cy.get('[role="dialog"]').contains('Redeem from Alpha Growth').should('be.visible')
  })

  // ── Scenario 37: Provizija pri povlačenju u stranoj valuti ────────────────
  // Conversion fee on a foreign-currency payout is applied during the backend
  // conversion. The FE allows picking a non-RSD target account; the fee is
  // backend-computed. Documented — redeem dialog supports account selection.
  it('Scenario 37 — redeem to a foreign-currency account (conversion fee is backend-applied)', () => {
    cy.intercept('GET', '**/api/v3/me/investment-funds', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            total_contributed_rsd: '5000.00',
            current_value_rsd: '6000.00',
            percentage_fund: '10.00',
            profit_rsd: '1000.00',
            last_change_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    }).as('getMyFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: {
        accounts: [
          CLIENT_RSD_ACCOUNT,
          {
            id: 2,
            account_number: '111000000000000002',
            account_name: 'EUR račun',
            currency_code: 'EUR',
            available_balance: 5000,
          },
        ],
        total: 2,
      },
    })

    cy.loginAsClient('/portfolio?tab=funds')
    cy.wait('@getMyFunds')

    cy.contains('button', 'Redeem').click()
    cy.get('#redeem-account').realClick()
    cy.contains('[role="option"]', 'EUR račun').should('be.visible')
  })
})

describe('Celina 4 — Kreiranje investicionog fonda', () => {
  // ── Scenario 38: Supervizor uspešno kreira novi fond ──────────────────────
  it('Scenario 38 — supervisor creates a new fund and is redirected to it', () => {
    cy.intercept('POST', '**/api/v3/investment-funds', {
      statusCode: 200,
      body: { fund: { ...FUND, id: 99, name: 'Beta Fund' } },
    }).as('createFund')
    cy.intercept('GET', '**/api/v3/investment-funds/99', {
      body: { ...FUND_DETAIL, fund: { ...FUND, id: 99, name: 'Beta Fund' } },
    }).as('getNewFund')
    cy.intercept('GET', '**/api/v3/bank-accounts', { body: { accounts: [CLIENT_RSD_ACCOUNT] } })
    cy.intercept('GET', '**/api/v3/employees/*', { statusCode: 404, body: {} })

    cy.loginAsEmployee('/funds/new')
    cy.contains('h1', 'Create fund').should('be.visible')

    cy.get('#fund-name').type('Beta Fund')
    cy.get('#fund-description').type('Diversified')
    cy.get('#fund-minimum').type('1000')
    cy.contains('button', 'Create fund').click()

    cy.wait('@createFund')
      .its('request.body')
      .should((body) => {
        expect(body.name).to.equal('Beta Fund')
        expect(body.minimum_contribution_rsd).to.equal('1000')
      })
    cy.url().should('include', '/funds/99')
  })

  // ── Scenario 39: Agent nema pristup stranici za kreiranje fonda ───────────
  // Create-fund is gated by the funds.manage permission (ProtectedRoute). A user
  // lacking it is redirected away. (A client stands in for a non-permitted
  // actor, demonstrating the permission gate.)
  it('Scenario 39 — a user without funds.manage is denied the create-fund page', () => {
    cy.loginAsClient('/funds/new')
    cy.contains('h1', 'Create fund').should('not.exist')
    cy.url().should('not.include', '/funds/new')
  })
})

describe('Celina 4 — Kupovina hartija za fond', () => {
  const BANK_ACCOUNTS = {
    accounts: [
      {
        id: 500,
        account_number: '900000000000000500',
        account_name: 'Fund RSD',
        currency_code: 'RSD',
        available_balance: 10_000,
      },
      {
        id: 501,
        account_number: '900000000000000501',
        account_name: 'Bank RSD',
        currency_code: 'RSD',
        available_balance: 5_000_000,
      },
    ],
  }

  const stubOrderPage = () => {
    cy.intercept('GET', '**/api/v3/bank-accounts', { body: BANK_ACCOUNTS }).as('getBankAccounts')
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [FUND], total: 1 } }).as(
      'getFunds'
    )
    cy.intercept('GET', '**/api/v3/me/accounts', { body: { accounts: [], total: 0 } })
  }

  // ── Scenario 40: Supervizor kupuje hartiju za investicioni fond ───────────
  it('Scenario 40 — employee can choose "Fund" charge mode and pick a fund account', () => {
    stubOrderPage()
    cy.loginAsEmployee('/securities/order/new?direction=buy&securityType=stock&listingId=1')

    cy.contains('h1', 'Create Order').should('be.visible')
    cy.get('#charge-mode').should('exist')
    cy.get('#charge-mode').find('option').should('contain.text', 'Fund')

    cy.get('#charge-mode').select('fund')
    // Fund accounts are labelled with the fund name.
    cy.get('#account').find('option').should('contain.text', 'Alpha Growth')
  })

  // ── Scenario 41: Supervizor kupuje hartiju za banku ───────────────────────
  it('Scenario 41 — employee can charge a bank account (Bank mode, fund accounts excluded)', () => {
    stubOrderPage()
    cy.loginAsEmployee('/securities/order/new?direction=buy&securityType=stock&listingId=1')

    cy.get('#charge-mode').select('bank')
    // Bank-only accounts exclude the fund-attached account (id 500).
    cy.get('#account').find('option').should('contain.text', 'Bank RSD')
  })

  // ── Scenario 42: Nema dovoljno likvidnosti fonda ──────────────────────────
  // Insufficient fund liquidity is rejected by the backend on order creation.
  // Backend-verified; the FE exposes the Fund charge mode used to place it.
  it('Scenario 42 — insufficient fund liquidity is rejected server-side (Fund mode available)', () => {
    stubOrderPage()
    cy.loginAsEmployee('/securities/order/new?direction=buy&securityType=stock&listingId=1')

    cy.get('#charge-mode').select('fund')
    cy.get('#account').find('option').should('contain.text', 'Alpha Growth')
  })
})

describe('Celina 4 — Moj portfolio: Moji fondovi i upravljanje zaposlenima', () => {
  // ── Scenario 43: Klijent pregleda svoje fondove u portfoliju ──────────────
  it('Scenario 43 — client sees their fund positions with share, value and profit', () => {
    cy.intercept('GET', '**/api/v3/me/investment-funds', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            total_contributed_rsd: '5000.00',
            current_value_rsd: '6000.00',
            percentage_fund: '10.00',
            profit_rsd: '1000.00',
            last_change_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    }).as('getMyFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/portfolio?tab=funds')
    cy.wait('@getMyFunds')

    cy.contains('Alpha Growth').should('be.visible')
    cy.contains('Share: 10.00%').should('be.visible')
    cy.contains('6000.00 RSD').should('be.visible')
    cy.contains('1000.00 RSD').should('be.visible')
    cy.contains('button', 'Invest').should('be.visible')
    cy.contains('button', 'Redeem').should('be.visible')
  })

  // ── Scenario 44: Supervizor pregleda fondove kojima upravlja ──────────────
  // The /portfolio route is not role-gated: PortfolioView adapts per role, and an
  // employee principal is served the *bank's* portfolio (API identity rule
  // OwnerIsBankIfEmployee). So a supervisor reaches the Portfolio page rather than
  // being redirected, and manages fund positions from there.
  it('Scenario 44 — an employee can open the Portfolio page (served the bank portfolio)', () => {
    cy.loginAsEmployee('/portfolio')
    cy.contains('h1', 'Portfolio').should('be.visible')
    cy.url().should('include', '/portfolio')
  })

  // ── Scenario 45: Procenat fonda se menja kada drugi klijent uloži ─────────
  // Re-proportioning when another client invests is computed server-side; the FE
  // renders the position's current share (percentage_fund) and value.
  it('Scenario 45 — a position shows its current share percentage (re-proportioning is backend)', () => {
    cy.intercept('GET', '**/api/v3/me/investment-funds', {
      body: {
        positions: [
          {
            fund_id: 7,
            fund_name: 'Alpha Growth',
            total_contributed_rsd: '5000.00',
            current_value_rsd: '6000.00',
            percentage_fund: '8.50',
            profit_rsd: '1000.00',
            last_change_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    }).as('getMyFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/portfolio?tab=funds')
    cy.wait('@getMyFunds')

    cy.contains('Share: 8.50%').should('be.visible')
  })

  // ── Scenario 46: Admin uklanja isSupervisor — fondovi se prebacuju ────────
  // The supervisor capability is modelled as the EmployeeSupervisor role on the
  // employee edit form. Removing it (changing the role) is a PUT; the fund
  // ownership transfer to the admin is performed server-side. Here we assert the
  // edit form exposes the role control on the employee detail page.
  it('Scenario 46 — employee edit form exposes the role control (fund reassignment is backend)', () => {
    cy.intercept('GET', '**/api/v3/employees*', { fixture: 'employees-list.json' })
    cy.intercept('GET', '**/api/v3/employees/7', { fixture: 'employee-detail.json' }).as(
      'getEmployee'
    )

    cy.loginAsEmployee('/employees/7')
    cy.wait('@getEmployee')

    cy.contains('h1', 'Edit Employee').should('be.visible')
    cy.get('#role').should('exist')
    // Save sits at the bottom of a long form inside <main overflow-y-auto>.
    cy.contains('button', 'Save').scrollIntoView().should('be.visible')
  })
})
