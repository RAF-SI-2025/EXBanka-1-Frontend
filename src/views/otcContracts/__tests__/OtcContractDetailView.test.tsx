import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcContractDetailView } from '@/views/otcContracts/OtcContractDetailView'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'
import * as useOtcOptionsHook from '@/hooks/useOtcOptions'

jest.mock('@/hooks/useOtcOptions')

function renderDetail() {
  return renderWithProviders(<OtcContractDetailView />, {
    route: '/otc/contracts/26',
    routePath: '/otc/contracts/:id',
  })
}

describe('OtcContractDetailView — Exercise gating', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useOtcOptionsHook.useExerciseOtcOptionContract)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as never)
  })

  it('shows the Exercise action for an ACTIVE contract the caller holds (me_owner)', () => {
    const contract = createMockOptionContract({ id: 26, status: 'ACTIVE', me_owner: true })
    jest
      .mocked(useOtcOptionsHook.useOtcOptionContract)
      .mockReturnValue({ data: { contract }, isLoading: false, isError: false } as never)
    renderDetail()
    expect(screen.getByRole('button', { name: /exercise contract/i })).toBeInTheDocument()
  })

  it('hides the Exercise action when the caller is the seller (me_owner false)', () => {
    const contract = createMockOptionContract({ id: 26, status: 'ACTIVE', me_owner: false })
    jest
      .mocked(useOtcOptionsHook.useOtcOptionContract)
      .mockReturnValue({ data: { contract }, isLoading: false, isError: false } as never)
    renderDetail()
    expect(screen.queryByRole('button', { name: /exercise contract/i })).not.toBeInTheDocument()
  })

  it('renders a graceful state (no crash, no Exercise) when the contract is null (cross-bank settling)', () => {
    jest
      .mocked(useOtcOptionsHook.useOtcOptionContract)
      .mockReturnValue({ data: { contract: null }, isLoading: false, isError: false } as never)
    renderDetail()
    expect(screen.getByText(/may still be settling/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /exercise contract/i })).not.toBeInTheDocument()
  })

  it('hides the Exercise action for a non-ACTIVE contract even when held', () => {
    const contract = createMockOptionContract({ id: 26, status: 'EXERCISED', me_owner: true })
    jest
      .mocked(useOtcOptionsHook.useOtcOptionContract)
      .mockReturnValue({ data: { contract }, isLoading: false, isError: false } as never)
    renderDetail()
    expect(screen.queryByRole('button', { name: /exercise contract/i })).not.toBeInTheDocument()
  })
})
