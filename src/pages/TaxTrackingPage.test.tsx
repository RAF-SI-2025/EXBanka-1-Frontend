import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TaxTrackingPage } from '@/pages/TaxTrackingPage'
import * as useTaxHook from '@/hooks/useTax'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

jest.mock('@/hooks/useTax')

describe('TaxTrackingPage', () => {
  const records = [
    createMockTaxRecord({ id: 1, first_name: 'Marko', last_name: 'Marković' }),
    createMockTaxRecord({ id: 2, first_name: 'Ana', last_name: 'Anić', user_type: 'actuary' }),
  ]
  const mutateFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useTaxHook.useTaxRecords).mockReturnValue({
      data: { tax_records: records, total_count: 2 },
      isLoading: false,
    } as any)
    jest
      .mocked(useTaxHook.useCollectTaxes)
      .mockReturnValue({ mutate: mutateFn, isPending: false } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<TaxTrackingPage />)
    expect(screen.getByText(/tax tracking/i)).toBeInTheDocument()
  })

  it('renders tax records in the table', () => {
    renderWithProviders(<TaxTrackingPage />)
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest
      .mocked(useTaxHook.useTaxRecords)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<TaxTrackingPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('calls collectTaxes when Collect Taxes button is clicked', () => {
    renderWithProviders(<TaxTrackingPage />)
    fireEvent.click(screen.getByRole('button', { name: /collect taxes/i }))
    expect(mutateFn).toHaveBeenCalled()
  })
})
