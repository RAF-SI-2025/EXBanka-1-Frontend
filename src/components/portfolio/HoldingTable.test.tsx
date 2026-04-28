import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HoldingTable } from '@/components/portfolio/HoldingTable'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

const mockHoldings = [
  createMockHolding({
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    public_quantity: 0,
    security_type: 'stock',
  }),
  createMockHolding({
    id: 2,
    ticker: 'MSFT',
    name: 'Microsoft',
    quantity: 5,
    public_quantity: 3,
    security_type: 'option',
  }),
]

describe('HoldingTable', () => {
  const defaultProps = {
    holdings: mockHoldings,
    onRowClick: jest.fn(),
    onSell: jest.fn(),
    onMakePublic: jest.fn(),
    onExercise: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Public Qty')).toBeInTheDocument()
  })

  it('renders holding rows', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('renders a Sell button for every row', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    const sellButtons = screen.getAllByRole('button', { name: /sell/i })
    expect(sellButtons).toHaveLength(2)
  })

  it('calls onSell with holding id when Sell clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    const sellButtons = screen.getAllByRole('button', { name: /sell/i })
    fireEvent.click(sellButtons[0])
    expect(defaultProps.onSell).toHaveBeenCalledWith(1)
  })

  it('shows Make Public button for non-option holdings', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /make public/i })).toBeInTheDocument()
  })

  it('calls onMakePublic when button clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /make public/i }))
    expect(defaultProps.onMakePublic).toHaveBeenCalledWith(1)
  })

  it('shows Exercise button for option holdings', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
  })

  it('calls onRowClick with holding id when row clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByText('AAPL'))
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1)
  })
})
