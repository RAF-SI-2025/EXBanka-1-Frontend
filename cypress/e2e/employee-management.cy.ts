describe('Celina 0.2: Upravljanje zaposlenima', () => {
  // Scenario 11: Admin vidi listu svih zaposlenih
  it('should display employee list with all columns (Scenario 11)', () => {
    cy.intercept('GET', 'https://bytenity.com/api/employees*', { fixture: 'employees-list.json' }).as('getEmployees')

    cy.loginAsEmployee('/employees')
    cy.wait('@getEmployees')

    cy.contains('h1', 'Employees').should('be.visible')

    // Table headers
    cy.contains('th', 'Name').should('be.visible')
    cy.contains('th', 'Email').should('be.visible')
    cy.contains('th', 'Position').should('be.visible')
    cy.contains('th', 'Phone').should('be.visible')
    cy.contains('th', 'Status').should('be.visible')

    // Both employees shown with their data
    cy.contains('Marko Marković').should('be.visible')
    cy.contains('marko.markovic@banka.rs').should('be.visible')
    cy.contains('Ana Petrović').should('be.visible')

    // Status badge visible
    cy.contains('Active').should('be.visible')
  })

  // Scenario 12: Admin pretražuje zaposlene
  it('should filter employee list by name (Scenario 12)', () => {
    cy.intercept('GET', 'https://bytenity.com/api/employees*', { fixture: 'employees-list.json' }).as('getEmployees')

    cy.loginAsEmployee('/employees')
    cy.wait('@getEmployees')

    // Register filtered intercept AFTER initial load
    cy.intercept('GET', 'https://bytenity.com/api/employees*', (req) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('name')) {
        req.reply({
          body: {
            employees: [
              {
                id: 7,
                first_name: 'Marko',
                last_name: 'Marković',
                email: 'marko.markovic@banka.rs',
                phone: '+381641234567',
                address: 'Knez Mihailova 10, Beograd',
                username: 'mmarkovic',
                date_of_birth: 631152000,
                gender: 'MALE',
                jmbg: '0101990710123',
                position: 'Analyst',
                department: 'Retail',
                role: 'EmployeeBasic',
                active: true,
                permissions: [],
              },
            ],
            total_count: 1,
          },
        })
      }
    }).as('getFilteredEmployees')

    cy.get('input[placeholder="Name"]').type('Marko')
    cy.wait('@getFilteredEmployees')

    // Only Marko visible after filtering
    cy.contains('Marko Marković').should('be.visible')
    cy.contains('Ana Petrović').should('not.exist')
  })

  // Scenario 13: Admin menja podatke zaposlenog
  // Note: spec says "prikazuje potvrdu o uspešnoj izmeni" but EditEmployeePage has no
  // success message — it redirects to /employees on success (useMutationWithRedirect).
  it('should edit employee phone and department (Scenario 13)', () => {
    cy.intercept('GET', 'https://bytenity.com/api/employees*', { fixture: 'employees-list.json' }).as('getEmployeesList')
    cy.intercept('GET', 'https://bytenity.com/api/employees/7', { fixture: 'employee-detail.json' }).as('getEmployee')
    cy.intercept('PUT', 'https://bytenity.com/api/employees/7', {
      statusCode: 200,
      body: {
        id: 7,
        first_name: 'Marko',
        last_name: 'Marković',
        email: 'marko.markovic@banka.rs',
        phone: '+381669999999',
        address: 'Knez Mihailova 10, Beograd',
        username: 'mmarkovic',
        date_of_birth: 631152000,
        gender: 'MALE',
        jmbg: '0101990710123',
        position: 'Analyst',
        department: 'Corporate',
        role: 'EmployeeBasic',
        active: true,
        permissions: [],
      },
    }).as('updateEmployee')

    cy.loginAsEmployee('/employees/7')
    cy.wait('@getEmployee')

    cy.contains('h1', 'Edit Employee').should('be.visible')

    // Disabled read-only fields are pre-filled
    cy.get('#first_name').should('have.value', 'Marko')
    cy.get('#email').should('have.value', 'marko.markovic@banka.rs')

    // Edit phone — PhoneInput splits into country-code Select + digit Input.
    // The digit input (placeholder="Phone number") holds only the digit portion.
    // employee.phone is "+381641234567" → parsePhone gives countryCode="+381", number="641234567"
    // To change to "+381669999999": clear and type only the digit portion "669999999"
    cy.get('input[placeholder="Phone number"]').clear().type('669999999')

    // Edit department
    cy.get('#department').clear().type('Corporate')

    // Submit
    cy.contains('button', 'Save').click()
    cy.wait('@updateEmployee')

    // Verify composed phone value in request body
    cy.get('@updateEmployee')
      .its('request.body')
      .should((body) => {
        expect(body.phone).to.equal('+381669999999')
        expect(body.department).to.equal('Corporate')
      })

    // Redirect to employee list (no success message — redirect is the confirmation)
    cy.url().should('include', '/employees')
    cy.url().should('not.include', '/employees/7')
  })

  // Scenario 14: Admin deaktivira zaposlenog
  // Note: spec says "klikne na opciju 'Deaktiviraj'" but there is no Deactivate button.
  // Deactivation is done by changing the Status Select from Active to Inactive and clicking Save.
  it('should deactivate employee by changing Status to Inactive (Scenario 14)', () => {
    cy.intercept('GET', 'https://bytenity.com/api/employees*', { fixture: 'employees-list.json' }).as('getEmployeesList')
    cy.intercept('GET', 'https://bytenity.com/api/employees/7', { fixture: 'employee-detail.json' }).as('getEmployee')
    cy.intercept('PUT', 'https://bytenity.com/api/employees/7', {
      statusCode: 200,
      body: {
        id: 7,
        first_name: 'Marko',
        last_name: 'Marković',
        email: 'marko.markovic@banka.rs',
        phone: '+381641234567',
        address: 'Knez Mihailova 10, Beograd',
        username: 'mmarkovic',
        date_of_birth: 631152000,
        gender: 'MALE',
        jmbg: '0101990710123',
        position: 'Analyst',
        department: 'Retail',
        role: 'EmployeeBasic',
        active: false,
        permissions: [],
      },
    }).as('deactivateEmployee')

    cy.loginAsEmployee('/employees/7')
    cy.wait('@getEmployee')

    cy.contains('h1', 'Edit Employee').should('be.visible')

    // Change Status from Active to Inactive.
    // #status is on the <SelectTrigger> which renders as <button>.
    // Use realClick() (cypress-real-events) so that Radix UI receives real pointer events
    // and correctly fires onValueChange.
    cy.get('#status').scrollIntoView().realClick()
    cy.contains('[role="option"]', 'Inactive').realClick()

    // Wait for Select to reflect the new value before submitting
    // Base UI SelectPrimitive.Value renders the raw value string (not the item label)
    cy.get('#status').should('contain.text', 'inactive')

    cy.contains('button', 'Save').click({ force: true })
    cy.wait('@deactivateEmployee')

    // Verify active: false in request body
    cy.get('@deactivateEmployee')
      .its('request.body')
      .should('have.property', 'active', false)

    // Redirect to employee list
    cy.url().should('include', '/employees')
    cy.url().should('not.include', '/employees/7')
  })

  // Scenario 15: Admin pokušava da izmeni drugog admina
  it('should show read-only view when admin tries to edit another admin (Scenario 15)', () => {
    // employee-auth.json JWT has user_id: 5
    // employee 10 has role: "EmployeeAdmin" and id: 10 ≠ 5
    // → isOtherAdmin = true → readOnly prop passed to EmployeeEditForm
    cy.intercept('GET', 'https://bytenity.com/api/employees/10', {
      fixture: 'employee-admin-detail.json',
    }).as('getAdminEmployee')

    cy.loginAsEmployee('/employees/10')
    cy.wait('@getAdminEmployee')

    // Title is "Administrator Details", not "Edit Employee"
    cy.contains('h1', 'Administrator Details').should('be.visible')

    // Read-only notice displayed above the form
    cy.contains('View only — administrator profiles cannot be edited.').should('be.visible')

    // Save button is NOT rendered when readOnly
    cy.contains('button', 'Save').should('not.exist')

    // Inputs are disabled
    cy.get('#last_name').should('be.disabled')
    cy.get('#department').should('be.disabled')
  })
})

describe('Celina 0.2: Autorizacija i permisije', () => {
  // Scenario 16: Korisnik bez admin permisija pokušava pristup admin portalu
  // Note: spec says "Nemate dozvolu za pristup ovoj stranici" but ProtectedRoute
  // silently redirects with no message. Full chain:
  //   /employees → ProtectedRoute <Navigate to="/" /> (missing employees.read)
  //   /          → App.tsx path="*" → <Navigate to="/login" />
  //   /login     → LoginPage (authenticated client) → <Navigate to="/home" />
  // Final URL: /home
  it('should redirect client user to /home when accessing employee management (Scenario 16)', () => {
    // client-auth.json has permissions: [] — no employees.read
    cy.loginAsClient('/employees')

    // Full redirect chain ends at /home (client default page)
    cy.url().should('include', '/home')
  })
})
