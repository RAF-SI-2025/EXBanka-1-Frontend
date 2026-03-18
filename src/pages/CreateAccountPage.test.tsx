import { screen } from '@testing-library/react'
import { CreateAccountPage } from '@/pages/CreateAccountPage'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/clients')
jest.mock('@/lib/api/accounts')

describe('CreateAccountPage', () => {
  it('renders page title and form', () => {
    renderWithProviders(<CreateAccountPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getAllByText(/create account/i)[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/account name/i)).toBeInTheDocument()
  })
})
