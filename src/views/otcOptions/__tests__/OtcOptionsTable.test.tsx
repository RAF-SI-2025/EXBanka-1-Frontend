import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcOptionsTable } from '@/views/otcOptions/components/OtcOptionsTable'
import type { OtcOptionRow } from '@/views/otcOptions/types'

const NO_TERMS_LABEL = "This option doesn't have a starting position"

function makeRow(overrides: Partial<OtcOptionRow> = {}): OtcOptionRow {
  return {
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
    ...overrides,
  }
}

function renderTable(rows: OtcOptionRow[]) {
  return renderWithProviders(
    <OtcOptionsTable rows={rows} onBid={() => {}} onActivity={() => {}} onRowOpen={() => {}} />
  )
}

describe('OtcOptionsTable — preset terms placeholder', () => {
  it('replaces the strike + premium columns with a placeholder when has_preset_terms is false', () => {
    renderTable([makeRow({ has_preset_terms: false })])

    expect(screen.getByText(NO_TERMS_LABEL)).toBeInTheDocument()
    // The numeric strike/premium values must NOT render for a no-terms listing.
    expect(screen.queryByText(/175\.50/)).not.toBeInTheDocument()
    expect(screen.queryByText(/700\.00/)).not.toBeInTheDocument()
  })

  it('shows the strike and premium values when has_preset_terms is true', () => {
    renderTable([makeRow({ has_preset_terms: true })])

    expect(screen.getByText(/175\.50/)).toBeInTheDocument()
    expect(screen.getByText(/700\.00/)).toBeInTheDocument()
    expect(screen.queryByText(NO_TERMS_LABEL)).not.toBeInTheDocument()
  })

  it('shows the strike and premium values when has_preset_terms is omitted', () => {
    renderTable([makeRow()])

    expect(screen.getByText(/175\.50/)).toBeInTheDocument()
    expect(screen.getByText(/700\.00/)).toBeInTheDocument()
    expect(screen.queryByText(NO_TERMS_LABEL)).not.toBeInTheDocument()
  })
})
