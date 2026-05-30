import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CancelRecurringOrderDialog } from '@/views/portfolio/components/CancelRecurringOrderDialog'

describe('CancelRecurringOrderDialog', () => {
  it('shows the irreversible-cancel warning when open', () => {
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={() => {}} onConfirm={() => {}} />
    )
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = jest.fn()
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={() => {}} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes without confirming when "Keep order" is clicked', () => {
    const onConfirm = jest.fn()
    const onOpenChange = jest.fn()
    renderWithProviders(
      <CancelRecurringOrderDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: /keep order/i }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
