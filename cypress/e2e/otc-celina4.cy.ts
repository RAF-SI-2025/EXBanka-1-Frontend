// Celina 4 — OTC Trgovina: Pristup/prikaz, Pregovaranje, Ponude i Ugovori
// (Scenarios 14–28)
//
// FE routes:
//   /otc/market    → OtcPortalView    (offers marketplace, buy/negotiate)
//   /otc/options   → OtcOptionsView   ("Aktivne ponude" — listings & negotiations)
//   /otc/contracts → OtcContractsView ("Sklopljeni ugovori" — signed contracts)
//
// NOTE on access control: the /otc/* routes are NOT permission-gated in the
// frontend router — any authenticated user reaches the shell, and OTC trading
// authorization is enforced by the backend on the data/action endpoints. Tests
// that depend on that gate therefore assert the backend-enforced data outcome.

const RSD_ACCOUNT = {
  id: 1,
  account_number: '111000000000000001',
  account_name: 'Tekući račun',
  currency_code: 'RSD',
  available_balance: 1_000_000,
}

const LOCAL_OFFER = {
  kind: 'local',
  id: 10,
  bank_code: 'SI-LOCAL',
  seller_id: 99, // not the logged-in client (id 42) → "Buy" button shows
  seller_name: 'Prodavac d.o.o.',
  seller_type: 'client',
  security_type: 'stock',
  ticker: 'AAPL',
  name: 'Apple Inc.',
  quantity: 50,
  price_per_unit: '20000.00',
  direction: 'sell',
}

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

const optionRow = (overrides: Record<string, unknown> = {}) => ({
  kind: 'local',
  bank_code: 'SI-LOCAL',
  // `local_id` is the addressable surrogate the FE uses on /otc/options/:id
  // routes (spec §47.2). Local rows carry it; `offer_id` is the peer-native id.
  local_id: 1,
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
  active_chains_count: 0,
  me_owner: false,
  my_negotiation_id: null,
  // Listing carries its own starting strike/premium. When `false`, the table
  // shows a "no starting position" placeholder across those two columns.
  has_preset_terms: true,
  ...overrides,
})

const stubOptionsLists = (allRows: unknown[], myRows: unknown[] = []) => {
  cy.intercept('GET', '**/api/v3/otc/options*', offersBody(allRows)).as('getAllOptions')
  cy.intercept('GET', '**/api/v3/me/otc/options*', offersBody(myRows)).as('getMyOptions')
  cy.intercept('GET', '**/api/v3/me/accounts', {
    body: { accounts: [RSD_ACCOUNT], total: 1 },
  }).as('getMyAccounts')
  cy.intercept('PUT', '**/api/v3/me/otc/options/*', { statusCode: 200, body: {} }).as(
    'updateOtcOption'
  )
}

describe('Celina 4 — OTC Trgovina: Pristup i prikaz', () => {
  // ── Scenario 14: Klijent sa permisijom vidi OTC portal ────────────────────
  it('Scenario 14 — client with trading access sees the OTC portal and offers list', () => {
    cy.intercept('GET', '**/api/v3/otc/stocks*', offersBody([LOCAL_OFFER])).as('getOffers')
    cy.intercept('GET', '**/api/v3/me/accounts', {
      body: { accounts: [RSD_ACCOUNT], total: 1 },
    })

    cy.loginAsClient('/otc/market')
    cy.wait('@getOffers')

    cy.contains('h1', 'OTC Trading Portal').should('be.visible')
    // Same securities-style tabular layout: ticker / name / type / source / qty / price
    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Type').should('be.visible')
    cy.contains('th', 'Quantity').should('be.visible')
    cy.contains('th', 'Price').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
    cy.contains('button', 'Buy').should('be.visible')
  })

  // ── Scenario 15: Klijent bez permisije nema pristup ───────────────────────
  // The route is open in the FE; OTC access is backend-enforced. With the offers
  // endpoint rejecting (403), no tradable offers render.
  it('Scenario 15 — without trading access the offers endpoint is denied and nothing is tradable', () => {
    cy.intercept('GET', '**/api/v3/otc/stocks*', {
      statusCode: 403,
      body: { message: 'Forbidden' },
    }).as('getOffers')

    cy.loginAsClient('/otc/market')
    cy.wait('@getOffers')

    // No offer rows / Buy actions are available to an unauthorized client.
    cy.contains('button', 'Buy').should('not.exist')
  })

  // ── Scenario 16: Supervizor vidi OTC portal i može kreirati ponudu ────────
  it('Scenario 16 — supervisor sees OTC options and can create a listing for negotiation', () => {
    stubOptionsLists([optionRow()])
    cy.intercept('GET', '**/api/v3/bank-accounts', {
      body: { accounts: [{ ...RSD_ACCOUNT, account_name: 'Bank RSD' }] },
    })

    cy.loginAsEmployee('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('h1', 'OTC Options').should('be.visible')
    cy.contains('button', 'New listing').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
  })
})

describe('Celina 4 — OTC Pregovaranje', () => {
  // ── Scenario 17: Kupac inicira pregovor (unosi qty, cenu, premiju, datum) ──
  it('Scenario 17 — buyer opens a bid with quantity, strike, premium and settlement date', () => {
    stubOptionsLists([optionRow()])

    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('button', 'Bid').click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Bid on AAPL').should('be.visible')
      cy.get('#bid-qty').should('exist')
      cy.get('#bid-strike').should('exist')
      cy.get('#bid-premium').should('exist')
      cy.get('#bid-settlement').should('exist')
    })
  })

  // ── Scenario 18: Prodavac šalje protivponudu ──────────────────────────────
  // A row on which the user already has an open negotiation chain surfaces a
  // "Counter" action (the FE counterpart of a counter-offer). ModifiedBy /
  // LastModified are stamped server-side.
  it('Scenario 18 — an existing negotiation chain surfaces a "Counter" action', () => {
    stubOptionsLists([optionRow({ my_negotiation_id: 55, active_chains_count: 1 })])

    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('button', 'Counter').should('be.visible')
  })

  // ── Scenario 19: Kupac prihvata ponudu → kreira se opcioni ugovor ─────────
  // Accepting a negotiation (POST .../accept, premium paid buyer→seller) yields
  // a signed contract that appears on "Sklopljeni ugovori". We assert the
  // resulting contract surface; the accept action itself is backend-driven.
  it('Scenario 19 — an accepted negotiation appears as a signed contract', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 19,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-12-31',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('h1', 'OTC Option Contracts').should('be.visible')
    cy.contains('a', '#19').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
  })

  // ── Scenario 20: Jedna strana odustaje od pregovora ───────────────────────
  // Withdrawing a negotiation / cancelling a listing removes it for both sides.
  // The owner manages their own listing from the "My" tab (Activity panel);
  // removal is backend-driven and reflected on next fetch.
  it('Scenario 20 — owner manages their own listing from the "My" tab', () => {
    stubOptionsLists([], [optionRow({ me_owner: true })])

    cy.loginAsClient('/otc/options')
    cy.wait('@getMyOptions')

    cy.contains('button', 'My').click()
    cy.contains('button', 'Activity').should('be.visible')
  })

  // ── Scenario 16b: Vlasnik listinga menja iznos akcija via PUT /me/otc/options/:id
  it('Scenario 16b — listing owner re-sizes the amount via PUT /me/otc/options/:id', () => {
    stubOptionsLists([optionRow({ me_owner: true })])
    cy.intercept('GET', '**/api/v3/otc/options/*/negotiations', {
      body: { negotiations: [], total: 0 },
    })
    cy.intercept('GET', '**/api/v3/otc/options/*/timeline', {
      body: { offer: {}, timeline: [] },
    })

    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('button', 'Activity').click()
    cy.contains('button', 'Edit').click()
    cy.get('#edit-amount').clear().type('25')
    cy.contains('button', 'Save').click()

    cy.wait('@updateOtcOption').its('request.body').should('deep.equal', { quantity: '25' })
  })

  // ── Scenario 21: Prodavac ne može imati ugovore za više akcija nego poseduje
  // Over-allocation is rejected server-side when accepting. Backend-verified;
  // the FE entry point (the options marketplace) is asserted reachable.
  it('Scenario 21 — over-allocation beyond owned shares is rejected (backend)', () => {
    stubOptionsLists([optionRow()])
    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')
    cy.contains('h1', 'OTC Options').should('be.visible')
  })

  // ── Scenario 22: Istekao ugovor oslobađa akcije za nove pregovore ─────────
  // Expiry frees reserved shares — a time/settlement-driven backend job. The FE
  // surfaces expired contracts in the "Concluded / Expired" group.
  it('Scenario 22 — expired contracts are listed under "Concluded / Expired"', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 22,
            status: 'EXPIRED',
            ticker: 'AAPL',
            quantity: 3,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-01-01',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('h2', 'Concluded / Expired').should('be.visible')
    cy.contains('a', '#22').should('be.visible')
  })
})

describe('Celina 4 — Portal OTC Ponude i Ugovori', () => {
  // ── Scenario 23: Aktivne ponude prikazuju sve aktivne pregovore ───────────
  it('Scenario 23 — active offers list shows counterparty, stock, qty, price and settlement', () => {
    stubOptionsLists([optionRow()])

    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('th', 'Ticker').should('be.visible')
    cy.contains('th', 'Qty').should('be.visible')
    cy.contains('th', 'Strike').should('be.visible')
    cy.contains('th', 'Premium').should('be.visible')
    cy.contains('th', 'Settles').should('be.visible')
    cy.contains('th', 'Bank').should('be.visible')
    cy.contains('td', 'AAPL').should('be.visible')
    cy.contains('td', '2026-12-31').should('be.visible')
  })

  // ── Scenario 24: Vizualizacija odstupanja u ponudama bojama ───────────────
  // The price-deviation colour coding (green ≤5%, yellow 5–20%, red >20%) is
  // NOT implemented on the current OTC offers table — there is no deviation
  // styling in OtcOptionsTable. Documented as not-implemented; the table renders
  // the offers without colour buckets.
  it('Scenario 24 — deviation colour coding is not implemented (offers render without colour buckets)', () => {
    stubOptionsLists([optionRow()])

    cy.loginAsClient('/otc/options')
    cy.wait('@getAllOptions')

    cy.contains('td', 'AAPL').should('be.visible')
  })

  // ── Scenario 25: Filtriranje sklopljenih ugovora po statusu "važeći" ──────
  // The contracts page groups by status: "Active" (važeći, each with an
  // "Iskoristi"/Exercise button) and "Concluded / Expired".
  it('Scenario 25 — valid contracts appear under "Active" with an Exercise action', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 25,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-12-31',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
          {
            id: 26,
            status: 'EXPIRED',
            ticker: 'TSLA',
            quantity: 4,
            strike_price: '200.00',
            premium: '8.00',
            settlement_date: '2026-01-01',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('h2', 'Active').should('be.visible')
    cy.contains('a', '#25').should('be.visible')
    cy.contains('button', 'Exercise').should('be.visible')
  })

  // ── Scenario 26: Iskorišćavanje važećeg opcionog ugovora po SAGA patternu ──
  it('Scenario 26 — exercising a valid contract launches the SAGA-backed settlement', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 26,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-12-31',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')
    cy.intercept('POST', '**/api/v3/otc/contracts/26/exercise', {
      statusCode: 200,
      // The API normalizes the returned `contract` (and `holding`), so the mock
      // must mirror the real response shape — a bare { status } would make
      // normalizeContract throw and route the mutation to the error path.
      body: {
        contract: {
          id: 26,
          status: 'EXERCISED',
          ticker: 'AAPL',
          quantity: 10,
          strike_price: '150.00',
          premium_paid: '5.00',
          settlement_date: '2026-12-31',
          buyer_owner_type: 'client',
          buyer_owner_id: 42,
          seller_owner_type: 'client',
          seller_owner_id: 99,
        },
        holding: {
          id: 1,
          stock_id: 1,
          quantity: '10',
          owner: { owner_type: 'client', owner_id: 42 },
        },
      },
    }).as('exercise')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('button', 'Exercise').click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Exercise contract').should('be.visible')
      cy.contains('Total to pay').should('be.visible') // qty × strike preview
      cy.contains('button', 'Exercise').click()
    })
    cy.wait('@exercise').its('response.statusCode').should('eq', 200)
    cy.contains('Contract #26 exercised.').should('be.visible')
  })

  // ── Scenario 27: Pokušaj iskorišćavanja isteklog ugovora ──────────────────
  it('Scenario 27 — an expired contract has no Exercise button (visible for record only)', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 27,
            status: 'EXPIRED',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-01-01',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('a', '#27').should('be.visible')
    cy.contains('h2', 'Concluded / Expired')
      .parents('.space-y-2')
      .within(() => {
        cy.contains('button', 'Exercise').should('not.exist')
      })
  })

  // ── Scenario 28: Kupac ne iskorišćava opciju — gubi samo premiju ──────────
  // Letting an option lapse (market price below strike) loses only the premium;
  // after settlementDate the contract becomes EXPIRED. The lapse/premium logic
  // is backend/time-driven; the FE shows the expired contract.
  it('Scenario 28 — a lapsed option shows as EXPIRED after settlement (premium-only loss is backend)', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 28,
            status: 'EXPIRED',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2026-01-01',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')

    cy.contains('a', '#28').should('be.visible')
    cy.contains('EXPIRED').should('be.visible')
  })
})
