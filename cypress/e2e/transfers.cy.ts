describe('Celina 3: Transferi — Prenos sredstava između sopstvenih računa', () => {
  describe('Transfer Flow (Scenarios 17–18, 20)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', 'https://bytenity.com/api/v1/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.loginAsClient('/transfers/new')
      // Force a full JS context reset so Redux transfer state doesn't leak between tests
      // (cy.visit to the same SPA URL may skip a full reload, persisting Redux state)
      cy.reload()
    })

    // Scenario 17: Transfer između sopstvenih računa u istoj valuti
    it('should complete same-currency transfer without commission (Scenario 17)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/preview', {
        statusCode: 200,
        body: {
          from_currency: 'RSD',
          to_currency: 'RSD',
          input_amount: '10000',
          total_fee: '0',
          fee_breakdown: [],
          converted_amount: '10000',
          exchange_rate: '1',
          exchange_commission_rate: '0',
        },
      }).as('previewTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-created.json',
      }).as('createTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/201/execute', {
        statusCode: 200,
        fixture: 'transfer-executed.json',
      }).as('executeTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/v1/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/v1/verifications/1/status', {
        statusCode: 200,
        body: { status: 'pending' },
      }).as('challengeStatus')

      cy.wait('@getAccounts')

      // Step 1: Fill transfer form
      cy.get('[aria-label="Source Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .realHover()
        .realClick()
      cy.get('[aria-label="Source Account"]').should('have.attr', 'aria-expanded', 'false')
      // Wait for Source portal exit animation to complete so it doesn't overlap Destination
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

      cy.get('[aria-label="Destination Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Štedni RSD')
        .realHover()
        .realClick()
      cy.get('[aria-label="Destination Account"]').should('have.attr', 'aria-expanded', 'false')
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

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
      cy.wait('@createChallenge')
      cy.contains('Verification').should('be.visible')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.get('@executeTransfer')
        .its('request.body')
        .should('have.property', 'challenge_id', 1)

      // Step 4: Success
      cy.contains('Transfer successful!').should('be.visible')
      cy.contains('Transaction ID: 201').should('be.visible')
    })

    // Scenario 18: Transfer između sopstvenih računa u različitim valutama
    it('should complete cross-currency transfer with exchange rate (Scenario 18)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/preview', {
        statusCode: 200,
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          input_amount: '11650',
          total_fee: '0',
          fee_breakdown: [],
          converted_amount: '100',
          exchange_rate: '116.5',
          exchange_commission_rate: '0',
        },
      }).as('previewTransfer')

      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers', {
        statusCode: 201,
        fixture: 'transfer-cross-currency.json',
      }).as('createTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/204/execute', {
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
      cy.intercept('POST', 'https://bytenity.com/api/v1/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/v1/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/v1/verifications/1/status', {
        statusCode: 200,
        body: { status: 'pending' },
      }).as('challengeStatus')

      cy.wait('@getAccounts')

      // Select RSD source account
      cy.get('[aria-label="Source Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .realHover()
        .realClick()
      cy.get('[aria-label="Source Account"]').should('have.attr', 'aria-expanded', 'false')
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

      // Select EUR destination account (different currency)
      cy.get('[aria-label="Destination Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Devizni EUR')
        .scrollIntoView()
        .realHover()
        .realClick()
      cy.get('[aria-label="Destination Account"]').should('have.attr', 'aria-expanded', 'false')
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

      cy.get('#amount').type('11650')
      cy.contains('button', 'Make Transfer').click()

      cy.wait('@previewTransfer')

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
      cy.wait('@createChallenge')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.contains('Transfer successful!').should('be.visible')
    })

    // Scenario 20: Neuspešan transfer zbog nedovoljnih sredstava
    it('should handle failed transfer due to insufficient funds (Scenario 20)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/preview', {
        statusCode: 200,
        body: {
          from_currency: 'RSD',
          to_currency: 'RSD',
          input_amount: '200000',
          total_fee: '0',
          fee_breakdown: [],
          converted_amount: '200000',
          exchange_rate: '1',
          exchange_commission_rate: '0',
        },
      }).as('previewTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers', {
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
      cy.get('[aria-label="Source Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD')
        .realHover()
        .realClick()
      cy.get('[aria-label="Source Account"]').should('have.attr', 'aria-expanded', 'false')
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

      cy.get('[aria-label="Destination Account"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Štedni RSD')
        .realHover()
        .realClick()
      cy.get('[aria-label="Destination Account"]').should('have.attr', 'aria-expanded', 'false')
      cy.get('[data-slot="select-content"]:visible').should('not.exist')

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
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/accounts', { fixture: 'transfer-accounts.json' }).as(
        'getAccounts'
      )
      cy.intercept('GET', 'https://bytenity.com/api/v1/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/transfers*', { fixture: 'transfer-history.json' }).as(
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
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/transfers*', {
        body: { transfers: [], total: 0 },
      }).as('getEmptyTransfers')

      cy.visit('/transfers/history')
      cy.wait('@getEmptyTransfers')

      cy.contains('No transfers.').should('be.visible')
    })
  })
})
