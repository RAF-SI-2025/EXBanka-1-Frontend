import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestDenyDialog } from '@/components/cards/CardRequestDenyDialog'

describe('CardRequestDenyDialog', () => {
  const onClose = jest.fn()
  const onConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and textarea when open', () => {
    renderWithProviders(<CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />)
    expect(screen.getByText(/deny card request/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/reason/i)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    renderWithProviders(
      <CardRequestDenyDialog open={false} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.queryByText(/deny card request/i)).not.toBeInTheDocument()
  })

  it('calls onConfirm with typed reason when Confirm Deny clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />)
    await user.type(screen.getByPlaceholderText(/reason/i), 'Insufficient history')
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(onConfirm).toHaveBeenCalledWith('Insufficient history')
  })

  it('calls onConfirm with empty string when textarea is blank', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })

  it('calls onClose when Cancel clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the textarea when closed and reopened', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithProviders(
      <CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />
    )
    await user.type(screen.getByPlaceholderText(/reason/i), 'Some reason')
    expect(screen.getByPlaceholderText(/reason/i)).toHaveValue('Some reason')

    rerender(<CardRequestDenyDialog open={false} onClose={onClose} onConfirm={onConfirm} />)

    rerender(<CardRequestDenyDialog open onClose={onClose} onConfirm={onConfirm} />)
    expect(screen.getByPlaceholderText(/reason/i)).toHaveValue('')
  })
})
