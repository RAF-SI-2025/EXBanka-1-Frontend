import { screen } from '@testing-library/react'
import { CreateAccountView } from '@/views/accounts/CreateAccountView'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/clients')
jest.mock('@/lib/api/accounts')

describe('CreateAccountView', () => {
  it('renders page title and form', () => {
    renderWithProviders(<CreateAccountView />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getAllByText(/create account/i)[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument()
  })
})
