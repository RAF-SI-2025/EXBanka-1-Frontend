import { render, screen } from '@testing-library/react'
import { TaxTrackingTable } from '@/components/tax/TaxTrackingTable'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

describe('TaxTrackingTable', () => {
  const records = [
    createMockTaxRecord({
      id: 1,
      first_name: 'Marko',
      last_name: 'Marković',
      user_type: 'client',
      unpaid_tax: '1500.00',
      paid_tax_ytd: '4500.00',
    }),
    createMockTaxRecord({
      id: 2,
      first_name: 'Ana',
      last_name: 'Anić',
      email: 'ana.anic@example.com',
      user_type: 'actuary',
      unpaid_tax: '3000.00',
      paid_tax_ytd: '9000.00',
    }),
  ]

  it('renders table headers', () => {
    render(<TaxTrackingTable records={records} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText(/unpaid tax/i)).toBeInTheDocument()
    expect(screen.getByText(/paid.*ytd/i)).toBeInTheDocument()
  })

  it('renders each record row with full name and tax values', () => {
    render(<TaxTrackingTable records={records} />)
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('1500.00')).toBeInTheDocument()
    expect(screen.getByText('3000.00')).toBeInTheDocument()
  })

  it('renders empty state when no records', () => {
    render(<TaxTrackingTable records={[]} />)
    expect(screen.getByText(/no records/i)).toBeInTheDocument()
  })

  it('renders user_type badge for each row', () => {
    render(<TaxTrackingTable records={records} />)
    expect(screen.getByText('client')).toBeInTheDocument()
    expect(screen.getByText('actuary')).toBeInTheDocument()
  })
})
