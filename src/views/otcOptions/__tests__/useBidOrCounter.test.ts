import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { useBidOrCounter } from '@/views/otcOptions/hooks/useBidOrCounter'
import type { BidOrCounterInput, OtcNegotiation } from '@/views/otcOptions/types'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    placeBid: jest.fn(),
    counter: jest.fn(),
    listNegotiations: jest.fn(),
  },
}))

function make409(): AxiosError {
  return new AxiosError('conflict', 'ERR_BAD_REQUEST', undefined, null, {
    data: { error: 'chain already exists' },
    status: 409,
    statusText: 'Conflict',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  })
}

function makeNeg(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 7,
    parent_offer_id: 42,
    status: 'open',
    bidder: { owner_type: 'client', owner_id: 5 },
    quantity: '10',
    strike_price: '175',
    premium: '700',
    settlement_date: '2026-12-31',
    created_at: '2026-05-16T00:00:00Z',
    updated_at: '2026-05-16T00:00:00Z',
    ...overrides,
  }
}

const placeBid = jest.mocked(otcOptionsApi.placeBid)
const counter = jest.mocked(otcOptionsApi.counter)
const listNegotiations = jest.mocked(otcOptionsApi.listNegotiations)

const baseInput: BidOrCounterInput = {
  offer_id: 42,
  account_id: 5,
  quantity: '10',
  strike_price: '175',
  premium: '700',
  settlement_date: '2026-12-31',
  bidder: { owner_type: 'client', owner_id: 5 },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useBidOrCounter', () => {
  it('calls placeBid directly on the first bid (no existing chain)', async () => {
    placeBid.mockResolvedValue({ negotiation: makeNeg() })

    const { result } = renderHook(() => useBidOrCounter(), { wrapper: createQueryWrapper() })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(placeBid).toHaveBeenCalledWith(42, {
      bidder_account_id: 5,
      quantity: '10',
      strike_price: '175',
      premium: '700',
      settlement_date: '2026-12-31',
    })
    expect(counter).not.toHaveBeenCalled()
    expect(listNegotiations).not.toHaveBeenCalled()
  })

  it("on 409, looks up the caller's existing chain and POSTs counter instead", async () => {
    placeBid.mockRejectedValue(make409())
    listNegotiations.mockResolvedValue({
      negotiations: [
        // someone else's chain
        makeNeg({ id: 1, bidder: { owner_type: 'client', owner_id: 99 } }),
        // caller's own chain — should be selected
        makeNeg({ id: 7, bidder: { owner_type: 'client', owner_id: 5 } }),
      ],
      total: 2,
    })
    counter.mockResolvedValue({ negotiation: makeNeg({ id: 7, status: 'countered' }) })

    const { result } = renderHook(() => useBidOrCounter(), { wrapper: createQueryWrapper() })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(placeBid).toHaveBeenCalledTimes(1)
    expect(listNegotiations).toHaveBeenCalledWith(42)
    expect(counter).toHaveBeenCalledWith(42, 7, {
      quantity: '10',
      strike_price: '175',
      premium: '700',
      settlement_date: '2026-12-31',
    })
  })

  it('propagates non-409 placeBid errors without trying counter', async () => {
    const err = new AxiosError('server error', 'ERR_BAD_RESPONSE', undefined, null, {
      data: { error: 'boom' },
      status: 500,
      statusText: 'Server Error',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    })
    placeBid.mockRejectedValue(err)

    const { result } = renderHook(() => useBidOrCounter(), { wrapper: createQueryWrapper() })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(counter).not.toHaveBeenCalled()
    expect(listNegotiations).not.toHaveBeenCalled()
  })

  it("throws when 409 fires but the caller's chain cannot be located", async () => {
    placeBid.mockRejectedValue(make409())
    listNegotiations.mockResolvedValue({
      negotiations: [makeNeg({ id: 1, bidder: { owner_type: 'client', owner_id: 99 } })],
      total: 1,
    })

    const { result } = renderHook(() => useBidOrCounter(), { wrapper: createQueryWrapper() })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(counter).not.toHaveBeenCalled()
  })
})
