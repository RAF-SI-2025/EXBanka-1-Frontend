import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardGrid } from '@/components/cards/CardGrid'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'

describe('CardGrid', () => {
  it('renders all cards', () => {
    const cards = [
      createMockCard({ id: 1, card_number: '4111111111111111' }),
      createMockCard({ id: 2, card_number: '5222222222222222' }),
    ]
    renderWithProviders(<CardGrid cards={cards} onBlock={jest.fn()} />)
    expect(screen.getByText('4111********1111')).toBeInTheDocument()
    expect(screen.getByText('5222********2222')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(<CardGrid cards={[]} onBlock={jest.fn()} />)
    expect(screen.getByText(/nemate kartice/i)).toBeInTheDocument()
  })
})
