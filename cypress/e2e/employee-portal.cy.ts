describe('Celina 8: Portal za zaposlene — Upravljanje klijentima', () => {
  // Scenario 39: Pretraga klijenta
  it('should search clients by name (Scenario 39)', () => {
    cy.intercept('GET', '**/api/v3/clients*', { fixture: 'clients-list.json' }).as('getClients')

    cy.loginAsEmployee('/admin/clients')
    cy.wait('@getClients')

    cy.contains('h1', 'Client Management').should('be.visible')

    // Both clients shown initially
    cy.contains('Marko').should('be.visible')
    cy.contains('Ana').should('be.visible')

    // Table columns
    cy.contains('th', 'First Name').should('be.visible')
    cy.contains('th', 'Last Name').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')

    // Filter by name — intercept the filtered request
    cy.intercept('GET', '**/api/v3/clients*', (req) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('name')) {
        req.reply({
          body: {
            clients: [
              {
                id: 42,
                first_name: 'Marko',
                last_name: 'Jovanović',
                email: 'marko@example.com',
                phone: '+381641234567',
              },
            ],
            total: 1,
          },
        })
      }
    }).as('getFilteredClients')

    cy.get('input[placeholder="Name"]').type('Marko')
    cy.wait('@getFilteredClients')

    // Only Marko should be shown
    cy.contains('Marko').should('be.visible')

    // Verify the "Edit" button is available
    cy.contains('button', 'Edit').should('be.visible')
  })

  // Scenario 40: Izmena podataka klijenta
  it('should edit client phone and address (Scenario 40)', () => {
    cy.intercept('GET', '**/api/v3/clients*', { fixture: 'clients-list.json' }).as('getClientsList')
    cy.intercept('GET', '**/api/v3/clients/42', { fixture: 'client-detail.json' }).as('getClient')
    cy.intercept('PUT', '**/api/v3/clients/42', {
      statusCode: 200,
      body: {
        id: 42,
        first_name: 'Marko',
        last_name: 'Jovanović',
        email: 'marko@example.com',
        phone: '+381669999999',
        address: 'Nova adresa 15, Beograd',
        gender: 'MALE',
        date_of_birth: '1990-05-15',
      },
    }).as('updateClient')

    cy.loginAsEmployee('/admin/clients/42')
    cy.wait('@getClient')

    cy.contains('Edit Client').should('be.visible')

    // Form should be pre-filled with current data
    cy.get('#first_name').should('have.value', 'Marko')
    cy.get('#last_name').should('have.value', 'Jovanović')
    cy.get('#email').should('have.value', 'marko@example.com')
    cy.get('#phone').should('have.value', '+381641234567')

    // Change phone and address
    cy.get('#phone').clear().type('+381669999999')
    cy.get('#address').clear().type('Nova adresa 15, Beograd')

    // Save
    cy.contains('button', 'Save').click()
    cy.wait('@updateClient')

    // Verify request body
    cy.get('@updateClient')
      .its('request.body')
      .should((body) => {
        expect(body.phone).to.equal('+381669999999')
        expect(body.address).to.equal('Nova adresa 15, Beograd')
        expect(body.first_name).to.equal('Marko')
      })

    // After save, redirects to clients list
    cy.url().should('include', '/admin/clients')
  })
})
