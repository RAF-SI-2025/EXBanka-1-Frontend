import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcContractsPage } from '@/pages/OtcContractsPage'
import { apiClient } from '@/lib/api/axios'
import type { AuthUser } from '@/types/auth'

// Integration / regression: exercises the REAL useOtcOptions hook and the
// REAL `normalizeContract` against a raw wire-shape response. If a future
// refactor drops `ticker`, stops mapping `premium_paid` → `premium`, or
// stops nesting buyer/seller, this test fails because the ticker cell,
// premium cell, or Exercise button is missing. Guards the buyer-button UX
// from silently regressing.
jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockGet = jest.mocked(apiClient.get)

const clientUser: AuthUser = {
  id: 7,
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

describe('OtcContractsPage › wire-shape integration', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders Exercise button for an ACTIVE contract when the wire response uses flat buyer/seller fields (regression for normalization)', async () => {
    mockGet.mockResolvedValue({
      data: {
        contracts: [
          {
            id: 17,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: '10',
            strike_price: '175.50',
            premium_paid: '700.00',
            settlement_date: '2027-08-01T00:00:00Z',
            buyer_owner_type: 'client',
            buyer_owner_id: 7,
            seller_owner_type: 'client',
            seller_owner_id: 42,
          },
        ],
        total: 1,
      },
    })

    renderWithProviders(<OtcContractsPage />, { preloadedState: clientAuth })

    await waitFor(() => expect(screen.getByText('AAPL')).toBeInTheDocument())
    expect(screen.getByText('700.00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^exercise$/i })).toBeInTheDocument()
  })
})
