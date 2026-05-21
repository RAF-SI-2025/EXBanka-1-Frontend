import { render, screen } from '@testing-library/react'
import { PasswordRequirements } from '../components/PasswordRequirements'

describe('PasswordRequirements', () => {
  it('shows all requirements as red when value is empty', () => {
    render(<PasswordRequirements value="" />)
    const items = screen.getAllByRole('listitem')
    items.forEach((item) => {
      expect(item).toHaveClass('text-destructive')
    })
  })

  it('shows max-32 rule as red when value exceeds 32 characters', () => {
    render(<PasswordRequirements value={'A'.repeat(31) + '12bb'} />)
    expect(screen.getByText(/at most 32 characters/i)).toHaveClass('text-destructive')
  })

  it('shows only satisfied rules as green on partial input', () => {
    // 'aaAA' has uppercase and lowercase but no digits and only 4 chars
    render(<PasswordRequirements value="aaAA" />)
    expect(screen.getByText(/uppercase/i)).toHaveClass('text-green-600')
    expect(screen.getByText(/lowercase/i)).toHaveClass('text-green-600')
    expect(screen.getByText(/2 numbers/i)).toHaveClass('text-destructive')
    expect(screen.getByText(/at least 8 characters/i)).toHaveClass('text-destructive')
  })
})
