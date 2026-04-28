import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OptionsTable } from '@/components/securities/OptionsTable'
import { createMockOption } from '@/__tests__/fixtures/security-fixtures'

const mockOnRowClick = jest.fn()
const mockOnBuy = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('OptionsTable', () => {
  const callOption = createMockOption({ id: 1, option_type: 'call', ticker: 'AAPL260417C00180000' })
  const putOption = createMockOption({ id: 2, option_type: 'put', ticker: 'AAPL260417P00175000' })

  it('renders option tickers', () => {
    renderWithProviders(
      <OptionsTable
        options={[callOption, putOption]}
        onRowClick={mockOnRowClick}
        onBuy={mockOnBuy}
      />
    )
    expect(screen.getByText('AAPL260417C00180000')).toBeInTheDocument()
    expect(screen.getByText('AAPL260417P00175000')).toBeInTheDocument()
  })

  it('renders Call and Put badges', () => {
    renderWithProviders(
      <OptionsTable
        options={[callOption, putOption]}
        onRowClick={mockOnRowClick}
        onBuy={mockOnBuy}
      />
    )
    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('Put')).toBeInTheDocument()
  })

  it('renders strike price and premium', () => {
    renderWithProviders(
      <OptionsTable options={[callOption]} onRowClick={mockOnRowClick} onBuy={mockOnBuy} />
    )
    expect(screen.getByText('180.00')).toBeInTheDocument()
    expect(screen.getByText('5.50')).toBeInTheDocument()
  })

  it('calls onBuy when Buy button clicked', () => {
    renderWithProviders(
      <OptionsTable options={[callOption]} onRowClick={mockOnRowClick} onBuy={mockOnBuy} />
    )
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(mockOnBuy).toHaveBeenCalledWith(callOption)
    expect(mockOnRowClick).not.toHaveBeenCalled()
  })

  it('calls onRowClick when row clicked', () => {
    renderWithProviders(
      <OptionsTable options={[callOption]} onRowClick={mockOnRowClick} onBuy={mockOnBuy} />
    )
    fireEvent.click(screen.getByText('AAPL260417C00180000'))
    expect(mockOnRowClick).toHaveBeenCalledWith(1)
  })

  it('renders empty table when no options', () => {
    renderWithProviders(<OptionsTable options={[]} onRowClick={mockOnRowClick} onBuy={mockOnBuy} />)
    expect(screen.queryByRole('button', { name: /buy/i })).not.toBeInTheDocument()
  })
})
