import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PriceAlertDialog } from '@/views/priceAlerts/components/PriceAlertDialog'
import { createMockPriceAlert } from '@/__tests__/fixtures/priceAlert-fixtures'

jest.mock('@/components/ui/select', () => jest.requireActual('@/__tests__/mocks/select-mock'))

const listing = { listing_id: 42, ticker: 'AAPL', name: 'Apple Inc.' }

function setup(overrides: Partial<React.ComponentProps<typeof PriceAlertDialog>> = {}) {
  const defaults = {
    open: true,
    onOpenChange: jest.fn(),
    listing,
    onSubmit: jest.fn(),
    loading: false,
  }
  const props = { ...defaults, ...overrides }
  renderWithProviders(<PriceAlertDialog {...props} />)
  return props
}

describe('PriceAlertDialog (create mode)', () => {
  it('renders the listing ticker and name in the title', () => {
    setup()
    expect(screen.getByText(/AAPL/)).toBeInTheDocument()
    expect(screen.getByText(/Apple Inc\./)).toBeInTheDocument()
  })

  it('uses the "Create price alert" title when no initialAlert is given', () => {
    setup()
    expect(screen.getByText(/create price alert/i)).toBeInTheDocument()
  })

  it('disables submit when threshold is empty', () => {
    setup()
    expect(screen.getByRole('button', { name: /create alert/i })).toBeDisabled()
  })

  it('disables submit when threshold is not a positive decimal', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: 'abc' } })
    expect(screen.getByRole('button', { name: /create alert/i })).toBeDisabled()
  })

  it('submits with condition + threshold + is_recurring=false (single-shot) by default', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: '199.99' } })
    fireEvent.click(screen.getByRole('button', { name: /create alert/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      listing_id: 42,
      condition: 'gte',
      threshold: '199.99',
      is_recurring: false,
    })
  })

  it('converts cooldown hours to seconds (default 1 hour → 3600s) when recurring', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: '50' } })
    fireEvent.click(screen.getByLabelText(/recurring/i))
    fireEvent.click(screen.getByRole('button', { name: /create alert/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_id: 42,
        threshold: '50',
        is_recurring: true,
        cooldown_seconds: 3600,
      })
    )
  })

  it('converts a user-entered 6 hours into 21600 seconds', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: '50' } })
    fireEvent.click(screen.getByLabelText(/recurring/i))
    fireEvent.change(screen.getByLabelText(/cooldown.*hours/i), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('button', { name: /create alert/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ cooldown_seconds: 21600 }))
  })

  it('calls onOpenChange(false) when Cancel is clicked', () => {
    const onOpenChange = jest.fn()
    setup({ onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('PriceAlertDialog (edit mode)', () => {
  it('renders the "Edit price alert" title when initialAlert is provided', () => {
    setup({
      initialAlert: createMockPriceAlert({ listing_id: 42, condition: 'lte', threshold: '90.50' }),
    })
    expect(screen.getByText(/edit price alert/i)).toBeInTheDocument()
    expect(screen.queryByText(/^create price alert/i)).not.toBeInTheDocument()
  })

  it('prefills threshold from the existing alert', () => {
    setup({
      initialAlert: createMockPriceAlert({ threshold: '123.45' }),
    })
    expect(screen.getByLabelText(/threshold/i)).toHaveValue('123.45')
  })

  it('shows "Save changes" as the submit button instead of "Create alert"', () => {
    setup({ initialAlert: createMockPriceAlert() })
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /create alert/i })).not.toBeInTheDocument()
  })

  it('prefills recurring + cooldown hours from cooldown_seconds (21600s → 6h)', () => {
    setup({
      initialAlert: createMockPriceAlert({ is_recurring: true, cooldown_seconds: 21600 }),
    })
    expect(screen.getByLabelText(/cooldown.*hours/i)).toHaveValue(6)
  })

  it('emits the edited payload when Save changes is clicked', () => {
    const onSubmit = jest.fn()
    setup({
      onSubmit,
      initialAlert: createMockPriceAlert({
        listing_id: 42,
        condition: 'gte',
        threshold: '100',
        is_recurring: false,
      }),
    })
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: '250' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ listing_id: 42, threshold: '250', is_recurring: false })
    )
  })
})
