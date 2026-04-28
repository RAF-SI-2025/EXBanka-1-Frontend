import { render, screen, act } from '@testing-library/react'
import { PiggyProvider } from './PiggyContext'
import { usePiggy } from '@/hooks/usePiggy'

function TriggerButton({ mode }: { mode: 'break' | 'fill' }) {
  const { triggerPiggy } = usePiggy()
  return (
    <button type="button" onClick={() => triggerPiggy(mode)}>
      go
    </button>
  )
}

describe('PiggyProvider', () => {
  it('does not render the animation initially', () => {
    render(
      <PiggyProvider>
        <TriggerButton mode="fill" />
      </PiggyProvider>
    )
    expect(screen.queryByTestId('piggy-animation')).not.toBeInTheDocument()
  })

  it('renders the animation after triggerPiggy is called', () => {
    render(
      <PiggyProvider>
        <TriggerButton mode="break" />
      </PiggyProvider>
    )
    act(() => {
      screen.getByRole('button', { name: 'go' }).click()
    })
    const animation = screen.getByTestId('piggy-animation')
    expect(animation).toHaveAttribute('data-mode', 'break')
  })
})

describe('usePiggy outside provider', () => {
  it('returns a no-op so consumers can be rendered in tests safely', () => {
    function Consumer() {
      const { triggerPiggy } = usePiggy()
      return (
        <button type="button" onClick={() => triggerPiggy('fill')}>
          go
        </button>
      )
    }
    render(<Consumer />)
    // Clicking outside the provider must not throw.
    expect(() => screen.getByRole('button', { name: 'go' }).click()).not.toThrow()
  })
})
