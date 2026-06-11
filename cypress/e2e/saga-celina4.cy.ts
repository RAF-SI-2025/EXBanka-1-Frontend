// Celina 4 — Feature: SAGA pattern (Scenarios 1–13)
//
// The SAGA orchestration (reserve funds → reserve securities → transfer funds →
// transfer ownership → final check, plus all compensating/rollback, retry and
// idempotency logic) lives on the backend. The frontend's only role is to
// *initiate* a SAGA-backed transaction and to *surface its outcome*.
//
// Historically there were two FE entry points that kicked off a SAGA:
//   1. Buying an OTC offer            → POST /otc/stocks/:id/buy        (OtcPortalView)
//   2. Exercising an option contract  → POST /otc/contracts/:id/exercise (OtcContractsView, §26)
//
// The OTC stock-offers portal (entry point #1) has been removed, so the
// buy-driven SAGA scenarios (1–3, 5–6, 8–13) that drove it through the FE no
// longer have a frontend surface and were dropped. The exercise-driven SAGA
// scenarios (#4, #7) remain — exercising a signed option contract is now the
// sole FE entry point that initiates a SAGA. Step-level rollback/retry/
// idempotency assertions stay backend-verified.

describe('Celina 4 — SAGA pattern (kupoprodaja akcija)', () => {
  // ── Scenario 4: Rollback pri neuspešnom transferu vlasništva ──────────────
  // Ownership transfer is the settlement step reached when *exercising* a
  // signed option contract. If it fails, the backend runs the compensating
  // transaction (refund buyer, return securities to seller). Backend-verified;
  // the FE entry point is the Exercise dialog.
  it('Scenario 4 — ownership-transfer failure triggers compensation (exercise path)', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 4,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: 10,
            strike_price: '20000.00',
            premium: '500.00',
            settlement_date: '2026-12-31',
            buyer_owner_type: 'client',
            buyer_owner_id: 42,
            seller_owner_type: 'client',
            seller_owner_id: 99,
          },
        ],
      },
    }).as('getContracts')
    cy.intercept('POST', '**/api/v3/otc/contracts/4/exercise', {
      statusCode: 500,
      body: { message: 'Ownership transfer failed' },
    }).as('exercise')

    cy.loginAsClient('/otc/contracts')
    cy.wait('@getContracts')
    cy.contains('button', 'Exercise').click()
    cy.get('[role="dialog"]').contains('Exercise contract').should('be.visible')
    cy.get('[role="dialog"]').contains('button', 'Exercise').click()
    cy.wait('@exercise').its('response.statusCode').should('eq', 500)
    // Failure: contract not marked exercised (no success toast).
    cy.contains('exercised.').should('not.exist')
  })

  // ── Scenario 7: Final-balance-check failure compensates prior steps ───────
  // Backend-orchestrated SAGA mechanics that are NOT observable as distinct FE
  // states — the frontend issues a single request and the orchestrator handles
  // the rest. The test asserts the SAGA-backed FE entry point is reachable; the
  // named behavior is backend-verified.
  it('Scenario 7 — final-balance-check failure compensates prior steps (exercise path, backend)', () => {
    cy.intercept('GET', '**/api/v3/me/otc/contracts*', {
      body: {
        contracts: [
          {
            id: 7,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: 5,
            strike_price: '20000.00',
            premium: '250.00',
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
    cy.contains('button', 'Exercise').should('be.visible')
  })
})
