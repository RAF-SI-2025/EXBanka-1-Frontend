import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OptionsChain } from '@/components/securities/OptionsChain'
import { createMockOption } from '@/__tests__/fixtures/security-fixtures'

const mockCalls = [
  createMockOption({
    id: 1,
    option_type: 'call',
    strike_price: '170.00',
    price: '12.00',
    bid: '11.80',
    ask: '12.20',
    volume: 500,
    open_interest: 1000,
    premium: '12.00',
  }),
  createMockOption({
    id: 2,
    option_type: 'call',
    strike_price: '175.00',
    price: '8.00',
    bid: '7.80',
    ask: '8.20',
    volume: 400,
    open_interest: 800,
    premium: '8.00',
  }),
  createMockOption({
    id: 3,
    option_type: 'call',
    strike_price: '180.00',
    price: '4.00',
    bid: '3.80',
    ask: '4.20',
    volume: 300,
    open_interest: 600,
    premium: '4.00',
  }),
  createMockOption({
    id: 4,
    option_type: 'call',
    strike_price: '185.00',
    price: '1.50',
    bid: '1.30',
    ask: '1.70',
    volume: 200,
    open_interest: 400,
    premium: '1.50',
  }),
]

const mockPuts = [
  createMockOption({
    id: 5,
    option_type: 'put',
    strike_price: '170.00',
    price: '1.00',
    bid: '0.80',
    ask: '1.20',
    volume: 200,
    open_interest: 500,
    premium: '1.00',
  }),
  createMockOption({
    id: 6,
    option_type: 'put',
    strike_price: '175.00',
    price: '3.00',
    bid: '2.80',
    ask: '3.20',
    volume: 300,
    open_interest: 700,
    premium: '3.00',
  }),
  createMockOption({
    id: 7,
    option_type: 'put',
    strike_price: '180.00',
    price: '6.00',
    bid: '5.80',
    ask: '6.20',
    volume: 400,
    open_interest: 900,
    premium: '6.00',
  }),
  createMockOption({
    id: 8,
    option_type: 'put',
    strike_price: '185.00',
    price: '10.00',
    bid: '9.80',
    ask: '10.20',
    volume: 500,
    open_interest: 1100,
    premium: '10.00',
  }),
]

describe('OptionsChain', () => {
  const defaultProps = {
    calls: mockCalls,
    puts: mockPuts,
    sharedPrice: 178,
    settlementDates: ['2026-04-17', '2026-05-15'],
    selectedDate: '2026-04-17',
    onDateChange: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders CALLS and PUTS headers', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    expect(screen.getByText('CALLS')).toBeInTheDocument()
    expect(screen.getByText('PUTS')).toBeInTheDocument()
    expect(screen.getByText('Strike')).toBeInTheDocument()
  })

  it('renders strike prices', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    expect(screen.getByText('$170.00')).toBeInTheDocument()
    expect(screen.getByText('$175.00')).toBeInTheDocument()
    expect(screen.getByText('$180.00')).toBeInTheDocument()
    expect(screen.getByText('$185.00')).toBeInTheDocument()
  })

  it('displays market price', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    expect(screen.getByText('Market Price: $178.00')).toBeInTheDocument()
  })

  it('renders settlement date selector', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    expect(screen.getByText('Settlement Date')).toBeInTheDocument()
    expect(screen.getByText('2026-04-17')).toBeInTheDocument()
  })

  it('calls onDateChange when settlement date changes', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    const select = screen.getByDisplayValue('2026-04-17')
    fireEvent.change(select, { target: { value: '2026-05-15' } })
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2026-05-15')
  })

  it('renders strikes count input', () => {
    renderWithProviders(<OptionsChain {...defaultProps} />)
    expect(screen.getByLabelText('Strikes shown')).toBeInTheDocument()
  })
})
