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
    expect(screen.getByLabelText(/dnevni limit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mesečni limit/i)).toBeInTheDocument()
  })

  it('shows verification step after submitting new limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    const dailyInput = screen.getByLabelText(/dnevni limit/i)
    await user.clear(dailyInput)
    await user.type(dailyInput, '300000')
    await user.click(screen.getByRole('button', { name: /sačuvaj/i }))
    expect(screen.getByText(/verifikacioni kod/i)).toBeInTheDocument()
  })

  it('calls onSubmit with new limits after verification', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    const dailyInput = screen.getByLabelText(/dnevni limit/i)
    const monthlyInput = screen.getByLabelText(/mesečni limit/i)
    await user.clear(dailyInput)
    await user.type(dailyInput, '300000')
    await user.clear(monthlyInput)
    await user.type(monthlyInput, '1200000')
    await user.click(screen.getByRole('button', { name: /sačuvaj/i }))
    await user.type(screen.getByLabelText(/verifikacioni kod/i), '123456')
    await user.click(screen.getByRole('button', { name: /potvrdi/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      daily_limit: 300000,
      monthly_limit: 1200000,
    })
  })
})
