import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'

describe('CreateOrderForm', () => {
  const defaultProps = {
    defaultDirection: 'buy' as const,
    onSubmit: jest.fn(),
    submitting: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders direction select', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.getByLabelText('Direction')).toBeInTheDocument()
  })

  it('renders order type select', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.getByLabelText('Order Type')).toBeInTheDocument()
  })

  it('renders quantity input', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form data', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    const quantityInput = screen.getByLabelText('Quantity')
    fireEvent.change(quantityInput, { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 10, direction: 'buy', order_type: 'market' })
    )
  })

  it('shows limit field when order type is limit', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    const typeSelect = screen.getByLabelText('Order Type')
    fireEvent.change(typeSelect, { target: { value: 'limit' } })
    expect(screen.getByLabelText('Limit Value')).toBeInTheDocument()
  })

  it('shows stop field when order type is stop', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    const typeSelect = screen.getByLabelText('Order Type')
    fireEvent.change(typeSelect, { target: { value: 'stop' } })
    expect(screen.getByLabelText('Stop Value')).toBeInTheDocument()
  })

  it('disables submit when submitting', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} submitting />)
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled()
  })
})
