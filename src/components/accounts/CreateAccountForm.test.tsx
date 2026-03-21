import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  })

  it('has create card checkbox', () => {
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/create card/i)).toBeInTheDocument()
  })

  it('does not show card brand dropdown when create card is unchecked', () => {
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.queryByLabelText(/tip kartice/i)).not.toBeInTheDocument()
  })

  it('shows card brand dropdown when create card checkbox is checked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await user.click(screen.getByLabelText(/create card/i))
    expect(screen.getByLabelText(/tip kartice/i)).toBeInTheDocument()
  })

  it('shows account kind dropdown by default (Current account type)', () => {
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/account kind/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/currency/i)).not.toBeInTheDocument()
  })

  it('shows currency dropdown alongside account kind when Foreign is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await user.click(screen.getByLabelText(/account type/i))
    await user.click(screen.getByText(/^foreign$/i))
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/account kind/i)).toBeInTheDocument()
  })

  it('shows company kind options when Company category is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateAccountForm {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await user.click(screen.getByLabelText(/account category/i))
    await user.click(screen.getByText(/^company$/i))
    await user.click(screen.getByLabelText(/account kind/i))
    expect(screen.getByText('DOO')).toBeInTheDocument()
    expect(screen.getByText('AD')).toBeInTheDocument()
    expect(screen.getByText('Foundation')).toBeInTheDocument()
  })
})
