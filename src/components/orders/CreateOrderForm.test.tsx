import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'
import type { Account } from '@/types/account'

describe('CreateOrderForm', () => {
  const defaultProps = {
    defaultDirection: 'buy' as const,
    onSubmit: jest.fn(),
    submitting: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('does not render a direction dropdown', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.queryByLabelText('Direction')).not.toBeInTheDocument()
  })

  it('always renders the account selector', () => {
    renderWithProviders(<CreateOrderForm {...defaultProps} />)
    expect(screen.getByLabelText('Account')).toBeInTheDocument()
  })

  it('renders account selector with provided accounts', () => {
    const accounts = [
      {
        id: 1,
        account_number: 'ACC-001',
        account_name: 'My Account',
        currency_code: 'RSD',
      } as Account,
    ]
    renderWithProviders(<CreateOrderForm {...defaultProps} accounts={accounts} />)
    expect(screen.getByText(/ACC-001/)).toBeInTheDocument()
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

  describe('forex mode (depositAccounts prop provided)', () => {
    const depositAccounts = [
      {
        id: 99,
        account_number: 'BANK-001',
        account_name: 'Bank Account',
        currency_code: 'RSD',
      } as Account,
    ]

    it('renders Deposit Account selector after Account selector', () => {
      renderWithProviders(<CreateOrderForm {...defaultProps} depositAccounts={depositAccounts} />)
      expect(screen.getByLabelText('Deposit Account')).toBeInTheDocument()
    })

    it('does not render Deposit Account selector when depositAccounts is not provided', () => {
      renderWithProviders(<CreateOrderForm {...defaultProps} />)
      expect(screen.queryByLabelText('Deposit Account')).not.toBeInTheDocument()
    })

    it('includes base_account_id and security_type forex in payload when deposit account selected', () => {
      renderWithProviders(<CreateOrderForm {...defaultProps} depositAccounts={depositAccounts} />)
      fireEvent.change(screen.getByLabelText('Deposit Account'), { target: { value: '99' } })
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })
      fireEvent.click(screen.getByRole('button', { name: /place order/i }))
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ base_account_id: 99, security_type: 'forex' })
      )
    })
  })
})
