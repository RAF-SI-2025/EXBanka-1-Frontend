describe('Celina 6: Kartice — Upravljanje bankarskim karticama', () => {
  describe('Client: Card Request & Viewing (Scenarios 28–30, 32)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/cards', { fixture: 'cards-list.json' }).as('getCards')
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
    })

    // Scenario 28: Kreiranje kartice na zahtev klijenta
    it('should request a new card for a personal account (Scenario 28)', () => {
      cy.intercept('POST', '/api/me/cards/requests', {
        statusCode: 201,
        body: {
          id: 5,
          account_number: '265000000000000011',
          card_brand: 'VISA',
          status: 'PENDING',
          created_at: '2026-03-26T10:00:00Z',
        },
      }).as('requestCard')

      cy.loginAsClient('/cards/request')

      cy.contains('Request New Card').should('be.visible')

      // Select account
      cy.get('[aria-label="Account"]').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      // Select card type (brand)
      cy.get('[aria-label="Card Type"]').click()
      cy.contains('[role="option"]', 'Visa').realClick()

      // Click "Request"
      cy.contains('button', 'Request').click()
      cy.wait('@requestCard')

      // Verify request body
      cy.get('@requestCard')
        .its('request.body')
        .should((body) => {
          expect(body.account_number).to.equal('265000000000000011')
          expect(body.card_brand).to.equal('VISA')
        })

      // Success screen
      cy.contains('Card request submitted!').should('be.visible')
      cy.contains('pending approval').should('be.visible')
    })

    // Scenario 29: Pregled liste kartica
    it('should display all cards with masked numbers and status badges (Scenario 29)', () => {
      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      cy.contains('h1', 'Cards').should('be.visible')

      // Card numbers are masked: "4111 **** **** 1111"
      cy.contains('4111').should('be.visible')
      cy.contains('1111').should('be.visible')

      // Status badges
      cy.contains('Active').should('be.visible')
      cy.contains('Blocked').should('be.visible')
      cy.contains('Deactivated').should('be.visible')

      // BLOCKED card should have "BLOCKED" overlay text
      cy.contains('BLOCKED').should('be.visible')

      // DEACTIVATED card should have "DEACTIVATED" overlay text
      cy.contains('DEACTIVATED').should('be.visible')

      // Only ACTIVE card should have "Block" button
      cy.get('button').contains('Block').should('have.length', 1)
    })

    // Scenario 30: Blokiranje kartice od strane klijenta
    it('should temporarily block an active card for 12 hours (Scenario 30)', () => {
      cy.intercept('POST', '/api/me/cards/10/temporary-block', {
        statusCode: 200,
        body: {},
      }).as('blockCard')

      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      // Register the updated cards intercept AFTER initial load to avoid LIFO conflict
      cy.intercept('GET', '/api/me/cards', {
        body: {
          cards: [
            {
              id: 10,
              card_number: '4111111111111111',
              card_type: 'DEBIT',
              card_name: 'Visa Debit',
              brand: 'VISA',
              created_at: '2026-01-20T10:00:00Z',
              expires_at: '2029-01-20T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '123',
              limit: 100000,
              status: 'BLOCKED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
            {
              id: 11,
              card_number: '5500000000000004',
              card_type: 'DEBIT',
              card_name: 'MasterCard Debit',
              brand: 'MASTERCARD',
              created_at: '2026-02-15T10:00:00Z',
              expires_at: '2029-02-15T10:00:00Z',
              account_number: '265000000000000011',
              cvv: '456',
              limit: 100000,
              status: 'BLOCKED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
            {
              id: 12,
              card_number: '9891000000000001',
              card_type: 'DEBIT',
              card_name: 'DinaCard Debit',
              brand: 'DINACARD',
              created_at: '2026-01-10T10:00:00Z',
              expires_at: '2028-01-10T10:00:00Z',
              account_number: '265000000000000022',
              cvv: '789',
              limit: 50000,
              status: 'DEACTIVATED',
              owner_name: 'MARKO JOVANOVIĆ',
            },
          ],
        },
      }).as('getCardsUpdated')

      // Click "Block" on the active Visa card
      cy.contains('button', 'Block').click()

      // Confirmation dialog
      cy.contains('Temporarily Block Card?').should('be.visible')
      cy.contains('temporarily block this card for 12 hours').should('be.visible')

      // Confirm block
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Block for 12 Hours').click()
      })
      cy.wait('@blockCard')

      // Verify request body
      cy.get('@blockCard')
        .its('request.body')
        .should('have.property', 'duration_hours', 12)

      // After block, card list refreshes
      cy.wait('@getCardsUpdated')
    })

    // Scenario 32: Pokušaj aktivacije deaktivirane kartice
    it('should not allow any actions on a deactivated card (Scenario 32)', () => {
      cy.loginAsClient('/cards')
      cy.wait('@getCards')

      // The deactivated DinaCard (id=12) should have the DEACTIVATED overlay
      cy.contains('DEACTIVATED').should('be.visible')

      // Only the ACTIVE card (id=10) has a "Block" button
      cy.get('button').contains('Block').should('have.length', 1)

      // There should be no "Unblock" or "Activate" button anywhere on the client page
      cy.contains('button', 'Unblock').should('not.exist')
      cy.contains('button', 'Activate').should('not.exist')
    })
  })

  describe('Employee: Card Management (Scenarios 27, 31)', () => {
    // Scenario 27: Automatsko kreiranje kartice prilikom otvaranja računa
    it('should create a card automatically when account is created with card option (Scenario 27)', () => {
      cy.intercept('GET', '/api/clients?*', { fixture: 'clients.json' }).as('searchClients')
      cy.intercept('POST', '/api/accounts', {
        statusCode: 201,
        fixture: 'create-account-response.json',
      }).as('createAccount')
      cy.intercept('GET', '/api/accounts?*', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', '/api/clients', { fixture: 'clients.json' }).as('getAllClients')
      cy.loginAsEmployee('/accounts/new')

      // Search and select client
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Check "Create Card" checkbox
      cy.get('#create_card').check()

      // Select card brand
      cy.get('[aria-label="Card Brand"]').click()
      cy.contains('[role="option"]', 'Visa').realClick()

      // Submit account creation
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify request includes card creation fields
      cy.get('@createAccount')
        .its('request.body')
        .should((body) => {
          expect(body.create_card).to.equal(true)
          expect(body.card_brand).to.equal('visa')
        })

      cy.url().should('include', '/admin/accounts')
    })
  })
})
