describe('Celina 7: Krediti — Upravljanje kreditima', () => {
  describe('Client: Loan Application & Viewing (Scenarios 33–34)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/me/accounts', { fixture: 'accounts.json' }).as('getAccounts')
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
    })

    // Scenario 33: Podnošenje zahteva za kredit
    it('should submit a loan application (Scenario 33)', () => {
      cy.intercept('POST', '/api/me/loan-requests', {
        statusCode: 201,
        fixture: 'loan-request-created.json',
      }).as('submitLoan')

      cy.loginAsClient('/loans/apply')
      cy.contains('Submit Loan Request').should('be.visible')
      cy.wait('@getAccounts')

      // Select Loan Type
      cy.get('[aria-label="Loan Type"]').click()
      cy.contains('[role="option"]', 'Cash').realClick()

      // Select Interest Type
      cy.contains('Select interest type').click()
      cy.contains('[role="option"]', 'Fixed').realClick()

      // Select Disbursement Account
      cy.contains('Select account').click()
      cy.contains('[role="option"]', 'Moj tekući račun').realClick()

      // Enter amount
      cy.get('#amount').type('300000')

      // Select repayment period (options available after selecting loan type)
      cy.get('[aria-label="Repayment Period"]').click()
      cy.contains('[role="option"]', '36 months').realClick()

      // Fill optional fields
      cy.get('#purpose').type('Home renovation')
      cy.get('#monthly_salary').type('120000')

      // Select employment status
      cy.contains('Select status').click()
      cy.contains('[role="option"]', 'Permanent Employment').realClick()

      cy.get('#employment_period').type('5')
      cy.get('#phone').type('+381641234567')

      // Submit
      cy.contains('button', 'Submit Request').click()
      cy.wait('@submitLoan')

      // Verify request body
      cy.get('@submitLoan')
        .its('request.body')
        .should((body) => {
          expect(body.loan_type).to.equal('CASH')
          expect(body.amount).to.equal(300000)
          expect(body.repayment_period).to.equal(36)
          expect(body.account_number).to.equal('265000000000000011')
        })

      // Success screen
      cy.contains('Loan request submitted successfully!').should('be.visible')
      cy.contains('Your request is being processed.').should('be.visible')
    })

    // Scenario 34: Pregled kredita klijenta
    it('should display loan list with status badges (Scenario 34)', () => {
      cy.intercept('GET', '/api/me/loans', { fixture: 'loans-list.json' }).as('getLoans')

      cy.loginAsClient('/loans')
      cy.wait('@getLoans')

      cy.contains('h1', 'My Loans').should('be.visible')

      // Both loans should be displayed
      cy.contains('Cash').should('be.visible')
      cy.contains('Housing').should('be.visible')
      cy.contains('LN-2026-001').should('be.visible')
      cy.contains('LN-2026-002').should('be.visible')

      // Status badges
      cy.contains('Active').should('be.visible')

      // "Apply for Loan" button
      cy.contains('button', 'Apply for Loan').should('be.visible')
    })
  })

  describe('Employee: Loan Request Management (Scenarios 35–36)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/loan-requests*', {
        fixture: 'loan-requests-pending.json',
      }).as('getLoanRequests')
      cy.intercept('GET', '/api/clients*', {
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
      }).as('getClients')
      cy.loginAsEmployee('/admin/loans/requests')
      // Wait for initial data load before tests register competing intercepts (LIFO fix)
      cy.wait('@getLoanRequests')
      cy.wait('@getClients')
    })

    // Scenario 35: Odobravanje kredita
    it('should approve a pending loan request (Scenario 35)', () => {
      cy.intercept('POST', '/api/loan-requests/10/approve', {
        statusCode: 200,
        body: {},
      }).as('approveRequest')

      // Register updated intercept AFTER initial load to avoid LIFO conflict
      cy.intercept('GET', '/api/loan-requests*', {
        body: { requests: [], total: 0 },
      }).as('getLoanRequestsUpdated')

      cy.contains('h1', 'Loan Requests').should('be.visible')

      // Verify request row shows client name and amount
      cy.contains('Marko Jovanović').should('be.visible')
      cy.contains('265000000000000011').should('be.visible')
      cy.contains('36 months').should('be.visible')

      // Click "Approve"
      cy.contains('button', 'Approve').click()
      cy.wait('@approveRequest')

      // List refreshes — request no longer shown
      cy.wait('@getLoanRequestsUpdated')
    })

    // Scenario 36: Odbijanje zahteva za kredit
    it('should reject a pending loan request (Scenario 36)', () => {
      cy.intercept('POST', '/api/loan-requests/10/reject', {
        statusCode: 200,
        body: {},
      }).as('rejectRequest')

      // Register updated intercept AFTER initial load to avoid LIFO conflict
      cy.intercept('GET', '/api/loan-requests*', {
        body: { requests: [], total: 0 },
      }).as('getLoanRequestsUpdated')

      // Click "Reject"
      cy.contains('button', 'Reject').click()
      cy.wait('@rejectRequest')

      // List refreshes
      cy.wait('@getLoanRequestsUpdated')
    })
  })
})
