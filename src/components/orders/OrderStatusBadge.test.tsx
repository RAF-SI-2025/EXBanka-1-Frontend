import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it('renders pending status', () => {
    render(<OrderStatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders approved status', () => {
    render(<OrderStatusBadge status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders declined status', () => {
    render(<OrderStatusBadge status="declined" />)
    expect(screen.getByText('Declined')).toBeInTheDocument()
  })

  it('applies subtle warning tone for pending', () => {
    const { container } = render(<OrderStatusBadge status="pending" />)
    expect(container.firstChild).toHaveClass('bg-amber-500/10')
  })

  it('applies subtle success tone for approved', () => {
    const { container } = render(<OrderStatusBadge status="approved" />)
    expect(container.firstChild).toHaveClass('bg-emerald-500/10')
  })

  it('applies subtle danger tone for declined', () => {
    const { container } = render(<OrderStatusBadge status="declined" />)
    expect(container.firstChild).toHaveClass('bg-rose-500/10')
  })
})
