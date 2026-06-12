import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OtcContractsTable } from '@/views/otcContracts/components/OtcContractsTable'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'

function renderTable(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('OtcContractsTable', () => {
  const onExercise = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders the empty state when there are no contracts', () => {
    renderTable(<OtcContractsTable contracts={[]} onExercise={onExercise} />)
    expect(screen.getByText(/no contracts in this view/i)).toBeInTheDocument()
  })

  it('renders the strike ticker, currency and premium', () => {
    const c = createMockOptionContract({
      id: 1,
      ticker: 'ACME',
      strike_currency: 'USD',
      premium: '700.00',
    })
    renderTable(<OtcContractsTable contracts={[c]} onExercise={onExercise} />)
    expect(screen.getByRole('columnheader', { name: /currency/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'ACME' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'USD' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '700.00' })).toBeInTheDocument()
  })

  it('shows "-" for premium when it is missing from the body', () => {
    const c = createMockOptionContract({ id: 1, premium: '', strike_currency: 'USD' })
    renderTable(<OtcContractsTable contracts={[c]} onExercise={onExercise} />)
    expect(screen.getByRole('cell', { name: '-' })).toBeInTheDocument()
  })

  it('shows "-" for currency when strike_currency is missing', () => {
    const c = createMockOptionContract({ id: 1, premium: '700.00', strike_currency: undefined })
    renderTable(<OtcContractsTable contracts={[c]} onExercise={onExercise} />)
    expect(screen.getByRole('cell', { name: '-' })).toBeInTheDocument()
  })

  it('renders an Exercise button for an ACTIVE contract the caller holds (me_owner)', () => {
    const active = createMockOptionContract({ id: 1, status: 'ACTIVE', me_owner: true })
    renderTable(<OtcContractsTable contracts={[active]} onExercise={onExercise} />)
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
  })

  it('does NOT render an Exercise button when the caller is the seller (me_owner false)', () => {
    const asSeller = createMockOptionContract({ id: 9, status: 'ACTIVE', me_owner: false })
    renderTable(<OtcContractsTable contracts={[asSeller]} onExercise={onExercise} />)
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
  })

  it('does not render an Exercise button for EXERCISED contracts', () => {
    const exercised = createMockOptionContract({ id: 2, status: 'EXERCISED' })
    renderTable(<OtcContractsTable contracts={[exercised]} onExercise={onExercise} />)
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
  })

  it('does not render an Exercise button for EXPIRED contracts', () => {
    const expired = createMockOptionContract({ id: 3, status: 'EXPIRED' })
    renderTable(<OtcContractsTable contracts={[expired]} onExercise={onExercise} />)
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
  })

  it('calls onExercise with the contract when the button is clicked', () => {
    const active = createMockOptionContract({ id: 42, status: 'ACTIVE', me_owner: true })
    renderTable(<OtcContractsTable contracts={[active]} onExercise={onExercise} />)
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(onExercise).toHaveBeenCalledWith(active)
  })

  it('renders Exercise only for the ACTIVE contracts the caller holds', () => {
    // Caller is the buyer/holder on #100 (me_owner) but the seller on #200.
    const held = createMockOptionContract({ id: 100, status: 'ACTIVE', me_owner: true })
    const written = createMockOptionContract({ id: 200, status: 'ACTIVE', me_owner: false })
    renderTable(<OtcContractsTable contracts={[held, written]} onExercise={onExercise} />)
    const buttons = screen.getAllByRole('button', { name: /exercise/i })
    expect(buttons).toHaveLength(1)
  })
})
