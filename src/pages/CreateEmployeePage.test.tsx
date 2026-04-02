import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateEmployeePage } from '@/pages/CreateEmployeePage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('CreateEmployeePage', () => {
  it('renders employee form', () => {
    renderWithProviders(<CreateEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('calls createEmployee API on submit', async () => {
    jest.mocked(employeesApi.createEmployee).mockResolvedValue(createMockEmployee())

    renderWithProviders(<CreateEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane')
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com')
    await userEvent.type(screen.getByLabelText(/username/i), 'jane.doe')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(employeesApi.createEmployee).toHaveBeenCalled()
    })
  })
})
