import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AuthorizedPersonForm } from './AuthorizedPersonForm'

describe('AuthorizedPersonForm', () => {
  it('renders form fields', () => {
    renderWithProviders(<AuthorizedPersonForm onSubmit={jest.fn()} loading={false} />)
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders all required fields including date_of_birth and gender', () => {
    renderWithProviders(<AuthorizedPersonForm onSubmit={jest.fn()} loading={false} />)
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument()
    expect(screen.getByLabelText('Gender')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Address')).toBeInTheDocument()
  })
})
