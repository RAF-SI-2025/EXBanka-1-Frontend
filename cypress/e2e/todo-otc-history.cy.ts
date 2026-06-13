// "todo test" — OTC pregovaranje notifikacije (60–63) i Istorija pregovora (64–68).
//
// OTC negotiation emails are backend-only — there is no OTC NotificationType in
// the FE, so the in-app panel mirrors them generically. Negotiation history has
// NO dedicated "Istorija pregovora" route and NO status/date/counterparty
// filters; it is surfaced contextually via the OTC Options activity panels
// (per-chain revision history). Tests assert the real surface and document gaps.

export {}

const RSD_ACCOUNT = {
  id: 1,
  account_number: '111000000000000001',
  account_name: 'Tekući račun',
  currency_code: 'RSD',
  available_balance: 1_000_000,
}

const optionRow = (over: Record<string, unknown> = {}) => ({
  kind: 'local',
  bank_code: 'SI-LOCAL',
  // `id` is the stable surrogate id the FE routes on (the live API field); for a
  // local row it is numeric.
  id: 1,
  offer_id: 1,
  seller_id: 99,
  direction: 'sell_initiated',
  ticker: 'AAPL',
  amount: 10,
  strike_price: '150.00',
  strike_currency: 'USD',
  premium: '5.00',
  premium_currency: 'USD',
  settlement_date: '2026-12-31T00:00:00Z',
  best_bid: null,
  best_ask: null,
  active_chains_count: 1,
  me_owner: false,
  my_negotiation_id: 55,
  ...over,
})

const offersBody = (offers: unknown[]) => ({
  body: {
    offers,
    total_count: offers.length,
    peers_total: 0,
    peers_reached: 0,
    partial: false,
    last_refresh: '2026-06-06T10:00:00Z',
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Notifikacije za OTC pregovaranje (Scenarios 60–63) — email-only on the backend.
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Notifikacije za OTC pregovaranje (in-app mirror)', () => {
  const stubNotifications = (title: string, message: string) => {
    cy.intercept('GET', '**/api/v3/me/notifications/unread-count', {
      body: { unread_count: 1 },
    }).as('getUnread')
    cy.intercept('GET', '**/api/v3/me/notifications*', {
      body: {
        notifications: [
          {
            id: 1,
            type: 'money_received',
            title,
            message,
            is_read: false,
            ref_type: null,
            ref_id: null,
            created_at: '2026-06-06T10:00:00Z',
          },
        ],
        total: 1,
      },
    }).as('getList')
    cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' })
    cy.intercept('GET', '**/api/v3/me/payments*', { fixture: 'home-payments.json' })
    cy.intercept('GET', '**/api/v3/me/payment-recipients*', { fixture: 'home-recipients.json' })
  }

  const openPanelAndAssert = (text: string) => {
    cy.loginAsClient('/home')
    cy.wait('@getUnread')
    cy.get('[aria-label="Notifications"]').click()
    cy.wait('@getList')
    cy.contains(text).should('be.visible')
  }

  // ── Scenario 60: Email pri pristigloj kontraponudi ────────────────────────
  it('Scenario 60 — a counter-offer notification is visible in-app (email is backend)', () => {
    stubNotifications('Counter-offer received', 'The seller sent a counter-offer on AAPL.')
    openPanelAndAssert('Counter-offer received')
  })

  // ── Scenario 61: Email kada druga strana prihvati ponudu ──────────────────
  it('Scenario 61 — an offer-accepted notification is visible in-app (email is backend)', () => {
    stubNotifications('Offer accepted', 'Your offer was accepted; a contract was created.')
    openPanelAndAssert('Offer accepted')
  })

  // ── Scenario 62: Email kada druga strana odustane ─────────────────────────
  it('Scenario 62 — an offer-withdrawn notification is visible in-app (email is backend)', () => {
    stubNotifications('Negotiation withdrawn', 'The other party withdrew from the negotiation.')
    openPanelAndAssert('Negotiation withdrawn')
  })

  // ── Scenario 63: Email upozorenje pre isteka opcionog ugovora ─────────────
  it('Scenario 63 — a contract-expiry warning is visible in-app (daily check + email are backend)', () => {
    stubNotifications('Contract expiring', 'Your option contract expires in 3 days.')
    openPanelAndAssert('Contract expiring')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Istorija pregovora (Scenarios 64–68)
// ─────────────────────────────────────────────────────────────────────────────
describe('todo test — Istorija pregovora', () => {
  const stubOtcOptions = (rows: unknown[]) => {
    cy.intercept('GET', '**/api/v3/otc/options*', offersBody(rows)).as('getAll')
    cy.intercept('GET', '**/api/v3/me/otc/options*', offersBody([])).as('getMine')
    cy.intercept('GET', '**/api/v3/me/accounts', { body: { accounts: [RSD_ACCOUNT], total: 1 } })
  }

  // ── Scenario 64: Prikaz svih završenih pregovora ──────────────────────────
  // There is no dedicated "Istorija pregovora" page; a user's negotiations are
  // surfaced via the OTC Options "My" tab and the per-offer activity panels.
  it('Scenario 64 — negotiations are surfaced via the OTC Options "My" tab (no dedicated history page)', () => {
    stubOtcOptions([optionRow({ my_negotiation_id: 55 })])

    cy.loginAsClient('/otc/options')
    cy.wait('@getAll')

    cy.contains('h1', 'OTC Options').should('be.visible')
    cy.contains('button', 'My').click()
  })

  // ── Scenario 65: Prikaz istorije kontraponuda za pregovor ─────────────────
  // Opening a chain shows its full revision history (old/new values, timestamp,
  // who modified) via the bidder activity panel.
  it('Scenario 65 — opening a chain shows its counter-offer revision history', () => {
    stubOtcOptions([optionRow({ my_negotiation_id: 55, active_chains_count: 1 })])
    cy.intercept('GET', '**/api/v3/me/otc/options/negotiations*', {
      body: {
        negotiations: [
          {
            id: 55,
            parent_offer_id: 1,
            offer_id: 1,
            status: 'accepted',
            quantity: '10',
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-12-31T00:00:00Z',
            last_action_by_owner_type: 'client',
            last_action_by_owner_id: 99,
          },
        ],
        total: 1,
      },
    }).as('getNegs')
    cy.intercept('GET', '**/api/v3/me/otc/options/negotiations/55/revisions', {
      body: {
        revisions: [
          {
            revision_number: 1,
            action: 'bid',
            action_by_principal_type: 'client',
            action_by_principal_id: 42,
            quantity: '10',
            strike_price: '150.00',
            premium: '4.00',
            settlement_date: '2026-12-31T00:00:00Z',
            created_at: '2026-06-01T10:00:00Z',
          },
          {
            revision_number: 2,
            action: 'counter',
            action_by_principal_type: 'client',
            action_by_principal_id: 99,
            quantity: '10',
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-12-31T00:00:00Z',
            created_at: '2026-06-02T10:00:00Z',
          },
        ],
      },
    }).as('getRevisions')

    cy.loginAsClient('/otc/options')
    cy.wait('@getAll')

    // Open the row body (not the inline action button) → bidder activity panel.
    cy.contains('td', 'AAPL').click()
    cy.contains('Your bidding history').should('be.visible')
    cy.wait('@getRevisions')

    cy.contains('th', 'Action').should('be.visible')
    cy.contains('th', 'Strike').should('be.visible')
    // The action is uppercased via CSS only — the DOM text stays lowercase, so
    // match the actual cell text (scoped to <td> to avoid the "bidding history"
    // heading).
    cy.contains('td', 'bid').should('be.visible')
    cy.contains('td', 'counter').should('be.visible')
  })

  // ── Scenario 66: Filtriranje istorije po statusu ──────────────────────────
  // Not implemented: the OTC Options view has no status filter for history.
  it('Scenario 66 — status filtering of negotiation history is not implemented', () => {
    stubOtcOptions([optionRow()])
    cy.loginAsClient('/otc/options')
    cy.wait('@getAll')

    cy.contains('label', 'Status').should('not.exist')
  })

  // ── Scenario 67: Filtriranje istorije po datumu ───────────────────────────
  it('Scenario 67 — date-range filtering of negotiation history is not implemented', () => {
    stubOtcOptions([optionRow()])
    cy.loginAsClient('/otc/options')
    cy.wait('@getAll')

    cy.get('input[type="date"]').should('not.exist')
  })

  // ── Scenario 68: Filtriranje istorije po drugoj strani ────────────────────
  it('Scenario 68 — counterparty filtering of negotiation history is not implemented', () => {
    stubOtcOptions([optionRow()])
    cy.loginAsClient('/otc/options')
    cy.wait('@getAll')

    cy.get('input[placeholder="Search"]').should('not.exist')
  })
})
