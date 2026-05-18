import { render, screen, fireEvent } from '@testing-library/react'
import { ExerciseContractDialog } from '@/views/otcContracts/components/ExerciseContractDialog'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'

describe('ExerciseContractDialog', () => {
  const contract = createMockOptionContract()
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    contract,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('does not render buyer/seller account selectors (accounts are read from contract)', () => {
    render(<ExerciseContractDialog {...baseProps} />)
    expect(screen.queryByText(/buyer account/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/seller account/i)).not.toBeInTheDocument()
  })

  it('submits an empty body when Exercise is clicked', () => {
    const onSubmit = jest.fn()
    render(<ExerciseContractDialog {...baseProps} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
    expect(onSubmit).toHaveBeenCalledWith({})
  })

  it('shows the total cost', () => {
    render(<ExerciseContractDialog {...baseProps} />)
    expect(screen.getByText(/500000\.00/)).toBeInTheDocument()
  })
})
