import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OtcContractsTable } from '@/components/otc/OtcContractsTable'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'

function renderTable(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('OtcContractsTable', () => {
  const onExercise = jest.fn()
  const isBuyerTrue = () => true
  const isBuyerFalse = () => false

  beforeEach(() => jest.clearAllMocks())

  it('renders the empty state when there are no contracts', () => {
    renderTable(<OtcContractsTable contracts={[]} onExercise={onExercise} isBuyer={isBuyerTrue} />)
    expect(screen.getByText(/no contracts in this view/i)).toBeInTheDocument()
  })

  it('renders an Exercise button for ACTIVE contracts when the caller is the buyer', () => {
    const active = createMockOptionContract({ id: 1, status: 'ACTIVE' })
    renderTable(
      <OtcContractsTable contracts={[active]} onExercise={onExercise} isBuyer={isBuyerTrue} />
    )
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
  })

  it('does not render an Exercise button for EXERCISED contracts', () => {
    const exercised = createMockOptionContract({ id: 2, status: 'EXERCISED' })
    renderTable(
      <OtcContractsTable contracts={[exercised]} onExercise={onExercise} isBuyer={isBuyerTrue} />
    )
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
  })

  it('does not render an Exercise button for EXPIRED contracts', () => {
    const expired = createMockOptionContract({ id: 3, status: 'EXPIRED' })
    renderTable(
      <OtcContractsTable contracts={[expired]} onExercise={onExercise} isBuyer={isBuyerTrue} />
    )
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
  })

  it('calls onExercise with the contract when the button is clicked', () => {
    const active = createMockOptionContract({ id: 42, status: 'ACTIVE' })
    renderTable(
      <OtcContractsTable contracts={[active]} onExercise={onExercise} isBuyer={isBuyerTrue} />
    )
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(onExercise).toHaveBeenCalledWith(active)
  })

  it('renders the em-dash (no Exercise button) for an ACTIVE row when isBuyer returns false', () => {
    const active = createMockOptionContract({ id: 7, status: 'ACTIVE' })
    renderTable(
      <OtcContractsTable contracts={[active]} onExercise={onExercise} isBuyer={isBuyerFalse} />
    )
    expect(screen.queryByRole('button', { name: /exercise/i })).not.toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('only renders Exercise for the row where isBuyer === true && status === ACTIVE', () => {
    const buyerRow = createMockOptionContract({ id: 100, status: 'ACTIVE' })
    const nonBuyerRow = createMockOptionContract({ id: 200, status: 'ACTIVE' })
    const isBuyer = (c: { id: number }) => c.id === 100
    renderTable(
      <OtcContractsTable
        contracts={[buyerRow, nonBuyerRow]}
        onExercise={onExercise}
        isBuyer={isBuyer}
      />
    )
    const buttons = screen.getAllByRole('button', { name: /exercise/i })
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0])
    expect(onExercise).toHaveBeenCalledWith(buyerRow)
  })
})
