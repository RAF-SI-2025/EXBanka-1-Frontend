import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TaxTable } from '@/components/tax/TaxTable'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

const mockRecords = [
  createMockTaxRecord({
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    user_type: 'client',
    unpaid_tax: '750.00',
    last_collection: null,
  }),
  createMockTaxRecord({
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    user_type: 'actuary',
    unpaid_tax: '1200.00',
    last_collection: '2026-04-01T10:00:00Z',
  }),
]

describe('TaxTable', () => {
  it('renders table headers', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Total Debt (RSD)')).toBeInTheDocument()
    expect(screen.getByText('Last Collection')).toBeInTheDocument()
  })

  it('renders full name from first_name and last_name', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders total debt', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('750.00')).toBeInTheDocument()
    expect(screen.getByText('1200.00')).toBeInTheDocument()
  })

  it('renders user type badges', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.getByText('Actuary')).toBeInTheDocument()
  })

  it('shows em dash when last_collection is null', () => {
    renderWithProviders(<TaxTable records={[mockRecords[0]]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('formats last_collection as a date when present', () => {
    renderWithProviders(<TaxTable records={[mockRecords[1]]} />)
    expect(screen.queryByText('2026-04-01T10:00:00Z')).not.toBeInTheDocument()
    // Locale date string is rendered instead of raw ISO
    expect(screen.queryByText('—')).not.toBeInTheDocument()
  })

  it('shows empty state when no records', () => {
    renderWithProviders(<TaxTable records={[]} />)
    expect(screen.getByText('No tax records found.')).toBeInTheDocument()
  })
})
