import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PlaceBidDialog } from '@/views/otcOptions/components/PlaceBidDialog'
import type { OtcOptionRow } from '@/views/otcOptions/types'
import type { Account } from '@/types/account'

const accounts: Account[] = [
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
]

function makeOffer(overrides: Partial<OtcOptionRow> = {}): OtcOptionRow {
  return {
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
    ...overrides,
  }
}

function renderDialog(offer: OtcOptionRow, onSubmit = jest.fn()) {
  return {
    onSubmit,
    ...renderWithProviders(
      <PlaceBidDialog
        open
        onOpenChange={() => {}}
        offer={offer}
        accounts={accounts}
        submitting={false}
        onSubmit={onSubmit}
      />
    ),
  }
}

async function typePremium(value: string) {
  const premiumInput = screen.getByLabelText(/premium/i)
  await userEvent.clear(premiumInput)
  await userEvent.type(premiumInput, value)
}

describe('PlaceBidDialog premium floor', () => {
  it('disables submit and shows best-bid error when premium below best_bid', async () => {
    renderDialog(makeOffer({ best_bid: '850' }))

    await typePremium('800')

    expect(screen.getByRole('button', { name: /submit bid/i })).toBeDisabled()
    const err = screen.getByText(/must be at least 850/i)
    expect(err).toBeInTheDocument()
    expect(err.textContent?.toLowerCase()).toContain('best bid')
  })

  it('enables submit when premium equals best_bid (boundary inclusive)', async () => {
    renderDialog(makeOffer({ best_bid: '850' }))

    await typePremium('850')

    expect(screen.getByRole('button', { name: /submit bid/i })).not.toBeDisabled()
  })

  it('enables submit and hides destructive helper when premium above best_bid', async () => {
    renderDialog(makeOffer({ best_bid: '850' }))

    await typePremium('900')

    expect(screen.getByRole('button', { name: /submit bid/i })).not.toBeDisabled()
    expect(screen.queryByText(/must be at least/i)).not.toBeInTheDocument()
  })

  it('falls back to strike floor when best_bid is absent and premium is below strike', async () => {
    renderDialog(makeOffer({ best_bid: undefined, strike_price: '175.50' }))

    await typePremium('100')

    expect(screen.getByRole('button', { name: /submit bid/i })).toBeDisabled()
    const err = screen.getByText(/must be at least 175\.50/i)
    expect(err).toBeInTheDocument()
    expect(err.textContent?.toLowerCase()).toContain('strike')
  })

  it('enables submit when premium meets strike floor (best_bid absent)', async () => {
    renderDialog(makeOffer({ best_bid: undefined, strike_price: '175.50' }))

    await typePremium('200')

    expect(screen.getByRole('button', { name: /submit bid/i })).not.toBeDisabled()
  })

  it('renders the floor source as helper text on initial mount', () => {
    renderDialog(makeOffer({ best_bid: '850' }))

    // Helper text describes either the best-bid floor or the seller-strike floor.
    const helper = screen.getByText(/minimum/i)
    expect(helper).toBeInTheDocument()
    const txt = helper.textContent?.toLowerCase() ?? ''
    expect(txt.includes('best bid') || txt.includes('seller strike')).toBe(true)
  })
})

describe('PlaceBidDialog — countering (existing chain) has no premium floor', () => {
  it('allows a below-floor premium and shows no floor helper when the user already has a chain', async () => {
    // my_negotiation_id present ⇒ this submit is a Counter, not a first bid.
    renderDialog(makeOffer({ best_bid: '850', my_negotiation_id: 77 }))

    await typePremium('100') // far below the 850 best-bid "floor"

    expect(screen.getByRole('button', { name: /submit bid/i })).not.toBeDisabled()
    expect(screen.queryByText(/minimum/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/must be at least/i)).not.toBeInTheDocument()
  })
})
