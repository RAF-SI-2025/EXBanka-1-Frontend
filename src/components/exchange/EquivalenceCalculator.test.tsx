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
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/iz valute/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/u valutu/i)).toBeInTheDocument()
    expect(screen.getByText(/izračunaj/i)).toBeInTheDocument()
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
