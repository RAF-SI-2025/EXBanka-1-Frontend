describe('Admin Actuaries Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/actuaries*', { fixture: 'actuaries-list.json' }).as('getActuaries')
  })

  it('should display actuaries list with table', () => {
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

  it('should show approval status correctly', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    // Petar: need_approval = false → "No"
    // Jovana: need_approval = true → "Yes"
    cy.contains('td', 'No').should('be.visible')
    cy.contains('td', 'Yes').should('be.visible')
  })

  it('should open edit limit dialog', () => {
    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.contains('Edit Limit — Petar Nikolić').should('be.visible')
      cy.contains('label', 'New Limit').should('be.visible')
      cy.get('#limit-input').should('have.value', '100000')
    })
  })

  it('should submit new limit via edit dialog', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/actuaries/1/limit', {
      statusCode: 200,
      body: { id: 1, limit: '200000' },
    }).as('setLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Edit Limit').first().click()

    cy.get('[role="dialog"]').within(() => {
      cy.get('#limit-input').clear().type('200000')
      cy.contains('button', 'Save').click()
    })

    cy.wait('@setLimit')
    cy.get('@setLimit').its('request.body').should('have.property', 'limit', '200000')
  })

  it('should reset an actuary limit', () => {
    cy.intercept('POST', 'https://bytenity.com/api/actuaries/1/reset-limit', {
      statusCode: 200,
      body: { id: 1, used_limit: '0' },
    }).as('resetLimit')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Reset').first().click()
    cy.wait('@resetLimit')
  })

  it('should toggle approval for an actuary', () => {
    cy.intercept('PUT', 'https://bytenity.com/api/actuaries/1/approval', {
      statusCode: 200,
      body: { id: 1, need_approval: true },
    }).as('setApproval')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getActuaries')

    cy.contains('button', 'Toggle Approval').first().click()
    cy.wait('@setApproval')
    cy.get('@setApproval').its('request.body').should('have.property', 'need_approval', true)
  })

  it('should show empty state when no actuaries', () => {
    cy.intercept('GET', 'https://bytenity.com/api/actuaries*', {
      body: { actuaries: [], total_count: 0 },
    }).as('getEmptyActuaries')

    cy.loginAsEmployee('/admin/actuaries')
    cy.wait('@getEmptyActuaries')

    cy.contains('No actuaries found.').should('be.visible')
  })
})
