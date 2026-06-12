import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BidderActivityPanel } from '@/views/otcOptions/components/BidderActivityPanel'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type { OtcOptionRow, OtcNegotiation, OtcParty } from '@/views/otcOptions/types'
import type { Account } from '@/types/account'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    listMyNegotiations: jest.fn(),
    listNegotiations: jest.fn(),
    getOfferTimeline: jest.fn(),
    listNegotiationRevisions: jest.fn(),
    counter: jest.fn(),
    withdrawNegotiation: jest.fn(),
    acceptNegotiation: jest.fn(),
  },
}))

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 7,
    account_number: 'ACC-7',
    account_name: 'Main',
    currency_code: 'USD',
    account_kind: 'current',
    account_type: 'standard',
    account_category: 'personal',
    balance: 0,
    available_balance: 0,
    reserved_balance: 0,
    status: 'ACTIVE',
    owner_id: 1,
    ...overrides,
  }
}

function makeOffer(overrides: Partial<OtcOptionRow> = {}): OtcOptionRow {
  return {
    offer_id: '42',
    kind: 'remote',
    bank_code: '333',
    ticker: 'AAPL',
    amount: '5',
    strike_price: '175.00',
    strike_currency: 'USD',
    premium: '10.00',
    premium_currency: 'USD',
    settlement_date: '2027-01-01',
    direction: 'sell_initiated',
    status: 'active',
    active_chains_count: 1,
    seller_id: 'seller-1',
    my_negotiation_id: null,
    ...overrides,
  } as OtcOptionRow
}

function makeNegotiation(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 99,
    parent_offer_id: 999,
    offer_id: undefined,
    status: 'open',
    quantity: '5',
    strike_price: '175.00',
    premium: '10.00',
    settlement_date: '2027-01-01',
    kind: 'remote',
    last_action_by: { owner_type: 'client', owner_id: 1 },
    ...overrides,
  } as OtcNegotiation
}

const currentBidder: OtcParty = { owner_type: 'client', owner_id: 1 }
const onBack = jest.fn()
const onPlaceBid = jest.fn()

const defaultProps = {
  offer: makeOffer(),
  accounts: [],
  currentBidder,
  onBack,
  onPlaceBid,
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })
  jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({ offer: {}, timeline: [] })
  jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({ revisions: [] })
})

describe('BidderActivityPanel — chain lookup', () => {
  it('shows "no bid" state when my_negotiation_id is absent and no parent_offer_id match', async () => {
    jest.mocked(otcOptionsApi.listMyNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} />)
    expect(await screen.findByText(/haven't placed a bid/i)).toBeInTheDocument()
  })

  it('finds the chain via my_negotiation_id even when parent_offer_id differs', async () => {
    // my_negotiation_id = 99, but parent_offer_id is 999 (remote bank id, NOT local surrogate 42)
    const offer = makeOffer({ my_negotiation_id: 99 })
    const negotiation = makeNegotiation({ id: 99, parent_offer_id: 999 })

    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    await waitFor(() => expect(screen.queryByText(/haven't placed a bid/i)).not.toBeInTheDocument())
    expect(screen.getByText(/your bidding history/i)).toBeInTheDocument()
  })
})

describe('BidderActivityPanel — isTerminal for remote chains', () => {
  it('shows Counter and Withdraw buttons when chain status is "ongoing" (remote counter received)', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    // ongoing = remote-bank peer vocabulary for "owner countered, bidder's turn"
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      last_action_by: { owner_type: 'client', owner_id: 2 },
    })

    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    expect(await screen.findByRole('button', { name: /counter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument()
  })

  it("accepts the seller's terms with the chosen acceptor account", async () => {
    const offer = makeOffer({ my_negotiation_id: 99 }) // resolveListingId → 42
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      last_action_by: { owner_type: 'client', owner_id: 2 },
    })
    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({
      revisions: [
        {
          id: 11,
          negotiation_id: 99,
          revision_number: 2,
          action: 'COUNTER',
          quantity: '5',
          strike_price: '175.00',
          premium: '10.00',
          settlement_date: '2027-01-01T00:00:00Z',
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
          created_at: '2026-06-01T12:00:00Z',
        },
      ],
    })
    jest.mocked(otcOptionsApi.acceptNegotiation).mockResolvedValue({ contract: { id: 1 } } as never)

    renderWithProviders(
      <BidderActivityPanel {...defaultProps} offer={offer} accounts={[account({ id: 7 })]} />
    )

    fireEvent.click(await screen.findByRole('button', { name: /^accept$/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm accept/i }))

    await waitFor(() =>
      expect(otcOptionsApi.acceptNegotiation).toHaveBeenCalledWith(42, 99, {
        acceptor_account_id: 7,
      })
    )
  })

  it('hides Counter and Withdraw buttons when chain status is "accepted" (terminal)', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    const negotiation = makeNegotiation({ id: 99, status: 'accepted' })

    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    await screen.findByText(/your bidding history/i)
    expect(screen.queryByRole('button', { name: /counter/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /withdraw/i })).not.toBeInTheDocument()
  })
})
