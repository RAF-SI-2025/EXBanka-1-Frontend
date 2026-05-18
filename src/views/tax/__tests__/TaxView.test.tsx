import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TaxView } from '@/views/tax/TaxView'
import { taxApi } from '@/views/tax/api/taxApi'
import { createMockTaxRecord } from '@/views/tax/__tests__/fixtures'

jest.mock('@/views/tax/api/taxApi', () => ({
  taxApi: {
    list: jest.fn(),
    collect: jest.fn(),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(taxApi.list).mockResolvedValue({
    tax_records: [createMockTaxRecord({ id: 1, first_name: 'John', last_name: 'Doe' })],
    total_count: 1,
  })
  jest.mocked(taxApi.collect).mockResolvedValue({
    collected_count: 5,
    total_collected_rsd: '3750.00',
    failed_count: 0,
  })
})

describe('TaxView', () => {
  it('renders title inside the animated shell', () => {
    renderWithProviders(<TaxView />)
    expect(screen.getByText('Tax Management')).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
  })

  it('displays tax records on load', async () => {
    renderWithProviders(<TaxView />)
    await screen.findByText('John Doe')
  })

  it('shows the loading state', () => {
    jest.mocked(taxApi.list).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<TaxView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('shows the empty state when no records', async () => {
    jest.mocked(taxApi.list).mockResolvedValue({ tax_records: [], total_count: 0 })
    renderWithProviders(<TaxView />)
    await screen.findByText('No tax records found.')
  })

  it('renders Collect Taxes button', () => {
    renderWithProviders(<TaxView />)
    expect(screen.getByRole('button', { name: /collect taxes/i })).toBeInTheDocument()
  })

  it('calls collect when button clicked', async () => {
    renderWithProviders(<TaxView />)
    await screen.findByText('John Doe')
    fireEvent.click(screen.getByRole('button', { name: /collect taxes/i }))
    await waitFor(() => expect(taxApi.collect).toHaveBeenCalled())
  })
})
