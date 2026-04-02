import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'

describe('ChangeLimitsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    currentDailyLimit: 250000,
    currentMonthlyLimit: 1000000,
    currency: 'RSD',
    onSubmit: jest.fn(),
    loading: false,
  }

  it('renders limit inputs', () => {
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    expect(screen.getByLabelText(/daily limit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monthly limit/i)).toBeInTheDocument()
  })

  it('shows verification step after submitting new limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    const dailyInput = screen.getByLabelText(/daily limit/i)
    await user.clear(dailyInput)
    await user.type(dailyInput, '300000')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
  })

  it('calls onSubmit with new limits after verification', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    const dailyInput = screen.getByLabelText(/daily limit/i)
    const monthlyInput = screen.getByLabelText(/monthly limit/i)
    await user.clear(dailyInput)
    await user.type(dailyInput, '300000')
    await user.clear(monthlyInput)
    await user.type(monthlyInput, '1200000')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await user.type(screen.getByLabelText(/verification code/i), '123456')
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      daily_limit: 300000,
      monthly_limit: 1200000,
    })
  })
})
