describe('Celina3 - Takse', () => {
  const stubTaxPage = () => {
    cy.intercept('GET', '**/api/v3/tax*', { fixture: 'tax-records.json' }).as('getTaxRecords')
  }

  const stubExchangesPage = () => {
    // Register wildcard first so the more-specific testing-mode intercept (registered last) wins
    cy.intercept('GET', '**/api/v3/stock-exchanges*', {
      body: {
        exchanges: [
          {
            id: 1, name: 'New York Stock Exchange', acronym: 'NYSE',
            mic_code: 'XNYS', polity: 'United States', currency: 'USD', time_zone: '-5',
          },
          {
            id: 2, name: 'NASDAQ', acronym: 'NASDAQ',
            mic_code: 'XNAS', polity: 'United States', currency: 'USD', time_zone: '-5',
          },
        ],
        total_count: 2,
      },
    }).as('getExchanges')
    cy.intercept('GET', '**/api/v3/stock-exchanges/testing-mode', {
      body: { testing_mode: false },
    }).as('getTestingMode')
  }

  // ── Scenario 74: Supervizor pristupa portalu za porez tracking ────────────

  it('Scenario 74 — Supervisor sees tax tracking portal with user names and debts in RSD', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('h1', 'Tax Management').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Total Debt (RSD)').should('be.visible')

    cy.contains('Marko Jovanović').should('be.visible')
    cy.contains('138.75').should('be.visible')
    cy.contains('Petar Nikolić').should('be.visible')
    cy.contains('780.00').should('be.visible')
  })

  // ── Scenario 75: Klijent nema pristup portalu za porez tracking ───────────

  it('Scenario 75 — Client is denied access to the tax tracking portal', () => {
    cy.loginAsClient('/admin/tax')
    cy.contains('h1', 'Tax Management').should('not.exist')
  })

  // ── Scenario 76: Filtriranje korisnika po tipu na portalu za porez ────────
  // Note: TaxPage FilterBar only has a 'search' field — user_type is wired in
  // apiFilters but there is no corresponding UI control (no dropdown). Filtering
  // by user type from the tax portal is not implemented in the current frontend.

  it('Scenario 76 — Tax portal has a search filter field (user_type UI filter not implemented)', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.get('input[placeholder="Search"]').should('be.visible')
  })

  it('Scenario 76 — Tax portal displays both client and actuary records by default', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    // fixture includes one client and one actuary — scope to table to avoid the
    // RoleSwitcher tabs in AppLayout's header
    cy.get('table').contains('Client').should('be.visible')
    cy.get('table').contains('Actuary').should('be.visible')
  })

  // ── Scenario 77: Filtriranje korisnika po imenu na portalu za porez ───────

  it('Scenario 77 — Typing in Search filters tax records by name', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    // Register filtered intercept after initial load so LIFO does not affect initial request
    cy.intercept('GET', '**/api/v3/tax*', {
      body: {
        tax_records: [
          { id: 1, first_name: 'Marko', last_name: 'Jovanović', user_type: 'client', unpaid_tax: '138.75', last_collection: null },
        ],
        total_count: 1,
      },
    }).as('getFilteredRecords')

    cy.get('input[placeholder="Search"]').type('Marko')
    cy.wait('@getFilteredRecords')

    cy.contains('Marko Jovanović').should('be.visible')
    cy.contains('Petar Nikolić').should('not.exist')
  })

  // ── Scenario 78: Automatski obračun poreza ────────────────────────────────
  // Backend-only: a monthly cron job calculates 15% capital gains tax and
  // deducts it from user accounts. There is no frontend action to trigger it.
  // The tax portal reflects the result after the backend runs.

  it('Scenario 78 — Tax portal shows debts accumulated by automated backend calculation (no UI action)', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('h1', 'Tax Management').should('be.visible')
    cy.contains('138.75').should('be.visible')
  })

  // ── Scenario 79: Ručno pokretanje obračuna poreza ─────────────────────────

  it('Scenario 79 — Supervisor manually triggers tax collection via "Collect Taxes" button', () => {
    stubTaxPage()
    cy.intercept('POST', '**/api/v3/tax/collect', {
      statusCode: 200,
      body: { collected_count: 2, total_collected_rsd: '918.75', failed_count: 0 },
    }).as('collectTaxes')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('button', 'Collect Taxes').should('be.visible').click()
    cy.wait('@collectTaxes')
    cy.get('@collectTaxes').its('response.statusCode').should('eq', 200)
  })

  // ── Scenario 80: Porez se konvertuje u RSD ────────────────────────────────
  // Backend-only: currency conversion (EUR → RSD) happens server-side during
  // tax calculation. The frontend always displays Total Debt in RSD as returned
  // by the API regardless of the account currency.

  it('Scenario 80 — Total Debt column is always in RSD (conversion is backend-only)', () => {
    stubTaxPage()
    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getTaxRecords')

    cy.contains('th', 'Total Debt (RSD)').should('be.visible')
    // Fixture amounts are already in RSD as returned by the API
    cy.contains('138.75').should('be.visible')
    cy.contains('780.00').should('be.visible')
  })

  // ── Scenario 81: Nema poreza ako nije ostvarena dobit ────────────────────

  it('Scenario 81 — User with zero profit has 0.00 tax debt', () => {
    cy.intercept('GET', '**/api/v3/tax*', {
      body: {
        tax_records: [
          { id: 5, first_name: 'Ana', last_name: 'Petrović', user_type: 'client', unpaid_tax: '0.00', last_collection: null },
        ],
        total_count: 1,
      },
    }).as('getZeroTax')

    cy.loginAsEmployee('/admin/tax')
    cy.wait('@getZeroTax')

    cy.contains('Ana Petrović').should('be.visible')
    cy.contains('0.00').should('be.visible')
  })

  // ── Scenario 82: Prikaz liste berzi i toggle za radno vreme ──────────────

  it('Scenario 82 — Stock Exchanges page shows exchange list with all required columns', () => {
    stubExchangesPage()
    cy.loginAsEmployee('/admin/stock-exchanges')
    cy.wait('@getExchanges')

    cy.contains('h1', 'Stock Exchanges').should('be.visible')
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Acronym').should('be.visible')
    cy.contains('th', 'MIC Code').should('be.visible')
    cy.contains('th', 'Currency').should('be.visible')
    cy.contains('th', 'Time Zone').should('be.visible')

    cy.contains('New York Stock Exchange').should('be.visible')
    cy.contains('NYSE').should('be.visible')
    cy.contains('XNYS').should('be.visible')
    cy.contains('USD').should('be.visible')
    cy.contains('2 exchanges').should('be.visible')
  })

  it('Scenario 82 — EmployeeAdmin sees the Testing mode toggle (admin role grants all permissions)', () => {
    // selectHasPermission returns true for any permission when the user's role is
    // EmployeeAdmin (see src/store/selectors/authSelectors.ts), so the toggle is
    // rendered for the admin fixture even though `exchanges.manage` is absent
    // from the JWT permission list. The not-rendered case is exercised by clients
    // (Scenario 75 — they cannot reach the page at all).
    stubExchangesPage()
    cy.loginAsEmployee('/admin/stock-exchanges')
    cy.wait('@getExchanges')

    // testing_mode = false (from getTestingMode stub) → button reads "Enable Testing Mode"
    cy.contains('button', 'Enable Testing Mode').should('be.visible')
  })
})
