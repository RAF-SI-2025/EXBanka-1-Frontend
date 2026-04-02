import { render, screen, fireEvent } from '@testing-library/react'
import { MakePublicDialog } from '@/components/portfolio/MakePublicDialog'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

describe('MakePublicDialog', () => {
  const holding = createMockHolding({ ticker: 'AAPL', quantity: 10, public_quantity: 3 })
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    holding,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with ticker', () => {
    render(<MakePublicDialog {...defaultProps} />)
    expect(screen.getByText(/make shares public.*aapl/i)).toBeInTheDocument()
  })

  it('shows current public_quantity and total quantity', () => {
    render(<MakePublicDialog {...defaultProps} />)
    expect(screen.getByText(/currently public/i)).toBeInTheDocument()
    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('calls onSubmit with entered quantity', () => {
    render(<MakePublicDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity to make public/i), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByRole('button', { name: /make public/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(5)
  })

  it('disables submit when quantity is 0', () => {
    render(<MakePublicDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity to make public/i), {
      target: { value: '0' },
    })
    expect(screen.getByRole('button', { name: /make public/i })).toBeDisabled()
  })

  it('disables submit when quantity exceeds holding quantity', () => {
    render(<MakePublicDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity to make public/i), {
      target: { value: '11' },
    })
    expect(screen.getByRole('button', { name: /make public/i })).toBeDisabled()
  })

  it('shows loading state on submit button', () => {
    render(<MakePublicDialog {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: /making public/i })).toBeDisabled()
  })
})
