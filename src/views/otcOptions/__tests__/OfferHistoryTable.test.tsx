import { render, screen } from '@testing-library/react'
import { OfferHistoryTable } from '@/views/otcOptions/components/OfferHistoryTable'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'

function rev(overrides: Partial<RevisionWithChain> = {}): RevisionWithChain {
  return {
    id: 1,
    negotiation_id: 5,
    revision_number: 1,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '7.50',
    settlement_date: '2026-07-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: 42,
    created_at: '2026-06-01T12:00:00Z',
    mine: false,
    is_latest: false,
    chain_id: 5,
    chain_bidder: { owner_type: 'client', owner_id: 42 },
    chain_bidder_name: undefined,
    ...overrides,
  }
}

describe('OfferHistoryTable', () => {
  it('shows an empty state when there are no revisions', () => {
    render(<OfferHistoryTable revisions={[]} />)
    expect(screen.getByText(/no bid activity yet/i)).toBeInTheDocument()
  })

  it('renders one row per revision', () => {
    render(
      <OfferHistoryTable
        revisions={[
          rev({ id: 1, action: 'BID' }),
          rev({ id: 2, action: 'COUNTER' }),
          rev({ id: 3, action: 'ACCEPT' }),
        ]}
      />
    )
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(3)
    expect(screen.getByText('BID')).toBeInTheDocument()
    expect(screen.getByText('COUNTER')).toBeInTheDocument()
    expect(screen.getByText('ACCEPT')).toBeInTheDocument()
  })

  it('shows the chain bidder name when present, falling back to owner identity', () => {
    render(
      <OfferHistoryTable
        revisions={[
          rev({
            id: 1,
            chain_id: 5,
            chain_bidder_name: 'Acme Corp',
            chain_bidder: { owner_type: 'client', owner_id: 42 },
          }),
          rev({
            id: 2,
            chain_id: 9,
            chain_bidder_name: undefined,
            chain_bidder: { owner_type: 'employee', owner_id: 99 },
          }),
        ]}
      />
    )
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('employee-99')).toBeInTheDocument()
  })

  it('labels actions taken by the current principal as "You"', () => {
    render(
      <OfferHistoryTable
        revisions={[
          rev({
            id: 1,
            chain_id: 1,
            chain_bidder: { owner_type: 'client', owner_id: 1 },
            chain_bidder_name: 'Bidder A',
            action_by_principal_type: 'client',
            action_by_principal_id: 7,
          }),
          rev({
            id: 2,
            chain_id: 2,
            chain_bidder: { owner_type: 'client', owner_id: 2 },
            chain_bidder_name: 'Bidder B',
            action_by_principal_type: 'client',
            action_by_principal_id: 42,
          }),
        ]}
        currentPrincipal={{ owner_type: 'client', owner_id: 7 }}
      />
    )
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('client-42')).toBeInTheDocument()
  })
})
