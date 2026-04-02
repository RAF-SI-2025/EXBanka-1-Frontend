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

  it('applies yellow variant for pending', () => {
    const { container } = render(<OrderStatusBadge status="pending" />)
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })

  it('applies green variant for approved', () => {
    const { container } = render(<OrderStatusBadge status="approved" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies red variant for declined', () => {
    const { container } = render(<OrderStatusBadge status="declined" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})
