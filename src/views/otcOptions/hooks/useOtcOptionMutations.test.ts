import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { useAcceptNegotiation } from '@/views/otcOptions/hooks/useOtcOptionMutations'
import type { AcceptNegotiationResponse, OtcNegotiation } from '@/views/otcOptions/types'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: { acceptNegotiation: jest.fn() },
}))

const toastSuccess = jest.fn()
const toastWarning = jest.fn()
const toastError = jest.fn()
jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    warning: (...args: unknown[]) => toastWarning(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

const acceptNegotiation = jest.mocked(otcOptionsApi.acceptNegotiation)

const OFFER_ID = 42
const NEGOTIATION_ID = 7

function winning(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: NEGOTIATION_ID,
    parent_offer_id: OFFER_ID,
    status: 'accepted',
    bidder: { owner_type: 'client', owner_id: 5 },
    quantity: '10',
    strike_price: '175',
    premium: '700',
    settlement_date: '2026-12-31',
    created_at: '2026-05-16T00:00:00Z',
    updated_at: '2026-05-16T00:00:00Z',
    viewer_role: '',
    last_action_mine: false,
    awaiting_viewer: false,
    can_accept: false,
    can_counter: false,
    can_reject: false,
    can_withdraw: false,
    ...overrides,
  }
}

function make412(message: string): AxiosError {
  return new AxiosError('precondition failed', 'ERR_BAD_RESPONSE', undefined, null, {
    data: { error: message },
    status: 412,
    statusText: 'Precondition Failed',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  })
}

function renderAccept() {
  return renderHook(() => useAcceptNegotiation(OFFER_ID), { wrapper: createQueryWrapper() })
}

function accept(result: ReturnType<typeof renderAccept>['result']) {
  result.current.mutate({ negotiationId: NEGOTIATION_ID, payload: { acceptor_account_id: 1 } })
}

beforeEach(() => jest.clearAllMocks())

describe('useAcceptNegotiation', () => {
  it('shows a "minted" success toast when a local accept returns a contract', async () => {
    const response: AcceptNegotiationResponse = {
      winning: winning(),
      parent_status: 'consumed',
      cancelled_siblings: [],
      contract: { id: 555 },
      cross_bank_transaction_id: undefined,
    }
    acceptNegotiation.mockResolvedValue(response)

    const { result } = renderAccept()
    accept(result)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toastSuccess).toHaveBeenCalledWith('Contract #555 minted')
    expect(toastWarning).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })

  it('shows a positive "settling" toast (not the abort warning) for a cross-bank accept with contract: null', async () => {
    const response: AcceptNegotiationResponse = {
      winning: winning(),
      cancelled_siblings: [],
      contract: null,
      cross_bank_transaction_id: '8b1c2ef8-0000-4000-8000-000000000000',
    }
    acceptNegotiation.mockResolvedValue(response)

    const { result } = renderAccept()
    accept(result)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // The old false-alarm warning must never fire for a 200 with contract: null.
    expect(toastWarning).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledTimes(1)
    const message = toastSuccess.mock.calls[0][0] as string
    expect(message).toMatch(/cross-bank contract is settling/i)
    expect(message).not.toMatch(/insufficient shares or premium/i)
    expect(message).not.toMatch(/formation saga aborted/i)
  })

  it('surfaces the backend reason on a genuine 412 abort, without any success toast', async () => {
    acceptNegotiation.mockRejectedValue(make412('seller has insufficient shares'))

    const { result } = renderAccept()
    accept(result)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toastError).toHaveBeenCalledWith("Couldn't form the contract", {
      description: 'seller has insufficient shares',
    })
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastWarning).not.toHaveBeenCalled()
  })
})
