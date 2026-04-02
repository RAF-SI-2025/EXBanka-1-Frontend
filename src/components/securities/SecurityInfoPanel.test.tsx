import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'

describe('SecurityInfoPanel', () => {
  const entries = [
    { label: 'Ticker', value: 'AAPL' },
    { label: 'Name', value: 'Apple Inc.' },
    { label: 'Price', value: '178.50' },
    { label: 'Volume', value: '52,000,000' },
  ]

  it('renders all label-value pairs', () => {
    renderWithProviders(<SecurityInfoPanel entries={entries} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('178.50')).toBeInTheDocument()
    expect(screen.getByText('Volume')).toBeInTheDocument()
    expect(screen.getByText('52,000,000')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    renderWithProviders(<SecurityInfoPanel entries={entries} title="Stock Details" />)
    expect(screen.getByText('Stock Details')).toBeInTheDocument()
  })

  it('renders empty when no entries', () => {
    const { container } = renderWithProviders(<SecurityInfoPanel entries={[]} />)
    expect(container.querySelectorAll('dt').length).toBe(0)
  })
})
