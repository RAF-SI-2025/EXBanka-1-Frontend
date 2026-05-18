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

  it('renders an Exercise button for ACTIVE contracts', () => {
    const active = createMockOptionContract({ id: 1, status: 'ACTIVE' })
    renderTable(<OtcContractsTable contracts={[active]} onExercise={onExercise} />)
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
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
    const active = createMockOptionContract({ id: 42, status: 'ACTIVE' })
    renderTable(<OtcContractsTable contracts={[active]} onExercise={onExercise} />)
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(onExercise).toHaveBeenCalledWith(active)
  })

  it('renders an Exercise button for every ACTIVE contract regardless of buyer identity', () => {
    const a = createMockOptionContract({
      id: 100,
      status: 'ACTIVE',
      buyer: { owner_type: 'client', owner_id: 7 },
    })
    const b = createMockOptionContract({
      id: 200,
      status: 'ACTIVE',
      buyer: { owner_type: 'client', owner_id: 999 },
    })
    renderTable(<OtcContractsTable contracts={[a, b]} onExercise={onExercise} />)
    const buttons = screen.getAllByRole('button', { name: /exercise/i })
    expect(buttons).toHaveLength(2)
  })
})
