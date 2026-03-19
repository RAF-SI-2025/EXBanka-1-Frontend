import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanFilters } from '@/components/loans/LoanFilters'
import type { LoanFilters as LoanFiltersType } from '@/types/loan'

describe('LoanFilters', () => {
  const mockOnFilterChange = jest.fn()
  const emptyFilters: LoanFiltersType = {}

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders account number filter input', () => {
    renderWithProviders(<LoanFilters filters={emptyFilters} onFilterChange={mockOnFilterChange} />)
    expect(screen.getByPlaceholderText(/broj računa/i)).toBeInTheDocument()
  })

  it('shows current account_number value in input', () => {
    renderWithProviders(
      <LoanFilters
        filters={{ account_number: '111000100000000011' }}
        onFilterChange={mockOnFilterChange}
      />
    )
    expect(screen.getByDisplayValue('111000100000000011')).toBeInTheDocument()
  })

  it('calls onFilterChange when account number input changes', async () => {
    renderWithProviders(<LoanFilters filters={emptyFilters} onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/broj računa/i)
    await userEvent.type(input, 'A')
    expect(mockOnFilterChange).toHaveBeenCalled()
  })

  it('renders loan type filter', () => {
    renderWithProviders(<LoanFilters filters={emptyFilters} onFilterChange={mockOnFilterChange} />)
    expect(screen.getByText(/svi tipovi/i)).toBeInTheDocument()
  })

  it('renders loan status filter', () => {
    renderWithProviders(<LoanFilters filters={emptyFilters} onFilterChange={mockOnFilterChange} />)
    expect(screen.getByText(/svi statusi/i)).toBeInTheDocument()
  })
})
