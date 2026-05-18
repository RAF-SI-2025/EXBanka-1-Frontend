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
    listMyNegotiations: jest.fn(),
  },
}))

jest.mock('@/lib/api/accounts', () => ({
  getClientAccounts: jest.fn(),
  getBankAccounts: jest.fn(),
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
  // Default: caller has no active chains anywhere.
  jest.mocked(otcOptionsApi.listMyNegotiations).mockResolvedValue({ negotiations: [], total: 0 })
  jest.mocked(otcOptionsApi.listMine).mockResolvedValue({ offers: [], total_count: 0 })
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
        reserved_balance: 0,
        status: 'ACTIVE',
        owner_id: 5,
      },
    ],
    total: 1,
  })
  jest.mocked(accountsApi.getBankAccounts).mockResolvedValue({
    accounts: [
      {
        id: 99,
        account_number: '999-1',
        account_name: 'Bank ops',
        currency_code: 'USD',
        account_kind: 'current',
        account_type: 'standard',
        account_category: 'business',
        balance: 100000,
        available_balance: 100000,
        reserved_balance: 0,
        status: 'ACTIVE',
        owner_id: 0,
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
    expect(screen.getByRole('button', { name: /^bid$/i })).toBeInTheDocument()
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
    expect(screen.queryByRole('button', { name: /^bid$/i })).not.toBeInTheDocument()
  })

  it('switches to My listings tab and fetches /me/otc/options', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [],
      total_count: 0,
    })
    // /me/otc/options now returns the same marketplace shape as /otc/options
    // (kind, bank_code, best_bid/ask, active_chains_count, …), scoped to the
    // caller's own open listings via owner_only_seller_id server-side.
    jest.mocked(otcOptionsApi.listMine).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '77',
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'TSLA',
          amount: 5,
          strike_price: '300',
          strike_currency: 'USD',
          premium: '500',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          active_chains_count: 0,
        },
      ],
      total_count: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(screen.getByRole('tab', { name: /my/i }))

    expect(await screen.findByText('TSLA')).toBeInTheDocument()
    await waitFor(() => expect(otcOptionsApi.listMine).toHaveBeenCalled())
  })

  it('routes an employee to the owner panel when clicking a local bank-owned row', async () => {
    const employee: AuthUser = {
      id: 7,
      email: 'emp@example.com',
      role: 'EmployeeAdmin',
      permissions: [],
      system_type: 'employee',
    }
    const employeeAuth = {
      auth: {
        user: employee,
        userType: 'employee' as const,
        accessToken: 'tok',
        refreshToken: 'rt',
        status: 'authenticated' as const,
        error: null,
      },
    }

    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '42',
          seller_id: { owner_type: 'bank', id: 7 },
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          active_chains_count: 0,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [],
      total: 0,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: employeeAuth })

    // Wait for the row to appear, then click it (not the Activity button — the
    // row body itself dispatches via onRowOpen which calls handleRowOpen and,
    // because isOwnRow short-circuits to true for employee + local + bank,
    // routes us into the OWNER panel (OfferActivityPanel), not BidderActivityPanel.
    const tickerCell = await screen.findByText('AAPL')
    const row = tickerCell.closest('tr')
    expect(row).not.toBeNull()
    await userEvent.click(row!)

    // The owner panel renders "Cancel listing" and a "Bidders" heading.
    // The bidder panel would render "Your chain" / "Place bid" instead — so
    // these two assertions together guard against the regression of an
    // employee being routed away from accept/counter/reject for bank-owned
    // local offers.
    expect(await screen.findByRole('button', { name: /cancel listing/i })).toBeInTheDocument()
    expect(screen.getByText(/bidders/i)).toBeInTheDocument()
  })

  it('uses bank accounts (not client accounts) for an employee user', async () => {
    const employee: AuthUser = {
      id: 7,
      email: 'emp@example.com',
      role: 'EmployeeAdmin',
      permissions: [],
      system_type: 'employee',
    }
    const employeeAuth = {
      auth: {
        user: employee,
        userType: 'employee' as const,
        accessToken: 'tok',
        refreshToken: 'rt',
        status: 'authenticated' as const,
        error: null,
      },
    }
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({ offers: [], total_count: 0 })

    renderWithProviders(<OtcOptionsView />, { preloadedState: employeeAuth })

    await waitFor(() => expect(accountsApi.getBankAccounts).toHaveBeenCalled())
    expect(accountsApi.getClientAccounts).not.toHaveBeenCalled()
  })
})
