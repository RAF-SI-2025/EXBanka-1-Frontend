describe('Celina 4: Primaoci plaćanja — Upravljanje primaocima', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me/payment-recipients', {
      fixture: 'recipients-list.json',
    }).as('getRecipients')
    cy.intercept('GET', '/api/me', {
      body: {
        id: 42,
        first_name: 'Marko',
        last_name: 'Jovanović',
        email: 'marko@example.com',
      },
    }).as('getMe')
    cy.loginAsClient('/payments/recipients')
    cy.wait('@getRecipients')
  })

  // Scenario 21: Dodavanje novog primaoca plaćanja
  it('should add a new payment recipient (Scenario 21)', () => {
    cy.intercept('POST', '/api/me/payment-recipients', {
      statusCode: 201,
      body: {
        id: 3,
        client_id: 42,
        recipient_name: 'Ana Petrović',
        account_number: '265000000000000099',
        created_at: '2026-03-26T10:00:00Z',
      },
    }).as('createRecipient')

    // After create, refetch returns updated list with 3 recipients
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Marković',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
          {
            id: 2,
            client_id: 42,
            recipient_name: 'Petar Nikolić',
            account_number: '265000000000000077',
            created_at: '2026-03-01T09:00:00Z',
          },
          {
            id: 3,
            client_id: 42,
            recipient_name: 'Ana Petrović',
            account_number: '265000000000000099',
            created_at: '2026-03-26T10:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    // Verify page title and existing recipients
    cy.contains('h1', 'Saved Recipients').should('be.visible')
    cy.contains('Jelena Marković').should('be.visible')
    cy.contains('Petar Nikolić').should('be.visible')

    // Click "Add Recipient" to show form
    cy.contains('button', 'Add Recipient').click()
    cy.contains('New Recipient').should('be.visible')

    // Fill form
    cy.get('#recipient_name').type('Ana Petrović')
    cy.get('#account_number').type('265000000000000099')

    // Click "Add" submit button
    cy.contains('button', 'Add').click()
    cy.wait('@createRecipient')

    // Verify request body
    cy.get('@createRecipient')
      .its('request.body')
      .should((body) => {
        expect(body.recipient_name).to.equal('Ana Petrović')
        expect(body.account_number).to.equal('265000000000000099')
      })

    // After success, form hides and new recipient appears in list
    cy.wait('@getRecipientsUpdated')
    cy.contains('New Recipient').should('not.exist')
    cy.contains('Ana Petrović').should('be.visible')
  })

  // Scenario 22: Izmena podataka primaoca plaćanja
  it('should edit an existing recipient (Scenario 22)', () => {
    cy.intercept('PUT', '/api/me/payment-recipients/1', {
      statusCode: 200,
      body: {
        id: 1,
        client_id: 42,
        recipient_name: 'Jelena Nikolić',
        account_number: '265000000000000088',
        created_at: '2026-02-10T12:00:00Z',
      },
    }).as('updateRecipient')

    // After update, refetch returns updated data
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Nikolić',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
          {
            id: 2,
            client_id: 42,
            recipient_name: 'Petar Nikolić',
            account_number: '265000000000000077',
            created_at: '2026-03-01T09:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    // Click "Edit" on the first recipient (Jelena Marković)
    cy.contains('tr', 'Jelena Marković').within(() => {
      cy.contains('button', 'Edit').click()
    })

    // Edit form appears with pre-filled values
    cy.contains('Edit Recipient').should('be.visible')
    cy.get('#recipient_name').should('have.value', 'Jelena Marković')
    cy.get('#account_number').should('have.value', '265000000000000088')

    // Change the name
    cy.get('#recipient_name').clear().type('Jelena Nikolić')

    // Click "Save" (editing mode)
    cy.contains('button', 'Save').click()
    cy.wait('@updateRecipient')

    // Verify request body
    cy.get('@updateRecipient')
      .its('request.body')
      .should((body) => {
        expect(body.recipient_name).to.equal('Jelena Nikolić')
        expect(body.account_number).to.equal('265000000000000088')
      })

    // After success, form hides and updated name appears
    cy.wait('@getRecipientsUpdated')
    cy.contains('Edit Recipient').should('not.exist')
    cy.contains('Jelena Nikolić').should('be.visible')
  })

  // Scenario 23: Brisanje primaoca plaćanja
  it('should delete a recipient with confirmation dialog (Scenario 23)', () => {
    cy.intercept('DELETE', '/api/me/payment-recipients/2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteRecipient')

    // After delete, refetch returns list without deleted recipient
    cy.intercept('GET', '/api/me/payment-recipients', {
      body: {
        recipients: [
          {
            id: 1,
            client_id: 42,
            recipient_name: 'Jelena Marković',
            account_number: '265000000000000088',
            created_at: '2026-02-10T12:00:00Z',
          },
        ],
      },
    }).as('getRecipientsUpdated')

    // Both recipients visible
    cy.contains('Jelena Marković').should('be.visible')
    cy.contains('Petar Nikolić').should('be.visible')

    // Click "Delete" on Petar Nikolić
    cy.contains('tr', 'Petar Nikolić').within(() => {
      cy.contains('button', 'Delete').click()
    })

    // Confirmation dialog appears
    cy.contains('Delete Recipient?').should('be.visible')
    cy.contains('Are you sure?').should('be.visible')

    // Confirm deletion
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.wait('@deleteRecipient')

    // After deletion, recipient is removed from list
    cy.wait('@getRecipientsUpdated')
    cy.contains('Petar Nikolić').should('not.exist')
    cy.contains('Jelena Marković').should('be.visible')
  })
})
