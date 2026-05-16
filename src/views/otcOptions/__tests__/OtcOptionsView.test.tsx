import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcOptionsView } from '@/views/otcOptions/OtcOptionsView'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import * as accountsApi from '@/lib/api/accounts'
import type { AuthUser } from '@/types/auth'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    listAll: jest.fn(),
    listMine: jest.fn(),
    createListing: jest.fn(),
    cancelListing: jest.fn(),
    placeBid: jest.fn(),
    counter: jest.fn(),
    acceptNegotiation: jest.fn(),
    rejectNegotiation: jest.fn(),
    withdrawNegotiation: jest.fn(),
    listNegotiations: jest.fn(),
  },
}))

jest.mock('@/lib/api/accounts', () => ({
  getClientAccounts: jest.fn(),
}))

const user: AuthUser = {
  id: 5,
  email: 'me@example.com',
  role: 'client',
  permissions: [],
  system_type: 'client',
}

const preloadedAuth = {
  auth: {
    user,
    userType: 'client' as const,
    accessToken: 'tok',
    refreshToken: 'rt',
    status: 'authenticated' as const,
    error: null,
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(accountsApi.getClientAccounts).mockResolvedValue({
    accounts: [
      {
        id: 11,
        account_number: '265-1',
        account_name: 'Main',
        currency_code: 'USD',
        account_kind: 'current',
        account_type: 'standard',
        account_category: 'personal',
        balance: 1000,
        available_balance: 1000,
        status: 'ACTIVE',
        owner_id: 5,
      },
    ],
    total: 1,
  })
})

describe('OtcOptionsView', () => {
  it('renders All offers and exposes a Place bid button for non-owner rows', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '42',
          seller_id: 'client-99',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          best_bid: '850',
          active_chains_count: 2,
        },
      ],
      total_count: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    expect(await screen.findByText('AAPL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument()
  })

  it("shows Activity (not Place bid) on the user's own listing", async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '42',
          seller_id: 'client-5', // matches user id
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
        },
      ],
      total_count: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    expect(await screen.findByText('AAPL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activity/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /place bid/i })).not.toBeInTheDocument()
  })

  it('switches to My listings tab and fetches /me/otc/options', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [],
      total_count: 0,
    })
    jest.mocked(otcOptionsApi.listMine).mockResolvedValue({
      offers: [
        {
          id: 77,
          direction: 'sell_initiated',
          status: 'open',
          stock_id: 1,
          ticker: 'TSLA',
          quantity: '5',
          strike_price: '300',
          premium: '500',
          settlement_date: '2026-12-31',
          initiator: { owner_type: 'client', owner_id: 5 },
          created_at: '2026-05-10T14:00:00Z',
        },
      ],
      total: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(screen.getByRole('tab', { name: /my/i }))

    expect(await screen.findByText('TSLA')).toBeInTheDocument()
    await waitFor(() => expect(otcOptionsApi.listMine).toHaveBeenCalled())
  })
})
