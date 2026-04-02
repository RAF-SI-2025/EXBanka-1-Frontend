import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HoldingTable } from '@/components/portfolio/HoldingTable'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

const mockHoldings = [
  createMockHolding({
    id: 1,
    ticker: 'AAPL',
    security_name: 'Apple Inc.',
    quantity: 10,
    profit_loss: '85.00',
    profit_loss_percent: '5.00',
    is_public: false,
  }),
  createMockHolding({
    id: 2,
    ticker: 'MSFT',
    security_name: 'Microsoft',
    quantity: 5,
    profit_loss: '-20.00',
    profit_loss_percent: '-2.00',
    is_public: true,
    public_quantity: 3,
  }),
]

describe('HoldingTable', () => {
  const defaultProps = {
    holdings: mockHoldings,
    onMakePublic: jest.fn(),
    onExercise: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('P&L')).toBeInTheDocument()
  })

  it('renders holding rows', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('shows Make Public button for non-public holdings', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /make public/i })).toBeInTheDocument()
  })

  it('calls onMakePublic when button clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /make public/i }))
    expect(defaultProps.onMakePublic).toHaveBeenCalledWith(1)
  })
})
