import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardVisual } from './CardVisual'
import { createMockCard, createMockMastercardCard } from '@/__tests__/fixtures/card-fixtures'

describe('CardVisual', () => {
  it('renders masked card number in spaced format', () => {
    renderWithProviders(<CardVisual card={createMockCard()} />)
    expect(screen.getByText('4111 **** **** 1111')).toBeInTheDocument()
  })

  it('renders owner name', () => {
    renderWithProviders(<CardVisual card={createMockCard()} />)
    expect(screen.getByText('Petar Petrovic')).toBeInTheDocument()
  })

  it('renders expiry date', () => {
    renderWithProviders(
      <CardVisual card={createMockCard({ expires_at: '2030-01-01T00:00:00Z' })} />
    )
    expect(screen.getByText('01/30')).toBeInTheDocument()
  })

  it('renders card name', () => {
    renderWithProviders(<CardVisual card={createMockCard()} />)
    expect(screen.getByText('Visa Debit')).toBeInTheDocument()
  })

  it('renders brand logo', () => {
    renderWithProviders(<CardVisual card={createMockCard()} />)
    expect(screen.getByTitle('Visa')).toBeInTheDocument()
  })

  it('renders Mastercard variant', () => {
    renderWithProviders(<CardVisual card={createMockMastercardCard()} />)
    expect(screen.getByTitle('Mastercard')).toBeInTheDocument()
  })

  it('shows BLOCKED overlay', () => {
    renderWithProviders(<CardVisual card={createMockCard({ status: 'BLOCKED' })} />)
    expect(screen.getByText('BLOCKED')).toBeInTheDocument()
  })

  it('shows DEACTIVATED overlay', () => {
    renderWithProviders(<CardVisual card={createMockCard({ status: 'DEACTIVATED' })} />)
    expect(screen.getByText('DEACTIVATED')).toBeInTheDocument()
  })
})
