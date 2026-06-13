import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminFeesView } from '@/views/adminFees/AdminFeesView'
import { adminFeesApi } from '@/views/adminFees/api/adminFeesApi'
import type { TransferFee } from '@/views/adminFees/types'

jest.mock('@/views/adminFees/api/adminFeesApi', () => ({
  adminFeesApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}))
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
  jest.mocked(adminFeesApi.list).mockResolvedValue({ fees: mockFees })
})

describe('AdminFeesView', () => {
  it('renders page title and shell', async () => {
    renderWithProviders(<AdminFeesView />)
    expect(screen.getByRole('heading', { name: 'Transfer Fees', level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
  })

  it('shows the loading state while data loads', () => {
    jest.mocked(adminFeesApi.list).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<AdminFeesView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('displays the fees table with data', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('Fixed Payment Fee')).toBeInTheDocument()
  })

  it('shows the Create Fee Rule button', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByRole('button', { name: /create fee rule/i })).toBeInTheDocument()
  })

  it('shows fee type badges', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('percentage')).toBeInTheDocument()
    expect(screen.getByText('fixed')).toBeInTheDocument()
  })

  it('shows Deactivate for active fees and Reactivate for inactive', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reactivate/i })).toBeInTheDocument()
  })

  it('shows currency or "All" for fees', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    expect(screen.getByText('RSD')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('shows the EmptyState when there are no fees', async () => {
    jest.mocked(adminFeesApi.list).mockResolvedValue({ fees: [] })
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('No fee rules found.')
    expect(screen.getByTestId('view-empty')).toBeInTheDocument()
  })

  it('renders Edit buttons for each fee', async () => {
    renderWithProviders(<AdminFeesView />)
    await screen.findByText('Standard Transfer Fee')
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    expect(editButtons).toHaveLength(2)
  })
})
