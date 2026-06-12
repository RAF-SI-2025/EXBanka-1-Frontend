import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OfferActivityPanel } from '@/views/otcOptions/components/OfferActivityPanel'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type { OtcNegotiation, OtcOptionRow, OtcParty } from '@/views/otcOptions/types'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    listNegotiations: jest.fn(),
    getOfferTimeline: jest.fn(),
    listNegotiationRevisions: jest.fn(),
    acceptNegotiation: jest.fn(),
    rejectNegotiation: jest.fn(),
    counter: jest.fn(),
    cancelListing: jest.fn(),
    updateListing: jest.fn(),
  },
}))

const bidder: OtcParty = { owner_type: 'client', owner_id: 5 }
const owner: OtcParty = { owner_type: 'bank', owner_id: null }

function makeOffer(overrides: Partial<OtcOptionRow> = {}): OtcOptionRow {
  return {
    id: 42,
    kind: 'local',
    bank_code: '111',
    ticker: 'AAPL',
    amount: '10',
    strike_price: '150.00',
    strike_currency: 'USD',
    premium: '5.00',
    premium_currency: 'USD',
    settlement_date: '2027-01-01',
    direction: 'sell_initiated',
    status: 'open',
    seller_id: 'bank',
    ...overrides,
  } as OtcOptionRow
}

function makeNeg(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 7,
    parent_offer_id: 42,
    status: 'countered',
    bidder,
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    viewer_role: 'poster',
    last_action_mine: false,
    awaiting_viewer: false,
    can_accept: false,
    can_counter: false,
    can_reject: false,
    can_withdraw: false,
    ...overrides,
  }
}

const defaultProps = {
  offer: makeOffer(),
  accounts: [],
  currentPrincipal: owner,
  onBack: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({ offer: {}, timeline: [] })
  jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({ revisions: [] })
})

describe('OfferActivityPanel — 403 non-poster error', () => {
  it('shows the "not the poster" message when listNegotiations rejects with 403', async () => {
    const forbidden = Object.assign(new Error('Forbidden'), {
      isAxiosError: true,
      response: {
        status: 403,
        data: {
          error: {
            code: 'forbidden',
            message: "only the listing's poster may view all chains on this offer",
          },
        },
      },
    })
    jest.mocked(otcOptionsApi.listNegotiations).mockRejectedValue(forbidden)

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(
      await screen.findByText(
        /you're not the poster of this listing — it may belong to another account/i
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/could not load chains/i)).not.toBeInTheDocument()
  })
})

describe('OfferActivityPanel — turn from revisions', () => {
  it('shows Accept/Counter/Reject when the bidder authored the latest revision', async () => {
    // Bidder (client/5) made the latest BID — it is the owner's turn.
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ id: 7 })],
      total: 1,
    })
    jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({
      offer: {},
      timeline: [
        {
          negotiation_id: 7,
          revision_number: 1,
          action: 'BID',
          action_by_principal_type: 'client',
          action_by_principal_id: 5,
          bidder_owner_type: 'client',
          bidder_owner_id: 5,
          quantity: '10',
          strike_price: '150.00',
          premium: '5.00',
          settlement_date: '2027-01-01',
          created_at: '2026-06-01T00:00:00Z',
          mine: false,
          is_latest: true,
        },
      ],
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByRole('button', { name: /^accept$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^counter$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument()
    expect(screen.queryByText(/waiting on bidder/i)).not.toBeInTheDocument()
  })

  it('shows "Waiting on bidder" when the owner authored the latest revision', async () => {
    // BID by bidder (rev 1), then owner COUNTERed (rev 2) → bidder's turn now.
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ id: 7 })],
      total: 1,
    })
    jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({
      offer: {},
      timeline: [
        {
          negotiation_id: 7,
          revision_number: 1,
          action: 'BID',
          action_by_principal_type: 'client',
          action_by_principal_id: 5,
          bidder_owner_type: 'client',
          bidder_owner_id: 5,
          quantity: '10',
          strike_price: '150.00',
          premium: '5.00',
          settlement_date: '2027-01-01',
          created_at: '2026-06-01T00:00:00Z',
          mine: false,
          is_latest: false,
        },
        {
          negotiation_id: 7,
          revision_number: 2,
          action: 'COUNTER',
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
          bidder_owner_type: 'client',
          bidder_owner_id: 5,
          quantity: '10',
          strike_price: '148.00',
          premium: '4.50',
          settlement_date: '2027-01-01',
          created_at: '2026-06-02T00:00:00Z',
          mine: true,
          is_latest: true,
        },
      ],
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByText(/waiting on bidder/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^counter$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument()
    // Unilateral controls always present
    expect(screen.getByRole('button', { name: /see history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel listing/i })).toBeInTheDocument()
  })

  it('shows no action buttons and no "waiting" text while the timeline is empty (turn unknown)', async () => {
    // Empty timeline → turn unknown; neither owner-turn buttons nor waiting hint.
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ id: 7 })],
      total: 1,
    })
    jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({ offer: {}, timeline: [] })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    // Wait for negotiations to render (the "See history" button appears per row)
    expect(await screen.findByRole('button', { name: /see history/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^counter$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/waiting on bidder/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel listing/i })).toBeInTheDocument()
  })
})
