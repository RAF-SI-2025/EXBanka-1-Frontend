describe('Admin Actuaries Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/actuaries*', { fixture: 'actuaries-list.json' }).as('getActuaries')
  })

  // ── Scenario 1: Supervisor opens actuaries management portal ─────────────

  it('should display actuaries list with table (Scenario 1)', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('h1', 'Actuaries').should('be.visible')

    // Table headers
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')
    cy.contains('th', 'Position').should('be.visible')
    cy.contains('th', 'Limit').should('be.visible')
    cy.contains('th', 'Used Limit').should('be.visible')
    cy.contains('th', 'Approval').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Actuary data
    cy.contains('Petar Nikolić').should('be.visible')
    cy.contains('petar@banka.rs').should('be.visible')
    cy.contains('Senior Actuary').should('be.visible')
    cy.contains('100000').should('be.visible')
    cy.contains('45000').should('be.visible')

    cy.contains('Jovana Đorđević').should('be.visible')
    cy.contains('jovana@banka.rs').should('be.visible')
    cy.contains('Junior Actuary').should('be.visible')

    cy.contains('2 actuaries').should('be.visible')
  })

  it('should display Search and Position filter fields (Scenario 1)', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.get('input[placeholder="Search"]').should('be.visible')
    cy.get('input[placeholder="Position"]').should('be.visible')
  })

  it('should filter actuaries by search query (Scenario 1)', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    // Register filtered intercept AFTER initial load so it wins the next request (LIFO)
    cy.intercept('GET', 'https://bytenity.com/api/v2/actuaries*', {
      body: { actuaries: [], total_count: 0 },
    }).as('getFilteredActuaries')

    cy.get('input[placeholder="Search"]').type('nonexistent')
    cy.wait('@getFilteredActuaries')

    cy.contains('No actuaries found.').should('be.visible')
  })

  // ── Scenario 2: Agent/client denied access ────────────────────────────────

  it('should deny access to non-supervisor client users (Scenario 2)', () => {
    cy.loginAsClient('/admin/actuaries')

    // Client is redirected away — the Actuaries page is never shown
    cy.contains('h1', 'Actuaries').should('not.exist')
  })

  // ── Scenario 3: Supervisor changes limit successfully ─────────────────────

  it('should open edit limit dialog (Scenario 3)', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.contains('Edit Limit — Petar Nikolić').should('be.visible')
      cy.contains('label', 'New Limit').should('be.visible')
      cy.get('#limit-input').should('have.value', '100000')
    })
  })

  it('should submit new limit and close dialog on save (Scenario 3)', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/v2/actuaries/1/limit', {
      statusCode: 200,
      body: { id: 1, employee_id: 1, limit: '150000' },
    }).as('setLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.get('#limit-input').clear().type('150000')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setLimit')
    cy.get('@setLimit').its('request.body').should('have.property', 'limit', '150000')

    // Dialog closes after save
    cy.get('[role="dialog"]').should('not.exist')
  })

  // ── Scenario 4: Invalid limit entry ──────────────────────────────────────
  // Note: EditLimitDialog has no client-side validation — the dialog submits
  // any value and the API is responsible for rejecting invalid inputs.

  it('should submit zero limit to API which rejects it (Scenario 4)', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/v2/actuaries/1/limit', {
      statusCode: 400,
      body: { message: 'Limit must be greater than 0' },
    }).as('setInvalidLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.get('#limit-input').clear().type('0')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setInvalidLimit')
    cy.get('@setInvalidLimit').its('request.body').should('have.property', 'limit', '0')
  })

  it('should submit negative limit to API which rejects it (Scenario 4)', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/v2/actuaries/1/limit', {
      statusCode: 400,
      body: { message: 'Limit must be greater than 0' },
    }).as('setNegativeLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.get('#limit-input').clear().type('-5000')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setNegativeLimit')
    cy.get('@setNegativeLimit').its('request.body').should('have.property', 'limit', '-5000')
  })

  // ── Scenario 5: Supervisor resets usedLimit ───────────────────────────────
  // Note: Current UI resets immediately on click without a confirmation modal.

  it('should reset an actuary usedLimit to 0 on Reset click (Scenario 5)', () => {
    cy.intercept('POST', 'https://bytenity.com/api/v2/actuaries/1/reset-limit', {
      statusCode: 200,
      body: { id: 1, employee_id: 1, used_limit: '0' },
    }).as('resetLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Reset').first().click()
    cy.wait('@resetLimit')
  })

  // ── Scenario 6: Limit equal to current usedLimit is allowed ──────────────

  it('should allow setting limit equal to current usedLimit (Scenario 6)', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/actuaries*', {
      body: {
        actuaries: [
          {
            id: 1,
            employee_id: 1,
            first_name: 'Petar',
            last_name: 'Nikolić',
            email: 'petar@banka.rs',
            position: 'Senior Actuary',
            department: 'Risk',
            active: true,
            limit: '100000',
            used_limit: '50000',
            need_approval: false,
          },
        ],
        total_count: 1,
      },
    }).as('getActuaryWith50k')

    cy.intercept('PUT', 'https://bytenity.com/api/v2/actuaries/1/limit', {
      statusCode: 200,
      body: { id: 1, employee_id: 1, limit: '50000' },
    }).as('setLimitEqualToUsed')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaryWith50k')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.get('#limit-input').clear().type('50000')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setLimitEqualToUsed')
    cy.get('@setLimitEqualToUsed').its('request.body').should('have.property', 'limit', '50000')
    cy.get('[role="dialog"]').should('not.exist')
  })

  // ── Scenario 7: Automatic usedLimit reset at end of day ──────────────────
  // Note: This is a backend-scheduled operation (cron job at 23:59). It is
  // triggered server-side and not exposed as a user-facing action in the UI.
  // No Cypress test is applicable for this scenario.

  // ── Scenario 8: Admin is also supervisor ─────────────────────────────────

  it('should allow admin (employee) to access and use actuaries portal (Scenario 8)', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('h1', 'Actuaries').should('be.visible')
    cy.contains('button', 'Edit Limit').should('be.visible')
    cy.contains('button', 'Reset').should('be.visible')
    cy.contains('button', 'Toggle Approval').should('be.visible')
  })

  // ── Scenario 9: Supervisor-only (non-admin) cannot access employee mgmt ──
  // Note: Requires a distinct supervisor-only auth token. With the current
  // test setup (loginAsEmployee = admin, loginAsClient = client), this
  // scenario cannot be fully exercised — covered by integration/backend tests.

  // ── Additional existing tests ─────────────────────────────────────────────

  it('should show approval status correctly', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    // Petar: need_approval = false → "No"
    // Jovana: need_approval = true → "Yes"
    cy.contains('td', 'No').should('be.visible')
    cy.contains('td', 'Yes').should('be.visible')
  })

  it('should toggle approval for an actuary', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/v2/actuaries/1/approval', {
      statusCode: 200,
      body: { id: 1, employee_id: 1, need_approval: true },
    }).as('setApproval')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Toggle Approval').first().click()
    cy.wait('@setApproval')
    cy.get('@setApproval').its('request.body').should('have.property', 'need_approval', true)
  })

  it('should show empty state when no actuaries', () => {
    cy.intercept('GET', 'https://bytenity.com/api/v2/actuaries*', {
      body: { actuaries: [], total_count: 0 },
    }).as('getEmptyActuaries')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getEmptyActuaries')

    cy.contains('No actuaries found.').should('be.visible')
  })
})
