import { configureStore } from '@reduxjs/toolkit'
import paymentReducer, { submitPayment } from '@/store/slices/paymentSlice'
import * as paymentsApi from '@/lib/api/payments'
import * as transfersApi from '@/lib/api/transfers'
import { parseApiError } from '@/lib/errors'
import { AxiosError } from 'axios'
import type { CreatePaymentRequest, CreateInternalTransferRequest } from '@/types/payment'

jest.mock('@/lib/api/payments')
jest.mock('@/lib/api/transfers')
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('Request failed')
  err.response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as AxiosError['config'],
  } as AxiosError['response']
  return err
}

const createStore = () => configureStore({ reducer: { payment: paymentReducer } })

const samplePayload: CreatePaymentRequest = {
  from_account_number: '111',
  to_account_number: '222',
  recipient_name: 'Test Recipient',
  amount: 100,
  payment_code: '289',
  reference_number: 'ref',
  payment_purpose: 'test',
}

const sampleTransferPayload: CreateInternalTransferRequest = {
  from_account_number: '111',
  to_account_number: '222',
  amount: 50,
}

beforeEach(() => jest.clearAllMocks())

describe('parseApiError integration', () => {
  it('returns the generic server-error message for 500 with no error field in body', () => {
    const mockErr = makeAxiosError(500, {})
    const result = parseApiError(mockErr)
    expect(result.message).toBe('The server reported an error. Please try again in a moment.')
  })

  it('returns the backend string for 4xx errors', () => {
    const mockErr = makeAxiosError(400, { error: 'Insufficient funds' })
    const result = parseApiError(mockErr)
    expect(result.message).toBe('Insufficient funds')
  })

  it('returns generic server-error message for 500 with non-string error field', () => {
    const mockErr = makeAxiosError(500, { error: { code: 'INTERNAL' } })
    const result = parseApiError(mockErr)
    expect(result.message).toBe('The server reported an error. Please try again in a moment.')
  })
})

describe('submitPayment thunk', () => {
  it('stores a clean parseApiError message on 400 rejection', async () => {
    const axiosErr = makeAxiosError(400, { error: 'Insufficient funds' })
    jest.mocked(paymentsApi.createPayment).mockRejectedValue(axiosErr)

    const store = createStore()
    await store.dispatch(submitPayment({ type: 'payment', data: samplePayload }))

    const state = store.getState().payment
    expect(state.error).toBe('Insufficient funds')
    expect(state.submitting).toBe(false)
  })

  it('stores the generic server-error message on 500 rejection (no error field in body)', async () => {
    const axiosErr = makeAxiosError(500, {})
    jest.mocked(paymentsApi.createPayment).mockRejectedValue(axiosErr)

    const store = createStore()
    await store.dispatch(submitPayment({ type: 'payment', data: samplePayload }))

    const state = store.getState().payment
    expect(state.error).toBe('The server reported an error. Please try again in a moment.')
    expect(state.submitting).toBe(false)
  })

  it('stores the generic server-error message on 500 for internal transfer', async () => {
    const axiosErr = makeAxiosError(500, {})
    jest.mocked(transfersApi.createTransfer).mockRejectedValue(axiosErr)

    const store = createStore()
    await store.dispatch(submitPayment({ type: 'internal', data: sampleTransferPayload }))

    const state = store.getState().payment
    expect(state.error).toBe('The server reported an error. Please try again in a moment.')
    expect(state.submitting).toBe(false)
  })

  it('stores a clean user-friendly fallback when the API call throws a non-Axios Error', async () => {
    jest.mocked(paymentsApi.createPayment).mockRejectedValue(new Error('Network request failed'))

    const store = createStore()
    await store.dispatch(submitPayment({ type: 'payment', data: samplePayload }))

    const state = store.getState().payment
    // parseApiError(new Error(...)) returns the error message directly
    expect(state.error).toBe('Network request failed')
    expect(state.submitting).toBe(false)
  })

  it('stores a fallback message instead of "Payment failed" when there is no response body', async () => {
    // AxiosError with no response (network error)
    const networkErr = new AxiosError('Network Error')
    jest.mocked(paymentsApi.createPayment).mockRejectedValue(networkErr)

    const store = createStore()
    await store.dispatch(submitPayment({ type: 'payment', data: samplePayload }))

    const state = store.getState().payment
    // The old code returned 'Payment failed'; parseApiError returns a network-specific message
    expect(state.error).not.toBe('Payment failed')
    expect(state.error).toBe('Could not reach the server. Check your connection.')
    expect(state.submitting).toBe(false)
  })
})
