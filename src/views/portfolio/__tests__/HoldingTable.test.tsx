import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { HoldingTable } from '@/views/portfolio/components/HoldingTable'
import { createMockSecurityPosition } from '@/__tests__/fixtures/portfolio-fixtures'

const mockPositions = [
  createMockSecurityPosition({
    holding_id: 1,
    symbol: 'AAPL',
    quantity: 10,
    asset_type: 'stock',
  }),
  createMockSecurityPosition({
    holding_id: 2,
    symbol: 'MSFT',
    quantity: 5,
    asset_type: 'option',
  }),
]

describe('HoldingTable', () => {
  const defaultProps = {
    positions: mockPositions,
    onRowClick: jest.fn(),
    onSell: jest.fn(),
    onMakePublic: jest.fn(),
    onExercise: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Avg Cost')).toBeInTheDocument()
    expect(screen.getByText('Current Price')).toBeInTheDocument()
    expect(screen.getByText('Current Value')).toBeInTheDocument()
  })

  it('renders position rows', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('renders a Sell button for every row', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    const sellButtons = screen.getAllByRole('button', { name: /sell/i })
    expect(sellButtons).toHaveLength(2)
  })

  it('calls onSell with the holding_id when Sell clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    const sellButtons = screen.getAllByRole('button', { name: /sell/i })
    fireEvent.click(sellButtons[0])
    expect(defaultProps.onSell).toHaveBeenCalledWith(1)
  })

  it('shows Make Public button for non-option positions', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /make public/i })).toBeInTheDocument()
  })

  it('calls onMakePublic with the holding_id when Make Public clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /make public/i }))
    expect(defaultProps.onMakePublic).toHaveBeenCalledWith(1)
  })

  it('shows Exercise button for option positions', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
  })

  it('calls onExercise with the holding_id when Exercise clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(defaultProps.onExercise).toHaveBeenCalledWith(2)
  })

  it('calls onRowClick with the holding_id when row clicked', () => {
    renderWithProviders(<HoldingTable {...defaultProps} />)
    fireEvent.click(screen.getByText('AAPL'))
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1)
  })
})
