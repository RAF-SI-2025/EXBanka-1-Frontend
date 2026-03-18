import { screen } from '@testing-library/react'
import { CreateAccountForm } from '@/components/accounts/CreateAccountForm'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/clients')
jest.mock('@/lib/api/accounts')

describe('CreateAccountForm', () => {
  const defaultProps = { onSuccess: jest.fn() }

  beforeEach(() => jest.clearAllMocks())

  it('renders account type selection', () => {
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/account name/i)).toBeInTheDocument()
  })

  it('has create card checkbox', () => {
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/create card/i)).toBeInTheDocument()
  })
})
