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
    viewer_role: '',
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

describe('OfferActivityPanel — turn gating', () => {
  it('shows Accept/Counter/Reject when the bidder moved last (owner’s turn)', async () => {
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ last_action_by: bidder })],
      total: 1,
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByRole('button', { name: /^accept$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^counter$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument()
    expect(screen.queryByText(/waiting on bidder/i)).not.toBeInTheDocument()
  })

  it('hides Accept/Counter/Reject when the owner moved last (bidder’s turn)', async () => {
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ last_action_by: owner })],
      total: 1,
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    // Owner just countered → it's the bidder's turn; the owner can't act.
    expect(await screen.findByText(/waiting on bidder/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^counter$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument()
    // Unilateral controls remain available regardless of turn.
    expect(screen.getByRole('button', { name: /see history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel listing/i })).toBeInTheDocument()
  })
})
