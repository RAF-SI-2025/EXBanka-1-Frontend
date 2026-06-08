// "todo test" — Feature: DCA / trajni nalozi (recurring orders) (Scenarios 47–53)
//
// Created from the order page (/securities/order/new) by checking "Schedule
// order"; managed from the portfolio "Recurring Orders" tab. The cron execution
// (auto market order, skip-on-insufficient-funds, actuary limit) is backend.
//
// NOTE: the FE recurring order is QUANTITY-based only — there is no BYAMOUNT
// vs BYQUANTITY mode in the UI (the payload carries `quantity` + `interval`).

export {}

const CLIENT_RSD_ACCOUNT = {
  id: 1,
  account_number: '111000000000000001',
  account_name: 'Tekući račun',
  currency_code: 'RSD',
  available_balance: 1_000_000,
}

const recurringOrder = (over: Record<string, unknown> = {}) => ({
  id: 10,
  listing_id: 1,
  side: 'buy',
  quantity: 5,
  interval: 'monthly',
  day_of_month: 15,
  status: 'active',
  ...over,
})

describe('todo test — DCA: kreiranje trajnog naloga', () => {
  const stubOrderPage = () => {
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    }).as('getAccounts')
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [], total: 0 } })
  }

  // ── Scenario 47: Kreiranje trajnog naloga BYAMOUNT ────────────────────────
  // BYAMOUNT (invest a RSD amount) is not supported in the FE — recurring orders
  // are quantity-based. The schedule UI offers Monthly/Weekly intervals only.
  it('Scenario 47 — recurring orders are quantity-based; an amount/mode field is not offered', () => {
    stubOrderPage()
    cy.loginAsClient('/securities/order/new?direction=buy&securityType=stock&listingId=1')

    cy.get('input[aria-label="Schedule order"]').check()
    cy.get('#frequency').find('option').should('contain.text', 'Monthly')
    cy.get('#frequency').find('option').should('contain.text', 'Weekly')
    // No BYAMOUNT mode control exists.
    cy.contains('label', 'Amount').should('not.exist')
  })

  // ── Scenario 48: Kreiranje trajnog naloga BYQUANTITY ──────────────────────
  it('Scenario 48 — scheduling a weekly quantity-based order creates a recurring order', () => {
    stubOrderPage()
    cy.intercept('POST', '**/api/v3/me/recurring-orders', {
      statusCode: 200,
      body: { recurring_order: recurringOrder({ interval: 'weekly', day_of_week: 1 }) },
    }).as('createRecurring')

    cy.loginAsClient('/securities/order/new?direction=buy&securityType=stock&listingId=1')

    cy.get('#quantity').type('5')
    cy.get('input[aria-label="Schedule order"]').check()
    cy.get('#frequency').select('weekly')
    cy.contains('button', 'Schedule').click()

    cy.wait('@createRecurring')
      .its('request.body')
      .should((body) => {
        expect(body.interval).to.equal('weekly')
        expect(body.quantity).to.equal(5)
        expect(body.listing_id).to.equal(1)
        expect(body.side).to.equal('buy')
      })
  })
})

describe('todo test — DCA: izvršavanje i upravljanje', () => {
  const stubRecurringList = (orders: unknown[]) => {
    cy.intercept('GET', '**/api/v3/me/recurring-orders', { body: { recurring_orders: orders } }).as(
      'getRecurring'
    )
    // Portfolio shell + listing map
    cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
    cy.intercept('GET', '**/api/v3/securities/forex*', {
      body: { forex_pairs: [], total_count: 0 },
    })
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [CLIENT_RSD_ACCOUNT], total: 1 },
    })
  }

  // ── Scenario 49: Automatsko kreiranje Market ordera na NextRun ────────────
  // The cron creating the market BUY and advancing NextRun is backend; the FE
  // surfaces the active recurring order in the portfolio.
  it('Scenario 49 — an active recurring order is listed (cron execution is backend)', () => {
    stubRecurringList([recurringOrder({ status: 'active' })])

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.contains('th', 'Frequency').should('be.visible')
    cy.contains('Active').should('be.visible')
  })

  // ── Scenario 50: Preskakanje naloga zbog nedovoljnih sredstava ────────────
  // Skip-on-insufficient-funds + email + NextRun advance are backend; the order
  // stays active and listed in the FE.
  it('Scenario 50 — skip-on-insufficient-funds is backend (order remains active in the list)', () => {
    stubRecurringList([recurringOrder({ status: 'active' })])

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.contains('Active').should('be.visible')
  })

  // ── Scenario 51: Pauziranje trajnog naloga ────────────────────────────────
  it('Scenario 51 — pausing a recurring order calls the pause endpoint', () => {
    stubRecurringList([recurringOrder({ status: 'active' })])
    cy.intercept('POST', '**/api/v3/me/recurring-orders/10/pause', {
      statusCode: 200,
      body: { recurring_order: recurringOrder({ status: 'paused' }) },
    }).as('pause')

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.contains('button', 'Pause').click()
    cy.wait('@pause').its('response.statusCode').should('eq', 200)
  })

  // ── Scenario 52: Otkazivanje trajnog naloga ───────────────────────────────
  it('Scenario 52 — cancelling a recurring order confirms then calls the cancel endpoint', () => {
    stubRecurringList([recurringOrder({ status: 'active' })])
    cy.intercept('POST', '**/api/v3/me/recurring-orders/10/cancel', {
      statusCode: 200,
      body: { recurring_order: recurringOrder({ status: 'cancelled' }) },
    }).as('cancel')

    cy.loginAsClient('/portfolio?tab=recurring-orders')
    cy.wait('@getRecurring')

    cy.contains('button', 'Cancel').click()
    cy.get('[role="dialog"]').contains('Cancel recurring order?').should('be.visible')
    cy.get('[role="dialog"]').contains('button', 'Cancel order').click()
    cy.wait('@cancel').its('response.statusCode').should('eq', 200)
  })

  // ── Scenario 53: UsedLimit aktuara se uračunava pri DCA izvršavanju ────────
  // The cron routes an over-limit auto-order to supervisor approval — entirely
  // backend. There is no FE surface: the portfolio (and its Recurring Orders
  // tab) is client-only, so an employee is redirected away.
  it('Scenario 53 — actuary DCA limit handling is backend (no employee portfolio surface)', () => {
    cy.loginAsEmployee('/portfolio?tab=recurring-orders')
    cy.url().should('not.include', '/portfolio')
  })
})
