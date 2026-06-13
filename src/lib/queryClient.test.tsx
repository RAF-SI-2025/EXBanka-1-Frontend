import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createQueryClient } from './queryClient'
import { notifyError } from './errors/notify'

jest.mock('./errors/notify', () => ({ notifyError: jest.fn() }))

function wrap(client = createQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => jest.clearAllMocks())

describe('createQueryClient', () => {
  it('queryCache.onError calls notifyError when a query fails', async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['boom'],
          queryFn: () => Promise.reject(new Error('q-fail')),
          retry: false,
        }),
      { wrapper: wrap() }
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(notifyError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('queryCache.onError is suppressed when meta.suppressGlobalError is true', async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['boom-silent'],
          queryFn: () => Promise.reject(new Error('q-fail')),
          retry: false,
          meta: { suppressGlobalError: true },
        }),
      { wrapper: wrap() }
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(notifyError).not.toHaveBeenCalled()
  })

  it('mutationCache.onError fires when mutation has no onError', async () => {
    const { result } = renderHook(
      () =>
        useMutation<void, Error, void>({ mutationFn: () => Promise.reject(new Error('m-fail')) }),
      { wrapper: wrap() }
    )
    await act(async () => {
      try {
        await result.current.mutateAsync()
      } catch {
        /* expected */
      }
    })
    expect(notifyError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('mutationCache.onError does NOT fire when mutation defines onError', async () => {
    const onError = jest.fn()
    const { result } = renderHook(
      () =>
        useMutation<void, Error, void>({
          mutationFn: () => Promise.reject(new Error('m-fail')),
          onError,
        }),
      { wrapper: wrap() }
    )
    await act(async () => {
      try {
        await result.current.mutateAsync()
      } catch {
        /* expected */
      }
    })
    expect(onError).toHaveBeenCalled()
    expect(notifyError).not.toHaveBeenCalled()
  })
})
