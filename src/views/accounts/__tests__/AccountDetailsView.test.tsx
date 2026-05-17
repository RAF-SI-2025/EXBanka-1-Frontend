import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountDetailsView } from '@/views/accounts/AccountDetailsView'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useAccounts')

describe('AccountDetailsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccount).mockReturnValue({
      data: createMockAccount({ reserved_balance: 1500 }),
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useUpdateAccountName).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useUpdateAccountLimits).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useAccountActivity).mockReturnValue({
      data: { entries: [], total_count: 0 },
      isLoading: false,
    } as any)
  })

  it('embeds the activity panel', () => {
    renderWithProviders(<AccountDetailsView />, { route: '/accounts/1' })
    expect(screen.getByText(/^activity$/i)).toBeInTheDocument()
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument()
  })

  it('does not have a separate "View Activity" navigate button', () => {
    renderWithProviders(<AccountDetailsView />, { route: '/accounts/1' })
    expect(screen.queryByRole('button', { name: /view activity/i })).not.toBeInTheDocument()
  })

  it('renders account name', () => {
    renderWithProviders(<AccountDetailsView />, { route: '/accounts/1' })
    expect(screen.getByRole('heading', { name: /Tekući RSD/ })).toBeInTheDocument()
  })

  it('renders rename button', () => {
    renderWithProviders(<AccountDetailsView />, { route: '/accounts/1' })
    expect(screen.getByText(/rename account/i)).toBeInTheDocument()
  })

  it('displays the reserved_balance from the account in the Reserved Funds row', () => {
    renderWithProviders(<AccountDetailsView />, { route: '/accounts/1' })
    const reservedLabel = screen.getByText(/reserved funds/i)
    const row = reservedLabel.parentElement
    expect(row).not.toBeNull()
    // The mock account has reserved_balance: 1500 — we should see "1.500" formatted, not "0".
    expect(row!.textContent).toMatch(/1[.,]500/)
    expect(row!.textContent).not.toMatch(/(?:^|\s)0(?:[.,]00)?\s*RSD/)
  })
})
