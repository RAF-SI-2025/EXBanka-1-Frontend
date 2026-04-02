import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioPage } from '@/pages/PortfolioPage'
import * as portfolioApi from '@/lib/api/portfolio'
import {
  createMockHolding,
  createMockPortfolioSummary,
} from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({
    holdings: [createMockHolding({ id: 1, ticker: 'AAPL' })],
    total_count: 1,
  })
  jest.mocked(portfolioApi.getPortfolioSummary).mockResolvedValue(createMockPortfolioSummary())
  jest.mocked(portfolioApi.makeHoldingPublic).mockResolvedValue(createMockHolding())
  jest.mocked(portfolioApi.exerciseOption).mockResolvedValue(createMockHolding())
})

describe('PortfolioPage', () => {
  it('renders page title', () => {
    renderWithProviders(<PortfolioPage />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('displays holdings on load', async () => {
    renderWithProviders(<PortfolioPage />)
    await screen.findByText('AAPL')
  })

  it('displays summary card', async () => {
    renderWithProviders(<PortfolioPage />)
    await screen.findByText('25000.00')
    expect(screen.getByText('Total Value')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(portfolioApi.getPortfolio).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<PortfolioPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({ holdings: [], total_count: 0 })
    renderWithProviders(<PortfolioPage />)
    await screen.findByText('No holdings found.')
  })
})
