import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardBrandLogo } from './CardBrandLogo'

describe('CardBrandLogo', () => {
  it('renders Visa logo', () => {
    renderWithProviders(<CardBrandLogo brand="VISA" />)
    expect(screen.getByTitle('Visa')).toBeInTheDocument()
  })

  it('renders Mastercard logo', () => {
    renderWithProviders(<CardBrandLogo brand="MASTERCARD" />)
    expect(screen.getByTitle('Mastercard')).toBeInTheDocument()
  })

  it('renders DinaCard logo', () => {
    renderWithProviders(<CardBrandLogo brand="DINACARD" />)
    expect(screen.getByTitle('DinaCard')).toBeInTheDocument()
  })

  it('renders Amex logo', () => {
    renderWithProviders(<CardBrandLogo brand="AMEX" />)
    expect(screen.getByTitle('American Express')).toBeInTheDocument()
  })

  it('renders fallback for unknown brand', () => {
    renderWithProviders(<CardBrandLogo brand={'UNKNOWN' as never} />)
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
  })
})
