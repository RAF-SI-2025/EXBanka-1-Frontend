import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcContractsPage } from '@/pages/OtcContractsPage'
import * as useOtcOptionsHook from '@/hooks/useOtcOptions'
import * as errors from '@/lib/errors'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ExerciseContractPayload, ExerciseOtcContractResponse } from '@/types/otcOption'
import type { AuthUser } from '@/types/auth'

jest.mock('@/hooks/useOtcOptions')
jest.mock('@/lib/errors', () => ({
  __esModule: true,
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}))

type ExerciseMutation = UseMutationResult<
  ExerciseOtcContractResponse,
  Error,
  ExerciseContractPayload,
  unknown
>

const clientUser: AuthUser = {
  id: 7, // matches the default buyer.owner_id in createMockOptionContract
  email: 'client@example.com',
  role: 'client',
  permissions: [],
  system_type: 'client',
}

const clientAuth = {
  auth: {
    user: clientUser,
    userType: 'client' as const,
    accessToken: 'tok',
    refreshToken: 'rt',
    status: 'authenticated' as const,
    error: null,
  },
}

const employeeUser: AuthUser = {
  id: 99,
  email: 'emp@example.com',
  role: 'EmployeeAdmin',
  permissions: [],
  system_type: 'employee',
}

const employeeAuth = {
  auth: {
    user: employeeUser,
    userType: 'employee' as const,
    accessToken: 'tok',
    refreshToken: 'rt',
    status: 'authenticated' as const,
    error: null,
  },
}

describe('OtcContractsPage', () => {
  const active = createMockOptionContract({ id: 101, status: 'ACTIVE' })
  const expired = createMockOptionContract({ id: 102, status: 'EXPIRED' })
  const mutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useOtcOptionsHook.useMyOtcOptionContracts).mockReturnValue({
      data: { contracts: [active, expired], total: 2 },
      isLoading: false,
    } as ReturnType<typeof useOtcOptionsHook.useMyOtcOptionContracts>)
    jest.mocked(useOtcOptionsHook.useExerciseOtcOptionContract).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ExerciseMutation)
  })

  it('renders both Active and Concluded sections', () => {
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    expect(screen.getByRole('heading', { level: 2, name: /^active$/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /concluded \/ expired/i })
    ).toBeInTheDocument()
  })

  it('opens the ExerciseContractDialog when the Exercise button is clicked', () => {
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/exercise contract/i)).toBeInTheDocument()
  })

  it('calls the mutation with an empty payload when the dialog Exercise button is confirmed', () => {
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
    const confirmButtons = screen.getAllByRole('button', { name: /^exercise$/i })
    // The last "Exercise" button is the one inside the dialog footer.
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(mutate).toHaveBeenCalledWith({}, expect.any(Object))
  })

  it('closes the dialog and fires a success toast on successful exercise', async () => {
    mutate.mockImplementation((_payload, opts) => opts?.onSuccess?.())
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
    const confirmButtons = screen.getAllByRole('button', { name: /^exercise$/i })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(errors.notifySuccess).toHaveBeenCalledWith(
      expect.stringContaining(`Contract #${active.id} exercised`)
    )
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('renders the Exercise button when a client matches contract.buyer.owner_id', () => {
    // active.buyer = { owner_type: 'client', owner_id: 7 }; clientUser.id = 7
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    expect(screen.getByRole('button', { name: /^exercise$/i })).toBeInTheDocument()
  })

  it('renders the Exercise button for an employee viewing a bank-owned buyer contract', () => {
    const bankBuyerActive = createMockOptionContract({
      id: 201,
      status: 'ACTIVE',
      buyer: { owner_type: 'bank', owner_id: 1 },
    })
    jest.mocked(useOtcOptionsHook.useMyOtcOptionContracts).mockReturnValue({
      data: { contracts: [bankBuyerActive], total: 1 },
      isLoading: false,
    } as ReturnType<typeof useOtcOptionsHook.useMyOtcOptionContracts>)
    renderWithProviders(<OtcContractsPage />, { preloadedState: employeeAuth })
    expect(screen.getByRole('button', { name: /^exercise$/i })).toBeInTheDocument()
  })

  it('does NOT render the Exercise button for a client whose id does not match the buyer', () => {
    const notMineActive = createMockOptionContract({
      id: 301,
      status: 'ACTIVE',
      buyer: { owner_type: 'client', owner_id: 999 }, // not 7
    })
    jest.mocked(useOtcOptionsHook.useMyOtcOptionContracts).mockReturnValue({
      data: { contracts: [notMineActive], total: 1 },
      isLoading: false,
    } as ReturnType<typeof useOtcOptionsHook.useMyOtcOptionContracts>)
    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })
    expect(screen.queryByRole('button', { name: /^exercise$/i })).not.toBeInTheDocument()
  })
})
