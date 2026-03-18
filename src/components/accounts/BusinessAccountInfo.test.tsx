import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'

describe('BusinessAccountInfo', () => {
  const company = {
    name: 'Firma DOO',
    registration_number: '12345678',
    tax_number: '123456789',
    activity_code: '62.01',
    address: 'Bulevar Kralja Aleksandra 1',
  }

  it('renders company details', () => {
    renderWithProviders(<BusinessAccountInfo company={company} />)
    expect(screen.getByText('Firma DOO')).toBeInTheDocument()
    expect(screen.getByText('12345678')).toBeInTheDocument()
    expect(screen.getByText('123456789')).toBeInTheDocument()
  })

  it('renders nothing when company is undefined', () => {
    renderWithProviders(<BusinessAccountInfo company={undefined} />)
    expect(screen.queryByText(/podaci o firmi/i)).not.toBeInTheDocument()
  })
})
