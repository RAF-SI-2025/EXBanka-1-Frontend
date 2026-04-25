describe('Celina 1: Računi — Kreiranje i upravljanje računima', () => {
  describe('Employee: Account Creation (Scenarios 1–4)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/clients?*', { fixture: 'clients.json' }).as('searchClients')
      cy.intercept('POST', 'https://bytenity.com/api/v1/accounts', {
        statusCode: 201,
        fixture: 'create-account-response.json',
      }).as('createAccount')
      cy.intercept('GET', 'https://bytenity.com/api/v2/accounts?*', { fixture: 'accounts.json' }).as('getAccounts')
      cy.intercept('GET', 'https://bytenity.com/api/v1/clients', { fixture: 'clients.json' }).as('getAllClients')
      cy.loginAsEmployee('/accounts/new')
    })

    // Scenario 1: Kreiranje tekućeg računa za postojećeg klijenta
    it('should create a current account for existing client', () => {
      // Search and select client
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Account Type is "current" by default — verify
      cy.get('[aria-label="Account Type"]').should('contain.text', 'current')

      // Enter initial balance
      cy.get('#initial_balance').clear().type('10000')

      // Submit
      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      // Verify request body has correct owner_id
      cy.get('@createAccount').its('request.body').should('have.property', 'owner_id', 42)

      // Verify redirect to admin accounts
      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 2: Kreiranje deviznog računa
    it('should create a foreign currency account', () => {
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Select foreign account type
      cy.get('[aria-label="Account Type"]').click()
      cy.contains('[role="option"]', 'Foreign').realClick()

      // Currency selector appears — wait for it then select EUR
      cy.get('[aria-label="Currency"]').should('be.visible').click()
      cy.contains('[role="option"]', 'EUR').realClick()

      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      cy.get('@createAccount')
        .its('request.body')
        .should((body) => {
          expect(body.account_kind).to.equal('foreign')
          expect(body.currency_code).to.equal('EUR')
        })

      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 3: Kreiranje računa sa automatskim kreiranjem kartice
    it('should create account with automatic card creation', () => {
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Check "Create Card" checkbox
      cy.get('#create_card').check()

      // Select card brand
      cy.get('[aria-label="Card Brand"]').click()
      cy.contains('[role="option"]', 'Visa').realClick()
      cy.get('[aria-label="Card Brand"]').should('contain.text', 'visa')

      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      cy.get('@createAccount').its('request.body').should('include', {
        create_card: true,
        card_brand: 'visa',
      })

      cy.url().should('include', '/admin/accounts')
    })

    // Scenario 4: Kreiranje poslovnog računa za firmu
    it('should create a business account for a company', () => {
      cy.get('input[placeholder="Search client by name..."]').type('Marko')
      cy.wait('@searchClients')
      cy.contains('li', 'Marko Jovanović').should('be.visible').click()

      // Select business category
      cy.get('[aria-label="Account Category"]').click()
      cy.contains('[role="option"]', 'Company').realClick()

      // Fill company fields — wait for CompanyForm to render first
      cy.get('#company\\.name').should('be.visible').type('Tech DOO')
      cy.get('#company\\.tax_number').type('123456789')
      cy.get('#company\\.registration_number').type('12345678')
      cy.get('#company\\.activity_code').type('6201')
      cy.get('#company\\.address').type('Nemanjina 5, Beograd')

      cy.contains('button', 'Create Account').click()
      cy.wait('@createAccount')

      cy.get('@createAccount')
        .its('request.body')
        .should((body) => {
          expect(body.account_category).to.equal('business')
        })

      cy.url().should('include', '/admin/accounts')
    })
  })

  describe('Client: Account Viewing & Management (Scenarios 6–8)', () => {
    beforeEach(() => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/accounts', { fixture: 'accounts.json' }).as(
        'getClientAccounts'
      )
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/payments*', {
        body: { payments: [], total: 0 },
      }).as('getPayments')
      cy.intercept('GET', 'https://bytenity.com/api/v1/me', {
        body: { id: 42, first_name: 'Marko', last_name: 'Jovanović', email: 'marko@example.com' },
      }).as('getClientMe')
      cy.loginAsClient('/accounts')
    })

    // Scenario 6: Pregled računa klijenta
    it('should display all active client accounts', () => {
      cy.wait('@getClientAccounts')

      cy.contains('h1', 'My Accounts').should('be.visible')
      cy.contains('Moj tekući račun').should('be.visible')
      cy.contains('Devizni EUR').should('be.visible')
    })

    // Scenario 7: Pregled detalja računa
    it('should display account details when account card is clicked', () => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/accounts/1', { fixture: 'account-detail.json' }).as(
        'getAccountDetail'
      )

      cy.wait('@getClientAccounts')
      cy.contains('Moj tekući račun').click()
      cy.wait('@getAccountDetail')

      cy.contains('h1', 'Moj tekući račun').should('be.visible')
      cy.contains('Account Type').should('be.visible')
      cy.contains('Balance').should('be.visible')
      cy.contains('Available').should('be.visible')
      cy.contains('265-0000000000000-11').should('be.visible')
    })

    // Scenario 8: Promena naziva računa
    it('should rename an account successfully', () => {
      cy.intercept('GET', 'https://bytenity.com/api/v1/me/accounts/1', { fixture: 'account-detail.json' }).as(
        'getAccountDetail'
      )
      cy.fixture('account-detail.json').then((account) => {
        cy.intercept('PUT', 'https://bytenity.com/api/v1/accounts/1/name', {
          statusCode: 200,
          body: { ...account, account_name: 'Glavni račun' },
        }).as('renameAccount')
      })

      cy.visit('/accounts/1')
      cy.wait('@getAccountDetail')

      cy.contains('button', 'Rename Account').click()
      cy.get('#account-name').clear().type('Glavni račun')
      cy.contains('button', 'Save').click()
      cy.wait('@renameAccount')

      cy.get('@renameAccount')
        .its('request.body')
        .should('have.property', 'new_name', 'Glavni račun')
      cy.contains('button', 'Rename Account').should('be.visible')
    })
  })
})
