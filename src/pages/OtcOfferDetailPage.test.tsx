import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcOfferDetailPage } from '@/pages/OtcOfferDetailPage'
import * as useOtcOptionsHook from '@/hooks/useOtcOptions'
import * as useAccountsHook from '@/hooks/useAccounts'
import {
  createMockOtcOptionOffer,
  createMockOtcNegotiation,
} from '@/__tests__/fixtures/otcOption-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/hooks/useOtcOptions')
jest.mock('@/hooks/useAccounts')

function setupBidMutations() {
  jest
    .mocked(useOtcOptionsHook.usePlaceBidOnOtcOption)
    .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  jest
    .mocked(useOtcOptionsHook.useCounterOtcNegotiation)
    .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  jest
    .mocked(useOtcOptionsHook.useAcceptOtcNegotiation)
    .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  jest
    .mocked(useOtcOptionsHook.useRejectOtcNegotiation)
    .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  jest
    .mocked(useOtcOptionsHook.useCancelOtcNegotiation)
    .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
}

beforeEach(() => {
  jest.clearAllMocks()
  setupBidMutations()
  jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
    data: { accounts: [createMockAccount({ id: 11 })], total: 1 },
  } as any)
  jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
    data: { accounts: [createMockAccount({ id: 99, account_type: 'bank' })], total: 1 },
  } as any)
})

function employeeAuth(id = 42) {
  return {
    auth: createMockAuthState({
      userType: 'employee',
      user: createMockAuthUser({ id, role: 'EmployeeAgent', system_type: 'employee' }),
    }),
  }
}

describe('OtcOfferDetailPage', () => {
  it('shows Counter / Accept / Decline buttons for an employee on a bank-owned offer with an open client bid', () => {
    jest.mocked(useOtcOptionsHook.useOtcOptionOffer).mockReturnValue({
      data: {
        offer: createMockOtcOptionOffer({
          id: 1001,
          status: 'open',
          initiator: { owner_type: 'bank', owner_id: null },
        }),
      },
      isLoading: false,
    } as any)
    jest.mocked(useOtcOptionsHook.useOtcOptionNegotiations).mockReturnValue({
      data: {
        negotiations: [
          createMockOtcNegotiation({
            id: 1,
            status: 'open',
            bidder: { owner_type: 'client', owner_id: 7 },
            last_action_by: { owner_type: 'client', owner_id: 7 },
          }),
        ],
        total: 1,
      },
      isLoading: false,
    } as any)
    renderWithProviders(<OtcOfferDetailPage />, {
      route: '/otc/offers/1001',
      routePath: '/otc/offers/:id',
      preloadedState: employeeAuth(),
    })
    expect(screen.getByRole('button', { name: /counter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^accept$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })
})
