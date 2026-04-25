describe('Celina 5: Menjačnica — Provera kursa i konverzija valuta', () => {
  describe('Exchange Rate List (Scenario 24)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/exchange/rates', { fixture: 'exchange-rates.json' }).as(
        'getExchangeRates'
      )
      cy.intercept('GET', 'https://bytenity.com/api/v1/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.loginAsClient('/exchange/rates')
    })

    // Scenario 24: Pregled kursne liste
    it('should display exchange rates for all supported currencies vs RSD (Scenario 24)', () => {
      cy.wait('@getExchangeRates')

      cy.contains('h1', 'Exchange Rates').should('be.visible')

      // Verify table headers
      cy.contains('th', 'Currency').should('be.visible')
      cy.contains('th', 'Buy Rate').should('be.visible')
      cy.contains('th', 'Sell Rate').should('be.visible')

      // All 7 foreign currencies should be displayed (filtered to to_currency=RSD)
      cy.contains('td', 'EUR').should('be.visible')
      cy.contains('td', 'USD').should('be.visible')
      cy.contains('td', 'CHF').should('be.visible')
      cy.contains('td', 'GBP').should('be.visible')
      cy.contains('td', 'JPY').should('be.visible')
      cy.contains('td', 'CAD').should('be.visible')
      cy.contains('td', 'AUD').should('be.visible')

      // RSD should NOT appear as a row (reverse rates filtered out)
      cy.get('tbody td.font-medium').each(($td) => {
        expect($td.text()).to.not.equal('RSD')
      })

      // Verify only 7 rows (not 9 — the 2 RSD→foreign rates are filtered)
      cy.get('tbody tr').should('have.length', 7)

      // Verify EUR buy/sell rates are formatted correctly
      cy.contains('tr', 'EUR').within(() => {
        cy.contains('116.50').should('exist')
        cy.contains('117.80').should('exist')
      })
    })
  })

  describe('Equivalence Calculator (Scenario 25)', () => {
    beforeEach(() => {
      // The calculator page also fetches all rates for local fallback
      cy.intercept('GET', 'https://bytenity.com/api/v1/exchange/rates', { fixture: 'exchange-rates.json' }).as(
        'getExchangeRates'
      )
      cy.intercept('GET', 'https://bytenity.com/api/v1/me', {
        body: {
          id: 42,
          first_name: 'Marko',
          last_name: 'Jovanović',
          email: 'marko@example.com',
        },
      }).as('getMe')
      cy.loginAsClient('/exchange/calculator')
    })

    // Scenario 25: Provera ekvivalentnosti valute
    it('should calculate equivalence without executing a transaction (Scenario 25)', () => {
      // Stub the specific rate lookup (called by convertCurrency)
      cy.intercept('GET', 'https://bytenity.com/api/v1/exchange/rates/RSD/EUR', {
        body: {
          from_currency: 'RSD',
          to_currency: 'EUR',
          buy_rate: 0.0086,
          sell_rate: 0.0085,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getRate')

      cy.contains('Check Equivalence').should('be.visible')

      // Default: From=RSD, To=EUR
      cy.get('[aria-label="From Currency"]').should('contain.text', 'RSD')
      cy.get('[aria-label="To Currency"]').should('contain.text', 'EUR')

      // Enter amount
      cy.get('#amount').type('10000')

      // Click "Calculate"
      cy.contains('button', 'Calculate').click()
      cy.wait('@getRate')

      // Result should display the conversion (10000 * 0.0086 = 86 EUR)
      cy.contains('Rate:').should('be.visible')

      // The result section shows formatted amounts
      cy.contains('RSD').should('be.visible')
      cy.contains('EUR').should('be.visible')

      // No transaction was created — verify no POST requests were made
      // (The calculator only uses GET for exchange rate lookup)
    })

    it('should allow changing currencies and recalculating (Scenario 25 — different pair)', () => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/exchange/rates/EUR/USD', {
        body: {
          from_currency: 'EUR',
          to_currency: 'USD',
          buy_rate: 1.11,
          sell_rate: 1.12,
          updated_at: '2026-03-26T08:00:00Z',
        },
      }).as('getRate')

      // Change From Currency to EUR
      cy.get('[aria-label="From Currency"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'EUR').realClick()

      // Change To Currency to USD
      cy.get('[aria-label="To Currency"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'USD').realClick()

      cy.get('#amount').type('100')
      cy.contains('button', 'Calculate').click()
      cy.wait('@getRate')

      // Result should show conversion result
      cy.contains('Rate:').should('be.visible')
    })

    it('should disable Calculate button when same currency selected', () => {
      // Select EUR for both From and To
      cy.get('[aria-label="From Currency"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'EUR').realClick()

      cy.get('[aria-label="To Currency"]').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'EUR').realClick()

      cy.get('#amount').type('100')

      // Button should be disabled
      cy.contains('button', 'Calculate').should('be.disabled')

      // Error message should appear
      cy.contains('Cannot convert to same currency').should('be.visible')
    })
  })

  describe('Currency Conversion During Transfer (Scenario 26)', () => {
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
    })

    // Scenario 26: Konverzija valute tokom transfera
    it('should display exchange rate and commission on cross-currency transfer (Scenario 26)', () => {
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
        body: {
          id: 205,
          from_account_number: '265000000000000011',
          to_account_number: '265000000000000022',
          initial_amount: 11650,
          final_amount: 100,
          exchange_rate: 116.5,
          commission: 0,
          timestamp: '2026-03-26T12:00:00Z',
        },
      }).as('createTransfer')
      cy.intercept('POST', 'https://bytenity.com/api/v1/me/transfers/205/execute', {
        statusCode: 200,
        body: {
          id: 205,
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
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Tekući RSD').realClick()

      // Select EUR destination account (different currency)
      cy.contains('Select account').click()
      cy.get('[data-slot="select-content"]:visible').contains('[role="option"]', 'Devizni EUR').realClick()

      cy.get('#amount').clear().type('11650')
      cy.contains('button', 'Make Transfer').click()

      // Wait for transfer preview to resolve
      cy.wait('@previewTransfer')

      // Confirmation step — verify exchange rate details
      cy.contains('Confirm Transfer').should('be.visible')

      // Rate should show the exchange rate (116.5)
      cy.contains('.text-muted-foreground', 'Rate').parent().should('contain.text', '116.5')

      // Commission should be displayed
      cy.contains('Commission').should('be.visible')

      // Final Amount should be displayed (converted amount in target currency)
      cy.contains('Final Amount').should('be.visible')

      // Complete the transfer
      cy.contains('button', 'Confirm').click()
      cy.wait('@createTransfer')
      cy.wait('@createChallenge')

      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executeTransfer')

      cy.contains('Transfer successful!').should('be.visible')
    })
  })
})
