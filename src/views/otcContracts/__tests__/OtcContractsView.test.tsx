import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcContractsView } from '@/views/otcContracts/OtcContractsView'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import * as useOtcOptionsHook from '@/hooks/useOtcOptions'
import * as useAccountsHook from '@/hooks/useAccounts'
import type { Account } from '@/types/account'

jest.mock('@/hooks/useOtcOptions')
jest.mock('@/hooks/useAccounts')

function bankAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    account_number: 'BANK-USD-001',
    account_name: 'EX Banka USD',
    currency_code: 'USD',
    account_kind: 'current',
    account_type: 'bank',
    account_category: 'personal',
    balance: 0,
    available_balance: 0,
    reserved_balance: 0,
    status: 'ACTIVE',
    owner_id: 1000000000,
    is_bank_account: true,
    ...overrides,
  }
}

function clientAccount(overrides: Partial<Account> = {}): Account {
  return bankAccount({
    id: 2,
    account_number: 'CLIENT-USD-007',
    account_name: 'My USD account',
    account_type: 'personal',
    owner_id: 42,
    is_bank_account: false,
    ...overrides,
  })
}

describe('OtcContractsView — exercising a remote contract', () => {
  const remote = createMockOptionContract({
    id: 1,
    kind: 'remote',
    status: 'ACTIVE',
    strike_currency: 'USD',
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useOtcOptionsHook.useMyOtcOptionContracts)
      .mockReturnValue({ data: { contracts: [remote], total: 1 }, isLoading: false } as any)
    jest
      .mocked(useOtcOptionsHook.useExerciseOtcOptionContract)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    // The bank operator has no client accounts; only bank accounts can pay the strike.
    jest
      .mocked(useAccountsHook.useClientAccounts)
      .mockReturnValue({ data: { accounts: [], total: 0 } } as any)
    jest
      .mocked(useAccountsHook.useBankAccounts)
      .mockReturnValue({ data: { accounts: [bankAccount()], total: 1 } } as any)
  })

  it('offers bank accounts (not client accounts) in the buyer-account selector', () => {
    renderWithProviders(<OtcContractsView />)
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(screen.getByRole('option', { name: /BANK-USD-001/ })).toBeInTheDocument()
  })

  describe('account source by user type', () => {
    const clientAuth = createMockAuthState({ user: createMockAuthUser(), userType: 'client' })
    const employeeAuth = createMockAuthState({
      user: createMockAuthUser(),
      userType: 'employee',
    })

    it('as CLIENT: sources accounts from /me/accounts, never /bank-accounts', () => {
      jest
        .mocked(useAccountsHook.useClientAccounts)
        .mockReturnValue({ data: { accounts: [clientAccount()], total: 1 } } as never)

      renderWithProviders(<OtcContractsView />, { preloadedState: { auth: clientAuth } })
      fireEvent.click(screen.getByRole('button', { name: /exercise/i }))

      // The employee-only /bank-accounts query must stay disabled for clients,
      // while the client's own /me/accounts query is enabled.
      expect(useAccountsHook.useBankAccounts).toHaveBeenLastCalledWith(false)
      expect(useAccountsHook.useClientAccounts).toHaveBeenLastCalledWith(true)
      expect(screen.getByRole('option', { name: /CLIENT-USD-007/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /BANK-USD-001/ })).not.toBeInTheDocument()
    })

    it('as EMPLOYEE: sources accounts from /bank-accounts, never /me/accounts', () => {
      renderWithProviders(<OtcContractsView />, { preloadedState: { auth: employeeAuth } })
      fireEvent.click(screen.getByRole('button', { name: /exercise/i }))

      expect(useAccountsHook.useBankAccounts).toHaveBeenLastCalledWith(true)
      expect(useAccountsHook.useClientAccounts).toHaveBeenLastCalledWith(false)
      expect(screen.getByRole('option', { name: /BANK-USD-001/ })).toBeInTheDocument()
    })
  })
})
