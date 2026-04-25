import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioSummaryCard } from '@/components/portfolio/PortfolioSummaryCard'
import { createMockPortfolioSummary } from '@/__tests__/fixtures/portfolio-fixtures'

describe('PortfolioSummaryCard', () => {
  it('renders summary values', () => {
    renderWithProviders(<PortfolioSummaryCard summary={createMockPortfolioSummary()} />)
    expect(screen.getByText('1500.00')).toBeInTheDocument()
    expect(screen.getByText('3000.00 RSD')).toBeInTheDocument()
    expect(screen.getByText('300.00 RSD')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders labels', () => {
    renderWithProviders(<PortfolioSummaryCard summary={createMockPortfolioSummary()} />)
    expect(screen.getByText('Unrealized P&L')).toBeInTheDocument()
    expect(screen.getByText('Realized (Lifetime)')).toBeInTheDocument()
    expect(screen.getByText('Tax Paid (Year)')).toBeInTheDocument()
    expect(screen.getByText('Open Positions')).toBeInTheDocument()
  })
})
