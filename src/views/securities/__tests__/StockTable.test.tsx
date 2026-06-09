import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockTable } from '@/views/securities/components/StockTable'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

describe('StockTable', () => {
  const defaultProps = {
    onRowClick: jest.fn(),
    onBuy: jest.fn(),
  }

  it('renders a Currency column header', () => {
    renderWithProviders(
      <StockTable stocks={[createMockStock({ currency: 'USD' })]} {...defaultProps} />
    )
    expect(screen.getByRole('columnheader', { name: 'Currency' })).toBeInTheDocument()
  })

  it('shows each stock currency from the API response', () => {
    renderWithProviders(
      <StockTable
        stocks={[
          createMockStock({ id: 1, ticker: 'AAPL', currency: 'USD' }),
          createMockStock({ id: 2, ticker: 'BMW', currency: 'EUR' }),
        ]}
        {...defaultProps}
      />
    )
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })
})
