import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminFeesPage } from '@/pages/AdminFeesPage'
import * as feesApi from '@/lib/api/fees'
import type { TransferFee } from '@/types/fee'

jest.mock('@/lib/api/fees')
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const mockFees: TransferFee[] = [
  {
    id: 1,
    name: 'Standard Transfer Fee',
    fee_type: 'percentage',
    fee_value: '0.5',
    min_amount: '100',
    max_fee: '500',
    transaction_type: 'transfer',
    currency_code: 'RSD',
    active: true,
  },
  {
    id: 2,
    name: 'Fixed Payment Fee',
    fee_type: 'fixed',
    fee_value: '50',
    min_amount: '',
    max_fee: '',
    transaction_type: 'payment',
    currency_code: '',
    active: false,
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(feesApi.getFees).mockResolvedValue({ fees: mockFees })
})

describe('AdminFeesPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<AdminFeesPage />)
    expect(screen.getByRole('heading', { name: 'Transfer Fees' })).toBeInTheDocument()
  })

  it('shows loading spinner while data loads', () => {
    jest.mocked(feesApi.getFees).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<AdminFeesPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays fees table with data', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('Fixed Payment Fee')).toBeInTheDocument()
  })

  it('shows Create Fee Rule button', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByRole('button', { name: /create fee rule/i })).toBeInTheDocument()
  })

  it('shows fee type badges', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('percentage')).toBeInTheDocument()
    expect(screen.getByText('fixed')).toBeInTheDocument()
  })

  it('shows deactivate button for active fees and reactivate for inactive', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reactivate/i })).toBeInTheDocument()
  })

  it('shows currency or "All" for fees', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('RSD')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('shows "No fee rules found." when there are no fees', async () => {
    jest.mocked(feesApi.getFees).mockResolvedValue({ fees: [] })

    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('No fee rules found.')
  })

  it('renders edit buttons for each fee', async () => {
    renderWithProviders(<AdminFeesPage />)

    await screen.findByText('Standard Transfer Fee')
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    expect(editButtons).toHaveLength(2)
  })
})
