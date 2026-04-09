import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminInterestRatesPage } from '@/pages/AdminInterestRatesPage'
import * as tiersApi from '@/lib/api/interestRateTiers'
import * as marginsApi from '@/lib/api/bankMargins'
import type { InterestRateTier } from '@/types/interestRateTiers'
import type { BankMargin } from '@/types/bankMargins'

jest.mock('@/lib/api/interestRateTiers')
jest.mock('@/lib/api/bankMargins')

const mockTiers: InterestRateTier[] = [
  {
    id: 1,
    amount_from: 0,
    amount_to: 50000,
    fixed_rate: 3.5,
    variable_base: 1.2,
    active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    amount_from: 50001,
    amount_to: 200000,
    fixed_rate: 4.0,
    variable_base: 1.5,
    active: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

const mockMargins: BankMargin[] = [
  {
    id: 1,
    loan_type: 'HOUSING',
    margin: 2.5,
    active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-06-15T00:00:00Z',
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(tiersApi.getInterestRateTiers).mockResolvedValue({ tiers: mockTiers })
  jest.mocked(marginsApi.getBankMargins).mockResolvedValue({ margins: mockMargins })
})

describe('AdminInterestRatesPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<AdminInterestRatesPage />)
    expect(screen.getByRole('heading', { name: 'Interest Rates' })).toBeInTheDocument()
  })

  it('shows loading spinner while data loads', () => {
    jest.mocked(tiersApi.getInterestRateTiers).mockReturnValue(new Promise(() => {}))
    jest.mocked(marginsApi.getBankMargins).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<AdminInterestRatesPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays tiers table with data', async () => {
    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('0 - 50,000')
    expect(screen.getByText('3.5%')).toBeInTheDocument()
    expect(screen.getByText('1.2%')).toBeInTheDocument()
    expect(screen.getByText('50,001 - 200,000')).toBeInTheDocument()
    expect(screen.getByText('4%')).toBeInTheDocument()
  })

  it('shows Create Tier button', async () => {
    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('0 - 50,000')
    expect(screen.getByRole('button', { name: /create tier/i })).toBeInTheDocument()
  })

  it('shows active/inactive badges for tiers', async () => {
    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('0 - 50,000')
    // "Active" appears as table header + badge, so use getAllByText
    const activeElements = screen.getAllByText('Active')
    expect(activeElements.length).toBeGreaterThanOrEqual(2) // header + badge
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('shows bank margins tab and can switch to it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('0 - 50,000')

    const marginsTab = screen.getByRole('tab', { name: /bank margins/i })
    await user.click(marginsTab)

    await waitFor(() => {
      expect(screen.getByText('Housing')).toBeInTheDocument()
      expect(screen.getByText('2.5%')).toBeInTheDocument()
    })
  })

  it('shows "No interest rate tiers found." when there are no tiers', async () => {
    jest.mocked(tiersApi.getInterestRateTiers).mockResolvedValue({ tiers: [] })

    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('No interest rate tiers found.')
  })

  it('renders edit, delete, and apply buttons for each tier', async () => {
    renderWithProviders(<AdminInterestRatesPage />)

    await screen.findByText('0 - 50,000')
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    const applyButtons = screen.getAllByRole('button', { name: /apply to loans/i })

    expect(editButtons).toHaveLength(2)
    expect(deleteButtons).toHaveLength(2)
    expect(applyButtons).toHaveLength(2)
  })
})
