import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TaxPage } from '@/pages/TaxPage'
import * as taxApi from '@/lib/api/tax'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

jest.mock('@/lib/api/tax')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(taxApi.getTaxRecords).mockResolvedValue({
    tax_records: [createMockTaxRecord({ id: 1, user_name: 'John Doe' })],
    total_count: 1,
  })
  jest.mocked(taxApi.collectTaxes).mockResolvedValue({
    collected_count: 5,
    total_collected_rsd: '3750.00',
    failed_count: 0,
  })
})

describe('TaxPage', () => {
  it('renders page title', () => {
    renderWithProviders(<TaxPage />)
    expect(screen.getByText('Tax Management')).toBeInTheDocument()
  })

  it('displays tax records on load', async () => {
    renderWithProviders(<TaxPage />)
    await screen.findByText('John Doe')
  })

  it('shows loading state', () => {
    jest.mocked(taxApi.getTaxRecords).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<TaxPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    jest.mocked(taxApi.getTaxRecords).mockResolvedValue({ tax_records: [], total_count: 0 })
    renderWithProviders(<TaxPage />)
    await screen.findByText('No tax records found.')
  })

  it('renders Collect Taxes button', () => {
    renderWithProviders(<TaxPage />)
    expect(screen.getByRole('button', { name: /collect taxes/i })).toBeInTheDocument()
  })

  it('calls collectTaxes when button clicked', async () => {
    renderWithProviders(<TaxPage />)
    await screen.findByText('John Doe')
    fireEvent.click(screen.getByRole('button', { name: /collect taxes/i }))
    await waitFor(() => expect(taxApi.collectTaxes).toHaveBeenCalled())
  })
})
