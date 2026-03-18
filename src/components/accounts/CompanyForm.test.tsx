import { screen } from '@testing-library/react'
import { CompanyForm } from '@/components/accounts/CompanyForm'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

describe('CompanyForm', () => {
  it('renders all company fields', () => {
    renderWithProviders(<CompanyForm register={jest.fn().mockReturnValue({})} errors={{}} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tax number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/activity code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
  })
})
