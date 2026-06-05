import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { useOtcOfferTimeline } from '@/views/otcOptions/hooks/useOtcOptionsLists'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    getOfferTimeline: jest.fn(),
  },
}))

const getOfferTimeline = jest.mocked(otcOptionsApi.getOfferTimeline)

const entry = (overrides = {}) => ({
  negotiation_id: 100,
  bidder_owner_type: 'client' as const,
  bidder_owner_id: 7,
  revision_number: 1,
  action: 'BID' as const,
  quantity: '10',
  strike_price: '150.00',
  premium: '5.00',
  settlement_date: '2026-07-01T00:00:00Z',
  action_by_principal_type: 'client' as const,
  action_by_principal_id: 7,
  created_at: '2026-06-01T12:00:00Z',
  ...overrides,
})

describe('useOtcOfferTimeline', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not fetch while the offer id is null', () => {
    renderHook(() => useOtcOfferTimeline(null), { wrapper: createQueryWrapper() })
    expect(getOfferTimeline).not.toHaveBeenCalled()
  })

  it('adapts flat timeline entries to RevisionWithChain rows, newest-first', async () => {
    getOfferTimeline.mockResolvedValue({
      offer: {},
      timeline: [
        entry({ revision_number: 1, action: 'BID', created_at: '2026-06-01T12:00:00Z' }),
        entry({
          revision_number: 2,
          action: 'COUNTER',
          created_at: '2026-06-01T12:05:00Z',
          action_by_principal_id: 1,
        }),
      ],
    })

    const { result } = renderHook(() => useOtcOfferTimeline(42), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(getOfferTimeline).toHaveBeenCalledWith(42)

    const revs = result.current.revisions
    expect(revs).toHaveLength(2)
    // Newest-first: the COUNTER (12:05) precedes the BID (12:00).
    expect(revs[0].action).toBe('COUNTER')
    expect(revs[1].action).toBe('BID')
    // Bidder identity is lifted from the flat entry onto chain_* fields.
    expect(revs[0].chain_id).toBe(100)
    expect(revs[0].chain_bidder).toEqual({ owner_type: 'client', owner_id: 7 })
  })
})
