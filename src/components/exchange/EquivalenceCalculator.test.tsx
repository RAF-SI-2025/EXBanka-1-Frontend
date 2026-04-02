import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EquivalenceCalculator } from '@/components/exchange/EquivalenceCalculator'

describe('EquivalenceCalculator', () => {
  const onConvert = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders amount input, currency selectors, and calculate button', () => {
    renderWithProviders(
      <EquivalenceCalculator onConvert={onConvert} result={null} loading={false} />
    )
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/from currency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to currency/i)).toBeInTheDocument()
    expect(screen.getByText(/calculate/i)).toBeInTheDocument()
  })

  it('displays conversion result', () => {
    const result = {
      from_amount: 100,
      from_currency: 'EUR',
      to_amount: 11750,
      to_currency: 'RSD',
      rate: 117.5,
    }
    renderWithProviders(
      <EquivalenceCalculator onConvert={onConvert} result={result} loading={false} />
    )
    expect(screen.getByText(/117.50/)).toBeInTheDocument()
  })
})
