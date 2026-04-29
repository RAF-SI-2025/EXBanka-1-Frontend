describe('Notifications bell', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v3/me/notifications/unread-count', {
      fixture: 'notifications-unread-count.json',
    }).as('getUnread')
    cy.intercept('GET', '**/api/v3/me/notifications*', {
      fixture: 'notifications.json',
    }).as('getList')
    cy.intercept('POST', '**/api/v3/me/notifications/*/read', {
      body: { success: true },
    }).as('markRead')
    // Account/payment intercepts so the Home page renders without backend.
    cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' })
    cy.intercept('GET', '**/api/v3/me/payments*', { fixture: 'home-payments.json' })
    cy.intercept('GET', '**/api/v3/me/payment-recipients*', { fixture: 'home-recipients.json' })
  })

  it('shows badge, opens dropdown, and marks one read', () => {
    cy.loginAsClient('/home')
    cy.wait('@getUnread')

    cy.get('[aria-label="Notifications"]').should('contain.text', '2').click()
    cy.wait('@getList')

    cy.contains('Money Received').should('be.visible').click()
    cy.wait('@markRead').its('request.url').should('include', '/notifications/1/read')
  })
})
