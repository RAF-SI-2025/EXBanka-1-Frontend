declare global {
  namespace Cypress {
    interface Chainable {
      loginAsEmployee(path?: string): Chainable<void>
      loginAsClient(path?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginAsEmployee', (path = '/') => {
  cy.fixture('employee-auth.json').then((auth: { access_token: string; refresh_token: string }) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('access_token', auth.access_token)
        win.sessionStorage.setItem('refresh_token', auth.refresh_token)
      },
    })
  })
})

Cypress.Commands.add('loginAsClient', (path = '/') => {
  cy.fixture('client-auth.json').then((auth: { access_token: string; refresh_token: string }) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('access_token', auth.access_token)
        win.sessionStorage.setItem('refresh_token', auth.refresh_token)
      },
    })
  })
})

export {}
