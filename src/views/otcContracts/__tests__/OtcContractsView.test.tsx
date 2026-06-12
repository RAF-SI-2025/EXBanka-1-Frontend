import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcContractsView } from '@/views/otcContracts/OtcContractsView'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'
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
})
