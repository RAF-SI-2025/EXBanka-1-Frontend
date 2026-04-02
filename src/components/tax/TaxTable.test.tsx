import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TaxTable } from '@/components/tax/TaxTable'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

const mockRecords = [
  createMockTaxRecord({
    id: 1,
    user_name: 'John Doe',
    user_email: 'john@test.com',
    user_type: 'client',
  }),
  createMockTaxRecord({
    id: 2,
    user_name: 'Jane Smith',
    user_email: 'jane@test.com',
    user_type: 'actuary',
    tax_amount: '1200.00',
  }),
]

describe('TaxTable', () => {
  it('renders table headers', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Taxable Amount')).toBeInTheDocument()
    expect(screen.getByText('Tax Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders tax record rows', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('1200.00')).toBeInTheDocument()
  })

  it('renders user type', () => {
    renderWithProviders(<TaxTable records={mockRecords} />)
    expect(screen.getByText('client')).toBeInTheDocument()
    expect(screen.getByText('actuary')).toBeInTheDocument()
  })
})
