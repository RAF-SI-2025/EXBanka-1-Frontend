describe('Celina 3: Transferi — Prenos sredstava između sopstvenih računa', () => {
  describe('Transfer Flow (Scenarios 17–18, 20)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.loginAsClient('/transfers/new')
    })

    // Scenario 17: Transfer između sopstvenih računa u istoj valuti
    it('should complete same-currency transfer without commission (Scenario 17)', () => {
      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-created.json',
      }).as('createTransfer')
      cy.intercept('POST', '/api/me/transfers/201/execute', {
        statusCode: 200,
        fixture: 'transfer-executed.json',
      }).as('executeTransfer')

      cy.wait('@getAccounts')

      // Step 1: Fill transfer form
      // Scope option search to visible select-content to avoid finding hidden portals from closed selects.
      // Use trigger('pointerdown', { pointerType: 'touch' }) to bypass Base UI's click guard which
      // requires highlighted state — pointerTypeRef is a useRef so it's always current.
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')

      // Select destination account — first select now shows selected value, second shows placeholder
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Štedni RSD')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')

      cy.get('#amount').type('10000')

      cy.contains('button', 'Make Transfer').click()

      // Step 2: Confirmation — TransferPreview
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('265-0000000000000-11').should('be.visible')
      cy.contains('265-0000000000000-33').should('be.visible')

      // For same-currency, rate should be 1
      cy.contains('.text-muted-foreground', 'Rate').parent().should('contain.text', '1')

      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      // Verify request body
      cy.get('@createTransfer')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000033')
          expect(body.amount).to.equal(10000)
        })

      // Step 3: Verification
      cy.contains('Verification').should('be.visible')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.get('@executeTransfer')
        .its('request.body')
        .should('have.property', 'verification_code', '123456')

      // Step 4: Success
      cy.contains('Transfer successful!').should('be.visible')
      cy.contains('Transaction ID: 201').should('be.visible')
    })

    // Scenario 18: Transfer između sopstvenih računa u različitim valutama
    it('should complete cross-currency transfer with exchange rate (Scenario 18)', () => {
      // Stub exchange rate lookup (triggered when currencies differ)
      cy.intercept('GET', '/api/exchange/rates/RSD/EUR', {
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          buy_rate: 116.5,
          sell_rate: 117.8,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getExchangeRate')

      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-cross-currency.json',
      }).as('createTransfer')
      cy.intercept('POST', '/api/me/transfers/204/execute', {
        statusCode: 200,
        body: {
          id: 204,
          from_account_number: '265000000000000011',
          to_account_number: '265000000000000022',
          initial_amount: 11650,
          final_amount: 100,
          exchange_rate: 116.5,
          commission: 0,
          timestamp: '2026-03-26T12:00:00Z',
        },
      }).as('executeTransfer')

      cy.wait('@getAccounts')

      // Select RSD source account
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')

      // Select EUR destination account (different currency)
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Devizni EUR')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')

      cy.get('#amount').type('11650')
      cy.contains('button', 'Make Transfer').click()

      // Wait for exchange rate query to resolve (fires when confirmation renders with cross-currency formData)
      cy.wait('@getExchangeRate')

      // Confirmation — exchange rate should be shown
      cy.contains('Confirm Transfer').should('be.visible')

      // TransferPreview shows the exchange rate value and computed amounts
      cy.contains('.text-muted-foreground', 'Rate').parent().should('contain.text', '116.5')
      cy.contains('Commission').should('be.visible')
      cy.contains('Final Amount').should('be.visible')

      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      cy.get('@createTransfer')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000022')
          expect(body.amount).to.equal(11650)
        })

      // Complete verification
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.contains('Transfer successful!').should('be.visible')
    })

    // Scenario 20: Neuspešan transfer zbog nedovoljnih sredstava
    it('should handle failed transfer due to insufficient funds (Scenario 20)', () => {
      cy.intercept('POST', '/api/me/transfers', {
        statusCode: 400,
        body: {
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Nedovoljno sredstava na računu',
          },
        },
      }).as('createTransfer')

      cy.wait('@getAccounts')

      // Select source and destination (same currency)
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Štedni RSD')
        .trigger('pointerdown', { pointerType: 'touch', bubbles: true })
        .trigger('click', { bubbles: true })
      cy.get('[data-base-ui-inert]').should('not.exist')

      // Enter amount exceeding available balance (145,000)
      cy.get('#amount').type('200000')
      cy.contains('button', 'Make Transfer').click()

      // Confirmation step
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')

      // User stays on confirmation step — transfer was not created
      cy.contains('Confirm Transfer').should('be.visible')
      cy.contains('button', 'Confirm').should('not.be.disabled')

      // The step does NOT advance to verification (no transactionId was set)
      cy.get('#verification-code').should('not.exist')
    })
  })

  describe('Transfer History (Scenario 19)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', '/api/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', '/api/me/transfers*', { fixture: 'transfer-history.json' }).as(
        'getTransfers'
      )
      cy.loginAsClient('/transfers/history')
    })

    // Scenario 19: Pregled istorije transfera
    it('should display transfer history sorted newest first (Scenario 19)', () => {
      cy.wait('@getTransfers')

      cy.contains('h1', 'Transfer History').should('be.visible')

      // Verify all table headers are present
      cy.contains('th', 'Date').should('be.visible')
      cy.contains('th', 'From Account').should('be.visible')
      cy.contains('th', 'To Account').should('be.visible')
      cy.contains('th', 'Amount').should('be.visible')
      cy.contains('th', 'Final Amount').should('be.visible')
      cy.contains('th', 'Rate').should('be.visible')
      cy.contains('th', 'Commission').should('be.visible')

      // Verify transfers from fixture are shown (3 rows)
      cy.get('tbody tr').should('have.length', 3)

      // Verify first row is the newest transfer (id=203, March 26: RSD→EUR)
      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.contains('265-0000000000000-11').should('exist')
          cy.contains('265-0000000000000-22').should('exist')
        })

      // Verify pagination controls are present
      cy.contains('Page').should('be.visible')
    })

    it('should show empty state when no transfers exist', () => {
      cy.intercept('GET', '/api/me/transfers*', {
        body: { transfers: [], total: 0 },
      }).as('getEmptyTransfers')

      cy.visit('/transfers/history')
      cy.wait('@getEmptyTransfers')

      cy.contains('No transfers.').should('be.visible')
    })
  })
})
