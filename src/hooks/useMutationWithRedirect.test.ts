import { renderHook, act, waitFor } from '@testing-library/react'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

beforeEach(() => jest.clearAllMocks())

describe('useMutationWithRedirect', () => {
  it('calls mutationFn when mutate is called', async () => {
    const mutationFn = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(
      () => useMutationWithRedirect({ mutationFn, redirectTo: '/employees' }),
      { wrapper: createQueryWrapper() }
    )

    await act(async () => {
      result.current.mutate(undefined)
    })

    await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(1))
  })

  it('navigates to redirectTo on success', async () => {
    const mutationFn = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(
      () => useMutationWithRedirect({ mutationFn, redirectTo: '/employees' }),
      { wrapper: createQueryWrapper() }
    )

    await act(async () => {
      result.current.mutate(undefined)
    })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/employees'))
  })

  it('exposes isPending and isError from the underlying mutation', async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error('fail'))
    const { result } = renderHook(
      () => useMutationWithRedirect({ mutationFn, redirectTo: '/employees' }),
      { wrapper: createQueryWrapper() }
    )

    expect(result.current.isPending).toBe(false)

    await act(async () => {
      result.current.mutate(undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when mutation fails', async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error('fail'))
    const { result } = renderHook(
      () => useMutationWithRedirect({ mutationFn, redirectTo: '/employees' }),
      { wrapper: createQueryWrapper() }
    )

    await act(async () => {
      result.current.mutate(undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
