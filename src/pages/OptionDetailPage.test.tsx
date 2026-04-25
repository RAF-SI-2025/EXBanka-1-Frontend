import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OptionDetailPage } from '@/pages/OptionDetailPage'
import * as securitiesApi from '@/lib/api/securities'
import { createMockOption } from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/securities')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(securitiesApi.getOption).mockResolvedValue(createMockOption())
})

describe('OptionDetailPage', () => {
  it('renders option ticker as page title', async () => {
    renderWithProviders(<OptionDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AAPL260417C00180000' })).toBeInTheDocument()
    })
  })

  it('shows option type and strike price', async () => {
    renderWithProviders(<OptionDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AAPL260417C00180000' })).toBeInTheDocument()
    })
    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('180.00')).toBeInTheDocument()
  })

  it('Buy button navigates to order form with optionId', async () => {
    renderWithProviders(<OptionDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AAPL260417C00180000' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/securities/order/new?optionId=1&direction=buy&securityType=option'
    )
  })

  it('renders Exercise button', async () => {
    renderWithProviders(<OptionDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AAPL260417C00180000' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /exercise/i })).toBeInTheDocument()
  })

  it('calls exerciseOption and shows result when Exercise clicked', async () => {
    jest.mocked(securitiesApi.exerciseOption).mockResolvedValue({
      id: 1,
      option_ticker: 'AAPL260417C00180000',
      exercised_quantity: 5,
      shares_affected: 500,
      profit: '150.00',
    })
    renderWithProviders(<OptionDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'AAPL260417C00180000' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    await waitFor(() => {
      expect(securitiesApi.exerciseOption).toHaveBeenCalledWith(1)
    })
    await screen.findByText(/exercised 5 contracts/i)
  })

  it('shows loading spinner while fetching', () => {
    jest.mocked(securitiesApi.getOption).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<OptionDetailPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows not found message for unknown option', async () => {
    jest
      .mocked(securitiesApi.getOption)
      .mockResolvedValue(null as unknown as ReturnType<typeof createMockOption>)
    renderWithProviders(<OptionDetailPage />)
    await screen.findByText('Option not found.')
  })
})
