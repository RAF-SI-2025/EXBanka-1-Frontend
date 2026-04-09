describe('Password Reset Page', () => {
  it('should display the password reset form', () => {
    cy.visit('/password-reset?token=test-token-123')

    cy.contains('Set New Password').should('be.visible')
    cy.get('#new_password').should('be.visible')
    cy.get('#confirm_password').should('be.visible')
    cy.contains('button', 'Reset Password').should('be.visible')
  })

  it('should submit new password successfully', () => {
    cy.intercept('POST', '/api/auth/password/reset', { statusCode: 200, body: {} }).as(
      'resetPassword'
    )

    cy.visit('/password-reset?token=test-token-123')

    cy.get('#new_password').type('NewPassword12!')
    cy.get('#confirm_password').type('NewPassword12!')
    cy.contains('button', 'Reset Password').click()

    cy.wait('@resetPassword')
    cy.get('@resetPassword')
      .its('request.body')
      .should((body) => {
        expect(body.token).to.equal('test-token-123')
        expect(body.new_password).to.equal('NewPassword12!')
        expect(body.confirm_password).to.equal('NewPassword12!')
      })

    // Success state
    cy.contains('Password reset successfully.').should('be.visible')
    cy.contains('Log in').should('be.visible')
  })

  it('should show validation error when passwords do not match', () => {
    cy.visit('/password-reset?token=test-token-123')

    cy.get('#new_password').type('NewPassword12!')
    cy.get('#confirm_password').type('DifferentPassword1!')
    cy.contains('button', 'Reset Password').click()

    cy.contains('Passwords do not match').should('be.visible')
  })

  it('should show error message on API failure', () => {
    cy.intercept('POST', '/api/auth/password/reset', { statusCode: 400, body: {} }).as(
      'resetPasswordFail'
    )

    cy.visit('/password-reset?token=expired-token')

    cy.get('#new_password').type('NewPassword12!')
    cy.get('#confirm_password').type('NewPassword12!')
    cy.contains('button', 'Reset Password').click()

    cy.wait('@resetPasswordFail')
    cy.contains('Failed to reset password. The link may have expired.').should('be.visible')
  })
})
