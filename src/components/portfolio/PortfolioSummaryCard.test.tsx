import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioSummaryCard } from '@/components/portfolio/PortfolioSummaryCard'
import { createMockPortfolioSummary } from '@/__tests__/fixtures/portfolio-fixtures'

describe('PortfolioSummaryCard', () => {
  it('renders summary values', () => {
    renderWithProviders(<PortfolioSummaryCard summary={createMockPortfolioSummary()} />)
    expect(screen.getByText('25000.00')).toBeInTheDocument()
    expect(screen.getByText('22000.00')).toBeInTheDocument()
    expect(screen.getByText('3000.00')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders labels', () => {
    renderWithProviders(<PortfolioSummaryCard summary={createMockPortfolioSummary()} />)
    expect(screen.getByText('Total Value')).toBeInTheDocument()
    expect(screen.getByText('Total Cost')).toBeInTheDocument()
    expect(screen.getByText('Profit/Loss')).toBeInTheDocument()
    expect(screen.getByText('Holdings')).toBeInTheDocument()
  })
})
