describe('Admin Card Requests Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://bytenity.com/api/cards/requests*', { fixture: 'card-requests-list.json' }).as(
      'getRequests'
    )
    cy.intercept('GET', 'https://bytenity.com/api/clients*', { fixture: 'clients-list.json' }).as('getClients')
  })

  it('should display pending card requests with client info', () => {
    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    cy.contains('h1', 'Card Requests').should('be.visible')

    // Table headers
    cy.contains('th', 'First Name').should('be.visible')
    cy.contains('th', 'Last Name').should('be.visible')
    cy.contains('th', 'Account Number').should('be.visible')
    cy.contains('th', 'Card Type').should('be.visible')
    cy.contains('th', 'Actions').should('be.visible')

    // Request data — client_id 42 = Marko Jovanović
    cy.contains('Marko').should('be.visible')
    cy.contains('Jovanović').should('be.visible')
    cy.contains('265000000000000011').should('be.visible')
    cy.contains('DEBIT').should('be.visible')

    // Action buttons
    cy.contains('button', 'Approve').should('be.visible')
    cy.contains('button', 'Deny').should('be.visible')
  })

  it('should approve a card request', () => {
    cy.intercept('POST', 'https://bytenity.com/api/cards/requests/10/approve', { statusCode: 200, body: {} }).as(
      'approveRequest'
    )

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    // Click the first Approve button
    cy.contains('button', 'Approve').first().click()
    cy.wait('@approveRequest')
  })

  it('should open deny dialog and submit with reason', () => {
    cy.intercept('POST', 'https://bytenity.com/api/cards/requests/10/reject', { statusCode: 200, body: {} }).as(
      'rejectRequest'
    )

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getRequests')

    // Click Deny on first request
    cy.contains('button', 'Deny').first().click()

    // Deny dialog opens
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Deny Card Request').should('be.visible')
      cy.get('textarea').type('Insufficient credit history')
      cy.contains('button', 'Confirm Deny').click()
    })

    cy.wait('@rejectRequest')
    cy.get('@rejectRequest')
      .its('request.body')
      .should('have.property', 'reason', 'Insufficient credit history')
  })

  it('should show empty state when no requests', () => {
    cy.intercept('GET', 'https://bytenity.com/api/cards/requests*', {
      body: { requests: [], total: 0 },
    }).as('getEmptyRequests')

    cy.loginAsEmployee('/admin/cards/requests')
    cy.wait('@getEmptyRequests')

    cy.contains('No requests.').should('be.visible')
  })
})
