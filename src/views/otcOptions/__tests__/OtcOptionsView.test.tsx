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
    updateListing: jest.fn(),
    cancelListing: jest.fn(),
    placeBid: jest.fn(),
    counter: jest.fn(),
    acceptNegotiation: jest.fn(),
    rejectNegotiation: jest.fn(),
    withdrawNegotiation: jest.fn(),
    listNegotiations: jest.fn(),
    listMyNegotiations: jest.fn(),
    getOfferTimeline: jest.fn(),
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
  jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({ offer: {}, timeline: [] })
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

  it('bids against the listing local_id (not NaN) when offer_id is absent on a local row', async () => {
    // A real LOCAL discovery row addresses the listing by `local_id`; `offer_id`
    // (the hosting bank's native id) is absent. Reading `offer_id` as the path
    // id sent /otc/options/NaN/bid — this guards that regression.
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          local_id: 42,
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
          active_chains_count: 0,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.placeBid).mockResolvedValue({
      negotiation: {
        id: 1,
        status: 'open',
        bidder: { owner_type: 'client', owner_id: 5 },
        quantity: '10',
        strike_price: '175.50',
        premium: '700.00',
        settlement_date: '2026-12-31T00:00:00Z',
        created_at: '2026-05-10T14:00:00Z',
        updated_at: '2026-05-10T14:00:00Z',
      },
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(await screen.findByRole('button', { name: /^bid$/i }))
    await userEvent.click(await screen.findByRole('button', { name: /submit bid/i }))

    await waitFor(() => expect(otcOptionsApi.placeBid).toHaveBeenCalled())
    expect(otcOptionsApi.placeBid).toHaveBeenCalledWith(42, expect.any(Object))
  })

  it('bids against the listing id when the live row carries only a bare `id`', async () => {
    // Mirrors the live /otc/options payload: the addressable surrogate arrives
    // as a bare `id`, with no `local_id` and no `offer_id`. Reading either of
    // those sent /otc/options/NaN/bid, which the gateway rejected with
    // {"error":{"code":"validation_error","message":"invalid id"}}.
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          id: 42,
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
          active_chains_count: 0,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.placeBid).mockResolvedValue({
      negotiation: {
        id: 1,
        status: 'open',
        bidder: { owner_type: 'client', owner_id: 5 },
        quantity: '10',
        strike_price: '175.50',
        premium: '700.00',
        settlement_date: '2026-12-31T00:00:00Z',
        created_at: '2026-05-10T14:00:00Z',
        updated_at: '2026-05-10T14:00:00Z',
      },
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(await screen.findByRole('button', { name: /^bid$/i }))
    await userEvent.click(await screen.findByRole('button', { name: /submit bid/i }))

    await waitFor(() => expect(otcOptionsApi.placeBid).toHaveBeenCalled())
    expect(otcOptionsApi.placeBid).toHaveBeenCalledWith(42, expect.any(Object))
  })

  it('shows Counter on a non-owner row where the caller already has a chain', async () => {
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
          // numeric my_negotiation_id ⇒ a bid chain is already underway.
          my_negotiation_id: 88,
          my_negotiation_status: 'open',
        },
      ],
      total_count: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    expect(await screen.findByText('AAPL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /counter/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^bid$/i })).not.toBeInTheDocument()
  })

  it("shows the caller's latest bid strike/premium (not the listing terms) on an offer they've bid on", async () => {
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
          // Listing terms posted by the owner.
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          // The caller already has a bid chain on this offer.
          my_negotiation_id: 88,
          my_negotiation_status: 'open',
        },
      ],
      total_count: 1,
    })
    // The caller's chain #88 has been countered up to a newer strike/premium.
    // The marketplace row should reflect THIS (their latest bid), not the
    // listing's original 175.50 / 700.00 terms.
    jest.mocked(otcOptionsApi.listMyNegotiations).mockResolvedValue({
      negotiations: [
        {
          id: 88,
          parent_offer_id: 42,
          offer_id: 42,
          status: 'countered',
          bidder: { owner_type: 'client', owner_id: 5 },
          quantity: '10',
          strike_price: '180.25',
          premium: '725.00',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-11T14:00:00Z',
          updated_at: '2026-05-12T14:00:00Z',
        },
      ],
      total: 1,
    })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    expect(await screen.findByText('AAPL')).toBeInTheDocument()
    // Latest bid (chain snapshot) is shown.
    expect(screen.getByText(/180\.25/)).toBeInTheDocument()
    expect(screen.getByText(/725\.00/)).toBeInTheDocument()
    // The listing's original terms are NOT shown for this row.
    expect(screen.queryByText(/175\.50/)).not.toBeInTheDocument()
    expect(screen.queryByText(/700\.00/)).not.toBeInTheDocument()
  })

  it('places the bid against the listing surrogate id (local_id), not offer_id', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          // The surrogate `id` differs from the native `offer_id` — the bid must
          // route on `id`.
          id: 17,
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
        },
      ],
      total_count: 1,
    })
    jest
      .mocked(otcOptionsApi.placeBid)
      .mockResolvedValue({ negotiation: { id: 1 } } as unknown as Awaited<
        ReturnType<typeof otcOptionsApi.placeBid>
      >)

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await screen.findByText('AAPL')
    await userEvent.click(screen.getByRole('button', { name: /^bid$/i }))
    // The dialog prefills every field from the offer, so it is valid on open.
    await userEvent.click(await screen.findByRole('button', { name: /submit bid/i }))

    await waitFor(() =>
      expect(otcOptionsApi.placeBid).toHaveBeenCalledWith(
        17,
        expect.objectContaining({ quantity: '10', strike_price: '175.50', premium: '700.00' })
      )
    )
  })

  it('opens the owner activity panel addressing the listing by local_id (not offer_id)', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          id: 17,
          offer_id: '42',
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          me_owner: true,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    const cell = await screen.findByText('AAPL')
    await userEvent.click(cell.closest('tr')!)

    await screen.findByRole('button', { name: /cancel listing/i })
    // Both the per-listing detail routes are keyed on local_id (17), not offer_id (42).
    await waitFor(() => expect(otcOptionsApi.getOfferTimeline).toHaveBeenCalledWith(17))
    expect(otcOptionsApi.listNegotiations).toHaveBeenCalledWith(17)
  })

  it("shows Activity (not Place bid) on the user's own listing", async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '42',
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          // Backend marks the caller as the listing's poster.
          me_owner: true,
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
          id: 42,
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
          // Backend resolves the employee-acting-as-bank caller as the poster.
          me_owner: true,
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
    // because the row's me_owner flag is true, routes us into the OWNER panel
    // (OfferActivityPanel), not BidderActivityPanel.
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

  it('lets the owner change the listing amount via PUT from the activity panel', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          id: 42,
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          me_owner: true,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })
    jest.mocked(otcOptionsApi.updateListing).mockResolvedValue(undefined)

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(await screen.findByRole('button', { name: /activity/i }))
    await userEvent.click(await screen.findByRole('button', { name: /^edit$/i }))
    const input = screen.getByLabelText(/^amount$/i)
    await userEvent.clear(input)
    await userEvent.type(input, '25')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() =>
      expect(otcOptionsApi.updateListing).toHaveBeenCalledWith(42, { quantity: '25' })
    )
  })

  it('disables Save in the amount editor for a non-positive or non-numeric amount', async () => {
    jest.mocked(otcOptionsApi.listAll).mockResolvedValue({
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          id: 42,
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          me_owner: true,
        },
      ],
      total_count: 1,
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })
    jest.mocked(otcOptionsApi.updateListing).mockResolvedValue(undefined)

    renderWithProviders(<OtcOptionsView />, { preloadedState: preloadedAuth })

    await userEvent.click(await screen.findByRole('button', { name: /activity/i }))
    await userEvent.click(await screen.findByRole('button', { name: /^edit$/i }))
    const input = screen.getByLabelText(/^amount$/i)

    await userEvent.clear(input)
    await userEvent.type(input, 'abc')
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()

    await userEvent.clear(input)
    await userEvent.type(input, '0')
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(otcOptionsApi.updateListing).not.toHaveBeenCalled()
  })
})
