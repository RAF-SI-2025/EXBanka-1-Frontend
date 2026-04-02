import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountCard } from '@/components/accounts/AccountCard'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('AccountCard', () => {
  it('renders account info', () => {
    const account = createMockAccount()
    renderWithProviders(<AccountCard account={account} />)
    expect(screen.getByText('Tekući RSD')).toBeInTheDocument()
    expect(screen.getByText(/aktivan/i)).toBeInTheDocument()
  })

  it('shows available balance', () => {
    const account = createMockAccount({ available_balance: 49000, currency_code: 'RSD' })
    renderWithProviders(<AccountCard account={account} />)
    expect(screen.getByText(/49.000/)).toBeInTheDocument()
  })
})
