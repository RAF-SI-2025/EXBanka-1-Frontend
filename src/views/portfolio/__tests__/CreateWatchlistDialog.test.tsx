import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateWatchlistDialog } from '@/views/portfolio/components/CreateWatchlistDialog'

function setup(overrides: Partial<React.ComponentProps<typeof CreateWatchlistDialog>> = {}) {
  const props = {
    open: true,
    onOpenChange: jest.fn(),
    onSubmit: jest.fn(),
    loading: false,
    ...overrides,
  }
  renderWithProviders(<CreateWatchlistDialog {...props} />)
  return props
}

describe('CreateWatchlistDialog', () => {
  it('renders the new-list title', () => {
    setup()
    expect(screen.getByText(/new watchlist/i)).toBeInTheDocument()
  })

  it('disables submit when the name is empty', () => {
    setup()
    expect(screen.getByRole('button', { name: /create list/i })).toBeDisabled()
  })

  it('disables submit when the name exceeds 64 characters', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/list name/i), { target: { value: 'x'.repeat(65) } })
    expect(screen.getByRole('button', { name: /create list/i })).toBeDisabled()
  })

  it('submits the trimmed name on confirm', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.change(screen.getByLabelText(/list name/i), { target: { value: '  tech  ' } })
    fireEvent.click(screen.getByRole('button', { name: /create list/i }))
    expect(onSubmit).toHaveBeenCalledWith('tech')
  })

  it('calls onOpenChange(false) when Cancel is clicked', () => {
    const onOpenChange = jest.fn()
    setup({ onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
