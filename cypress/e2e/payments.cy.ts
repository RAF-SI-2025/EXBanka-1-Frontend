describe('Celina 2: Plaćanja — Izvršavanje plaćanja između klijenata', () => {
  describe('Payment Flow (Scenarios 9–15)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', 'https://bytenity.com/api/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      }).as('getMe')
      cy.intercept('GET', 'https://bytenity.com/api/me/payment-recipients', {
        body: { recipients: [] },
      }).as('getRecipients')
      cy.intercept('GET', 'https://bytenity.com/api/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.loginAsClient('/payments/new')
    })

    // Scenario 9: Uspešno plaćanje drugom klijentu
    it('should complete a payment successfully (Scenario 9)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', 'https://bytenity.com/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')
      cy.intercept('POST', 'https://bytenity.com/api/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/verifications/1/status', {
        statusCode: 200,
        body: { status: 'verified' },
      }).as('challengeStatus')

      // Step 1: Fill the payment form
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')

      cy.contains('button', 'Continue').click()

      // Step 2: Confirmation screen — verify details shown
      cy.contains('Confirm Payment').should('be.visible')
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('265000000000000099').should('be.visible')

      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.wait('@createChallenge')

      // Verify the request body
      cy.get('@createPayment')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000011')
          expect(body.to_account_number).to.equal('265000000000000099')
          expect(body.recipient_name).to.equal('Ana Petrović')
          expect(body.amount).to.equal(5000)
        })

      // Step 3: Verification step — enter code and confirm
      cy.contains('Verification').should('be.visible')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      // Verify execute request sends challenge_id
      cy.get('@executePayment')
        .its('request.body')
        .should('have.property', 'challenge_id', 1)

      // Step 4: Success screen
      cy.contains('Payment successful!').should('be.visible')
      cy.contains('Transaction ID: 101').should('be.visible')
    })

    // Scenario 10: Neuspešno plaćanje zbog nedovoljnih sredstava
    it('should show error when payment amount exceeds balance (Scenario 10)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 400,
        body: {
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Nedovoljno sredstava na računu',
          },
        },
      }).as('createPayment')

      // Fill form with amount exceeding available balance (145,000)
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('200000')
      cy.contains('button', 'Continue').click()

      // Confirmation — click Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Error message should appear on confirmation step
      cy.contains('Nedovoljno sredstava na računu').should('be.visible')

      // User stays on confirmation step (not redirected)
      cy.contains('Confirm Payment').should('be.visible')
    })

    // Scenario 11: Neuspešno plaćanje zbog nepostojećeg računa
    it('should show error when recipient account does not exist (Scenario 11)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 404,
        body: {
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Uneti račun ne postoji',
          },
        },
      }).as('createPayment')

      // Fill form with nonexistent account
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('999999999999999999')
      cy.get('#recipient_name').type('Nepoznati Korisnik')
      cy.get('#amount').type('1000')
      cy.contains('button', 'Continue').click()

      // Confirmation — click Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')

      // Error message should appear
      cy.contains('Uneti račun ne postoji').should('be.visible')

      // User stays on confirmation step
      cy.contains('Confirm Payment').should('be.visible')
    })

    // Scenario 12: Plaćanje u različitim valutama uz konverziju
    it('should handle cross-currency payment with conversion (Scenario 12)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-cross-currency.json',
      }).as('createPayment')
      cy.intercept('POST', 'https://bytenity.com/api/me/payments/104/execute', {
        statusCode: 200,
        body: {
          id: 104,
          from_account_number: '265000000000000022',
          to_account_number: '265000000000000099',
          initial_amount: 100,
          final_amount: 11650,
          commission: 50,
          recipient_name: 'Ana Petrović',
          payment_code: '289',
          reference_number: '',
          payment_purpose: 'Cross-currency test',
          status: 'COMPLETED',
          timestamp: '2026-03-26T10:00:00Z',
        },
      }).as('executePayment')
      cy.intercept('POST', 'https://bytenity.com/api/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/verifications/1/status', {
        statusCode: 200,
        body: { status: 'verified' },
      }).as('challengeStatus')

      // Select EUR foreign account as source
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Devizni EUR').realClick()

      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('100')
      cy.get('#payment_purpose').type('Cross-currency test')

      cy.contains('button', 'Continue').click()

      // Confirmation — verify EUR account shown
      cy.contains('Confirm Payment').should('be.visible')
      cy.contains('265000000000000022').should('be.visible')

      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.wait('@createChallenge')

      // Verify request was sent with EUR account
      cy.get('@createPayment')
        .its('request.body')
        .should((body) => {
          expect(body.from_account_number).to.equal('265000000000000022')
          expect(body.amount).to.equal(100)
        })

      // Complete verification
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      cy.contains('Payment successful!').should('be.visible')
    })

    // Scenario 13: Plaćanje uz verifikacioni kod
    it('should verify payment with 6-digit code within 5 minutes (Scenario 13)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', 'https://bytenity.com/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')
      cy.intercept('POST', 'https://bytenity.com/api/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/verifications/1/status', {
        statusCode: 200,
        body: { status: 'verified' },
      }).as('challengeStatus')

      // Fill form quickly
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()

      // Confirm
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.wait('@createChallenge')

      // Verification step UI
      cy.contains('Verification').should('be.visible')
      cy.contains('5 minutes').should('be.visible')
      cy.get('#verification-code').should('be.visible')
      cy.get('#verification-code').should('have.attr', 'maxlength', '6')
      cy.get('#verification-code').should('have.attr', 'placeholder', '000000')

      // "Confirm" button should be disabled when code is empty
      cy.contains('button', 'Confirm').should('be.disabled')

      // Enter valid 6-digit code
      cy.get('#verification-code').type('654321')
      cy.contains('button', 'Confirm').should('not.be.disabled')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      cy.get('@executePayment')
        .its('request.body')
        .should('have.property', 'challenge_id', 1)

      cy.contains('Payment successful!').should('be.visible')
    })

    // Scenario 14: Otkazivanje transakcije nakon tri pogrešna koda
    it('should show error after failed verification attempts (Scenario 14)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', 'https://bytenity.com/api/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')

      // Each submitCode call returns one fewer remaining attempt
      let submitAttempt = 0
      cy.intercept('POST', 'https://bytenity.com/api/verifications/1/code', (req) => {
        submitAttempt++
        req.reply({
          statusCode: 200,
          body: { success: false, remaining_attempts: 3 - submitAttempt },
        })
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/verifications/1/status', {
        statusCode: 200,
        body: { status: 'pending' },
      }).as('challengeStatus')

      // Fill form and get to verification step
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.wait('@createChallenge')

      // First wrong code
      cy.get('#verification-code').type('000001')
      cy.contains('button', 'Confirm').click()
      cy.wait('@submitCode')
      cy.contains('Invalid code. 2 attempts remaining.').should('be.visible')

      // Second wrong code
      cy.get('#verification-code').clear().type('000002')
      cy.contains('button', 'Confirm').click()
      cy.wait('@submitCode')
      cy.contains('Invalid code. 1 attempts remaining.').should('be.visible')

      // Third wrong code
      cy.get('#verification-code').clear().type('000003')
      cy.contains('button', 'Confirm').click()
      cy.wait('@submitCode')
      cy.contains('Invalid code. 0 attempts remaining.').should('be.visible')
    })

    // Scenario 15: Dodavanje primaoca nakon uspešnog plaćanja
    it('should allow saving recipient after successful payment (Scenario 15)', () => {
      cy.intercept('POST', 'https://bytenity.com/api/me/payments', {
        statusCode: 201,
        fixture: 'payment-created.json',
      }).as('createPayment')
      cy.intercept('POST', 'https://bytenity.com/api/me/payments/101/execute', {
        statusCode: 200,
        fixture: 'payment-executed.json',
      }).as('executePayment')
      cy.intercept('POST', 'https://bytenity.com/api/me/payment-recipients', {
        statusCode: 201,
        body: {
          id: 2,
          client_id: 42,
          recipient_name: 'Ana Petrović',
          account_number: '265000000000000099',
          created_at: '2026-03-26T10:05:00Z',
        },
      }).as('saveRecipient')
      cy.intercept('POST', 'https://bytenity.com/api/verifications', {
        statusCode: 200,
        body: { challenge_id: 1 },
      }).as('createChallenge')
      cy.intercept('POST', 'https://bytenity.com/api/verifications/1/code', {
        statusCode: 200,
        body: { success: true, remaining_attempts: 0 },
      }).as('submitCode')
      cy.intercept('GET', 'https://bytenity.com/api/verifications/1/status', {
        statusCode: 200,
        body: { status: 'verified' },
      }).as('challengeStatus')

      // Complete payment flow
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()
      cy.get('#to_account_number').type('265000000000000099')
      cy.get('#recipient_name').type('Ana Petrović')
      cy.get('#amount').type('5000')
      cy.contains('button', 'Continue').click()
      cy.contains('button', 'Confirm').click()
      cy.wait('@createPayment')
      cy.wait('@createChallenge')
      cy.get('#verification-code').type('123456')
      cy.contains('button', 'Confirm').click()
      cy.wait('@executePayment')

      // Success screen — AddRecipientPrompt should be visible
      cy.contains('Payment successful!').should('be.visible')
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('button', 'Save Recipient').should('be.visible')

      // Click "Save Recipient"
      cy.contains('button', 'Save Recipient').click()
      cy.wait('@saveRecipient')

      // Verify request body
      cy.get('@saveRecipient')
        .its('request.body')
        .should((body) => {
          expect(body.recipient_name).to.equal('Ana Petrović')
          expect(body.account_number).to.equal('265000000000000099')
        })

      // After saving, should show confirmation
      cy.contains('Recipient saved.').should('be.visible')
    })
  })

  describe('Payment History (Scenario 16)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', 'https://bytenity.com/api/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      }).as('getMe')
      cy.intercept('GET', 'https://bytenity.com/api/me/payments*', { fixture: 'payment-history.json' }).as(
        'getPayments'
      )
      cy.loginAsClient('/payments/history')
    })

    // Scenario 16: Pregled istorije plaćanja
    it('should display payment history list with all statuses (Scenario 16)', () => {
      cy.wait('@getPayments')

      cy.contains('h1', 'Payment History').should('be.visible')

      // Verify all 3 payments from fixture are shown
      cy.contains('Ana Petrović').should('be.visible')
      cy.contains('Jelena Marković').should('be.visible')
      cy.contains('Petar Nikolić').should('be.visible')

      // Verify status badges
      cy.contains('Completed').should('be.visible')
      cy.contains('Processing').should('be.visible')
      cy.contains('Rejected').should('be.visible')
    })

    it('should filter payments by status (Scenario 16 — filtering)', () => {
      cy.wait('@getPayments')

      // Intercept the filtered request
      cy.intercept('GET', 'https://bytenity.com/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('status_filter') === 'COMPLETED') {
          req.reply({
            body: {
              payments: [
                {
                  id: 101,
                  from_account_number: '265000000000000011',
                  to_account_number: '265000000000000099',
                  initial_amount: 5000,
                  final_amount: 5000,
                  commission: 0,
                  recipient_name: 'Ana Petrović',
                  payment_code: '289',
                  reference_number: 'RF-001',
                  payment_purpose: 'Test payment',
                  status: 'COMPLETED',
                  timestamp: '2026-03-25T14:30:00Z',
                },
              ],
              total: 1,
            },
          })
        }
      }).as('getFilteredPayments')

      // Click Status dropdown and select "Completed" checkbox
      cy.contains('button', 'Status').click()
      // Scope to the popover content to avoid matching the "Completed" badge in the table
      cy.get('[data-slot="popover-content"]').find('input[aria-label="Completed"]').check()
      cy.wait('@getFilteredPayments')

      // Only completed payment should be shown
      cy.contains('Ana Petrović').should('be.visible')
    })

    it('should filter payments by date range (Scenario 16 — date filter)', () => {
      cy.wait('@getPayments')

      // Intercept filtered request
      cy.intercept('GET', 'https://bytenity.com/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('date_from')) {
          req.reply({ fixture: 'payment-history.json' })
        }
      }).as('getDateFiltered')

      // Set "From Date" filter
      cy.get('input[placeholder="From Date"]').type('2026-03-24')
      cy.wait('@getDateFiltered')

      // Verify the request includes date_from param
      cy.get('@getDateFiltered')
        .its('request.url')
        .should('include', 'date_from=2026-03-24')
    })

    it('should filter payments by amount range (Scenario 16 — amount filter)', () => {
      cy.wait('@getPayments')

      cy.intercept('GET', 'https://bytenity.com/api/me/payments*', (req) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.searchParams.get('amount_min')) {
          req.reply({ fixture: 'payment-history.json' })
        }
      }).as('getAmountFiltered')

      // Set Min Amount filter
      cy.get('input[placeholder="Min Amount"]').type('1000')
      cy.wait('@getAmountFiltered')

      cy.get('@getAmountFiltered')
        .its('request.url')
        .should('include', 'amount_min=1000')
    })
  })
})
