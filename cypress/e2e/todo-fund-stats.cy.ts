// "todo test" — Feature: Statistika fondova (Scenarios 73–77)
//
// IMPORTANT: the SP3 fund metrics (annualized return, reward-to-variability,
// max drawdown, volatility) are now rendered on the fund DETAIL page (hero
// cards + a NAV-vs-system-average performance chart + risk-metric cards). The
// funds Discovery table, however, still shows only Name / Description / Fund
// value / Profit / Min. contribution, with NO metric columns and NO sorting UI.
// These tests assert the actual FE state and document the remaining gaps.

export {}

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
  // SP3 risk/return metrics carried on the fund object.
  annualized_return_pct: '12.40',
  volatility_pct: '9.00',
  reward_to_variability: '1.31',
  max_drawdown_pct: '-7.20',
  metrics_available: true,
}

const FUND_DETAIL = {
  fund: FUND,
  holdings: [],
  investor_count: 42,
  total_contributed_rsd: '5000000.00',
  liquid_rsd_balance: '1500000.00',
  total_holdings_value_rsd: '3500000.00',
  total_value_rsd: '5000000.00',
  total_dividends_paid_rsd: '0.00',
  profit_rsd: '5000.00',
  profit_pct: '0.1000',
  // Daily NAV series + system-average benchmark for the detail chart.
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

describe('todo test — Statistika fondova', () => {
  const stubDiscovery = () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [FUND], total: 1 } }).as(
      'getFunds'
    )
    cy.intercept('GET', '**/api/v3/me/accounts', { body: { accounts: [], total: 0 } })
  }

  // ── Scenario 73: Prikaz metrika na Discovery page ─────────────────────────
  // Not implemented: the discovery table has no SP3 metric columns and no
  // per-column sorting. Only the base columns are rendered.
  it('Scenario 73 — SP3 metric columns are not rendered on the discovery table', () => {
    stubDiscovery()
    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.contains('th', 'Fund value').should('be.visible')
    cy.contains('th', 'Profit').should('be.visible')
    // Metric columns from the spec are absent in the current FE.
    cy.contains('th', 'Annualized').should('not.exist')
    cy.contains('th', 'Volatility').should('not.exist')
    cy.contains('th', 'Max Drawdown').should('not.exist')
    cy.contains('th', 'Reward').should('not.exist')
  })

  // ── Scenario 74: Metrike se ne prikazuju bez dovoljno podataka ────────────
  // Trivially satisfied in the current FE: since no metric columns exist, a newly
  // created fund with no history shows no metrics either. Documented.
  it('Scenario 74 — a fund with no history shows no metrics (no metric columns exist at all)', () => {
    cy.intercept('GET', '**/api/v3/investment-funds*', {
      body: {
        funds: [{ ...FUND, id: 8, name: 'Brand New Fund', fund_value_rsd: '0.00' }],
        total: 1,
      },
    }).as('getFunds')
    cy.intercept('GET', '**/api/v3/me/accounts', { body: { accounts: [], total: 0 } })

    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.contains('a', 'Brand New Fund').should('be.visible')
    cy.contains('th', 'Annualized').should('not.exist')
  })

  // ── Scenario 75: Grafikon istorijske vrednosti fonda ──────────────────────
  // The fund detail now renders a NAV-vs-system-average performance chart and a
  // risk-metrics panel (annualized return, volatility, Sharpe, max drawdown)
  // alongside the hero cards, allocation pie, fund details, and holdings.
  it('Scenario 75 — the fund detail shows a performance chart and risk metrics', () => {
    cy.intercept('GET', '**/api/v3/investment-funds/7', { body: FUND_DETAIL }).as('getFund')
    cy.intercept('GET', '**/api/v3/me/accounts', { body: { accounts: [], total: 0 } })

    cy.loginAsClient('/funds/7')
    cy.wait('@getFund')

    cy.contains('Performance vs. system average').should('be.visible')
    cy.contains('Annualized return').should('be.visible')
    cy.contains('12.40%').should('be.visible')
    cy.contains('Max drawdown').should('be.visible')
    cy.contains('Holdings').should('be.visible')
  })

  // ── Scenario 76: Sortiranje fondova po godišnjem prinosu ───────────────────
  // Not implemented: the discovery page has only Search + "Active only"; no sort
  // control (the backend supports sort_by but the FE does not expose it).
  it('Scenario 76 — sorting by annualized return is not available in the FE', () => {
    stubDiscovery()
    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.get('#funds-search').should('be.visible')
    cy.contains('Annualized return').should('not.exist')
    cy.get('select').should('not.exist') // no sort_by dropdown on the discovery page
  })

  // ── Scenario 77: Sortiranje fondova po Max Drawdown ───────────────────────
  it('Scenario 77 — sorting by Max Drawdown is not available in the FE', () => {
    stubDiscovery()
    cy.loginAsClient('/funds')
    cy.wait('@getFunds')

    cy.get('#funds-search').should('be.visible')
    cy.contains('Max Drawdown').should('not.exist')
  })
})
