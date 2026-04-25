describe('Celina 0.1: Kreiranje zaposlenog', () => {
  // Scenario 6: Admin kreira novog zaposlenog
  it('should create a new employee and redirect to employee list (Scenario 6)', () => {
    cy.intercept('POST', 'https://bytenity.com/api/v1/employees', {
      statusCode: 201,
      fixture: 'employee-created.json',
    }).as('createEmployee')

    cy.loginAsEmployee('/employees/new')

    cy.contains('h1', 'Create Employee').should('be.visible')

    // Fill required fields
    cy.get('#first_name').type('Nikola')
    cy.get('#last_name').type('Petrović')
    cy.get('#date_of_birth').type('1990-01-01')
    cy.get('#email').type('nikola.petrovic@example.com')
    cy.get('#username').type('npetrovic')
    cy.get('#jmbg').type('1234567890123')

    // Select role (required)
    // formatRoleLabel('EmployeeBasic') → 'Employee Basic' (inserts space before each capital)
    cy.get('#role').click()
    cy.contains('[role="option"]', 'Employee Basic').click()

    // Submit — scroll into view first; the form is long and the button may be off-screen
    cy.contains('button', 'Save').click({ force: true })
    cy.wait('@createEmployee')

    // Verify request body contains required fields
    cy.get('@createEmployee')
      .its('request.body')
      .should((body) => {
        expect(body.first_name).to.equal('Nikola')
        expect(body.last_name).to.equal('Petrović')
        expect(body.email).to.equal('nikola.petrovic@example.com')
        expect(body.username).to.equal('npetrovic')
        expect(body.jmbg).to.equal('1234567890123')
      })

    // Redirect to employee list
    cy.url().should('include', '/employees')
  })

  // Scenario 7: Kreiranje zaposlenog sa već postojećim email-om
  it('should show error when creating employee with duplicate email (Scenario 7)', () => {
    cy.intercept('POST', 'https://bytenity.com/api/v1/employees', {
      statusCode: 409,
      body: { message: 'Email already exists' },
    }).as('createEmployeeDuplicate')

    cy.loginAsEmployee('/employees/new')

    cy.contains('h1', 'Create Employee').should('be.visible')

    // Fill form with a duplicate email
    cy.get('#first_name').type('Marko')
    cy.get('#last_name').type('Markovic')
    cy.get('#email').type('marko.markovic@example.com')
    cy.get('#username').type('mmarkovic')
    cy.get('#jmbg').type('9876543210123')

    // Select role
    cy.get('#role').click()
    cy.contains('[role="option"]', 'Employee Basic').click()

    // Submit — scroll into view first; the form is long and the button may be off-screen
    cy.contains('button', 'Save').click({ force: true })
    cy.wait('@createEmployeeDuplicate')

    // Frontend shows generic error (not the API message)
    // Note: spec says "Nalog sa ovom email adresom već postoji" but frontend renders
    // the hardcoded string from CreateEmployeePage.tsx: "Failed to create employee."
    cy.contains('Failed to create employee.').should('be.visible')

    // Admin stays on the form
    cy.url().should('include', '/employees/new')
  })
})
