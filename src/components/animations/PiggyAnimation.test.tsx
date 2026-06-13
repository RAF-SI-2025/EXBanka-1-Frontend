import { render, screen } from '@testing-library/react'
import { PiggyAnimation } from './PiggyAnimation'

describe('PiggyAnimation', () => {
  it('renders in fill mode', () => {
    render(<PiggyAnimation mode="fill" />)
    const el = screen.getByTestId('piggy-animation')
    expect(el).toHaveAttribute('data-mode', 'fill')
  })

  it('renders in break mode', () => {
    render(<PiggyAnimation mode="break" />)
    const el = screen.getByTestId('piggy-animation')
    expect(el).toHaveAttribute('data-mode', 'break')
  })

  it('is aria-hidden so it does not interfere with screen readers', () => {
    render(<PiggyAnimation mode="fill" />)
    expect(screen.getByTestId('piggy-animation')).toHaveAttribute('aria-hidden')
  })
})
