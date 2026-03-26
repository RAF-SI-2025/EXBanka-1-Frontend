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
  })
})
