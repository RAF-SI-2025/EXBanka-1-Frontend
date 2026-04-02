import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditLimitDialog } from '@/components/actuaries/EditLimitDialog'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

describe('EditLimitDialog', () => {
  const actuary = createMockActuary({
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    limit: '100000.00',
  })

  const defaultProps = {
    open: true,
    actuary,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with agent name', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    expect(screen.getByText(/edit limit.*agent smith/i)).toBeInTheDocument()
  })

  it('renders input pre-filled with current limit', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    const input = screen.getByDisplayValue('100000.00')
    expect(input).toBeInTheDocument()
  })

  it('calls onConfirm with new limit value when Save is clicked', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    const input = screen.getByDisplayValue('100000.00')
    fireEvent.change(input, { target: { value: '200000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith('200000.00')
  })

  it('calls onClose when Cancel is clicked', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('does not render content when open is false', () => {
    renderWithProviders(<EditLimitDialog {...defaultProps} open={false} />)
    expect(screen.queryByText(/edit limit/i)).not.toBeInTheDocument()
  })
})
