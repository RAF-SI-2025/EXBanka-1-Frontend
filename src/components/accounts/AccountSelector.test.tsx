import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountSelector } from '@/components/accounts/AccountSelector'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

const mockBusiness = createMockAccount({
  id: 10,
  account_number: '265-0000000010-00',
  account_name: 'Firma DOO',
  currency_code: 'RSD',
  account_category: 'business',
})

const mockPersonal = createMockAccount({
  id: 11,
  account_number: '111-0000000011-00',
  account_name: 'Personal RSD',
  currency_code: 'RSD',
  account_category: 'personal',
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccountsHook.useSearchAccounts).mockReturnValue({
    data: { accounts: [mockBusiness, mockPersonal], total: 2 },
    isLoading: false,
  } as any)
})

describe('AccountSelector', () => {
  it('renders search input', () => {
    renderWithProviders(<AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} />)
    expect(screen.getByPlaceholderText(/search account/i)).toBeInTheDocument()
  })

  it('shows matching accounts in dropdown after typing', async () => {
    renderWithProviders(<AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} />)
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
  })

  it('calls onAccountSelected with the account when a row is clicked', async () => {
    const onSelect = jest.fn()
    renderWithProviders(<AccountSelector onAccountSelected={onSelect} selectedAccount={null} />)
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
    await userEvent.click(screen.getByText(/265-0000000010-00/))
    expect(onSelect).toHaveBeenCalledWith(mockBusiness)
  })

  it('shows selected account summary with Change button when an account is selected', () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={mockBusiness} />
    )
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
  })

  it('calls onAccountSelected(null) when Change is clicked', async () => {
    const onSelect = jest.fn()
    renderWithProviders(
      <AccountSelector onAccountSelected={onSelect} selectedAccount={mockBusiness} />
    )
    await userEvent.click(screen.getByRole('button', { name: /change/i }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('filters to business accounts only when businessOnly prop is true', async () => {
    renderWithProviders(
      <AccountSelector onAccountSelected={jest.fn()} selectedAccount={null} businessOnly />
    )
    await userEvent.type(screen.getByPlaceholderText(/search account/i), '111')
    expect(screen.queryByText(/111-0000000011-00/)).not.toBeInTheDocument()
    expect(screen.getByText(/265-0000000010-00/)).toBeInTheDocument()
  })
})
