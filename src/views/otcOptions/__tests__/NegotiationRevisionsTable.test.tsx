import { render, screen } from '@testing-library/react'
import { NegotiationRevisionsTable } from '@/views/otcOptions/components/NegotiationRevisionsTable'
import type { OtcNegotiationRevision } from '@/views/otcOptions/types'

function rev(overrides: Partial<OtcNegotiationRevision> = {}): OtcNegotiationRevision {
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
    ...overrides,
  }
}

describe('NegotiationRevisionsTable', () => {
  it('shows an empty state when no revisions are provided', () => {
    render(<NegotiationRevisionsTable revisions={[]} />)
    expect(screen.getByText(/no revisions yet/i)).toBeInTheDocument()
  })

  it('renders one row per revision in the order received', () => {
    render(
      <NegotiationRevisionsTable
        revisions={[
          rev({ id: 1, revision_number: 1, action: 'BID', quantity: '10' }),
          rev({ id: 2, revision_number: 2, action: 'COUNTER', quantity: '8' }),
          rev({ id: 3, revision_number: 3, action: 'ACCEPT', quantity: '8' }),
        ]}
      />
    )

    const rowText = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent ?? '')
    expect(rowText[0]).toContain('BID')
    expect(rowText[1]).toContain('COUNTER')
    expect(rowText[2]).toContain('ACCEPT')
  })

  it('labels the current principal\'s actions as "You"', () => {
    render(
      <NegotiationRevisionsTable
        revisions={[
          rev({ id: 1, action_by_principal_type: 'client', action_by_principal_id: 42 }),
          rev({ id: 2, action_by_principal_type: 'employee', action_by_principal_id: 99 }),
        ]}
        currentPrincipal={{ owner_type: 'client', owner_id: 42 }}
      />
    )

    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('employee-99')).toBeInTheDocument()
  })

  it('falls back to raw identity when no current principal is provided', () => {
    render(
      <NegotiationRevisionsTable
        revisions={[rev({ action_by_principal_type: 'client', action_by_principal_id: 42 })]}
      />
    )
    expect(screen.getByText('client-42')).toBeInTheDocument()
    expect(screen.queryByText('You')).not.toBeInTheDocument()
  })

  it('shows the trade role (not "<role>-undefined") when the actor has no numeric id', () => {
    render(
      <NegotiationRevisionsTable
        revisions={[rev({ action_by_principal_type: 'buyer', action_by_principal_id: null })]}
      />
    )
    expect(screen.getByText('Buyer')).toBeInTheDocument()
    expect(screen.queryByText(/buyer-/i)).not.toBeInTheDocument()
  })
})
