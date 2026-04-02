import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActuaryListPage } from '@/pages/ActuaryListPage'
import * as actuariesApi from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/actuaries')

const mockActuaries = [
  createMockActuary({
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'smith@test.com',
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
  }),
  createMockActuary({
    id: 2,
    first_name: 'Agent',
    last_name: 'Jones',
    email: 'jones@test.com',
    limit: '50000.00',
    used_limit: '0',
    need_approval: false,
  }),
]

const supervisorAuth = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read', 'agents.manage'],
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(actuariesApi.getActuaries).mockResolvedValue({
    actuaries: mockActuaries,
    total_count: 2,
  })
  jest.mocked(actuariesApi.setActuaryLimit).mockResolvedValue(mockActuaries[0])
  jest.mocked(actuariesApi.resetActuaryLimit).mockResolvedValue(mockActuaries[0])
  jest.mocked(actuariesApi.setActuaryApproval).mockResolvedValue(mockActuaries[0])
})

describe('ActuaryListPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    expect(screen.getByText('Actuaries')).toBeInTheDocument()
  })

  it('displays all actuaries on load', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')
    expect(screen.getByText('Agent Jones')).toBeInTheDocument()
  })

  it('calls API with search filter when typing', async () => {
    jest.mocked(actuariesApi.getActuaries).mockImplementation(async (filters = {}) => {
      if (filters.search === 'Smith') {
        return { actuaries: [mockActuaries[0]], total_count: 1 }
      }
      return { actuaries: mockActuaries, total_count: 2 }
    })

    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const searchInput = screen.getByPlaceholderText(/^search$/i)
    fireEvent.change(searchInput, { target: { value: 'Smith' } })

    await waitFor(() =>
      expect(actuariesApi.getActuaries).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Smith', page: 1, page_size: 10 })
      )
    )
  })

  it('shows loading state', () => {
    jest.mocked(actuariesApi.getActuaries).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No actuaries found." when API returns empty array', async () => {
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue({
      actuaries: [],
      total_count: 0,
    })
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('No actuaries found.')
  })

  it('calls resetActuaryLimit when Reset button is clicked', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const resetButtons = screen.getAllByRole('button', { name: /reset/i })
    fireEvent.click(resetButtons[0])

    await waitFor(() => expect(actuariesApi.resetActuaryLimit).toHaveBeenCalledWith(1))
  })

  it('calls setActuaryApproval when Toggle Approval button is clicked', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const toggleButtons = screen.getAllByRole('button', { name: /toggle approval/i })
    fireEvent.click(toggleButtons[0])

    await waitFor(() =>
      expect(actuariesApi.setActuaryApproval).toHaveBeenCalledWith(1, { need_approval: false })
    )
  })

  it('opens edit limit dialog and calls setActuaryLimit on save', async () => {
    renderWithProviders(<ActuaryListPage />, {
      preloadedState: { auth: supervisorAuth },
    })
    await screen.findByText('Agent Smith')

    const editButtons = screen.getAllByRole('button', { name: /edit limit/i })
    fireEvent.click(editButtons[0])

    const input = await screen.findByDisplayValue('100000.00')
    fireEvent.change(input, { target: { value: '200000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(actuariesApi.setActuaryLimit).toHaveBeenCalledWith(1, { limit: '200000.00' })
    )
  })
})
